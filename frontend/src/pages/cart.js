import { getCartProductFromLS } from "../utils/getCartProducts.js";
import { fetchQuantityFromCartLS } from "../utils/fetchQuantityFromCartLS.js";
import { incrementDecrement } from "../utils/incrementDecrement.js";
import { removeProdFromCart } from "../utils/removeProdFromCart.js";
import { updateCartProductTotal } from "../utils/updateCartProductTotal.js";
import { getProductById } from '../services/api.js';

console.log("Cart page loaded");

let cartProducts = getCartProductFromLS();
let cartItems = [];
let isLoading = true;

// Show loading state
function showLoading() {
  const cartElement = document.querySelector("#productCartContainer");
  if (cartElement) {
    cartElement.innerHTML = `
      <div class="loading-cart" style="text-align: center; padding: 3rem;">
        <i class="fas fa-spinner fa-spin fa-3x"></i>
        <p style="margin-top: 1rem;">Loading your cart...</p>
      </div>
    `;
  }
}

// Fetch product details for items in cart
async function loadCartProducts() {
  const cartElement = document.querySelector("#productCartContainer");
  
  if (!cartElement) return;
  
  // Show loading state
  showLoading();
  
  try {
    cartItems = [];
    
    if (cartProducts.length === 0) {
      showEmptyCart();
      return;
    }
    
    for (const cartItem of cartProducts) {
      try {
        const product = await getProductById(cartItem.id);
        if (product) {
          cartItems.push({
            ...product,
            quantity: cartItem.quantity,
            cartPrice: cartItem.price
          });
        } else {
          console.warn(`Product with ID ${cartItem.id} not found`);
        }
      } catch (err) {
        console.error(`Error loading product ${cartItem.id}:`, err);
      }
    }
    
    console.log("Cart items with details:", cartItems);
    isLoading = false;
    
    if (cartItems.length === 0) {
      showEmptyCart();
    } else {
      showCartProduct();
    }
    
  } catch (error) {
    console.error("Error loading cart products:", error);
    cartElement.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Error Loading Cart</h2>
        <p>There was a problem loading your cart. Please try again.</p>
        <button class="btn" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Show empty cart message
function showEmptyCart() {
  const cartElement = document.querySelector("#productCartContainer");
  if (cartElement) {
    cartElement.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items yet.</p>
        <a href="products.html" class="btn">Start Shopping</a>
      </div>
    `;
  }
  updateCartProductTotal();
}

// Display cart products
const showCartProduct = () => {
  const cartElement = document.querySelector("#productCartContainer");
  const templateContainer = document.querySelector("#productCartTemplate");
  
  if (!cartElement || !templateContainer) return;
  
  cartElement.innerHTML = '';

  cartItems.forEach((product) => {
    const { category, id, image, name, stock, price, quantity } = product;

    const productClone = document.importNode(templateContainer.content, true);

    const lSActualData = fetchQuantityFromCartLS(id, price);

    // Set card ID
    const card = productClone.querySelector("#cardValue");
    if (card) card.setAttribute("id", `card${id}`);
    
    // Set category
    const categoryElem = productClone.querySelector(".category");
    if (categoryElem) categoryElem.textContent = category || 'Uncategorized';
    
    // Set product name
    const nameElem = productClone.querySelector(".productName");
    if (nameElem) nameElem.textContent = name;
    
    // Set image
    const imgElem = productClone.querySelector(".productImage");
    if (imgElem) {
      imgElem.src = image || 'https://via.placeholder.com/80';
      imgElem.alt = name;
    }

    // Set quantity and price
    const qtyElem = productClone.querySelector(".productQuantity");
    if (qtyElem) qtyElem.textContent = quantity;
    
    const priceElem = productClone.querySelector(".productPrice");
    if (priceElem) priceElem.textContent = `₹${(price * quantity).toLocaleString()}`;

    // Handle increment and decrement
    const stockElement = productClone.querySelector(".stockElement");
    if (stockElement) {
      stockElement.addEventListener("click", (event) => {
        incrementDecrement(event, id, stock, price);
      });
    }

    // Handle remove
    const removeBtn = productClone.querySelector(".remove-to-cart-button");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => removeProdFromCart(id));
    }

    cartElement.appendChild(productClone);
  });

  updateCartProductTotal();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCartProducts();
});