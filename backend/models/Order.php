<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Product.php';

class Order {
    private $conn;
    private $table = 'orders';
    private $itemsTable = 'order_items';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function createOrder($user_id, $cartItems, $shippingData, $totalAmount) {
        try {
            // 1. Először zároljuk a termékeket és ellenőrizzük a készletet
            $productIds = array_unique(array_column($cartItems, 'product_id'));
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            $stmt = $this->conn->prepare("SELECT id, stock FROM products WHERE id IN ($placeholders) FOR UPDATE");
            $stmt->execute($productIds);
            $stocks = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            // Ellenőrizzük a készletet
            foreach ($cartItems as $item) {
                $pid = $item['product_id'];
                if (!isset($stocks[$pid])) {
                    throw new Exception("Termék nem található (ID: $pid)");
                }
                if ($stocks[$pid] < $item['quantity']) {
                    throw new Exception("Nincs elég készlet a(z) '{$item['name']}' termékből. Elérhető: {$stocks[$pid]}, Kért: {$item['quantity']}");
                }
            }
            
            // 2. Indítjuk a tranzakciót (a zárolás már aktív)
            $this->conn->beginTransaction();
            
            // 3. Rendelés beszúrása
            $query = "INSERT INTO " . $this->table . " (user_id, total_amount, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country, payment_method, status) 
                      VALUES (:user_id, :total_amount, :shipping_name, :shipping_address, :shipping_city, :shipping_zip, :shipping_country, :payment_method, 'pending')";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':total_amount', $totalAmount);
            $stmt->bindParam(':shipping_name', $shippingData['name']);
            $stmt->bindParam(':shipping_address', $shippingData['address']);
            $stmt->bindParam(':shipping_city', $shippingData['city']);
            $stmt->bindParam(':shipping_zip', $shippingData['zip']);
            $stmt->bindParam(':shipping_country', $shippingData['country']);
            $stmt->bindParam(':payment_method', $shippingData['payment_method']);
            $stmt->execute();
            $orderId = $this->conn->lastInsertId();
            
            // 4. Rendelési tételek beszúrása
            foreach ($cartItems as $item) {
                $itemQuery = "INSERT INTO " . $this->itemsTable . " (order_id, product_id, quantity, price) VALUES (:order_id, :product_id, :quantity, :price)";
                $itemStmt = $this->conn->prepare($itemQuery);
                $itemStmt->bindParam(':order_id', $orderId);
                $itemStmt->bindParam(':product_id', $item['product_id']);
                $itemStmt->bindParam(':quantity', $item['quantity']);
                $itemStmt->bindParam(':price', $item['price']);
                $itemStmt->execute();
            }
            
            // 5. Készlet frissítése (levonás)
            foreach ($cartItems as $item) {
                $updateStmt = $this->conn->prepare("UPDATE products SET stock = stock - :quantity WHERE id = :id");
                $updateStmt->bindParam(':quantity', $item['quantity']);
                $updateStmt->bindParam(':id', $item['product_id']);
                $updateStmt->execute();
            }
            
            $this->conn->commit();
            return $orderId;
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            // A hibaüzenetet továbbítjuk a controller felé
            throw new Exception($e->getMessage());
        }
    }
    
    public function getOrdersByUser($user_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = :user_id ORDER BY order_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getOrderWithItems($order_id) {
    // Rendelés adatainak lekérése
    $query = "SELECT * FROM " . $this->table . " WHERE id = :order_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':order_id', $order_id);
    $stmt->execute();
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($order) {
        // Rendelési tételek lekérése külön
        $itemQuery = "SELECT oi.*, p.name FROM " . $this->itemsTable . " oi 
                      JOIN products p ON oi.product_id = p.id 
                      WHERE oi.order_id = :order_id";
        $itemStmt = $this->conn->prepare($itemQuery);
        $itemStmt->bindParam(':order_id', $order_id);
        $itemStmt->execute();
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    return $order;
}
    
    public function getAllOrders() {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email 
                  FROM " . $this->table . " o 
                  JOIN users u ON o.user_id = u.id 
                  ORDER BY o.order_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function updateOrderStatus($order_id, $status) {
        $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :order_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':order_id', $order_id);
        return $stmt->execute();
    }
}