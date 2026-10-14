const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// Authenticate every cart operation so handlers use the customer attached to req.user.
router.post('/:productId', protect, addToCart);
router.get('/', protect, getCart);
router.patch('/:productId', protect, updateQuantity);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
