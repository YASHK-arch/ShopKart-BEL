const mongoose = require('mongoose');
const Product = require('../models/product.model');

const LISTING_FIELDS = 'name price category image stock';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isMissingRequiredField = ({ name, description, price, category, image, stock }) =>
  name === undefined ||
  name === '' ||
  description === undefined ||
  description === '' ||
  price === undefined ||
  price === '' ||
  category === undefined ||
  category === '' ||
  image === undefined ||
  image === '' ||
  stock === undefined ||
  stock === '';

const isInvalidPrice = (price) => typeof price !== 'number' || Number.isNaN(price) || price <= 0;

const isInvalidStock = (stock) =>
  typeof stock !== 'number' || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0;

// @desc    Create a product
// @route   POST /products
// @access  Public (admin auth in a later lab)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (isMissingRequiredField({ name, description, price, category, image, stock })) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isInvalidPrice(price)) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }

    if (isInvalidStock(stock)) {
      return res.status(400).json({ success: false, message: 'Invalid stock' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get products with optional search, category, and sort
// @route   GET /products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }

    let query = Product.find(filter).select(LISTING_FIELDS);

    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single product by id
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
