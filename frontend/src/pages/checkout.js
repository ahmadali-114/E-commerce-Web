// checkout.js – Complete checkout with auth.js integration
import { isLoggedIn, getCurrentUser, updateUserProfile, saveOrder } from '../utils/auth.js';
import { getCartProductFromLS } from "../utils/getCartProducts.js";
import { updateCartValue } from "../utils/updateCartValue.js";
import { getProductById } from '../services/api.js';

// ========== REDIRECT IF NOT LOGGED IN ==========
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// ========== LOAD CART ITEMS ==========
const cartProducts = getCartProductFromLS();

if (cartProducts.length === 0) {
  window.location.href = 'addToCart.html';
}

// ========== LOAD PRODUCT DETAILS FROM API ==========
let cartItems = [];
let isLoading = true;

// Show loading state
function showLoading() {
  const container = document.getElementById('checkoutItems');
  if (container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading cart items...</p></div>';
  }
}

// Load product details for each cart item
async function loadCartItems() {
  try {
    showLoading();
    cartItems = [];
    
    for (const cartItem of cartProducts) {
      try {
        const product = await getProductById(cartItem.id);
        if (product) {
          cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: cartItem.quantity
          });
        }
      } catch (err) {
        console.error(`Error loading product ${cartItem.id}:`, err);
      }
    }
    
    console.log("Cart items loaded:", cartItems);
    isLoading = false;
    displayCheckoutItems();
    
  } catch (error) {
    console.error("Error loading cart items:", error);
    isLoading = false;
    const container = document.getElementById('checkoutItems');
    if (container) {
      container.innerHTML = '<div class="error-message">Error loading cart items. Please try again.</div>';
    }
  }
}

// ========== DISPLAY ORDER SUMMARY ==========
function displayCheckoutItems() {
  const container = document.getElementById('checkoutItems');
  
  if (!container) return;
  
  if (cartItems.length === 0) {
    container.innerHTML = '<p>No items in cart</p>';
    return;
  }

  let subtotal = 0;
  let html = '';

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
      <div class="checkout-item">
        <div class="item-image">
          <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
          <span class="item-quantity">${item.quantity}x</span>
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <p class="item-price">₹${Number(item.price).toLocaleString()} each</p>
        </div>
        <div class="item-total">₹${itemTotal.toLocaleString()}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  const tax = 50;
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('shippingCost');
  const taxEl = document.getElementById('checkoutTax');
  const totalEl = document.getElementById('checkoutTotal');
  
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
  if (taxEl) taxEl.textContent = `₹${tax}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;

  return { subtotal, tax, shipping, total };
}

// ========== PAYMENT FORM TOGGLES & FORMATTING ==========
function setupPaymentMethods() {
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardForm = document.getElementById('cardPaymentForm');
  const easypaisaForm = document.getElementById('easypaisaForm');

  if (!paymentRadios.length) return;

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (cardForm) cardForm.style.display = 'none';
      if (easypaisaForm) easypaisaForm.style.display = 'none';

      if (e.target.value === 'card' && cardForm) {
        cardForm.style.display = 'block';
      } else if (e.target.value === 'easypaisa' && easypaisaForm) {
        easypaisaForm.style.display = 'block';
      }
    });
  });

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
      let parts = [];
      for (let i = 0; i < v.length && i < 16; i += 4) {
        parts.push(v.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    });
  }

  // Expiry formatting
  const expiryDate = document.getElementById('expiryDate');
  if (expiryDate) {
    expiryDate.addEventListener('input', (e) => {
      let v = e.target.value.replace(/[^0-9]/g, '');
      if (v.length >= 2) {
        e.target.value = v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
      } else {
        e.target.value = v;
      }
    });
  }

  // CVV
  const cvv = document.getElementById('cvv');
  if (cvv) {
    cvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
  }

  // Mobile
  const mobileNumber = document.getElementById('mobileNumber');
  if (mobileNumber) {
    mobileNumber.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 11);
    });
  }
}

// ========== PRE-FILL FORM WITH USER DATA ==========
function prefillUserData() {
  const user = getCurrentUser();
  if (!user) return;

  const fullNameEl = document.getElementById('fullName');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const addressEl = document.getElementById('address');
  const cityEl = document.getElementById('city');
  const provinceEl = document.getElementById('province');

  if (fullNameEl) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    fullNameEl.value = fullName;
  }
  if (emailEl) emailEl.value = user.email || '';
  if (phoneEl) phoneEl.value = user.phone || '';
  if (addressEl) addressEl.value = user.address || '';
  if (cityEl) cityEl.value = user.city || '';
  if (provinceEl) provinceEl.value = user.province || '';
}

// ========== VALIDATE FORM ==========
function validateForm() {
  const fullName = document.getElementById('fullName')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const address = document.getElementById('address')?.value.trim();
  const city = document.getElementById('city')?.value.trim();
  const province = document.getElementById('province')?.value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

  if (!fullName || !email || !phone || !address || !city || !province || !paymentMethod) {
    alert('Please fill in all required fields');
    return false;
  }

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return false;
  }

  // Phone (simple)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 12) {
    alert('Please enter a valid phone number');
    return false;
  }

  // Validate card if selected
  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    const expiry = document.getElementById('expiryDate')?.value;
    const cvv = document.getElementById('cvv')?.value;
    const cardName = document.getElementById('cardName')?.value.trim();

    if (!cardNumber || !expiry || !cvv || !cardName) {
      alert('Please fill in all card details');
      return false;
    }
    if (cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }
    if (cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      alert('Please enter expiry in MM/YY format');
      return false;
    }
  }

  // Validate EasyPaisa if selected
  if (paymentMethod === 'easypaisa') {
    const mobile = document.getElementById('mobileNumber')?.value;
    const otp = document.getElementById('otp')?.value;
    if (!mobile || !otp) {
      alert('Please enter mobile number and OTP');
      return false;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid mobile number');
      return false;
    }
    if (otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return false;
    }
  }

  return true;
}

// ========== PLACE ORDER ==========
async function placeOrder() {
  if (!validateForm()) return;

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const originalText = placeOrderBtn.innerHTML;
  
  // Disable button and show loading
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    const fullName = document.getElementById('fullName').value.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Prepare address object
    const addressObj = {
      street: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      province: document.getElementById('province').value,
      postalCode: document.getElementById('postalCode')?.value.trim() || ''
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 50;
    const shipping = subtotal > 1000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    // Build order data
    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: addressObj.street,
      city: addressObj.city,
      province: addressObj.province,
      postalCode: addressObj.postalCode,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' :
                      paymentMethod === 'card' ? 'Credit/Debit Card' : 'EasyPaisa/JazzCash',
      notes: document.getElementById('orderNotes')?.value.trim() || ''
    };

    // Save order using API
    const result = await saveOrder(orderData);

    if (result.success) {
      // Clear cart
      localStorage.removeItem('cartProductLS');
      updateCartValue([]);

      // Show confirmation modal
      showOrderConfirmation(result.orderId || 'ORD-' + Date.now(), orderData);
    } else {
      alert('Failed to place order: ' + result.message);
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Order error:', error);
    alert('An error occurred. Please try again.');
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = originalText;
  }
}

// ========== SHOW CONFIRMATION MODAL ==========
function showOrderConfirmation(orderId, orderData) {
  const modal = document.getElementById('orderModal');
  const orderNumberEl = document.getElementById('orderNumber');
  const orderPaymentEl = document.getElementById('orderPayment');
  const orderAmountEl = document.getElementById('orderAmount');
  const orderAddressEl = document.getElementById('orderAddress');
  const orderMessageEl = document.getElementById('orderMessage');

  if (orderNumberEl) orderNumberEl.textContent = orderId;
  if (orderPaymentEl) orderPaymentEl.textContent = orderData.paymentMethod;
  if (orderAmountEl) orderAmountEl.textContent = `₹${orderData.total.toLocaleString()}`;
  if (orderAddressEl) {
    orderAddressEl.textContent = `${orderData.shippingAddress}, ${orderData.city}, ${orderData.province}`;
  }
  if (orderMessageEl) {
    orderMessageEl.textContent = orderData.paymentMethod === 'Cash on Delivery' 
      ? 'Your order has been confirmed! Pay when you receive your items.'
      : 'Payment successful! Your order has been confirmed.';
  }

  if (modal) modal.style.display = 'flex';
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
  // Load cart items first
  loadCartItems().then(() => {
    setupPaymentMethods();
    prefillUserData();
  });

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }
});

// Close modal on outside click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('orderModal');
  if (e.target === modal) {
    modal.style.display = 'none';
    window.location.href = 'products.html';
  }
});