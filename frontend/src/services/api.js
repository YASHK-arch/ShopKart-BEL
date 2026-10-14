import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  // Send the HTTP-only JWT cookie on API calls, including protected cart endpoints.
  withCredentials: true,
});

export const registerCustomer = async (data) => {
  const response = await api.post('/customers/register', data);
  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await api.post('/customers/login', data);
  return response.data;
};

export const getCustomerProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

export const getProducts = async ({ search = '', category = '', sort = '' } = {}) => {
  const params = {};

  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export const getCart = async () => {
  // Cart routes return the authenticated customer's cart, not a client-supplied user ID.
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

export const updateQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

export const createPaymentOrder = async (shippingAddress) => {
  // Only the shipping address is sent; the server derives items and totals itself.
  const response = await api.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

export const verifyPayment = async (paymentDetails) => {
  const response = await api.post('/orders/verify-payment', paymentDetails);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default api;



// Axios is a JavaScript library used to make HTTP requests between your application and a server/API.