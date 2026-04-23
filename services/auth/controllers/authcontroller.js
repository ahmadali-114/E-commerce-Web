const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ firstName, lastName, email, phone, password });
    if (!user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const token = generateToken(user.id, user.isAdmin);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    delete user.password;

    const token = generateToken(user.id, user.isAdmin);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, secretKey } = req.body;

    const admin = await User.createAdmin(
      { firstName, lastName, email, phone, password },
      secretKey
    );

    const token = generateToken(admin.id, admin.isAdmin);

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      user: admin
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    const message = error.message === 'Unauthorized: Invalid secret key' || error.message === 'Admin account already exists'
      ? error.message
      : 'Server error';
    res.status(400).json({ message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, province } = req.body;
    const { query } = require('../utils/db');

    await query(
      `UPDATE users 
       SET firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, province = ?
       WHERE id = ?`,
      [firstName, lastName, phone, address, city, province, req.user.id]
    );

    const updatedUser = await User.findById(req.user.id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { getOne, query } = require('../utils/db');
    const bcrypt = require('bcryptjs');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await getOne('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkAdmin = async (req, res) => {
  try {
    const { getOne } = require('../utils/db');
    const admin = await getOne('SELECT id FROM users WHERE isAdmin = true');
    
    res.json({
      hasAdmin: !!admin,
      isCurrentUserAdmin: req.user && req.user.isAdmin === 1
    });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  createAdmin,
  getProfile,
  updateProfile,
  changePassword,
  checkAdmin
};