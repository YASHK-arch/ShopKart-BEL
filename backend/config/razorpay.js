const Razorpay = require('razorpay');

// Only construct the client when credentials exist so the server can still start
// (and other routes work) before Razorpay keys are configured.
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = razorpay;
