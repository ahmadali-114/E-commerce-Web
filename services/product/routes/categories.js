const express = require('express');
const { getAllCategories } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.getById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;