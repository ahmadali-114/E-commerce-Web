console.log("🔴 Categories.js file is LOADED");

const categoriesContainer = document.querySelector("#categoriesContainer");
const categoriesTemplate = document.querySelector("#categoriesTemplate");

console.log("🔴 Container element:", categoriesContainer);
console.log("🔴 Template element:", categoriesTemplate);

export const showCategories = async () => {
  console.log("🔵 showCategories function CALLED");
  
  if (!categoriesContainer) {
    console.error("❌ FATAL: categoriesContainer is null! Check if element with id='categoriesContainer' exists in HTML");
    return;
  }
  
  if (!categoriesTemplate) {
    console.error("❌ FATAL: categoriesTemplate is null! Check if element with id='categoriesTemplate' exists in HTML");
    return;
  }

  try {
    console.log("🟡 Fetching from API: /api/categories");

    const response = await fetch('/api/categories');
    console.log("🟡 Response status:", response.status);
    
    const categories = await response.json();
    console.log("🟢 Categories received:", categories);
    console.log("🟢 Number of categories:", categories.length);
    
    if (categories.length === 0) {
      console.warn("⚠️ No categories found in database");
      return;
    }

    console.log("🟡 Clearing container");
    categoriesContainer.innerHTML = '';
    console.log("🟡 Container cleared, current children:", categoriesContainer.children.length);

    console.log("🟡 Starting to loop through categories");
    categories.forEach((category, index) => {
      const categoryClone = document.importNode(categoriesTemplate.content, true);

      const card = categoryClone.querySelector(".category-card");
      if (card) card.setAttribute("data-category-id", category.id || category.name);

      const img = categoryClone.querySelector(".category-image");
      if (img) {
        img.src = category.image || 'https://via.placeholder.com/300x200?text=Category';
        img.alt = category.name;
      }

      const nameElem = categoryClone.querySelector(".category-name");
      if (nameElem) nameElem.textContent = category.name.charAt(0).toUpperCase() + category.name.slice(1);

      const descElem = categoryClone.querySelector(".category-description");
      if (descElem) descElem.textContent = category.description || `Shop our ${category.name} collection`;

      if (card) {
        card.addEventListener("click", () => {
          window.location.href = `products.html?category=${category.name}`;
        });
      }

      categoriesContainer.appendChild(categoryClone);
    });

    console.log("✅ ALL DONE! Final container children:", categoriesContainer.children.length);
  } catch (error) {
    console.error("❌ ERROR in showCategories:", error);
    if (categoriesContainer) categoriesContainer.innerHTML = `<p style="color:red">Error loading categories: ${error.message}</p>`;
  }
};

const loadLocalCategories = () => {
  console.log("Loading categories from local JSON file...");
  
};