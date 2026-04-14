import React, { createContext, useState, useContext, useEffect } from 'react';
import { cart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await cart.get();
      setCartItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Hiba a kosár betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return;
    try {
      await cart.add(productId, quantity);
      await fetchCart(); // Frissítjük a kosarat
    } catch (error) {
      console.error('Hiba a kosárhoz adáskor:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    try {
      if (quantity <= 0) {
        await cart.remove(productId);
      } else {
        await cart.update(productId, quantity);
      }
      await fetchCart();
    } catch (error) {
      console.error('Hiba a mennyiség frissítésekor:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await cart.remove(productId);
      await fetchCart();
    } catch (error) {
      console.error('Hiba a termék eltávolításakor:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    // A backenden nincs tömeges törlés, de minden tételt egyesével törölhetünk
    for (const item of cartItems) {
      await cart.remove(item.product_id);
    }
    await fetchCart();
  };

  // Kosár újratöltése, ha a felhasználó változik (bejelentkezés/kijelentkezés)
  useEffect(() => {
    fetchCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};