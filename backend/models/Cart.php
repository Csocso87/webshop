<?php
require_once __DIR__ . '/../config/database.php';

class Cart {
    private $conn;
    private $table = 'cart';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function getCart($user_id) {
        $query = "SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock as available_stock 
                  FROM " . $this->table . " c 
                  JOIN products p ON c.product_id = p.id 
                  WHERE c.user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function addItem($user_id, $product_id, $quantity = 1) {
        // Ellenőrizzük, hogy van-e már a kosárban
        $checkQuery = "SELECT id, quantity FROM " . $this->table . " WHERE user_id = :user_id AND product_id = :product_id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $user_id);
        $checkStmt->bindParam(':product_id', $product_id);
        $checkStmt->execute();
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            $newQuantity = $existing['quantity'] + $quantity;
            $updateQuery = "UPDATE " . $this->table . " SET quantity = :quantity WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':quantity', $newQuantity);
            $updateStmt->bindParam(':id', $existing['id']);
            return $updateStmt->execute();
        } else {
            $insertQuery = "INSERT INTO " . $this->table . " (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':user_id', $user_id);
            $insertStmt->bindParam(':product_id', $product_id);
            $insertStmt->bindParam(':quantity', $quantity);
            return $insertStmt->execute();
        }
    }
    
    public function updateItem($user_id, $product_id, $quantity) {
        if ($quantity <= 0) {
            return $this->removeItem($user_id, $product_id);
        }
        $query = "UPDATE " . $this->table . " SET quantity = :quantity WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $product_id);
        return $stmt->execute();
    }
    
    public function removeItem($user_id, $product_id) {
        $query = "DELETE FROM " . $this->table . " WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $product_id);
        return $stmt->execute();
    }
    
    public function clearCart($user_id) {
        $query = "DELETE FROM " . $this->table . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }
}
?>