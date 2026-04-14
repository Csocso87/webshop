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
        $products = $this->productModel->getAll($category_id, $sort, $search);
        echo json_encode($products);
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
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        // Termék létrehozása (image_url ideiglenesen üres)
        $result = $this->productModel->create(
            $data['name'],
            $data['description'] ?? '',
            $data['price'],
            $data['stock'],
            '',  // image_url üres, később frissítjük
            $data['category_id'] ?? null
        );
        
        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Creation failed']);
            return;
        }
        
        $newId = $this->productModel->lastInsertId();
        $primaryImageUrl = null;
        
        // Galéria képek mentése
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
                } else {
                    // Ha már létező URL (nem base64) – csak szerkesztésnél fordulhat elő, itt nem
                }
            }
        }
        
        // Ha nincs kijelölt elsődleges kép, de van galériakép, az első legyen a borító
        if (!$primaryImageUrl) {
            $images = $this->productModel->getImages($newId);
            if (!empty($images)) {
                $primaryImageUrl = $images[0]['image_url'];
                // Beállítjuk az első képet elsődlegesnek
                $this->productModel->setPrimaryImage($newId, $images[0]['id']);
            }
        }
        
        // Frissítjük a products tábla image_url mezőjét
        if ($primaryImageUrl) {
            $this->productModel->updateImageUrl($newId, $primaryImageUrl);
        }
        
        echo json_encode(['message' => 'Product created', 'id' => $newId]);
    }
    
    public function update($id) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['name']) || !isset($data['price']) || !isset($data['stock'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    // Termék adatok frissítése (image_url-t majd később állítjuk be)
    $result = $this->productModel->update(
        $id,
        $data['name'],
        $data['description'] ?? '',
        $data['price'],
        $data['stock'],
        '',  // image_url-t majd a galéria alapján állítjuk be
        $data['category_id'] ?? null
    );
    
    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Update failed']);
        return;
    }
    
    // 1. Lekérjük a meglévő galériaképeket
    $existingImages = $this->productModel->getImages($id);
    $existingMap = [];
    foreach ($existingImages as $img) {
        $existingMap[$img['id']] = $img;
    }
    
    // 2. Feldolgozzuk a frontend által küldött galériát
    $newGallery = isset($data['gallery']) && is_array($data['gallery']) ? $data['gallery'] : [];
    $receivedUrls = [];
    $primaryImageUrl = null;
    
    foreach ($newGallery as $galleryImage) {
        $galleryUrl = $galleryImage['image_url'] ?? '';
        $is_primary = isset($galleryImage['is_primary']) ? (bool)$galleryImage['is_primary'] : false;
        $sort_order = isset($galleryImage['sort_order']) ? (int)$galleryImage['sort_order'] : 0;
        
        // Ha a kép base64 (új feltöltés)
        if (strpos($galleryUrl, 'data:image') === 0) {
            $savedUrl = $this->saveBase64Image($galleryUrl);
            if ($savedUrl) {
                $this->productModel->addImage($id, $savedUrl, $is_primary, $sort_order);
                $receivedUrls[] = $savedUrl;
                if ($is_primary) $primaryImageUrl = $savedUrl;
            }
        } else {
            // Meglévő URL – keresünk hozzá az adatbázisban egyező URL-t
            $found = false;
            foreach ($existingMap as $img) {
                if ($img['image_url'] === $galleryUrl) {
                    // Frissítjük az elsődlegességet és a sorrendet
                    $this->productModel->updateImageMetadata($img['id'], $is_primary, $sort_order);
                    $receivedUrls[] = $galleryUrl;
                    if ($is_primary) $primaryImageUrl = $galleryUrl;
                    $found = true;
                    break;
                }
            }
            // Ha nem találtuk, akkor új kép (ilyen nem fordulhat elő, mert csak base64 vagy meglévő URL jöhet)
            if (!$found && !empty($galleryUrl)) {
                // Biztonsági tartalék: hozzáadjuk új képként (nem base64, de talán hibás)
                $this->productModel->addImage($id, $galleryUrl, $is_primary, $sort_order);
                $receivedUrls[] = $galleryUrl;
                if ($is_primary) $primaryImageUrl = $galleryUrl;
            }
        }
    }
    
    // 3. Töröljük azokat a képeket, amelyek nem szerepelnek a kapott listában
    foreach ($existingImages as $img) {
        if (!in_array($img['image_url'], $receivedUrls)) {
            // Fájl törlése a fizikai mappából
            $filePath = __DIR__ . '/../uploads/' . basename($img['image_url']);
            if (file_exists($filePath)) unlink($filePath);
            $this->productModel->deleteImage($img['id'], $id);
        }
    }
    
    // 4. Ha nincs kijelölt elsődleges kép, de van galériakép, az első legyen a borító
    if (!$primaryImageUrl) {
        $images = $this->productModel->getImages($id);
        if (!empty($images)) {
            $primaryImageUrl = $images[0]['image_url'];
            $this->productModel->setPrimaryImage($id, $images[0]['id']);
        }
    }
    
    // 5. Frissítjük a products tábla image_url mezőjét
    if ($primaryImageUrl) {
        $this->productModel->updateImageUrl($id, $primaryImageUrl);
    } else {
        $this->productModel->updateImageUrl($id, '');
    }
    
    echo json_encode(['message' => 'Product updated']);
}
    
    public function delete($id) {
        // Törlés előtt a galéria képeket is töröljük a fájlrendszerből
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
    
    // ---------- Galéria kezelés (meglévő metódusok) ----------
    public function uploadImages($product_id) {
        // ... marad a régi kód, de a frontend már nem használja ezt a végpontot.
        // A metódust meghagyhatjuk, de nem szükséges.
    }
    
    public function deleteImage($product_id, $image_id) { /* ... */ }
    public function setPrimaryImage($product_id, $image_id) { /* ... */ }
    public function reorderImages($product_id) { /* ... */ }
}
?>