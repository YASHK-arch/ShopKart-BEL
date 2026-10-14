import { createContext, useContext, useState, useEffect } from 'react';
import { getCart as getCartAPI, addToCart as addToCartAPI, updateQuantity as updateQuantityAPI, removeFromCart as removeFromCartAPI } from '../services/api';

const CartContext = createContext();

// Keep cart data in one provider so pages and product cards read and update the same cart.
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Tracks whether the first cart load has completed, so pages can avoid
  // rendering an "empty cart" state before the server response arrives.
  const [initialized, setInitialized] = useState(false);

  // Derive totals from the latest cart response instead of keeping duplicate totals in state.
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Reload the persisted cart; the server response is the source of truth after each request.
  const refreshCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCartAPI();
      setCartItems(data.cart || []);
      setIsAuthenticated(true);
      // The Navbar keeps its own badge state, so notify it when the cart changes.
      const count = data.cart?.reduce((total, item) => total + item.quantity, 0) || 0;
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: count } }));
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setCartItems([]);
        window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: 0 } }));
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
        setCartItems([]);
        window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: 0 } }));

        // The Navbar listens for cart-changed and sets its cart badge count from event.detail.cartCount. Sending 0 tells it the cart is now empty—for example, after logout. This is client-side communication; it doesn’t make an API request.
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Send the product ID only; the backend resolves the product and enforces stock limits.
  const addToCart = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await addToCartAPI(productId);
      setCartItems(data.cart || []);
      setIsAuthenticated(true);
      // Replace local state with the server result, then refresh the Navbar badge.
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: data.cart?.reduce((total, item) => total + item.quantity, 0) || 0 } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Persist the requested quantity and use the returned cart to keep UI state in sync.
  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateQuantityAPI(productId, quantity);
      setCartItems(data.cart || []);
      // Cart count includes units, not just the number of distinct products.
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: data.cart?.reduce((total, item) => total + item.quantity, 0) || 0 } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove the item on the server before replacing the shared cart state.
  const removeFromCart = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await removeFromCartAPI(productId);
      setCartItems(data.cart || []);
      // Notify the Navbar even when removal reduces the cart count to zero.
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: data.cart?.reduce((total, item) => total + item.quantity, 0) || 0 } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset client-side cart state after the backend confirms a verified payment.
  const clearCart = () => {
    setCartItems([]);
    setError(null);
    window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: 0 } }));
  };

  // Restore the signed-in customer's persisted cart when the provider first mounts.
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshCart();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Login should reload this customer's cart; logout should immediately clear client-side data.
  useEffect(() => {
    const handleLogin = () => {
      refreshCart();
    };

    const handleLogout = () => {
      setCartItems([]);
      setIsAuthenticated(false);
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { cartCount: 0 } }));
    };

    window.addEventListener('user-logged-in', handleLogin);
    window.addEventListener('user-logged-out', handleLogout);

    return () => {
      window.removeEventListener('user-logged-in', handleLogin);
      window.removeEventListener('user-logged-out', handleLogout);
    };
  }, []);

  const value = {
    cartItems,
    cartCount,
    subtotal,
    loading,
    error,
    isAuthenticated,
    initialized,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  // Expose both cart data and its API-backed actions to all descendants of the provider.
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
