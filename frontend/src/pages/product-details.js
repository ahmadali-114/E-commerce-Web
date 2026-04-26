// product-details.js
import { getProductById } from '../services/api.js';
import { updateCartValue } from "../utils/updateCartValue.js";
import { isLoggedIn, getCurrentUser, getToken } from '../utils/auth.js';

console.log("🔍 PRODUCT DETAILS PAGE LOADED");

// ========== REVIEWS API FUNCTIONS ==========
const API_URL = '/api';

// Fetch reviews for a product
async function fetchReviews(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}/reviews`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// Submit a new review
async function submitReview(productId, reviewData) {
  try {
    const token = getToken();
    if (!token) {
      alert('Please login to submit a review');
      window.location.href = 'login.html';
      return null;
    }

    const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit review');
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    alert(error.message);
    return null;
  }
}

// Mark review as helpful
async function markReviewHelpful(productId, reviewId) {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/products/${productId}/reviews/${reviewId}/helpful`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return false;
  }
}

// ========== HELPER FUNCTIONS ==========

// Helper function for rating stars
function getRatingStars(rating) {
  if (!rating) return '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }
  return stars;
}

// Setup quantity controls
function setupQuantityControls(maxStock) {
  const qtyInput = document.getElementById('productQty');
  const decrement = document.getElementById('decrementQty');
  const increment = document.getElementById('incrementQty');

  if (!qtyInput || !decrement || !increment) return;

  decrement.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if (val > 1) {
      qtyInput.value = val - 1;
    }
  });

  increment.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if (val < maxStock) {
      qtyInput.value = val + 1;
    }
  });

  qtyInput.addEventListener('change', () => {
    let val = parseInt(qtyInput.value);
    if (val < 1) qtyInput.value = 1;
    if (val > maxStock) qtyInput.value = maxStock;
  });
}

// Add to cart from details page
function addToCartFromDetails(product, quantity) {
  try {
    let cart = JSON.parse(localStorage.getItem('cartProductLS')) || [];
    const totalPrice = product.price * quantity;
    
    console.log(`Adding to cart: ${product.name}, Quantity: ${quantity}, Unit Price: ₹${product.price}, Total: ₹${totalPrice}`);
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price * existingItem.quantity;
    } else {
      cart.push({
        id: product.id,
        quantity: quantity,
        price: totalPrice
      });
    }
    
    localStorage.setItem('cartProductLS', JSON.stringify(cart));
    updateCartValue(cart);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = `✅ Added ${quantity} ${product.name} to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
    return true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add to cart. Please try again.");
    return false;
  }
}

// ========== REVIEWS DISPLAY FUNCTIONS ==========

// Display reviews on the page
function displayReviews(reviews, productId) {
  const reviewsList = document.getElementById('reviewsList');
  const reviewsSummary = document.getElementById('reviewsSummary');
  
  if (!reviewsList || !reviewsSummary) return;
  
  if (!reviews || reviews.length === 0) {
    reviewsSummary.innerHTML = `
      <div class="no-reviews">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    `;
    reviewsList.innerHTML = '';
    return;
  }

  // Calculate average rating
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  // Count ratings by star
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++;
    }
  });

  // Summary HTML
  reviewsSummary.innerHTML = `
    <div class="average-rating">
      <span class="big-rating">${avgRating.toFixed(1)}</span>
      <div class="rating-stars">
        ${getRatingStars(avgRating)}
      </div>
      <span class="total-reviews">${reviews.length} review${reviews.length > 1 ? 's' : ''}</span>
    </div>
    <div class="rating-breakdown">
      ${[5,4,3,2,1].map(star => `
        <div class="rating-bar">
          <span>${star} star</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${reviews.length > 0 ? (ratingCounts[star-1] / reviews.length) * 100 : 0}%"></div>
          </div>
          <span>${ratingCounts[star-1]}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Reviews list HTML
  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-info">
          <strong>${review.userName || 'Anonymous'}</strong>
          <div class="review-rating">
            ${getRatingStars(review.rating)}
          </div>
        </div>
        <span class="review-date">${new Date(review.createdAt).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>
      ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
      <p class="review-content">${review.comment || review.content}</p>
      <div class="review-actions">
        <button class="helpful-btn" onclick="window.markHelpful('${productId}', '${review.id}')">
          <i class="far fa-thumbs-up"></i> Helpful (${review.helpful || 0})
        </button>
      </div>
    </div>
  `).join('');
}

// Setup review form
function setupReviewForm(productId) {
  const writeBtn = document.getElementById('writeReviewBtn');
  const form = document.getElementById('writeReviewForm');
  const cancelBtn = document.getElementById('cancelReviewBtn');
  const submitBtn = document.getElementById('submitReviewBtn');
  const stars = document.querySelectorAll('.star-rating i');
  
  if (!writeBtn || !form || !cancelBtn || !submitBtn) {
    console.log("Review form elements not found");
    return;
  }
  
  let selectedRating = 0;

  // Show form (check if user is logged in)
  writeBtn.addEventListener('click', () => {
    if (!isLoggedIn()) {
      alert('Please login to write a review');
      window.location.href = 'login.html';
      return;
    }
    form.style.display = 'block';
    writeBtn.style.display = 'none';
  });

  // Cancel form
  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    writeBtn.style.display = 'block';
    resetReviewForm();
  });

  // Star rating
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const rating = star.dataset.rating;
      highlightStars(rating);
    });

    star.addEventListener('mouseout', () => {
      highlightStars(selectedRating);
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      highlightStars(selectedRating);
    });
  });

  // Submit review
  submitBtn.addEventListener('click', async () => {
    const title = document.getElementById('reviewTitle').value;
    const content = document.getElementById('reviewContent').value;
    const name = document.getElementById('reviewerName').value || 'Anonymous';

    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!content.trim()) {
      alert('Please write your review');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    // Submit review to API
    const reviewData = {
      rating: selectedRating,
      title,
      comment: content,
      name
    };

    const result = await submitReview(productId, reviewData);

    if (result) {
      // Reset and hide form
      form.style.display = 'none';
      writeBtn.style.display = 'block';
      resetReviewForm();

      // Reload reviews
      const updatedReviews = await fetchReviews(productId);
      displayReviews(updatedReviews, productId);
      
      alert('Thank you for your review!');
    }

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Submit Review';
  });

  // Highlight stars helper
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = 'fa-solid fa-star';
      } else {
        star.className = 'fa-regular fa-star';
      }
    });
  }

  // Reset form
  function resetReviewForm() {
    document.getElementById('reviewTitle').value = '';
    document.getElementById('reviewContent').value = '';
    document.getElementById('reviewerName').value = 'Anonymous';
    selectedRating = 0;
    highlightStars(0);
  }
}

// ========== MAIN INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
  console.log("🔍 PRODUCT DETAILS PAGE LOADED");
  
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  
  console.log("🔍 Looking for product ID:", productId);
  
  if (!productId) {
    showError("No product selected");
    return;
  }

  try {
    console.log("🔍 Fetching product from API...");
    const product = await getProductById(productId);
    console.log("✅ Product received:", product);
    
    const container = document.getElementById('productDetailsContainer');
    const reviewsWrapper = document.getElementById('reviewsWrapper');
    
    if (!product) {
      showError("Product not found");
      return;
    }
    
    if (reviewsWrapper) reviewsWrapper.style.display = 'block';
    
    const discount = product.originalPrice && product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    container.innerHTML = `
      <div class="product-details-card">
        <div class="product-details-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        
        <div class="product-details-info">
          <span class="product-category">${product.category}</span>
          <h1 class="product-title">${product.name}</h1>
          <p class="product-brand">Brand: ${product.brand || 'N/A'}</p>
          
          <div class="product-ratings">
            ${getRatingStars(product.rating)}
            <span class="rating-count">(${product.reviewCount || 0} reviews)</span>
          </div>
          
          <div class="product-prices">
            <span class="current-price">₹${Number(product.price).toLocaleString()}</span>
            ${product.originalPrice ? `
              <span class="original-price">₹${Number(product.originalPrice).toLocaleString()}</span>
              <span class="discount-badge-large">${discount}% OFF</span>
            ` : ''}
          </div>
          
          <div class="product-stock">
            <i class="fas ${product.stock > 10 ? 'fa-check-circle in-stock' : 'fa-exclamation-circle low-stock'}"></i>
            ${product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
          </div>
          
          <div class="product-description">
            <h3>Description</h3>
            <p>${product.description}</p>
          </div>
          
          <div class="product-quantity-detail">
            <h3>Quantity:</h3>
            <div class="quantity-selector">
              <button class="quantity-btn" id="decrementQty">-</button>
              <input type="number" id="productQty" value="1" min="1" max="${product.stock}">
              <button class="quantity-btn" id="incrementQty">+</button>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="add-to-cart-btn" id="detailsAddToCart">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="buy-now-btn" id="buyNowBtn">
              <i class="fas fa-bolt"></i> Buy Now
            </button>
          </div>
          
          <div class="product-meta">
            <p><i class="fas fa-truck"></i> Free shipping on orders above ₹1000</p>
            <p><i class="fas fa-undo"></i> 30-day return policy</p>
          </div>
        </div>
      </div>
    `;

    setupQuantityControls(product.stock);
    
    document.getElementById('detailsAddToCart').addEventListener('click', () => {
      const quantity = parseInt(document.getElementById('productQty').value);
      addToCartFromDetails(product, quantity);
    });

    document.getElementById('buyNowBtn').addEventListener('click', () => {
      const quantity = parseInt(document.getElementById('productQty').value);
      addToCartFromDetails(product, quantity);
      window.location.href = 'addToCart.html';
    });

    // Load and display reviews
    console.log("🔍 Fetching reviews...");
    const reviews = await fetchReviews(productId);
    displayReviews(reviews, productId);
    setupReviewForm(productId);
    
  } catch (error) {
    console.error("❌ Error:", error);
    showError("Failed to load product");
  }
});

function showError(message) {
  const container = document.getElementById('productDetailsContainer');
  const reviewsWrapper = document.getElementById('reviewsWrapper');
  
  if (container) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-exclamation-circle"></i>
        <h3>${message}</h3>
        <p>Please try again later.</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
  }
  if (reviewsWrapper) reviewsWrapper.style.display = 'none';
}

// Make markHelpful available globally
window.markHelpful = async (productId, reviewId) => {
  const success = await markReviewHelpful(productId, reviewId);
  if (success) {
    // Reload reviews to show updated count
    const reviews = await fetchReviews(productId);
    displayReviews(reviews, productId);
  }
};