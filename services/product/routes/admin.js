const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  getAllProducts,               // ← add this import
  addProduct,
  updateProduct,
  deleteProduct,
  getTotalProducts,
  getLowStockProducts
} = require('../controllers/productController');
const {
  addCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.use(protect, admin);

// Product admin routes
router.get('/products', getAllProducts);     // ← add this line
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category admin routes
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Stats endpoints for Admin Service
router.get('/stats/total-products', getTotalProducts);
router.get('/stats/low-stock', getLowStockProducts);

module.exports = router;