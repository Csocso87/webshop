<?php
require_once __DIR__ . '/../models/Category.php';

class CategoryController {
    private $categoryModel;
    
    public function __construct() {
        $this->categoryModel = new Category();
    }
    
    public function getAll() {
        $categories = $this->categoryModel->getAll();
        echo json_encode($categories);
    }
    
    public function getById($id) {
        $category = $this->categoryModel->getById($id);
        if ($category) {
            echo json_encode($category);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found']);
        }
    }
    
    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name required']);
            return;
        }
        $result = $this->categoryModel->create($data['name'], $data['description'] ?? '');
        if ($result) {
            echo json_encode(['message' => 'Category created']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Creation failed']);
        }
    }
    
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name required']);
            return;
        }
        $result = $this->categoryModel->update($id, $data['name'], $data['description'] ?? '');
        if ($result) {
            echo json_encode(['message' => 'Category updated']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
        }
    }
    
    public function delete($id) {
        $result = $this->categoryModel->delete($id);
        if ($result) {
            echo json_encode(['message' => 'Category deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Deletion failed']);
        }
    }
}
?>