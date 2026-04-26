const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  createAdmin,
  getProfile,
  updateProfile,
  changePassword,
  checkAdmin
} = require('../controllers/authcontroller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);        // ✅ THIS LINE MUST EXIST
router.post('/create-admin', createAdmin);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/check-admin', protect, checkAdmin);

module.exports = router;