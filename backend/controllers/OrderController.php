<?php
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';

class OrderController {
    private $orderModel;
    private $cartModel;
    
    public function __construct() {
        $this->orderModel = new Order();
        $this->cartModel = new Cart();
    }
    
    public function placeOrder($userId) {
        ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['shipping']) || !isset($data['payment_method'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing shipping or payment info']);
                return;
            }
            
            // Átmásoljuk a payment_method-ot a shipping tömbbe
            $shipping = $data['shipping'];
            $shipping['payment_method'] = $data['payment_method'];
            
            $cart = $this->cartModel->getCart($userId);
            if (empty($cart)) {
                http_response_code(400);
                echo json_encode(['error' => 'Cart is empty']);
                return;
            }
            
            $total = 0;
            foreach ($cart as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            
            $orderId = $this->orderModel->createOrder($userId, $cart, $shipping, $total);
            if ($orderId) {
                $this->cartModel->clearCart($userId);
                echo json_encode(['message' => 'Order placed', 'order_id' => $orderId]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Order failed, possibly insufficient stock']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
        }
    }
    
    public function getMyOrders($userId) {
        $orders = $this->orderModel->getOrdersByUser($userId);
        echo json_encode($orders);
    }
    
    public function getOrderDetails($userId, $orderId) {
        $order = $this->orderModel->getOrderWithItems($orderId);
        if ($order && $order['user_id'] == $userId) {
            echo json_encode($order);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized or order not found']);
        }
    }
    
    // Admin
    public function getAllOrders() {
        $orders = $this->orderModel->getAllOrders();
        echo json_encode($orders);
    }
    
    public function updateOrderStatus($orderId) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Status required']);
            return;
        }
        $result = $this->orderModel->updateOrderStatus($orderId, $data['status']);
        if ($result) {
            echo json_encode(['message' => 'Order status updated']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
        }
    }
    // A class végére, a updateOrderStatus után
public function getOrderDetailsAdmin($orderId) {
    $order = $this->orderModel->getOrderWithItems($orderId);
    if ($order) {
        echo json_encode($order);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
    }
}
}