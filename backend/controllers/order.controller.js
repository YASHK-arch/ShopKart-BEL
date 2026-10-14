const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const razorpay = require('../config/razorpay');

const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

// Validate and normalise the shipping address. The frontend also validates, but the
// server must never trust client input for business-critical data.
const parseShippingAddress = (shippingAddress = {}) => {
  const fields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  const address = {};

  for (const field of fields) {
    const value = typeof shippingAddress[field] === 'string' ? shippingAddress[field].trim() : '';
    if (!value) {
      return { error: 'All shipping fields are required' };
    }
    address[field] = value;
  }

  if (!/^\d{10}$/.test(address.phone)) {
    return { error: 'Phone must be a valid 10-digit number' };
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  return { address };
};

// @desc    Validate cart, create a pending ShopKart order and a Razorpay order
// @route   POST /orders/create-payment-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { address, error: addressError } = parseShippingAddress(req.body?.shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    // Reload the customer with populated cart so we work with the latest product data.
    const user = await Customer.findById(req.user._id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      const product = cartItem.product;

      // A product deleted after it was added to the cart can no longer be ordered.
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available',
        });
      }

      // Adding to cart reserves stock (product.stock is already decremented), so a
      // negative value means the reservation can no longer be fulfilled.
      if (product.stock < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      // Snapshot purchase-time data. Never trust prices sent by the frontend.
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on the server',
      });
    }

    // Persist the ShopKart order first; the cart is only cleared after payment verification.
    const shopKartOrder = await Order.create({
      user: user._id,
      items,
      shippingAddress: address,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    // Razorpay expects the amount in the smallest currency unit (paise for INR).
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: shopKartOrder._id.toString(),
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create payment order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// @desc    Verify Razorpay signature and confirm the ShopKart order
// @route   POST /orders/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // Only the owner of the order may verify its payment.
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Use the Razorpay order id stored in our database as the trusted value,
    // never the id supplied by the browser.
    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Signature is valid, so the payment is genuine. Confirm the order.
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // The cart clears only after a verified payment.
    const user = await Customer.findById(req.user._id);
    user.cart = [];
    await user.save();

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

// @desc    Get the authenticated customer's orders (newest first)
// @route   GET /orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
};

// @desc    Get a single order (owner only)
// @route   GET /orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    // Return 404 for both missing orders and orders owned by another customer so
    // users cannot probe for the existence of someone else's order.
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load order' });
  }
};

// @desc    Update an order's fulfilment status (development helper / bonus)
// @route   PATCH /orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
