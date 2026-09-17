import { Link, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';

const Navbar = ({ authenticated = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={authenticated ? '/home' : '/login'}
                className="text-xl font-bold text-primary"
              >
                ShopKart
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                <Link to="/home" className="text-gray-700 hover:text-primary">
                  Home
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
