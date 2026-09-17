const jwt = require('jsonwebtoken');

const generateToken = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

module.exports = generateToken;
