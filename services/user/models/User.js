const { query, getOne } = require('../utils/db');

class User {
  static async findById(id) {
    return getOne(
      `SELECT id, firstName, lastName, email, phone, address, city, province, isAdmin, createdAt
       FROM users WHERE id = ?`,
      [id]
    );
  }

  static async updateProfile(id, data) {
    const { firstName, lastName, phone, address, city, province } = data;
    await query(
      `UPDATE users SET firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, province = ?
       WHERE id = ?`,
      [firstName, lastName, phone, address, city, province, id]
    );
    return this.findById(id);
  }

  static async getAllUsers() {
    return query(
      `SELECT id, firstName, lastName, email, phone, isAdmin, createdAt
       FROM users ORDER BY id DESC`
    );
  }

  static async deleteUser(id) {
    // Check if user is the only admin
    const user = await getOne('SELECT isAdmin FROM users WHERE id = ?', [id]);
    if (user && user.isAdmin) {
      const adminCount = await getOne('SELECT COUNT(*) as total FROM users WHERE isAdmin = true');
      if (adminCount.total <= 1) {
        throw new Error('Cannot delete the only admin user');
      }
    }
    // Check if user has orders
    const orders = await query('SELECT id FROM orders WHERE userId = ?', [id]);
    if (orders.length > 0) {
      throw new Error('Cannot delete user with existing orders');
    }
    await query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  static async getTotalUsers() {
    const [result] = await query('SELECT COUNT(*) as total FROM users');
    return result.total;
  }
}

module.exports = User;