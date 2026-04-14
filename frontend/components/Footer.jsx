import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} WebShop. Minden jog fenntartva.
        </p>
        <div className="flex justify-center space-x-4 mt-2 text-gray-400 text-sm">
          <Link to="/" className="hover:text-white transition">Főoldal</Link>
          <span>|</span>
          <Link to="/profile" className="hover:text-white transition">Profil</Link>
          <span>|</span>
          <Link to="/cart" className="hover:text-white transition">Kosár</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;