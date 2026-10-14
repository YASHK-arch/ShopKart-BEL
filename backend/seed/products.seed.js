require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');

const products = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
    stock: 10,
  },
  {
    name: 'Smartphone',
    description: '6.5-inch display smartphone with a long-lasting battery.',
    price: 18999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Soft cotton t-shirt for everyday wear.',
    price: 799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    stock: 40,
  },
  {
    name: 'Denim Jacket',
    description: 'Classic denim jacket with a comfortable fit.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Atomic Habits',
    description: 'A practical book on building better habits.',
    price: 499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
  {
    name: 'Ceramic Table Lamp',
    description: 'Warm bedside lamp for living rooms and bedrooms.',
    price: 1599,
    category: 'Home',
    image: 'https://tse1.explicit.bing.net/th/id/OIP.euhu9Ze7oKtHN42HGA6_JgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    stock: 8,
  },
  {
    name: 'Non-Stick Cookware Set',
    description: 'Five-piece cookware set for everyday cooking.',
    price: 3499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    stock: 0,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed products:', error.message);
    process.exit(1);
  }
};

seedProducts();


// cd backend
// npm run seed:products

// process.exit(0) and process.exit(1) are used to tell the operating system whether your Node.js program finished successfully or failed.
