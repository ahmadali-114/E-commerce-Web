const { query, getOne, insert } = require('../utils/db');

class Category {
  static async getAll() {
    return query('SELECT * FROM categories ORDER BY name');
  }

  static async getById(id) {
    return getOne('SELECT * FROM categories WHERE id = ?', [id]);
  }

  static async getByName(name) {
    return getOne('SELECT id FROM categories WHERE name = ?', [name]);
  }

  static async create(name, description) {
    const result = await insert(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    return this.getById(result);
  }

  static async update(id, name, description) {
    await query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    // Get category name first
    const category = await this.getById(id);
    if (!category) throw new Error('Category not found');
    
    // Check if category is used by products
    const products = await query('SELECT id FROM products WHERE category = ?', [category.name]);
    if (products.length > 0) {
      throw new Error('Cannot delete category that has products');
    }
    
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Category;