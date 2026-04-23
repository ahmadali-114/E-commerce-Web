const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const search = req.query.search || '';

    const result = await Product.getAll({ page, limit, category, search });
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, brand, category, description, price, stock, image, originalPrice } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const product = await Product.create({ name, brand, category, description, price, stock, image, originalPrice });
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, description, price, stock, image, originalPrice } = req.body;
    const product = await Product.update(id, { name, brand, category, description, price, stock, image, originalPrice });
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Internal stats endpoint for Admin Service
const getTotalProducts = async (req, res) => {
  try {
    const total = await Product.getTotalCount();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.getLowStock(5);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getTotalProducts,
  getLowStockProducts
};