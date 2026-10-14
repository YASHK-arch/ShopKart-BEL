# ShopKart-BEL

npm install express mongodb mongoose bcrypt jsonwebtoken cookie-parser dotenv nodemon


Lab-06 implemented. Frontend build passes (vite build) and backend modules load.
Backend (new):

- models/order.model.js — Order with user ref, snapshot items (name/price/image), shipping address, total, payment/status enums, Razorpay ids.
- config/razorpay.js — client built only when keys exist (server still boots without them).
- controllers/order.controller.js — createPaymentOrder (validates address, reloads cart/products, recalculates total server-side, creates pending order + Razorpay order in paise), verifyPayment (HMAC-SHA256 against stored razorpayOrderId, marks PAID/PLACED, clears cart), getOrders, getOrderById (owner-only 404), updateOrderStatus (bonus).
- routes/order.routes.js — all protected; registered in index.js at /orders.
- .env / .env.example — added RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.
  Frontend (new):
- pages/Checkout.jsx (form state + validation, script loader, Razorpay Checkout, verify → clearCart() → success), OrderSuccess.jsx, Orders.jsx, OrderDetails.jsx.
- components/CheckoutForm.jsx, OrderSummary.jsx, OrderCard.jsx, utils/orderFormat.js.
  Frontend (modified): services/api.js (order endpoints), CartContext.jsx (clearCart, initialized), App.jsx (routes /checkout, /order-success/:id, /orders, /orders/:id), Cart.jsx (checkout button links), Navbar.jsx (My Orders).
  Two things to note:

1. Add your real Test Mode keys to backend/.env (placeholders currently set) and restart the server. .env is already gitignored.
2. Stock decision: this repo's cart reserves stock on add-to-cart (decrements product.stock), so checkout validates the reservation is still fulfillable (stock < 0 → reject) and the order does not decrement again. If you'd rather stock be decremented only at order time (the other common model), the cart controller would need adjusting — tell me and I'll switch it.
