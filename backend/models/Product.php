<?php
require_once __DIR__ . '/../config/database.php';

class Product {
    private $conn;
    private $table = 'products';
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function getAll($category_id = null, $sort = null, $search = null) {
    $sql = "SELECT p.*, c.name as category_name FROM " . $this->table . " p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
    $params = [];
    
    if ($category_id) {
        $sql .= " AND p.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }
    
    if ($search && trim($search) !== '') {
        // Szóközök alapján széttördeljük a keresési kifejezést
        $keywords = explode(' ', trim($search));
        $keywordConditions = [];
        foreach ($keywords as $index => $keyword) {
            $paramName = ":search_$index";
            $keywordConditions[] = "p.name LIKE $paramName";
            $params[$paramName] = "%$keyword%";
        }
        $sql .= " AND (" . implode(' AND ', $keywordConditions) . ")";
    }
    
    if ($sort == 'price_asc') {
        $sql .= " ORDER BY p.price ASC";
    } elseif ($sort == 'price_desc') {
        $sql .= " ORDER BY p.price DESC";
    } else {
        $sql .= " ORDER BY p.id DESC";
    }
    
    $stmt = $this->conn->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
    
    public function getById($id) {
        $query = "SELECT p.*, c.name as category_name FROM " . $this->table . " p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($name, $description, $price, $stock, $image_url, $category_id) {
        $query = "INSERT INTO " . $this->table . " (name, description, price, stock, image_url, category_id) VALUES (:name, :description, :price, :stock, :image_url, :category_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':category_id', $category_id);
        return $stmt->execute();
    }
    
    public function update($id, $name, $description, $price, $stock, $image_url, $category_id) {
        $query = "UPDATE " . $this->table . " SET name = :name, description = :description, price = :price, stock = :stock, image_url = :image_url, category_id = :category_id WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':category_id', $category_id);
        return $stmt->execute();
    }
    
    public function updateStock($id, $quantity) {
        $query = "UPDATE " . $this->table . " SET stock = stock - :quantity WHERE id = :id AND stock >= :quantity";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            $checkStmt = $this->conn->prepare("SELECT stock FROM " . $this->table . " WHERE id = :id");
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            $currentStock = $checkStmt->fetchColumn();
            if ($currentStock === false) {
                throw new Exception("Termék nem található (ID: $id)");
            } else {
                throw new Exception("Nincs elég készlet. Elérhető: $currentStock, Kért: $quantity");
            }
        }
        return true;
    }
    
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
    // ---------- Galéria kezelés ----------
    public function getImages($product_id) {
        $stmt = $this->conn->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id");
        $stmt->execute([$product_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function addImage($product_id, $image_url, $is_primary = false, $sort_order = 0) {
        $stmt = $this->conn->prepare("INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$product_id, $image_url, $is_primary, $sort_order]);
    }
    
    public function deleteImage($image_id, $product_id) {
        $stmt = $this->conn->prepare("DELETE FROM product_images WHERE id = ? AND product_id = ?");
        return $stmt->execute([$image_id, $product_id]);
    }
    
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    public function updateImageUrl($id, $image_url) {
        $stmt = $this->conn->prepare("UPDATE " . $this->table . " SET image_url = :image_url WHERE id = :id");
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function updateImageMetadata($image_id, $is_primary, $sort_order) {
        $stmt = $this->conn->prepare("UPDATE product_images SET is_primary = :is_primary, sort_order = :sort_order WHERE id = :id");
        $stmt->bindParam(':is_primary', $is_primary, PDO::PARAM_BOOL);
        $stmt->bindParam(':sort_order', $sort_order, PDO::PARAM_INT);
        $stmt->bindParam(':id', $image_id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>