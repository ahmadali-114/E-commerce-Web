// orders.js
import { getMyOrders, getToken, isLoggedIn } from '../utils/auth.js';

// Redirect if not logged in
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// Load orders from API
const loadOrders = async () => {
  const container = document.getElementById('ordersContainer');
  
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-orders">
      <i class="fas fa-spinner fa-spin fa-3x"></i>
      <p>Loading your orders...</p>
    </div>
  `;

  try {
    const orders = await getMyOrders();
    console.log("Orders loaded:", orders);
    
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-box-open no-orders-icon"></i>
          <h2>No Orders Yet</h2>
          <p>Looks like you haven't placed any orders yet.</p>
          <a href="products.html" class="btn">Start Shopping</a>
        </div>
      `;
      return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let ordersHTML = '';
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Calculate total items
      const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      // Get status color
      const statusColor = {
        'Processing': '#ffc107',
        'Confirmed': '#28a745',
        'Shipped': '#17a2b8',
        'Delivered': '#28a745',
        'Cancelled': '#dc3545'
      }[order.status] || '#ffc107';

      ordersHTML += `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #${order.orderNumber || order.id}</h3>
              <p class="order-date"><i class="fas fa-calendar"></i> ${date}</p>
            </div>
            <div class="order-status" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
              ${order.status || 'Processing'}
            </div>
          </div>

          <div class="order-items">
            ${order.items?.map(item => `
              <div class="order-item">
                <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" class="order-item-image">
                <div class="order-item-details">
                  <h4>${item.name}</h4>
                  <div class="order-item-meta">
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                    <span class="item-price">₹${Number(item.price).toLocaleString()} each</span>
                  </div>
                </div>
                <div class="order-item-total">
                  ₹${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            `).join('') || '<p>No items</p>'}
          </div>

          <div class="order-footer">
            <div class="order-summary">
              <div class="summary-row">
                <span>Total Items:</span>
                <strong>${totalItems}</strong>
              </div>
              <div class="summary-row">
                <span>Payment Method:</span>
                <strong>${order.paymentMethod || 'Cash on Delivery'}</strong>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <strong>₹${Number(order.total || 0).toLocaleString()}</strong>
              </div>
            </div>
            <div class="order-actions">
              <button class="track-order-btn" onclick="trackOrder('${order.orderNumber || order.id}')">
                <i class="fas fa-truck"></i> Track Order
              </button>
              <button class="reorder-btn" onclick="reorder('${order.id}')">
                <i class="fas fa-redo-alt"></i> Reorder
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = ordersHTML;
    
  } catch (error) {
    console.error("Error loading orders:", error);
    container.innerHTML = `
      <div class="no-orders">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Error Loading Orders</h2>
        <p>Failed to load your orders. Please try again.</p>
        <button class="btn" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
};

// Track order function
window.trackOrder = (orderId) => {
  window.location.href = `track-order.html?id=${orderId}`;
};

// Reorder function
window.reorder = async (orderId) => {
  try {
    const token = getToken();
    if (!token) {
      alert('Please login to reorder');
      window.location.href = 'login.html';
      return;
    }

    // Fetch the order details
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();
    
    if (order && order.items) {
      // Get current cart
      let cart = JSON.parse(localStorage.getItem('cartProductLS')) || [];
      
      // Add items from order to cart
      order.items.forEach(item => {
        const existingItem = cart.find(cartItem => cartItem.id === item.productId);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.push({
            id: item.productId,
            quantity: item.quantity,
            price: item.price * item.quantity
          });
        }
      });
      
      // Save cart
      localStorage.setItem('cartProductLS', JSON.stringify(cart));
      
      // Update cart value
      const { updateCartValue } = await import('../utils/updateCartValue.js');
      updateCartValue(cart);
      
      // Show success message
      alert('Items added to your cart!');
      window.location.href = 'addToCart.html';
    }
  } catch (error) {
    console.error('Reorder error:', error);
    alert('Failed to reorder. Please try again.');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadOrders);