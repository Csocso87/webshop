import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orders } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    payment_method: 'cash_on_delivery',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user && user.is_admin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">

        <p className="text-gray-600">Ez az oldal admin felhasználók számára nem elérhető.</p>
        <Link to="/" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await orders.place(shipping, 'cash_on_delivery');
      clearCart();
      toast.success('Rendelés sikeresen leadva!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Rendelés leadása</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <input 
          name="name" 
          placeholder="Teljes név" 
          value={shipping.name} 
          onChange={handleChange} 
          required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          name="address" 
          placeholder="Cím" 
          value={shipping.address} 
          onChange={handleChange} 
          required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          name="city" 
          placeholder="Város" 
          value={shipping.city} 
          onChange={handleChange} 
          required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          name="zip" 
          placeholder="Irányítószám" 
          value={shipping.zip} 
          onChange={handleChange} 
          required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          name="country" 
          placeholder="Ország" 
          value={shipping.country} 
          onChange={handleChange} 
          required 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="bg-gray-100 p-3 rounded-lg text-center text-gray-700">
          Fizetési mód: <strong>Utánvét</strong>
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Feldolgozás...' : 'Rendelés leadása (utánvéttel)'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;