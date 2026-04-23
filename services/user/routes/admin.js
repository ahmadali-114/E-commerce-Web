const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { getAllUsers, getUserById, deleteUser, getTotalUsers } = require('../controllers/userController');

const router = express.Router();

router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.get('/stats/total-users', getTotalUsers);

module.exports = router;