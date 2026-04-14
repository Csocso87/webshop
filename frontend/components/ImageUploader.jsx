import React, { useState, useEffect } from 'react';

const ImageUploader = ({ onImagesChange, initialImages = [] }) => {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    const newImages = [];
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      newImages.push({
        id: Date.now() + Math.random(),
        image_url: base64,
        is_primary: (images.length === 0 && newImages.length === 0) ? 1 : 0,
        sort_order: images.length + newImages.length,
        is_temp: true
      });
    }
    const updated = [...images, ...newImages];
    setImages(updated);
    if (onImagesChange) onImagesChange(updated);
    setLoading(false);
    e.target.value = '';
  };

  const handleDelete = (id) => {
    const updated = images.filter(img => img.id !== id);
    if (updated.length > 0 && !updated.some(img => img.is_primary === 1)) {
      updated[0].is_primary = 1;
    }
    setImages(updated);
    if (onImagesChange) onImagesChange(updated);
  };

  const handleSetPrimary = (id) => {
    const updated = images.map(img => ({ ...img, is_primary: img.id === id ? 1 : 0 }));
    setImages(updated);
    if (onImagesChange) onImagesChange(updated);
  };

  const handleReorder = (dragIndex, dropIndex) => {
    const newImages = [...images];
    const [dragged] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, dragged);
    newImages.forEach((img, idx) => { img.sort_order = idx; });
    setImages(newImages);
    if (onImagesChange) onImagesChange(newImages);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold mb-2">Termékképek galériája</h4>
      <div className="mb-3">
        <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={loading} />
        {loading && <span className="ml-2 text-blue-500">Feltöltés...</span>}
      </div>
      {images.length === 0 && <p className="text-gray-500">Még nincs feltöltött kép.</p>}
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={img.id} className="relative w-24 border rounded p-1 bg-gray-100"
               draggable
               onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 const dragIdx = parseInt(e.dataTransfer.getData('text/plain'));
                 if (!isNaN(dragIdx) && dragIdx !== idx) handleReorder(dragIdx, idx);
               }}>
            <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded" />
            <div className="text-center text-xs mt-1">
              {img.is_primary === 1 ? (
                <span className="text-green-600 font-bold">Borítókép</span>
              ) : (
                <button onClick={() => handleSetPrimary(img.id)} className="text-xs bg-blue-500 text-white px-1 rounded">Borítónak</button>
              )}
            </div>
            <div className="text-center mt-1">
              <button onClick={() => handleDelete(img.id)} className="text-xs bg-red-500 text-white px-1 rounded">X</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">Tipp: Átrendezheted a képeket drag-and-droppal.</p>
    </div>
  );
};

export default ImageUploader;