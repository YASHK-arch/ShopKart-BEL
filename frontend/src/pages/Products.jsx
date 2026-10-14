import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getCustomerProfile, getProducts, getWishlist } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
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

  useEffect(() => {
    if (!authReady) return undefined;

    let cancelled = false;
    const delay = search ? 350 : 0;
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const [productsData, wishlistData] = await Promise.all([
          getProducts({ search, category, sort }),
          getWishlist()
        ]);
        if (!cancelled) {
          setProducts(productsData.products || []);
          setWishlistIds((wishlistData.wishlist || []).map(item => item._id));
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setWishlistIds([]);
          setError('Something went wrong while loading products.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [authReady, search, category, sort]);

  // Refresh products when cart changes (to update stock display)
  useEffect(() => {
    const handleCartChange = () => {
      if (!authReady) return;
      // Trigger a refresh of products with a small delay to ensure backend is updated
      setTimeout(() => {
        setLoading(true);
        getProducts({ search, category, sort })
          .then((data) => {
            setProducts(data.products || []);
          })
          .catch(() => {
            setError('Something went wrong while loading products.');
          })
          .finally(() => {
            setLoading(false);
          });
      }, 100);
    };

    window.addEventListener('cart-changed', handleCartChange);
    return () => window.removeEventListener('cart-changed', handleCartChange);
  }, [authReady, search, category, sort]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar authenticated />
      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">Browse the ShopKart catalogue.</p>
        </div>

        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        <div className="mt-8">
          {loading && (
            <p className="text-center text-gray-500 text-lg py-16">Loading products...</p>
          )}

          {!loading && error && (
            <p className="text-center text-red-500 text-lg py-16">{error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-16">No products found.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialWishlisted={wishlistIds.includes(product._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
