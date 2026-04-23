const { query, getOne, insert } = require('../utils/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    return getOne('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return getOne(
      'SELECT id, firstName, lastName, email, phone, isAdmin, createdAt FROM users WHERE id = ?',
      [id]
    );
  }

  static async create(userData) {
    const { firstName, lastName, email, phone, password } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await insert(
      'INSERT INTO users (firstName, lastName, email, phone, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone || '', hashedPassword, false]
    );
    return this.findById(userId);
  }

  static async createAdmin(userData, secretKey) {
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      throw new Error('Unauthorized: Invalid secret key');
    }

    const existingAdmin = await getOne('SELECT id FROM users WHERE isAdmin = true');
    if (existingAdmin) {
      throw new Error('Admin account already exists');
    }

    const { firstName, lastName, email, phone, password } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await insert(
      'INSERT INTO users (firstName, lastName, email, phone, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone || '', hashedPassword, true]
    );
    return this.findById(userId);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;