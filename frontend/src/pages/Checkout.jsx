import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../context/CartContext';
import { getCustomerProfile, createPaymentOrder, verifyPayment } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpay';

const EMPTY_ADDRESS = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
};

// Client-side validation keeps obviously invalid requests from reaching the API.
// The backend validates the same rules again before creating an order.
const validateAddress = (values) => {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required';
  if (!values.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.state.trim()) errors.state = 'State is required';

  if (!values.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = 'Phone must be a valid 10-digit number';
  }

  if (!values.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must contain 6 digits.';
  }

  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, loading: cartLoading, initialized, clearCart } = useCart();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');

    const validationErrors = validateAddress(address);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      // The server re-derives items, prices, stock and the total from the cart.
      const data = await createPaymentOrder(address);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setSubmitError('Unable to load the payment gateway. Please try again.');
        setSubmitting(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,

        // Never treat this callback as proof of payment; it only means we should
        // send the details to the backend for signature verification.
        handler: async (response) => {
          try {
            await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Clear global cart state only after the payment is verified.
            clearCart();
            navigate(`/order-success/${data.shopKartOrderId}`);
          } catch (err) {
            setSubmitError(
              err.response?.data?.message || 'Payment verification failed. Please contact support.'
            );
            setSubmitting(false);
          }
        },

        prefill: {
          name: address.fullName,
          contact: address.phone,
        },

        theme: { color: '#2563eb' },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', () => {
        setSubmitError('Payment failed. Your cart has not been cleared. Please try again.');
        setSubmitting(false);
      });

      paymentObject.on('modal.closed', () => {
        setSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to start checkout');
      setSubmitting(false);
    }
  };

  if (!authReady || cartLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar authenticated />
        <div className="flex-1 flex items-center justify-center py-16">
          <p className="text-gray-500 text-lg">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar authenticated />
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Add products to your cart before checking out.</p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm
              values={address}
              errors={errors}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={cartItems}
              total={subtotal}
              submitting={submitting}
              onPlaceOrder={handlePlaceOrder}
              error={submitError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
