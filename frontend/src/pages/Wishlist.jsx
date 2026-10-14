import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCustomerProfile, getWishlist, removeFromWishlist } from '../services/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        await getCustomerProfile();
        setAuthReady(true);
      } catch {
        navigate('/login', { replace: true });
      }
    };

    verifySession();
  }, [navigate]);

  const loadWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch {
      setError('Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    loadWishlist();
  }, [authReady]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch {
      alert('Failed to remove product from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          {!loading && !error && (
            <p className="mt-1 text-gray-600">{wishlist.length} products saved</p>
          )}
        </div>

        <div className="mt-8">
          {loading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Loading your wishlist...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg mb-4">Something went wrong.</p>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={loadWishlist}
                className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && wishlist.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">Save products you love and find them here later.</p>
              <Link
                to="/products"
                className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600"
              >
                Browse Products
              </Link>
            </div>
          )}

          {!loading && !error && wishlist.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <article key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                    <p className="mt-2 text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                    <p className={`mt-1 text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                    </p>
                    
                    <div className="mt-4 flex flex-col gap-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="inline-flex justify-center items-center w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="inline-flex justify-center items-center w-full py-2.5 px-4 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Remove ♥
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
