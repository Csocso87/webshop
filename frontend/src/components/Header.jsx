import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition">
          WebShop
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Kezdőlap</Link>

          {user && !user.is_admin && (
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
              Kosár
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {itemCount}
              </span>
              
            </Link>
          )}

          {user && <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition">Profil</Link>}


          {user?.is_admin === 1 && (
            <>
              <Link to="/admin/categories" className="text-gray-700 hover:text-blue-600 transition">Kategóriák</Link>
              <Link to="/admin/products" className="text-gray-700 hover:text-blue-600 transition">Termékek</Link>
              <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600 transition">Rendelések</Link>
            </>
          )}

          {!user ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">Bejelentkezés</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Regisztráció
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition">
              Kijelentkezés
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
