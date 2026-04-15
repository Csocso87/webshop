import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, total, updateQuantity, removeFromCart, loading } = useCart();

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

  if (!user) return <div className="text-center py-20">Kérlek, jelentkezz be a kosár megtekintéséhez.</div>;
  if (loading) return <div className="text-center py-20">Betöltés...</div>;
  if (cartItems.length === 0) return <div className="text-center py-20">A kosár üres.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Kosár</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Termék</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Darab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ár</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Összeg</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cartItems.map(item => (
              <tr key={item.product_id}>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="1"
                    max={item.available_stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md w-20 px-2 py-1"
                  />
                </td>
                <td className="px-6 py-4">{item.price} Ft</td>
                <td className="px-6 py-4">{item.price * item.quantity} Ft</td>
                <td className="px-6 py-4">
                  <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-700">
                    Törlés
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <span className="text-xl font-bold">Végösszeg: {total} Ft</span>
          <Link to="/checkout">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Pénztár
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;