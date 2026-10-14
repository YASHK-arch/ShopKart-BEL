require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Default route to test if server is running
app.get('/', (req, res) => {
  res.send('ShopKart Backend API is running!');
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} --> http://localhost:${PORT}/customers/register`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
