const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
} = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', protect, logoutCustomer);
router.get('/me', protect, getMyProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;
