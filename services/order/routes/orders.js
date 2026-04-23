const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;