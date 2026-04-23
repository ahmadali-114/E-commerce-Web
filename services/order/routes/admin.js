const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  getAllOrders,
  updateOrderStatus,
  getTotalOrders,
  getTotalRevenue,
  getPendingOrdersCount,
  getMonthlySales,
  getOrdersByStatus
} = require('../controllers/orderController');

const router = express.Router();

router.use(protect, admin);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Stats endpoints for Admin Service
router.get('/stats/total-orders', getTotalOrders);
router.get('/stats/total-revenue', getTotalRevenue);
router.get('/stats/pending-orders', getPendingOrdersCount);
router.get('/stats/monthly-sales', getMonthlySales);
router.get('/stats/orders-by-status', getOrdersByStatus);

module.exports = router;