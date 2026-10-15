import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContinuePaymentButton from '../components/ContinuePaymentButton';
import { formatOrderDate, statusStyles } from '../utils/orderFormat';
import { getOrderById } from '../services/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch {
        setError('Unable to load this order.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-3xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading order...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-6">{error}</p>
            <Link
              to="/orders"
              className="inline-block bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600"
            >
              Back to My Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order._id.slice(-8)}
                </h1>
                <p className="text-sm text-gray-500">{formatOrderDate(order.createdAt)}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  statusStyles[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
              <ul className="space-y-4">
                {order.items.map((item) => (
                  <li key={item.product} className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
                <address className="not-italic text-sm text-gray-700 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>{order.shippingAddress.pincode}</p>
                </address>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="font-medium text-gray-900">{order.paymentStatus}</span>
                  </div>
                  {order.status === 'PENDING_PAYMENT' && order.paymentStatus === 'PENDING' && (
                    <div className="pt-2">
                      <ContinuePaymentButton order={order} />
                    </div>
                  )}
                  {order.razorpayPaymentId && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Payment ID:</span>
                      <span className="font-medium text-gray-900 break-all">
                        {order.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/orders"
              className="inline-block mt-6 text-sm font-medium text-primary hover:text-blue-500"
            >
              ← Back to My Orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
