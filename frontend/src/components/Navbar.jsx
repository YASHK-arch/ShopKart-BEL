import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logoutCustomer, getWishlist, getCart } from '../services/api';

const Navbar = ({ authenticated = false, wishlistCount: wishlistCountProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(wishlistCountProp ?? null);
  const [cartCount, setCartCount] = useState(null);

  // Fetch count whenever authenticated and the route changes
  useEffect(() => {
    if (!authenticated) return;

    // If a count was passed as a prop, use it (for pages that already fetched)
    if (wishlistCountProp !== undefined) {
      setWishlistCount(wishlistCountProp);
      return;
    }

    let alive = true;
    getWishlist()
      .then((data) => {
        if (alive) setWishlistCount(data.count ?? 0);
      })
      .catch(() => {
        // silently ignore — count just won't show
      });

    return () => { alive = false; };
  }, [authenticated, location.pathname, wishlistCountProp]);

  // Fetch cart count whenever authenticated
  useEffect(() => {
    if (!authenticated) {
      setCartCount(null);
      return;
    }

    let alive = true;
    getCart()
      .then((data) => {
        if (alive) {
          const count = data.cart?.reduce((total, item) => total + item.quantity, 0) || 0;
          setCartCount(count);
        }
      })
      .catch(() => {
        // silently ignore — count just won't show
      });

    return () => { alive = false; };
  }, [authenticated]);

  // Live update: listen for add/remove events fired by ProductCard
  useEffect(() => {
    if (!authenticated) return;

    const handleWishlistChange = (e) => {
      setWishlistCount((prev) => Math.max(0, (prev ?? 0) + e.detail.delta));
    };

    window.addEventListener('wishlist-changed', handleWishlistChange);
    return () => window.removeEventListener('wishlist-changed', handleWishlistChange);
  }, [authenticated]);

  // Live update: listen for cart-changed events
  useEffect(() => {
    if (!authenticated) return;

    const handleCartChange = (e) => {
      setCartCount(e.detail.cartCount);
    };

    window.addEventListener('cart-changed', handleCartChange);
    return () => window.removeEventListener('cart-changed', handleCartChange);
  }, [authenticated]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      window.dispatchEvent(new CustomEvent('user-logged-out'));
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={authenticated ? '/home' : '/login'}
                className="text-xl font-bold text-primary"
              >
                ShopKart
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <Link to="/home" className="text-gray-700 hover:text-primary">
                  Home
                </Link>
                <Link to="/products" className="text-gray-700 hover:text-primary">
                  Products
                </Link>

                {/* Wishlist link with badge */}
                <Link
                  to="/wishlist"
                  className="relative text-gray-700 hover:text-primary"
                >
                  Wishlist
                  {wishlistCount !== null && wishlistCount > 0 && (
                    <span className="absolute -bottom-1.5 -right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart link with badge */}
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-primary"
                >
                  Cart
                  {cartCount !== null && cartCount > 0 && (
                    <span className="absolute -bottom-1.5 -right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/orders" className="text-gray-700 hover:text-primary">
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
