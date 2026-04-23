const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = await Order.create(req.user.id, orderData);
    res.status(201).json({
      message: 'Order placed successfully',
      id: order.id,
      orderNumber: order.orderNumber,
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!req.user.isAdmin && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.updateStatus(req.params.id, status);
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Stats endpoints
const getTotalOrders = async (req, res) => {
  try {
    const total = await Order.getTotalOrders();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalRevenue = async (req, res) => {
  try {
    const total = await Order.getTotalRevenue();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingOrdersCount = async (req, res) => {
  try {
    const total = await Order.getPendingOrdersCount();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const data = await Order.getMonthlySales();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrdersByStatus = async (req, res) => {
  try {
    const data = await Order.getOrdersByStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getTotalOrders,
  getTotalRevenue,
  getPendingOrdersCount,
  getMonthlySales,
  getOrdersByStatus
};