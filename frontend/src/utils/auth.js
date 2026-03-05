// auth.js – Backend API authentication with JWT

const API_URL = 'http://localhost:5000/api/auth';

// ========== HELPER FUNCTIONS ==========

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// ========== USER AUTHENTICATION ==========

// Register a new user
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Registration failed' 
      };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Login failed' 
      };
    }

    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Update user profile
export async function updateUserProfile(updatedFields) {
  try {
    const token = getToken();
    
    if (!token) {
      return { success: false, message: 'Not logged in' };
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedFields)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Profile update failed' 
      };
    }

    // Update stored user data
    localStorage.setItem('user', JSON.stringify(data.user));

    return { 
      success: true, 
      message: data.message,
      user: data.user 
    };

  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// ========== PASSWORD RESET ==========

// Request password reset
export async function requestPasswordReset(email) {
  try {
    // Note: You'll need to create this endpoint on your backend
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Request failed' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Reset link sent to your email' 
    };

  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Reset password with token
export async function resetPassword(token, newPassword) {
  try {
    // Note: You'll need to create this endpoint on your backend
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Password reset failed' 
      };
    }

    return { 
      success: true, 
      message: data.message || 'Password updated successfully' 
    };

  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Validate reset token
export async function validateResetToken(token) {
  try {
    // Note: You'll need to create this endpoint on your backend
    const response = await fetch(`${API_URL}/validate-token/${token}`);
    
    const data = await response.json();

    return { 
      valid: response.ok, 
      message: data.message 
    };

  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// ========== ORDERS ==========

// Save an order for the current user
export async function saveOrder(orderData) {
  try {
    const token = getToken();
    
    if (!token) {
      return { success: false, message: 'Not logged in' };
    }

    // Note: You'll need to create this endpoint on your backend
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Order failed' 
      };
    }

    return { 
      success: true, 
      orderId: data.id,
      message: data.message || 'Order placed successfully' 
    };

  } catch (error) {
    console.error('Order error:', error);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Get orders for the current user
export async function getUserOrders() {
  try {
    const token = getToken();
    
    if (!token) {
      return [];
    }

    // Note: You'll need to create this endpoint on your backend
    const response = await fetch('http://localhost:5000/api/orders/myorders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const orders = await response.json();
    return orders;

  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

// Get single order by ID
export async function getOrderById(orderId) {
  try {
    const token = getToken();
    
    if (!token) {
      return null;
    }

    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const order = await response.json();
    return order;

  } catch (error) {
    console.error('Get order error:', error);
    return null;
  }
}