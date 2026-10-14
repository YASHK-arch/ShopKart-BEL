import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const ProductCard = ({ product, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { addToCart, cartItems } = useCart();

  // Read the shared cart so the button label reflects this product's current quantity.
  const cartItem = cartItems.find(item => item.product._id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  // Cart responses include current stock; prefer it over the potentially stale catalog result.
  const availableStock = cartItem?.product.stock ?? product.stock;
  const inStock = availableStock > 0;

  const toggleWishlist = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMessage('');

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
        window.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { delta: -1 } }));
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
        window.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { delta: +1 } }));
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || !inStock) return;

    setCartLoading(true);
    setErrorMessage('');

    try {
      // Context updates every cart consumer after the server confirms the mutation.
      await addToCart(product._id);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to add to cart. Please try again.');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
      <div className="h-48 bg-gray-100 overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={toggleWishlist}
          disabled={loading}
          className="absolute top-2 right-2 bg-white w-9 h-9 flex items-center justify-center rounded-full shadow-md text-xl hover:bg-gray-50 disabled:opacity-80 transition-colors"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {loading ? '⏳' : (isWishlisted ? '❤️' : '🤍')}
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <p className="mt-2 text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
        <p className={`mt-1 text-sm font-medium ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
          {inStock ? `${availableStock} units left` : 'Out of stock'}
        </p>
        
        {errorMessage && (
          <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
        )}

        <Link
          to={`/products/${product._id}`}
          className="mt-4 inline-flex justify-center items-center w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors"
        >
          View Details
        </Link>

        <button
          onClick={handleAddToCart}
          disabled={cartLoading || !inStock}
          className="mt-2 inline-flex justify-center items-center w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {cartLoading
            ? 'Adding...'
            : !inStock
              ? 'Out of Stock'
              : quantityInCart > 0
                ? 'Add Another'
                : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
