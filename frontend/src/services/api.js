// frontend/src/services/api.js

const API_URL = 'http://localhost:5000/api';

// Helper to get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for fetch with authentication
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
};

// ========== PRODUCT APIs ==========

// Get products with pagination and filters
export const getProducts = async (params = {}) => {
  const { page = 1, category = '', search = '' } = params;
  
  let url = `${API_URL}/products?page=${page}`;
  if (category) url += `&category=${category}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const res = await fetch(`${API_URL}/products/category/${category}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

// Search products
export const searchProducts = async (term) => {
  try {
    const res = await fetch(`${API_URL}/products/search/${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error searching products with term "${term}":`, error);
    throw error;
  }
};

// ========== AUTH APIs ==========

// Register new user
export const register = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user profile
export const getProfile = async () => {
  try {
    const res = await fetchWithAuth(`${API_URL}/auth/profile`);
    
    if (!res.ok) {
      if (res.status === 401) {
        logout();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const res = await fetchWithAuth(`${API_URL}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Profile update failed');
    }
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: error.message };
  }
};

// ========== ORDER APIs ==========

// Create new order
export const createOrder = async (orderData) => {
  try {
    const res = await fetchWithAuth(`${API_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Order creation failed');
    }
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: error.message };
  }
};

// Get current user's orders
export const getMyOrders = async () => {
  try {
    const res = await fetchWithAuth(`${API_URL}/orders/myorders`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (id) => {
  try {
    const res = await fetchWithAuth(`${API_URL}/orders/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// ========== HELPER FUNCTIONS ==========

// Check if user is logged in
export const isAuthenticated = () => {
  return !!getToken();
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};