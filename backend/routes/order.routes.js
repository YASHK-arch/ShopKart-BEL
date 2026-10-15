const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentSession,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// Every order route is user-specific, so authentication is required throughout.
router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, getOrders);
router.get('/:id/payment-session', protect, getPaymentSession);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
