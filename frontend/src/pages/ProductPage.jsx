import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ImageGallery from '../components/ImageGallery';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    products.getById(id).then(res => setProduct(res.data));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(id, quantity);
      toast.success('Termék a kosárban!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sikertelen hozzáadás');
    }
  };

  if (!product) return <div className="text-center py-20">Betöltés...</div>;

  const isAdmin = user && user.is_admin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6">
        <div className="md:w-1/2">
          <ImageGallery images={product.images || []} productName={product.name} />
        </div>
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="mt-4 space-y-2">
              <p className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</p>
              <p className="text-gray-700">Készlet: <span className="font-semibold">{product.stock}</span></p>
              <p className="text-gray-700">Kategória: {product.category_name}</p>
            </div>
          </div>
          {!isAdmin && (
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-gray-700">Mennyiség:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 w-20 text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                Kosárba
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;