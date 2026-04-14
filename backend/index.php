<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/config.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/CategoryController.php';
require_once 'controllers/ProductController.php';
require_once 'controllers/CartController.php';
require_once 'controllers/OrderController.php';
require_once 'middleware/AuthMiddleware.php';

$request_uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/webshop/backend/', '', parse_url($request_uri, PHP_URL_PATH));
$path = ltrim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Routing
if ($path == 'api/register' && $method == 'POST') {
    $controller = new AuthController();
    $controller->register();
} elseif ($path == 'api/login' && $method == 'POST') {
    $controller = new AuthController();
    $controller->login();
} elseif ($path == 'api/profile' && $method == 'GET') {
    $user = AuthMiddleware::authenticate();
    $controller = new AuthController();
    $controller->getProfile($user['user_id']);
} elseif ($path == 'api/categories' && $method == 'GET') {
    $controller = new CategoryController();
    $controller->getAll();
} elseif (preg_match('#^api/categories/(\d+)$#', $path, $matches) && $method == 'GET') {
    $controller = new CategoryController();
    $controller->getById($matches[1]);
} elseif ($path == 'api/categories' && $method == 'POST') {
    AuthMiddleware::requireAdmin();
    $controller = new CategoryController();
    $controller->create();
} elseif (preg_match('#^api/categories/(\d+)$#', $path, $matches) && $method == 'PUT') {
    AuthMiddleware::requireAdmin();
    $controller = new CategoryController();
    $controller->update($matches[1]);
} elseif (preg_match('#^api/categories/(\d+)$#', $path, $matches) && $method == 'DELETE') {
    AuthMiddleware::requireAdmin();
    $controller = new CategoryController();
    $controller->delete($matches[1]);
} elseif ($path == 'api/products' && $method == 'GET') {
    $controller = new ProductController();
    $controller->getAll();
} elseif (preg_match('#^api/products/(\d+)$#', $path, $matches) && $method == 'GET') {
    $controller = new ProductController();
    $controller->getById($matches[1]);
} elseif ($path == 'api/products' && $method == 'POST') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->create();
} elseif (preg_match('#^api/products/(\d+)$#', $path, $matches) && $method == 'PUT') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->update($matches[1]);
} elseif (preg_match('#^api/products/(\d+)$#', $path, $matches) && $method == 'DELETE') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->delete($matches[1]);
} elseif (preg_match('#^api/products/(\d+)/images$#', $path, $matches) && $method == 'POST') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->uploadImages($matches[1]);
} elseif (preg_match('#^api/products/(\d+)/images/(\d+)$#', $path, $matches) && $method == 'DELETE') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->deleteImage($matches[1], $matches[2]);
} elseif (preg_match('#^api/products/(\d+)/images/primary/(\d+)$#', $path, $matches) && $method == 'PUT') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->setPrimaryImage($matches[1], $matches[2]);
} elseif (preg_match('#^api/products/(\d+)/images/reorder$#', $path, $matches) && $method == 'PUT') {
    AuthMiddleware::requireAdmin();
    $controller = new ProductController();
    $controller->reorderImages($matches[1]);
} elseif ($path == 'api/cart' && $method == 'GET') {
    $user = AuthMiddleware::authenticate();
    $controller = new CartController();
    $controller->getCart($user['user_id']);
} elseif ($path == 'api/cart' && $method == 'POST') {
    $user = AuthMiddleware::authenticate();
    $controller = new CartController();
    $controller->addToCart($user['user_id']);
} elseif ($path == 'api/cart' && $method == 'PUT') {
    $user = AuthMiddleware::authenticate();
    $controller = new CartController();
    $controller->updateCartItem($user['user_id']);
} elseif (preg_match('#^api/cart/(\d+)$#', $path, $matches) && $method == 'DELETE') {
    $user = AuthMiddleware::authenticate();
    $controller = new CartController();
    $controller->removeFromCart($user['user_id'], $matches[1]);
} elseif ($path == 'api/orders' && $method == 'POST') {
    $user = AuthMiddleware::authenticate();
    $controller = new OrderController();
    $controller->placeOrder($user['user_id']);
} elseif ($path == 'api/orders' && $method == 'GET') {
    $user = AuthMiddleware::authenticate();
    $controller = new OrderController();
    $controller->getMyOrders($user['user_id']);
} elseif (preg_match('#^api/orders/(\d+)$#', $path, $matches) && $method == 'GET') {
    $user = AuthMiddleware::authenticate();
    $controller = new OrderController();
    $controller->getOrderDetails($user['user_id'], $matches[1]);
} elseif ($path == 'api/admin/orders' && $method == 'GET') {
    AuthMiddleware::requireAdmin();
    $controller = new OrderController();
    $controller->getAllOrders();
} elseif (preg_match('#^api/admin/orders/(\d+)/status$#', $path, $matches) && $method == 'PUT') {
    AuthMiddleware::requireAdmin();
    $controller = new OrderController();
    $controller->updateOrderStatus($matches[1]);
} elseif (preg_match('#^api/admin/orders/(\d+)/details$#', $path, $matches) && $method == 'GET') {
    AuthMiddleware::requireAdmin();
    $controller = new OrderController();
    $controller->getOrderDetailsAdmin($matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
?>