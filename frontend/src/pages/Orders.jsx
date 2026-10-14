import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import { getCustomerProfile, getOrders } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
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

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch {
      setError('Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    loadOrders();
  }, [authReady]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-5xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">Something went wrong.</p>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              You have not placed any orders yet.
            </h2>
            <p className="text-gray-500 mb-6">Your completed orders will appear here.</p>
            <Link
              to="/products"
              className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
