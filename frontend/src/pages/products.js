// products.js
import { getProducts, searchProducts } from '../services/api.js';
import { setupSearch } from "../utils/search.js";
import { homeQuantityToggle } from "../utils/homeQuantityToggle.js";
import { addToCart } from "../utils/addToCart.js";

console.log("Products.js loaded");

// Add this at the top of products.js after imports
console.log("Checking API connection...");
fetch('http://localhost:5000/api/products')
  .then(res => res.json())
  .then(data => console.log("API test - products:", data))
  .catch(err => console.error("API test failed:", err));

const productContainer = document.querySelector("#productContainer");
const productTemplate = document.querySelector("#productTemplate");
const categoryTitle = document.querySelector("#categoryTitle");
const productCount = document.querySelector("#productCount");

console.log("Product Container:", productContainer);
console.log("Product Template:", productTemplate);

// Check if template exists
if (!productTemplate) {
  console.error("❌ CRITICAL ERROR: productTemplate not found!");
  document.body.innerHTML += '<p style="color:red">Template missing!</p>';
}

// Get category from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get('category');

console.log("Selected Category:", selectedCategory);

// Category display names mapping
const categoryNames = {
  'electronics': 'Electronics',
  'clothing': 'Clothing',
  'sports': 'Sports & Fitness',
  'home-appliances': 'Home Appliances',
  'books': 'Books',
  'beauty': 'Beauty & Personal Care',
  'toys': 'Toys & Games',
  'automotive': 'Automotive',
  'groceries': 'Groceries',
  'furniture': 'Furniture',
  'pets': 'Pets',
  'garden': 'Garden',
  'office': 'Office',
  'baby': 'Baby',
  'music': 'Music',
  'jewelry': 'Jewelry',
  'watches': 'Watches',
  'shoes': 'Shoes',
  'bags': 'Bags',
  'camping': 'Camping',
  'photography': 'Photography',
  'gaming': 'Gaming'
};

// Store current products being displayed
let currentProducts = [];
let currentSort = 'default';
let minPrice = 0;
let maxPrice = Infinity;
let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

// Update category title
const updateCategoryTitle = () => {
  if (categoryTitle) {
    categoryTitle.textContent = selectedCategory ? 
      (categoryNames[selectedCategory] || selectedCategory) : 
      "All Products";
  }
};

// Sort products function (client-side sorting after fetching)
const sortProducts = (productsToSort, sortType) => {
  const sorted = [...productsToSort];
  
  switch(sortType) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return productsToSort;
  }
};

// Filter by price (client-side)
const filterByPrice = (productsToFilter) => {
  return productsToFilter.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

// Fetch products from API
const fetchProducts = async () => {
  try {
    console.log("Fetching products from API...");
    
    const params = {
      page: currentPage,
      category: selectedCategory || '',
      search: currentSearch
    };
    
    const data = await getProducts(params);
    console.log("Products fetched:", data);
    
    currentProducts = data.products || [];
    totalPages = data.pages || 1;
    
    // Update UI
    if (productCount) {
      productCount.textContent = `${data.total || 0} Product${data.total !== 1 ? 's' : ''}`;
    }
    
    // Apply client-side filters and sorting
    let filteredProducts = filterByPrice(currentProducts);
    filteredProducts = sortProducts(filteredProducts, currentSort);
    
    renderProducts(filteredProducts);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    if (productContainer) {
      productContainer.innerHTML = `
        <div class="no-products">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error Loading Products</h3>
          <p>Failed to load products. Please try again later.</p>
          <button class="btn" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
};

// Render products to DOM
const renderProducts = (productsToRender) => {
  console.log("renderProducts called with", productsToRender.length, "products");
  
  if (!productContainer) {
    console.error("Product container not found!");
    return;
  }
  
  if (!productTemplate) {
    console.error("Product template not found!");
    productContainer.innerHTML = '<p style="color:red">Template missing!</p>';
    return;
  }

  // Clear container first
  productContainer.innerHTML = '';
  console.log("Container cleared");

  // Check if we have products
  if (!productsToRender || productsToRender.length === 0) {
    console.log("No products found");
    productContainer.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <h3>No Products Found</h3>
        <p>No products available in this category.</p>
        <a href="products.html" class="btn">View All Products</a>
      </div>
    `;
    return;
  }

  console.log(`Rendering ${productsToRender.length} products`);

  productsToRender.forEach((curProd, index) => {
    console.log(`Rendering product ${index + 1}:`, curProd.name);
    
    const { id, name, category, brand, price, originalPrice, description, image, stock, rating, reviewCount } = curProd;

    // Clone the template
    const productClone = document.importNode(productTemplate.content, true);

    // Set ID for the card
    const card = productClone.querySelector("#cardValue");
    if (card) card.setAttribute("id", `card${id}`);
    
    // Set category
    const categoryElem = productClone.querySelector(".category");
    if (categoryElem) categoryElem.textContent = category;
    
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
    if (stockElem) stockElem.textContent = stock;
    
    // Set description (truncated)
    const descElem = productClone.querySelector(".productDescription");
    if (descElem) descElem.textContent = description ? description.substring(0, 100) + "..." : "No description available";
    
    // Set prices
    const priceElem = productClone.querySelector(".productPrice");
    if (priceElem) priceElem.textContent = `₹${price ? Number(price).toLocaleString() : '0'}`;
    
    const originalPriceElem = productClone.querySelector(".productActualPrice");
    if (originalPriceElem && originalPrice) {
      originalPriceElem.textContent = `₹${Number(originalPrice).toLocaleString()}`;
    }
    
    // Calculate and set discount
    if (originalPrice && price && originalPrice > price) {
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      const discountElem = productClone.querySelector(".discount-badge");
      if (discountElem) {
        discountElem.textContent = `${discount}% OFF`;
      }
    }

    // Set rating stars
    const ratingContainer = productClone.querySelector(".productRating");
    if (ratingContainer && rating) {
      ratingContainer.innerHTML = '';
      
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          ratingContainer.innerHTML += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
          ratingContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
          ratingContainer.innerHTML += '<i class="fa-regular fa-star"></i>';
        }
      }
      
      if (reviewCount) {
        ratingContainer.innerHTML += `<span> (${reviewCount.toLocaleString()})</span>`;
      }
    }

    // Add event listener for quantity toggle
    const stockElement = productClone.querySelector(".stockElement");
    if (stockElement) {
      stockElement.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent card click
        homeQuantityToggle(event, id, stock);
      });
    }

    // Add event listener for add to cart
    const addToCartBtn = productClone.querySelector(".add-to-cart-button");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent card click
        addToCart(event, id, stock);
      });
    }

    // DIRECT CLICK HANDLER FOR THE CARD
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on buttons
      if (e.target.tagName === 'BUTTON' || e.target.closest('.stockElement')) {
        return;
      }
      
      const productId = this.id.replace('card', '');
      console.log(`🖱️ Card clicked! Navigating to product-details.html?id=${productId}`);
      window.location.href = `product-details.html?id=${productId}`;
    });

    // Append to container
    productContainer.appendChild(productClone);
    console.log(`Product ${index + 1} appended to container`);
  });
  
  console.log("All products rendered");
  
  // Add pagination controls if needed
  if (totalPages > 1) {
    addPaginationControls();
  }
};

// Add pagination controls
const addPaginationControls = () => {
  const paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  paginationDiv.style.cssText = 'display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;';
  
  let paginationHTML = '';
  
  if (currentPage > 1) {
    paginationHTML += `<button class="btn pagination-btn" data-page="${currentPage - 1}">Previous</button>`;
  }
  
  paginationHTML += `<span style="padding: 1rem;">Page ${currentPage} of ${totalPages}</span>`;
  
  if (currentPage < totalPages) {
    paginationHTML += `<button class="btn pagination-btn" data-page="${currentPage + 1}">Next</button>`;
  }
  
  paginationDiv.innerHTML = paginationHTML;
  productContainer.parentNode.appendChild(paginationDiv);
  
  // Add event listeners to pagination buttons
  document.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      fetchProducts();
      
      // Remove old pagination
      const oldPagination = document.querySelector('.pagination');
      if (oldPagination) oldPagination.remove();
    });
  });
};

// Apply sort and filter then re-render
const applySortAndFilter = () => {
  let filteredProducts = filterByPrice(currentProducts);
  filteredProducts = sortProducts(filteredProducts, currentSort);
  renderProducts(filteredProducts);
};

// Setup sort and filter listeners
const setupSortFilter = () => {
  const sortSelect = document.getElementById('sortProducts');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const applyBtn = document.getElementById('applyPriceFilter');
  const clearBtn = document.getElementById('clearFilter');
  const activeFilters = document.getElementById('activeFilters');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applySortAndFilter();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      minPrice = parseInt(minPriceInput.value) || 0;
      maxPrice = parseInt(maxPriceInput.value) || Infinity;
      applySortAndFilter();
      updateActiveFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      minPriceInput.value = '';
      maxPriceInput.value = '';
      minPrice = 0;
      maxPrice = Infinity;
      currentSort = 'default';
      if (sortSelect) sortSelect.value = 'default';
      applySortAndFilter();
      updateActiveFilters();
    });
  }
};

// Update active filters display
const updateActiveFilters = () => {
  const activeFilters = document.getElementById('activeFilters');
  if (!activeFilters) return;
  
  let filters = [];
  if (minPrice > 0) filters.push(`Min: ₹${minPrice}`);
  if (maxPrice < Infinity) filters.push(`Max: ₹${maxPrice}`);
  
  if (filters.length > 0) {
    activeFilters.innerHTML = `
      <span class="filter-label">Active Filters:</span>
      ${filters.map(f => `<span class="filter-tag">${f}</span>`).join('')}
    `;
  } else {
    activeFilters.innerHTML = '';
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing products page");
  
  updateCategoryTitle();
  fetchProducts(); // Fetch from API instead of using local data
  setupSortFilter();
  
  // Setup search
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  
  if (searchInput && searchBtn) {
    console.log("Search elements found, setting up search");
    
    searchBtn.addEventListener('click', async () => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      await fetchProducts();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchProducts();
      }
    });
  } else {
    console.log("Search elements not found - search disabled");
  }
});