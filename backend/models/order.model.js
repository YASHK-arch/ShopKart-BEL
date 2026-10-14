const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // The authenticated customer who placed the order.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        // Name, price and image are snapshots taken at purchase time so the order
        // stays historically accurate even if the Product document changes later.
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      state: String,
      pincode: String,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },

    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
      default: 'PENDING_PAYMENT',
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
