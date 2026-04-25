<?php
require_once __DIR__ . '/../models/Product.php';

class ProductController {
    private $productModel;
    
    public function __construct() {
        $this->productModel = new Product();
    }
    
    public function getAll() {
        $category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;
        $sort = isset($_GET['sort']) ? $_GET['sort'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;

        $products = $this->productModel->getAll($category_id, $sort, $search, $limit, $offset);
        $total = $this->productModel->getTotalCount($category_id, $search);

        echo json_encode([
            'data' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ]);
    }
    
    public function getById($id) {
        $product = $this->productModel->getById($id);
        if ($product) {
            $product['images'] = $this->productModel->getImages($id);
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
    }
    
    private function saveBase64Image($base64String) {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
            $imageType = $matches[1];
            $base64Data = substr($base64String, strpos($base64String, ',') + 1);
            $imageData = base64_decode($base64Data);
            if ($imageData === false) return false;
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $fileName = uniqid() . '.' . $imageType;
            $filePath = $uploadDir . $fileName;
            if (file_put_contents($filePath, $imageData)) {
                return 'http://localhost/webshop/backend/uploads/' . $fileName;
            }
        }
        return false;
    }
    
    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name']) || !isset($data['price']) || !isset($data['stock'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Hiányzó mezők (név, ár, készlet)']);
            return;
        }
        
        $hasImage = false;
        $imageUrl = $data['image_url'] ?? '';
        if (!empty($imageUrl) && strpos($imageUrl, 'data:image') === 0) {
            $hasImage = true;
        }
        if (!$hasImage && isset($data['gallery']) && is_array($data['gallery']) && count($data['gallery']) > 0) {
            $hasImage = true;
        }
        if (!$hasImage) {
            http_response_code(400);
            echo json_encode(['error' => 'Legalább egy képet fel kell tölteni (borítókép vagy galériakép)']);
            return;
        }
        
        if (strpos($imageUrl, 'data:image') === 0) {
            $savedUrl = $this->saveBase64Image($imageUrl);
            if ($savedUrl) {
                $imageUrl = $savedUrl;
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Érvénytelen kép adat']);
                return;
            }
        } else {
            $imageUrl = '';
        }
        
        $result = $this->productModel->create(
            $data['name'],
            $data['description'] ?? '',
            $data['price'],
            $data['stock'],
            $imageUrl,
            $data['category_id'] ?? null
        );
        
        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Adatbázis hiba a termék létrehozásakor']);
            return;
        }
        
        $newId = $this->productModel->lastInsertId();
        $primaryImageUrl = null;
        
        if (isset($data['gallery']) && is_array($data['gallery'])) {
            foreach ($data['gallery'] as $galleryImage) {
                $galleryUrl = $galleryImage['image_url'] ?? '';
                if (strpos($galleryUrl, 'data:image') === 0) {
                    $savedGalleryUrl = $this->saveBase64Image($galleryUrl);
                    if ($savedGalleryUrl) {
                        $is_primary = isset($galleryImage['is_primary']) ? (bool)$galleryImage['is_primary'] : false;
                        $sort_order = isset($galleryImage['sort_order']) ? (int)$galleryImage['sort_order'] : 0;
                        $this->productModel->addImage($newId, $savedGalleryUrl, $is_primary, $sort_order);
                        if ($is_primary) {
                            $primaryImageUrl = $savedGalleryUrl;
                        }
                    }
                }
            }
        }
        
        if (!$primaryImageUrl) {
            $images = $this->productModel->getImages($newId);
            if (!empty($images)) {
                $primaryImageUrl = $images[0]['image_url'];
                $this->productModel->setPrimaryImage($newId, $images[0]['id']);
            }
        }
        
        if ($primaryImageUrl) {
            $this->productModel->updateImageUrl($newId, $primaryImageUrl);
        } else {
            $this->productModel->delete($newId);
            http_response_code(400);
            echo json_encode(['error' => 'Nem sikerült képet menteni, a termék létrehozása megszakítva']);
            return;
        }
        
        echo json_encode(['message' => 'Termék létrehozva', 'id' => $newId]);
    }
    
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name']) || !isset($data['price']) || !isset($data['stock'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $result = $this->productModel->update(
            $id,
            $data['name'],
            $data['description'] ?? '',
            $data['price'],
            $data['stock'],
            '',
            $data['category_id'] ?? null
        );
        
        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
            return;
        }
        
        $existingImages = $this->productModel->getImages($id);
        $existingMap = [];
        foreach ($existingImages as $img) {
            $existingMap[$img['id']] = $img;
        }
        
        $newGallery = isset($data['gallery']) && is_array($data['gallery']) ? $data['gallery'] : [];
        $receivedUrls = [];
        $primaryImageUrl = null;
        
        foreach ($newGallery as $galleryImage) {
            $galleryUrl = $galleryImage['image_url'] ?? '';
            $is_primary = isset($galleryImage['is_primary']) ? (bool)$galleryImage['is_primary'] : false;
            $sort_order = isset($galleryImage['sort_order']) ? (int)$galleryImage['sort_order'] : 0;
            
            if (strpos($galleryUrl, 'data:image') === 0) {
                $savedUrl = $this->saveBase64Image($galleryUrl);
                if ($savedUrl) {
                    $this->productModel->addImage($id, $savedUrl, $is_primary, $sort_order);
                    $receivedUrls[] = $savedUrl;
                    if ($is_primary) $primaryImageUrl = $savedUrl;
                }
            } else {
                $found = false;
                foreach ($existingMap as $img) {
                    if ($img['image_url'] === $galleryUrl) {
                        $this->productModel->updateImageMetadata($img['id'], $is_primary, $sort_order);
                        $receivedUrls[] = $galleryUrl;
                        if ($is_primary) $primaryImageUrl = $galleryUrl;
                        $found = true;
                        break;
                    }
                }
                if (!$found && !empty($galleryUrl)) {
                    $this->productModel->addImage($id, $galleryUrl, $is_primary, $sort_order);
                    $receivedUrls[] = $galleryUrl;
                    if ($is_primary) $primaryImageUrl = $galleryUrl;
                }
            }
        }
        
        foreach ($existingImages as $img) {
            if (!in_array($img['image_url'], $receivedUrls)) {
                $filePath = __DIR__ . '/../uploads/' . basename($img['image_url']);
                if (file_exists($filePath)) unlink($filePath);
                $this->productModel->deleteImage($img['id'], $id);
            }
        }
        
        if (!$primaryImageUrl) {
            $images = $this->productModel->getImages($id);
            if (!empty($images)) {
                $primaryImageUrl = $images[0]['image_url'];
                $this->productModel->setPrimaryImage($id, $images[0]['id']);
            }
        }
        
        if ($primaryImageUrl) {
            $this->productModel->updateImageUrl($id, $primaryImageUrl);
        } else {
            $this->productModel->updateImageUrl($id, '');
        }
        
        echo json_encode(['message' => 'Product updated']);
    }
    
    public function delete($id) {
        $images = $this->productModel->getImages($id);
        foreach ($images as $img) {
            $filePath = __DIR__ . '/../uploads/' . basename($img['image_url']);
            if (file_exists($filePath)) unlink($filePath);
        }
        $result = $this->productModel->delete($id);
        if ($result) {
            echo json_encode(['message' => 'Product deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Deletion failed']);
        }
    }
    
    // ---------- Galéria kezelés ----------
    // Több kép feltöltése termékhez (nem használt, de meghagyható)
    public function uploadImages($product_id) {
        // ...
    }
    
    // Egy kép törlése (fájl és adatbázis)
    public function deleteImage($product_id, $image_id) {
        // Lekérjük a kép adatait
        $image = $this->productModel->getImageById($image_id);
        if ($image) {
            $filePath = __DIR__ . '/../uploads/' . basename($image['image_url']);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        $result = $this->productModel->deleteImage($image_id, $product_id);
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Törlés sikertelen']);
        }
    }
    
    public function setPrimaryImage($product_id, $image_id) {
        $result = $this->productModel->setPrimaryImage($product_id, $image_id);
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Beállítás sikertelen']);
        }
    }
    
    public function reorderImages($product_id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['order']) || !is_array($data['order'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Érvénytelen sorrend']);
            return;
        }
        $this->productModel->updateImageOrder($product_id, $data['order']);
        echo json_encode(['success' => true]);
    }
}
?>