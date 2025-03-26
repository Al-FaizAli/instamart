// client/src/api/index.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api.onrender.com' // Replace with your deployed backend URL
    : 'http://localhost:5000',
});

// Products API
export const fetchProducts = () => API.get('/api/products');
export const fetchFeaturedProducts = () => API.get('/api/products/featured');
export const fetchProductsByDepartment = (departmentId) => 
  API.get(`/api/products/department/${departmentId}`);
export const searchProducts = (query) => 
  API.get(`/api/products/search?q=${query}`);

// Departments API
export const fetchDepartments = () => API.get('/api/departments');

export default API;