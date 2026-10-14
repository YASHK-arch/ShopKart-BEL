import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const Cart = () => {
  const { cartItems, loading, error, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();

  // Keep the UI within known limits; the backend independently validates every change.
  const handleIncreaseQuantity = async (productId, currentQuantity, stock) => {
    if (currentQuantity < stock) {
      try {
        await updateQuantity(productId, currentQuantity + 1);
      } catch (err) {
        console.error('Failed to increase quantity:', err);
      }
    }
  };

  const handleDecreaseQuantity = async (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(productId, currentQuantity - 1);
      } catch (err) {
        console.error('Failed to decrease quantity:', err);
      }
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  // Render request states separately so an empty cart is not confused with a pending fetch.
  if (loading) {
    return (
      <>
        <Navbar authenticated={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar authenticated={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar authenticated={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty 🛒</p>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar authenticated={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Each line uses the populated product data plus the saved quantity. */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Product details come from the referenced Product document. */}
                <div className="sm:w-32 sm:h-32 flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.category}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatPrice(item.product.price)}
                  </p>
                  <p className={`mt-1 text-sm font-medium ${item.product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.product.stock > 0 ? `${item.product.stock} units left` : 'Out of stock'}
                  </p>
                </div>

                {/* Quantity controls enforce minimum and displayed-stock limits in the UI. */}
                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecreaseQuantity(item.product._id, item.quantity)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.product._id, item.quantity, item.product.stock)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <p className="mt-2 font-semibold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals are derived from the shared cart rather than persisted separately. */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Items:</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <Link
                to="/checkout"
                className="mt-6 block text-center w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-md font-medium transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="mt-3 block text-center text-sm text-gray-600 hover:text-primary"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
