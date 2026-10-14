const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

// Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
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

    // Check if already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    // Add Product ObjectId
    user.wishlist.push(productId);
    
    // Save User
    await user.save();
    
    res.status(200).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description'
    });
    
    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = req.user;

    if (!productId) {
       return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Check if in wishlist
    const inWishlist = user.wishlist.some(id => id.toString() === productId.toString());
    if (!inWishlist) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    // Remove Product Reference
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    
    // Save User
    await user.save();
    
    res.status(200).json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
     if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
