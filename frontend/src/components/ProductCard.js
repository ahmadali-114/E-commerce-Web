import { addToCart } from "../utils/addToCart.js";
import { homeQuantityToggle } from "../utils/homeQuantityToggle.js";

const productContainer = document.querySelector("#productContainer");
const productTemplate = document.querySelector("#productTemplate");

export const showProductContainer = (products) => {
  console.log("showProductContainer called with", products?.length, "products");
  
  if (!products) {
    console.error("No products provided");
    return false;
  }

  if (!productTemplate) {
    console.error("productTemplate not found in DOM!");
    return false;
  }

  if (!productContainer) {
    console.error("productContainer not found in DOM!");
    return false;
  }

  // Clear container first
  productContainer.innerHTML = '';
  console.log("Container cleared");

  products.forEach((curProd, index) => {
    console.log(`Creating product ${index + 1}:`, curProd.name);
    
    const { id, name, category, brand, price, description, image, stock } = curProd;

    // Clone the template
    const productClone = document.importNode(productTemplate.content, true);

    // Set ID for the card
    const card = productClone.querySelector("#cardValue");
    if (card) {
      card.setAttribute("id", `card${id}`);
    }
    
    // Set category
    const categoryElem = productClone.querySelector(".category");
    if (categoryElem) categoryElem.textContent = category || 'Uncategorized';
    
    // Set product name
    const nameElem = productClone.querySelector(".productName");
    if (nameElem) nameElem.textContent = name;
    
    // Set brand
    const brandElem = productClone.querySelector(".productBrand");
    if (brandElem) brandElem.textContent = brand || '';
    
    // Set image
    const imgElem = productClone.querySelector(".productImage");
    if (imgElem) {
      imgElem.src = image || 'https://via.placeholder.com/300x200?text=No+Image';
      imgElem.alt = name;
    }
    
    // Set stock
    const stockElem = productClone.querySelector(".productStock");
    if (stockElem) stockElem.textContent = stock || 0;
    
    // Set description (truncated)
    const descElem = productClone.querySelector(".productDescription");
    if (descElem) {
      descElem.textContent = description ? description.substring(0, 100) + "..." : "No description available";
    }
    
    // Set prices
    const priceElem = productClone.querySelector(".productPrice");
    if (priceElem) priceElem.textContent = `₹${price ? Number(price).toLocaleString() : '0'}`;
    
    const originalPriceElem = productClone.querySelector(".productActualPrice");
    if (originalPriceElem) {
      originalPriceElem.textContent = `₹${price ? Number(price * 1.2).toLocaleString() : '0'}`;
    }

    // Add event listener for quantity toggle
    const stockElement = productClone.querySelector(".stockElement");
    if (stockElement) {
      stockElement.addEventListener("click", (event) => {
        event.stopPropagation();
        homeQuantityToggle(event, id, stock);
      });
    }

    // Add event listener for add to cart
    const addToCartBtn = productClone.querySelector(".add-to-cart-button");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        addToCart(event, id, stock);
      });
    }

    // Add click event for the whole card
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('.stockElement')) {
        return;
      }
      window.location.href = `product-details.html?id=${id}`;
    });

    // Append to container
    productContainer.appendChild(productClone);
    console.log(`Product ${index + 1} appended`);
  });
  
  console.log("All products rendered, total cards:", productContainer.children.length);
};