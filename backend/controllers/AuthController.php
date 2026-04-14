<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JwtHandler.php';

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            return;
        }
        
        if ($this->userModel->findByEmail($data['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }
        
        $userId = $this->userModel->create($data['name'], $data['email'], $data['password']);
        if ($userId) {
            $user = $this->userModel->findById($userId);
            $token = JwtHandler::encode(['user_id' => $user['id'], 'email' => $user['email'], 'is_admin' => $user['is_admin']]);
            echo json_encode(['message' => 'User registered', 'token' => $token, 'user' => $user]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }
    
    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing email or password']);
            return;
        }
        
        $user = $this->userModel->findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        
        $token = JwtHandler::encode(['user_id' => $user['id'], 'email' => $user['email'], 'is_admin' => $user['is_admin']]);
        echo json_encode(['message' => 'Login successful', 'token' => $token, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'is_admin' => $user['is_admin']]]);
    }
    
    public function getProfile($userId) {
        $user = $this->userModel->findById($userId);
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }
}
?>