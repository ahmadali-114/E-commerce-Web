// services/admin/controllers/dashboardController.js
const { fetchProduct, fetchOrder, fetchUser, batchFetch } = require('../utils/fetch');

const getDashboardStats = async (req, res) => {
  try {
    const token = req.headers.authorization;

    // Fetch all stats in parallel
    const [productsData, ordersData, revenueData, pendingData, usersData, lowStockData, recentOrdersData] = await batchFetch(
      [
        { service: 'product', endpoint: '/api/admin/stats/total-products' },
        { service: 'order', endpoint: '/api/admin/stats/total-orders' },
        { service: 'order', endpoint: '/api/admin/stats/total-revenue' },
        { service: 'order', endpoint: '/api/admin/stats/pending-orders' },
        { service: 'user', endpoint: '/api/admin/stats/total-users' },
        { service: 'product', endpoint: '/api/admin/stats/low-stock' },
        { service: 'order', endpoint: '/api/admin/orders?limit=5' },
      ],
      token
    );

    const stats = {
      products: productsData.total || 0,
      orders: ordersData.total || 0,
      users: usersData.total || 0,
      revenue: revenueData.total || 0,
      pendingOrders: pendingData.total || 0,
    };

    res.json({
      stats,
      recentOrders: recentOrdersData.slice(0, 5),
      lowStock: lowStockData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

const getChartData = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const [ordersByStatus, monthlySales] = await batchFetch(
      [
        { service: 'order', endpoint: '/api/admin/stats/orders-by-status' },
        { service: 'order', endpoint: '/api/admin/stats/monthly-sales' },
      ],
      token
    );

    res.json({
      ordersByStatus,
      monthlySales,
    });
  } catch (error) {
    console.error('Chart data error:', error.message);
    res.status(500).json({ message: 'Failed to fetch chart data', error: error.message });
  }
};

module.exports = { getDashboardStats, getChartData };