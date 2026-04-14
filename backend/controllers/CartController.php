<?php
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';

class CartController {
    private $cartModel;
    private $productModel;
    
    public function __construct() {
        $this->cartModel = new Cart();
        $this->productModel = new Product();
    }
    
    public function getCart($userId) {
        $cart = $this->cartModel->getCart($userId);
        $total = 0;
        foreach ($cart as &$item) {
            $item['subtotal'] = $item['price'] * $item['quantity'];
            $total += $item['subtotal'];
        }
        echo json_encode(['items' => $cart, 'total' => $total]);
    }
    
    public function addToCart($userId) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID and quantity required']);
            return;
        }
        
        $product = $this->productModel->getById($data['product_id']);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }
        
        if ($product['stock'] < $data['quantity']) {
            http_response_code(400);
            echo json_encode(['error' => 'Not enough stock']);
            return;
        }
        
        $result = $this->cartModel->addItem($userId, $data['product_id'], $data['quantity']);
        if ($result) {
            echo json_encode(['message' => 'Item added to cart']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add item']);
        }
    }
    
    public function updateCartItem($userId) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID and quantity required']);
            return;
        }
        
        $result = $this->cartModel->updateItem($userId, $data['product_id'], $data['quantity']);
        if ($result) {
            echo json_encode(['message' => 'Cart updated']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
        }
    }
    
    public function removeFromCart($userId, $productId) {
        $result = $this->cartModel->removeItem($userId, $productId);
        if ($result) {
            echo json_encode(['message' => 'Item removed']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Removal failed']);
        }
    }
}
?>