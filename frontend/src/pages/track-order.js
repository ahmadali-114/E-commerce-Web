// track-order.js
import { isLoggedIn, getToken } from '../utils/auth.js';

// Redirect if not logged in
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// Get order ID from URL (using 'id' parameter)
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id') || urlParams.get('order'); // Support both id and order

// If no order ID, redirect to orders page
if (!orderId) {
  window.location.href = 'orders.html';
  throw new Error('No order ID provided');
}

// Load order details from API
const loadTrackingInfo = async () => {
  const container = document.getElementById('trackingContainer');
  
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-tracking">
      <i class="fas fa-spinner fa-spin fa-3x"></i>
      <p>Loading order details...</p>
    </div>
  `;

  try {
    const token = getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Fetch order from API
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();
    console.log("Order loaded:", order);

    if (!order) {
      container.innerHTML = `
        <div class="no-tracking">
          <i class="fas fa-exclamation-circle"></i>
          <h2>Order Not Found</h2>
          <p>No order found with ID: ${orderId}</p>
          <a href="orders.html" class="btn">Back to Orders</a>
        </div>
      `;
      return;
    }

    const date = new Date(order.createdAt).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate tracking steps based on order status
    const steps = [
      { status: 'Order Placed', completed: true, date: date },
      { status: 'Confirmed', completed: order.status !== 'Processing' || order.status === 'Confirmed' || order.status === 'Shipped' || order.status === 'Delivered', date: order.status !== 'Processing' ? 'Confirmed' : null },
      { status: 'Shipped', completed: order.status === 'Shipped' || order.status === 'Delivered', date: order.status === 'Shipped' || order.status === 'Delivered' ? 'Shipped' : null },
      { status: 'Delivered', completed: order.status === 'Delivered', date: order.status === 'Delivered' ? 'Delivered!' : null }
    ];

    // Generate estimated delivery (7 days from order date)
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const estimatedDelivery = deliveryDate.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get status display
    const getStatusDisplay = (status) => {
      const statusMap = {
        'Processing': 'Processing',
        'Confirmed': 'Confirmed',
        'Shipped': 'Shipped',
        'Delivered': 'Delivered',
        'Cancelled': 'Cancelled'
      };
      return statusMap[status] || 'Processing';
    };

    container.innerHTML = `
      <div class="tracking-card">
        <div class="tracking-header">
          <h2>Order #${order.orderNumber || order.id}</h2>
          <div class="order-date-tracking">
            <i class="fas fa-calendar"></i> Placed on ${date}
          </div>
          <div class="order-status-badge" style="margin-top: 1rem;">
            Status: <strong>${getStatusDisplay(order.status)}</strong>
          </div>
        </div>

        <div class="tracking-progress">
          <div class="progress-steps-vertical">
            ${steps.map((step, index) => `
              <div class="progress-step ${step.completed ? 'completed' : ''}">
                <div class="step-indicator">
                  ${step.completed ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
                </div>
                <div class="step-content">
                  <h4>${step.status}</h4>
                  ${step.date ? `<p>${step.date}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="delivery-info-tracking">
          <i class="fas fa-truck"></i>
          <div>
            <h4>Estimated Delivery</h4>
            <p>${estimatedDelivery}</p>
          </div>
        </div>

        <div class="order-summary-tracking">
          <h3>Order Summary</h3>
          <div class="tracking-items">
            ${order.items?.map(item => `
              <div class="tracking-item">
                <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
                <div class="tracking-item-details">
                  <h4>${item.name}</h4>
                  <p>Qty: ${item.quantity} × ₹${Number(item.price).toLocaleString()}</p>
                </div>
                <div class="tracking-item-total">
                  ₹${(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            `).join('') || '<p>No items found</p>'}
          </div>

          <div class="tracking-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${order.shipping === 0 ? 'Free' : '₹' + Number(order.shipping).toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>₹${Number(order.tax || 0).toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>₹${Number(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="shipping-address-tracking">
          <h4><i class="fas fa-map-marker-alt"></i> Shipping Address</h4>
          <p>${order.shippingAddress || 'N/A'}, ${order.city || ''}, ${order.province || ''}</p>
          <p><i class="fas fa-phone"></i> ${order.phone || 'N/A'}</p>
        </div>

        <div class="tracking-actions">
          <a href="orders.html" class="btn">
            <i class="fas fa-arrow-left"></i> Back to Orders
          </a>
          <a href="products.html" class="btn btn-secondary">
            <i class="fas fa-shopping-bag"></i> Continue Shopping
          </a>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading order:', error);
    container.innerHTML = `
      <div class="no-tracking">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Error Loading Order</h2>
        <p>Failed to load order details. Please try again.</p>
        <button class="btn" onclick="location.reload()">Retry</button>
        <a href="orders.html" class="btn btn-secondary" style="margin-left: 1rem;">Back to Orders</a>
      </div>
    `;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTrackingInfo);