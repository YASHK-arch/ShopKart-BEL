import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getPaymentSession, verifyPayment } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpay';

const ContinuePaymentButton = ({ order }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const continuePayment = async () => {
    setError('');
    setLoading(true);

    try {
      const paymentSession = await getPaymentSession(order._id);
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error('Unable to load the payment gateway. Please try again.');
      }

      const paymentObject = new window.Razorpay({
        key: paymentSession.key,
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: paymentSession.razorpayOrderId,
        prefill: {
          name: paymentSession.shippingAddress?.fullName,
          contact: paymentSession.shippingAddress?.phone,
        },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await verifyPayment({
              shopKartOrderId: paymentSession.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            navigate(`/order-success/${paymentSession.shopKartOrderId}`);
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
                'Payment verification failed. Please contact support.'
            );
            setLoading(false);
          }
        },
      });

      paymentObject.on('payment.failed', () => {
        setError('Payment failed. Your order is still pending; you can try again.');
        setLoading(false);
      });

      paymentObject.on('modal.closed', () => {
        // Closing checkout does not establish whether a payment succeeded.
        setLoading(false);
      });

      paymentObject.open();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to resume payment');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={continuePayment}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening payment...' : 'Continue payment'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ContinuePaymentButton;
