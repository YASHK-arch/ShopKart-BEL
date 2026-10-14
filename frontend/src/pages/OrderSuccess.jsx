import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatOrderDate } from '../utils/orderFormat';
import { getOrderById } from '../services/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const OrderSuccess = () => {
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
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          {loading && <p className="text-gray-500">Loading order...</p>}

          {!loading && error && (
            <>
              <p className="text-red-500 mb-6">{error}</p>
              <Link
                to="/orders"
                className="inline-block bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600"
              >
                View My Orders
              </Link>
            </>
          )}

          {!loading && !error && order && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Order Placed Successfully
              </h1>

              <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-medium text-gray-900 break-all">{order._id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium text-gray-900">{formatOrderDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-medium text-gray-900">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-gray-900">{order.status}</span>
                </div>
              </div>

              <p className="mt-6 text-gray-600">Your order has been saved successfully.</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/orders"
                  className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600"
                >
                  View My Orders
                </Link>
                <Link
                  to="/products"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
