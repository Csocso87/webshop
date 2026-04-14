<?php
require_once __DIR__ . '/../utils/JwtHandler.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            exit;
        }
        
        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);
        
        $payload = JwtHandler::decode($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }
        
        return $payload; // tartalmazza a user_id, email, is_admin
    }
    
    public static function requireAdmin() {
        $user = self::authenticate();
        if (!isset($user['is_admin']) || !$user['is_admin']) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit;
        }
        return $user;
    }
}
?>