const User = require('../models/User');

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, province } = req.body;
    const updatedUser = await User.updateProfile(req.user.id, {
      firstName, lastName, phone, address, city, province
    });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { query } = require('../utils/db');
    const [orderCount] = await query('SELECT COUNT(*) as total FROM orders WHERE userId = ?', [req.params.id]);
    res.json({ ...user, orderCount: orderCount.total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Internal stats
const getTotalUsers = async (req, res) => {
  try {
    const total = await User.getTotalUsers();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  getTotalUsers
};