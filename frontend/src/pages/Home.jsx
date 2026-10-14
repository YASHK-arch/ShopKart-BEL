import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerProfile } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCustomerProfile();
        setUser(data.customer || data);
        window.dispatchEvent(new CustomEvent('user-logged-in'));
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar authenticated />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 sm:px-10 sm:py-12">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.fullName}!
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              Manage your ShopKart account here.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              Browse products
            </Link>
          </div>

          <div className="px-6 py-6 sm:px-10 border-t border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                <p className="text-base text-gray-900 font-semibold">{user.fullName}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                <p className="text-base text-gray-900 font-semibold">{user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                <p className="text-base text-gray-900 font-semibold">{user.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
