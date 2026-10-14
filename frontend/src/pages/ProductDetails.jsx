import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCustomerProfile, getProductById } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        await getCustomerProfile();
      } catch {
        navigate('/login', { replace: true });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getProductById(id);
        setProduct(data.product);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          setError('Product not found.');
        } else if (status === 400) {
          setError('Invalid product ID.');
        } else {
          setError('Something went wrong while loading products.');
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Refresh product when cart changes (to update stock display)
  useEffect(() => {
    const handleCartChange = () => {
      if (!product) return;
      setLoading(true);
      getProductById(id)
        .then((data) => {
          setProduct(data.product);
        })
        .catch(() => {
          setError('Something went wrong while loading product.');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    window.addEventListener('cart-changed', handleCartChange);
    return () => window.removeEventListener('cart-changed', handleCartChange);
  }, [id, product]);

  const handleAddToCart = async () => {
    setCartMessage('');
    try {
      await addToCart(product._id);
      setCartMessage('Added to cart!');
      // Refresh product data to show updated stock
      const data = await getProductById(id);
      setProduct(data.product);
    } catch (err) {
      setCartMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="text-sm font-medium text-primary hover:text-blue-600">
          ← Back to products
        </Link>

        {loading && (
          <p className="text-center text-gray-500 text-lg py-16">Loading products...</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 text-lg py-16">{error}</p>
        )}

        {!loading && !error && product && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gray-100 min-h-[320px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover max-h-[520px]"
                />
              </div>
              <div className="p-6 sm:p-10 flex flex-col">
                <p className="text-sm font-medium text-primary">{product.category}</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
                <p className="mt-6 text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                <p className={`mt-2 text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                </p>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="mt-8 w-full sm:w-auto inline-flex justify-center py-2.5 px-6 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  Add to Cart
                </button>
                {cartMessage && (
                  <p className="mt-3 text-sm text-emerald-600">{cartMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
