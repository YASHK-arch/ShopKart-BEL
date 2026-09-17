const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the customer and attach it to req.user without the password
      req.user = await Customer.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
