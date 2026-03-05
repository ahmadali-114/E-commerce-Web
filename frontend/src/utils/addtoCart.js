// addToCart.js
import { getCartProductFromLS } from "./getCartProducts.js";
import { showToast } from "./showToast.js";
import { updateCartValue } from "./updateCartValue.js";

export const addToCart = (event, id, stock) => {
  let arrLocalStorageProduct = getCartProductFromLS();

  const currentProdElem = document.querySelector(`#card${id}`);
  if (!currentProdElem) return;
  
  // Get quantity and price from the product card
  let quantity = parseInt(currentProdElem.querySelector(".productQuantity").innerText) || 1;
  let price = currentProdElem.querySelector(".productPrice").innerText;
  
  // Remove ₹ symbol and convert to number
  price = parseFloat(price.replace("₹", "").replace(/,/g, ""));
  
  // Calculate total price (price per unit × quantity)
  let totalPrice = price * quantity;

  let existingProd = arrLocalStorageProduct.find(
    (curProd) => curProd.id === id
  );

  if (existingProd) {
    // If product already exists in cart
    if (quantity > 1) {
      // If user selected quantity > 1, add that many
      quantity = Number(existingProd.quantity) + Number(quantity);
      totalPrice = price * quantity;
    } else {
      // If user clicked add to cart with default quantity 1, just add 1
      quantity = Number(existingProd.quantity) + 1;
      totalPrice = price * quantity;
    }
    
    let updatedCart = { id, quantity, price: totalPrice };

    updatedCart = arrLocalStorageProduct.map((curProd) => {
      return curProd.id === id ? updatedCart : curProd;
    });

    localStorage.setItem("cartProductLS", JSON.stringify(updatedCart));
    showToast("add", id);
    updateCartValue(updatedCart);
    return;
  }

  // New product - add to cart
  arrLocalStorageProduct.push({ 
    id, 
    quantity: quantity, 
    price: totalPrice 
  });
  
  localStorage.setItem("cartProductLS", JSON.stringify(arrLocalStorageProduct));

  updateCartValue(arrLocalStorageProduct);
  showToast("add", id);
};