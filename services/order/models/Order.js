const { query, getOne, insert } = require('../utils/db');
const axios = require('axios');

class Order {
  static async create(userId, orderData) {
    const {
      items, shippingAddress, city, province, postalCode,
      paymentMethod, subtotal, shipping, tax, total, notes
    } = orderData;

    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Insert order
    const orderId = await insert(
      `INSERT INTO orders (
        userId, orderNumber, subtotal, shipping, tax, total,
        paymentMethod, shippingAddress, city, province, postalCode,
        notes, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId, orderNumber, subtotal || 0, shipping || 0, tax || 0,
        total || 0, paymentMethod || 'Cash on Delivery', shippingAddress,
        city, province, postalCode || '', notes || '', 'Processing'
      ]
    );

    // Insert order items and update stock (via Product Service)
    for (const item of items) {
      await insert(
        `INSERT INTO order_items (orderId, productId, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );

      // Call Product Service to update stock
      try {
        await axios.put(`${process.env.PRODUCT_SERVICE_URL}/api/internal/stock`, {
          productId: item.productId,
          quantity: item.quantity
        });
      } catch (err) {
        console.error('Stock update failed:', err.message);
        // In production, implement retry or event queue
      }
    }

    return this.getById(orderId);
  }

  static async getById(orderId) {
    const order = await getOne(
      `SELECT o.*, u.email, u.firstName, u.lastName, u.phone
       FROM orders o
       JOIN users u ON o.userId = u.id
       WHERE o.id = ?`,
      [orderId]
    );
    if (!order) return null;
    const items = await query(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [orderId]
    );
    return { ...order, items };
  }

  static async getUserOrders(userId) {
    const orders = await query(
      `SELECT o.*, COUNT(oi.id) as itemCount, SUM(oi.quantity) as totalItems
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.orderId
       WHERE o.userId = ?
       GROUP BY o.id
       ORDER BY o.createdAt DESC`,
      [userId]
    );
    // Fetch items for each order
    for (let order of orders) {
      const items = await query(
        `SELECT oi.*, p.name, p.image
         FROM order_items oi
         JOIN products p ON oi.productId = p.id
         WHERE oi.orderId = ?`,
        [order.id]
      );
      order.items = items;
    }
    return orders;
  }

  static async getAllOrders() {
    const orders = await query(
      `SELECT o.*, u.email, u.firstName, u.lastName, u.phone
       FROM orders o
       JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC`
    );
    for (let order of orders) {
      const items = await query(
        `SELECT oi.*, p.name, p.image
         FROM order_items oi
         JOIN products p ON oi.productId = p.id
         WHERE oi.orderId = ?`,
        [order.id]
      );
      order.items = items;
    }
    return orders;
  }

  static async updateStatus(orderId, status) {
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    return this.getById(orderId);
  }

  static async getTotalOrders() {
    const [result] = await query('SELECT COUNT(*) as total FROM orders');
    return result.total;
  }

  static async getTotalRevenue() {
    const [result] = await query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = "Delivered"');
    return result.total;
  }

  static async getPendingOrdersCount() {
    const [result] = await query(`SELECT COUNT(*) as total FROM orders WHERE status IN ('Processing', 'Confirmed', 'Shipped')`);
    return result.total;
  }

  static async getMonthlySales(months = 6) {
    return query(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
              COUNT(*) as orders,
              SUM(total) as revenue
       FROM orders
       WHERE status = 'Delivered'
         AND createdAt >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
       ORDER BY month DESC`,
      [months]
    );
  }

  static async getOrdersByStatus() {
    return query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`);
  }
}

module.exports = Order;