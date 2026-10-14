const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    // `protect` middleware loads the authenticated customer into req.user.
    const user = req.user;

    // Validate productId
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product Not Found' });
    }

    // Keep one line per product; adding an existing product increases its quantity.
    const cartItem = user.cart.find(item => item.product.toString() === productId.toString());

    // Product stock is the remaining stock after existing cart reservations.
    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    if (cartItem) {
      // Product already in cart, increase quantity
      cartItem.quantity += 1;
      // Decrease product stock
      product.stock -= 1;
    } else {
      // Add new product to cart with quantity 1
      user.cart.push({
        product: productId,
        quantity: 1
      });
      // Decrease product stock
      product.stock -= 1;
    }

    // Persist both the cart quantity and corresponding stock adjustment.
    await user.save();
    await product.save();

    // Return product details for rendering while the stored cart keeps only the reference and quantity.
    const updatedUser = await Customer.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Cart updated',
      cart: updatedUser.cart
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Cart
const getCart = async (req, res) => {
  try {
    // Populate the referenced products so clients can display current details and prices.
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.status(200).json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Product Quantity
const updateQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const user = req.user;

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product Not Found' });
    }

    // Check if product is in cart
    const cartItem = user.cart.find(item => item.product.toString() === productId.toString());
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    // Positive differences consume more stock; negative differences put units back.
    const quantityDifference = quantity - cartItem.quantity;

    // Include the item's currently reserved quantity when calculating the customer's maximum.
    if (quantity > product.stock + cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock'
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    // A decrease restores stock; an increase reserves the additional units.
    product.stock -= quantityDifference;

    // Save User and Product
    await user.save();
    await product.save();

    // Populate cart before returning
    const updatedUser = await Customer.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Quantity updated',
      cart: updatedUser.cart
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    console.error('Update quantity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Find the cart item
    const cartItem = user.cart.find(item => item.product.toString() === productId.toString());
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product Not Found' });
    }

    // Return all units reserved by this cart line to the product's available stock.
    product.stock += cartItem.quantity;

    // Remove product from cart
    user.cart = user.cart.filter(item => item.product.toString() !== productId.toString());

    // Save User and Product
    await user.save();
    await product.save();

    // Populate cart before returning
    const updatedUser = await Customer.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Product removed from cart',
      cart: updatedUser.cart
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };
