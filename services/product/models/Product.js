const { query, getOne, insert } = require('../utils/db');

class Product {
  static async getAll({ page = 1, limit = 10, category = '', search = '' }) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const term = `%${search}%`;
      countParams.push(term, term, term);
    }
    const [totalResult] = await query(countSql, countParams);

    return {
      products,
      page: parseInt(page),
      pages: Math.ceil(totalResult.total / limit),
      total: totalResult.total
    };
  }

  static async getById(id) {
    return getOne('SELECT * FROM products WHERE id = ?', [id]);
  }

  static async create(productData) {
    const { name, brand, category, description, price, stock, image, originalPrice } = productData;
    const result = await insert(
      `INSERT INTO products (name, brand, category, description, price, stock, image, originalPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand || '', category || '', description || '', price, stock || 0, image || '', originalPrice || null]
    );
    return this.getById(result);
  }

  static async update(id, productData) {
    const { name, brand, category, description, price, stock, image, originalPrice } = productData;
    await query(
      `UPDATE products 
       SET name = ?, brand = ?, category = ?, description = ?, price = ?, stock = ?, image = ?, originalPrice = ?
       WHERE id = ?`,
      [name, brand, category, description, price, stock, image, originalPrice, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    // Check if product exists in orders
    const orders = await query('SELECT id FROM order_items WHERE productId = ?', [id]);
    if (orders.length > 0) {
      throw new Error('Cannot delete product that has been ordered');
    }
    await query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }

  static async getLowStock(limit = 5) {
    return query('SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT ?', [limit]);
  }

  static async getTotalCount() {
    const [result] = await query('SELECT COUNT(*) as total FROM products');
    return result.total;
  }
}

module.exports = Product;