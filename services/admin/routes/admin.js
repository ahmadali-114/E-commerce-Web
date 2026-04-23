const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { getDashboardStats, getChartData } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/charts', getChartData);

module.exports = router;