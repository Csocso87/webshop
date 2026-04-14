import React, { useState } from 'react';

const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center bg-white rounded-lg" style={{ minHeight: '200px' }}>
        <img 
          src="https://via.placeholder.com/500" 
          alt={productName} 
          className="max-w-full max-h-96 w-auto object-contain cursor-pointer rounded-lg"
          onClick={() => setLightboxOpen(true)}
        />
      </div>
    );
  }

  const mainImage = images.find(img => img.is_primary) || images[0];
  const thumbnails = images.filter(img => img.id !== mainImage.id);

  const openLightbox = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {/* Fő kép */}
        <div 
          className="cursor-pointer flex justify-center items-center bg-white rounded-lg"
          style={{ minHeight: '200px' }}
          onClick={() => openLightbox(images.findIndex(img => img.id === mainImage.id))}
        >
          <img 
            src={mainImage.image_url} 
            alt={productName} 
            className="max-w-full max-h-96 w-auto object-contain rounded-lg" 
          />
        </div>
        {/* Bélyegképek */}
        {thumbnails.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {thumbnails.map((img, idx) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={`${productName} - ${idx + 1}`}
                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                onClick={() => openLightbox(images.findIndex(i => i.id === img.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox - fix gombok, zoom nélkül */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Bezáró gomb - fix a jobb felső sarokban */}
          <button
            className="fixed top-4 right-4 text-white text-3xl z-50 hover:text-gray-300"
            onClick={() => setLightboxOpen(false)}
          >
            &times;
          </button>

          {/* Balra mutató nyíl - fix a bal oldalon, középen */}
          <button
            className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
          >
            ❮
          </button>

          {/* Jobbra mutató nyíl - fix a jobb oldalon, középen */}
          <button
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
          >
            ❯
          </button>

          {/* Kép konténer */}
          <div 
            className="flex items-center justify-center p-4"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]?.image_url}
              alt={productName}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
            />
          </div>

          {/* Kép számláló */}
          <div className="fixed bottom-4 left-0 right-0 text-center text-white z-50">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;