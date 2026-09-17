import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
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

export default api;
