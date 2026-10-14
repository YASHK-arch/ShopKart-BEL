# 🛒 Engineering Lab 05 — ShopKart Shopping Cart

> **Build a complete Shopping Cart experience for ShopKart using frontend state management and persistent backend data.**
>
> This lab extends the Wishlist system from Lab-04 and introduces the core engineering problem of keeping **UI state, cart calculations and server data in sync**.

---

## 📋 Lab Overview

|                            |                                             |
| -------------------------- | ------------------------------------------- |
| **Application**      | ShopKart                                    |
| **Lab**              | 05                                          |
| **Duration**         | 2–2.5 Hours                                |
| **Mode**             | Individual                                  |
| **Total Marks**      | **100**                               |
| **Primary Theme**    | Cart State + Derived Data + Persistent APIs |
| **Frontend**         | React                                       |
| **Backend**          | Node.js + Express                           |
| **Database**         | MongoDB                                     |
| **Authentication**   | JWT                                         |
| **State Management** | Context API or Redux Toolkit                |

---

# 1. 🎯 Product Brief

## The Problem

A customer has decided that they may actually purchase a product.

A wishlist only answers:

> “What do I want to save for later?”

A cart must answer much more:

- What am I buying right now?
- How many units do I want?
- Is the requested quantity still available?
- What is my subtotal?
- What happens if I refresh the page?
- What happens if the same product is added again?
- What happens if product price or stock changes?

### Desired experience

```text
Browse Products
       ↓
Add to Cart
       ↓
Cart state updates instantly
       ↓
Open Cart
       ↓
Change Quantity / Remove Items
       ↓
See Order Summary
       ↓
Proceed to Checkout
```

---

# 2. 🧑‍💻 What Are You Building?

You are extending the ShopKart application from Labs 01–04.

```mermaid
flowchart LR
    A[Products] --> B[Add to Cart]
    B --> C[Cart State]
    C --> D[Cart Page]
    D --> E[Increase Quantity]
    D --> F[Decrease Quantity]
    D --> G[Remove Product]
    D --> H[Order Summary]
    H --> I[Proceed to Checkout]
```

### Feature scope

- Add products to cart
- Prevent duplicate cart rows
- Increase / decrease quantity
- Remove products
- Persist cart to MongoDB
- Load authenticated user's cart
- Introduce frontend global state management
- Keep navbar cart count in sync
- Calculate subtotal and total item count
- Validate stock limits
- Handle loading, empty and error states
- Prepare the application for Checkout in the next lab

---

# 3. 🧠 Learning Objectives

By the end of this lab, you should understand:

### State Management

- Why some data becomes application-level state
- Difference between server state and UI state
- Sharing cart data across multiple components
- Updating global state after API mutations
- Derived values from state

### Backend

- Modelling quantity-based relationships
- Updating nested MongoDB data
- Authenticated user-specific resources
- Business-rule validation
- Stock validation

### Frontend

- Optimistic-feeling user interactions
- Loading states for individual actions
- Cart totals
- Quantity controls
- Keeping Navbar and Cart Page consistent

---

# 4. 🧩 Cart Data Model

Wishlist stored only Product references.

A cart needs one additional piece of information:

```text
quantity
```

Recommended structure inside the User model:

```js
cart: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }
]
```

### Relationship

```mermaid
erDiagram
    USER ||--o{ CART_ITEM : owns
    PRODUCT ||--o{ CART_ITEM : referenced_by

    USER {
        ObjectId _id
        string name
        string email
    }

    CART_ITEM {
        ObjectId product
        number quantity
    }

    PRODUCT {
        ObjectId _id
        string name
        number price
        number stock
    }
```

> Do not duplicate full Product objects inside the cart.

---

# 5. 🔌 API Contract

| Method | Endpoint             | Auth | Purpose                 |
| ------ | -------------------- | :--: | ----------------------- |
| POST   | `/cart/:productId` |  ✅  | Add product to cart     |
| GET    | `/cart`            |  ✅  | Get current user's cart |
| PATCH  | `/cart/:productId` |  ✅  | Update quantity         |
| DELETE | `/cart/:productId` |  ✅  | Remove product          |

---

# 6. 🧩 Task 1 — Extend User Schema

### **10 Marks**

Add a `cart` field to the existing User model.

### Requirements

- Cart is an array
- Every entry stores:
  - Product reference
  - Quantity
- Quantity cannot be less than 1
- Existing users should continue to work
- Default cart should be empty

---

# 7. ➕ Task 2 — Add Product to Cart API

### **15 Marks**

### Endpoint

```http
POST /cart/:productId
```

### Behaviour

If the product is not already in the cart:

```text
Add product with quantity = 1
```

If the product is already present:

```text
Increase existing quantity by 1
```

### Important validation

The new quantity must not exceed product stock.

### Backend flow

```mermaid
flowchart TD
    A[Request] --> B[Authenticate User]
    B --> C[Validate Product ID]
    C --> D[Find Product]
    D -->|Missing| X[404]
    D --> E{In Cart?}
    E -->|No| F[Add quantity 1]
    E -->|Yes| G[Increase Quantity]
    F --> H{Stock Available?}
    G --> H
    H -->|No| Y[400]
    H -->|Yes| I[Save User]
    I --> J[Return Updated Cart]
```

### Example response

```json
{
  "success": true,
  "message": "Cart updated",
  "cart": []
}
```

---

# 8. 📥 Task 3 — Get Current User Cart

### **15 Marks**

### Endpoint

```http
GET /cart
```

The API must:

1. Authenticate the user.
2. Load the authenticated user.
3. Populate each cart item's Product.
4. Return cart items with quantity.

### Example response

```json
{
  "success": true,
  "cart": [
    {
      "product": {
        "_id": "66d123",
        "name": "Mechanical Keyboard",
        "price": 2999,
        "image": "https://example.com/keyboard.jpg",
        "stock": 10
      },
      "quantity": 2
    }
  ]
}
```

---

# 9. 🔢 Task 4 — Update Product Quantity

### **10 Marks**

### Endpoint

```http
PATCH /cart/:productId
```

### Request body

```json
{
  "quantity": 3
}
```

### Rules

- Quantity must be a number
- Quantity must be at least 1
- Quantity must not exceed Product stock
- Product must already exist in the cart

### Failure cases

| Scenario            | Status |
| ------------------- | -----: |
| Not logged in       |    401 |
| Invalid product ID  |    400 |
| Product not found   |    404 |
| Product not in cart |    404 |
| Quantity < 1        |    400 |
| Quantity > stock    |    400 |

---

# 10. 🗑️ Task 5 — Remove Product from Cart

### **10 Marks**

### Endpoint

```http
DELETE /cart/:productId
```

The item should be removed from the authenticated user's cart.

Return the updated cart after removal.

---

# 11. 🌐 Task 6 — Introduce Global Cart State

### **15 Marks**

For the first time in the ShopKart project, cart data must be shared across multiple areas of the application.

Examples:

```text
Product Card
Cart Page
Navbar Cart Count
Order Summary
```

Use either:

- React Context API, or
- Redux Toolkit

### Your state should support

- `cartItems`
- cart loading
- cart error
- add to cart
- remove from cart
- update quantity
- refresh cart from backend

> Do not fetch the cart separately in every component.

---

# 12. 🖥️ Task 7 — Product Card Integration

### **5 Marks**

Update the Product Card.

### Default

```text
[ Add to Cart ]
```

### While request is running

```text
[ Adding... ]
```

### If already in cart

You may display:

```text
[ Add Another ]
```

or keep:

```text
[ Add to Cart ]
```

Both are valid if the behaviour is correct.

---

# 13. 🛒 Task 8 — Cart Page

### **10 Marks**

Create:

```text
/cart
```

Suggested UI:

```text
┌────────────────────────────────────────────────────────────┐
│ ShopKart                     Products Wishlist Cart(3)     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ My Cart                                                    │
│                                                            │
│ ┌────────────┐ Mechanical Keyboard                         │
│ │   IMAGE    │ ₹2,999                                      │
│ └────────────┘                                             │
│              [-] 2 [+]                  ₹5,998             │
│              [ Remove ]                                    │
│                                                            │
│ ────────────────────────────────────────────────────────   │
│                                                            │
│ Order Summary                                              │
│ Items: 2                                                   │
│ Subtotal: ₹5,998                                           │
│                                                            │
│ [ Proceed to Checkout ]                                    │
└────────────────────────────────────────────────────────────┘
```

---

# 14. ➖➕ Quantity Controls

Each item must provide:

```text
[-]  2  [+]
```

### Behaviour

`+`

- Increase quantity by 1
- Do not exceed stock

`-`

- Decrease quantity by 1
- Do not allow quantity below 1

For quantity = 1, the user should use the explicit Remove action.

---

# 15. 🧮 Derived Cart Values

Do not store these separately in MongoDB:

- subtotal
- cart item count
- total units

Calculate them from cart state.

### Example

```js
subtotal = Σ(product.price × quantity)
```

Example:

```text
Keyboard
₹2,999 × 2 = ₹5,998

Mouse
₹1,499 × 1 = ₹1,499

Subtotal = ₹7,497
```

### Cart count

Navbar count should represent total quantity:

```text
Cart (3)
```

for:

```text
Keyboard × 2
Mouse × 1
```

---

# 16. 🧭 Navbar Integration

### **5 Marks**

Update navigation:

```text
Products | Wishlist | Cart (3) | Logout
```

The cart count must update after:

- Add to cart
- Quantity increase
- Quantity decrease
- Remove item

No page refresh should be required.

---

# 17. 💤 Cart UI States

## Loading

```text
Loading your cart...
```

## Empty

```text
Your cart is empty 🛒

Looks like you haven't added anything yet.

[ Browse Products ]
```

## Error

```text
Unable to load your cart.

[ Try Again ]
```

---

# 18. 🚨 Important Business Rules

| Rule                       | Expected Behaviour                     |
| -------------------------- | -------------------------------------- |
| User must be authenticated | Protected cart APIs                    |
| Invalid product            | 404                                    |
| Quantity below 1           | Reject                                 |
| Quantity above stock       | Reject                                 |
| Same product added twice   | Increase quantity                      |
| Refresh page               | Cart persists                          |
| Logout/login               | Cart persists                          |
| Product price changes      | Latest Product price should be shown   |
| Product stock changes      | New quantity must respect latest stock |

---

# 19. 🔄 Frontend State Synchronisation

After every cart mutation, the UI must remain consistent.

Example:

```text
Product Card
    ↓
Add to Cart API
    ↓
Backend updates MongoDB
    ↓
Global Cart State updates
    ↓
Navbar Cart Count updates
    ↓
Cart Page reflects same state
```

Avoid this:

```text
Navbar says Cart (2)
Cart Page shows 3 items
```

There should be one shared source of frontend truth for cart state.

---

# 20. 🧪 Postman Test Plan

Test backend before integrating React.

### Test 1 — Add new item

```http
POST /cart/:productId
```

Expected quantity:

```text
1
```

### Test 2 — Add same item again

Expected quantity:

```text
2
```

### Test 3 — Get Cart

```http
GET /cart
```

Expected populated Product information.

### Test 4 — Update quantity

```http
PATCH /cart/:productId
```

### Test 5 — Exceed stock

Expected:

```text
400 Bad Request
```

### Test 6 — Remove item

```http
DELETE /cart/:productId
```

### Test 7 — Unauthenticated request

Expected:

```text
401 Unauthorized
```

---

# 21. 🧱 Suggested Frontend Structure

### Context API approach

```text
src/
│
├── context/
│   └── CartContext.jsx
│
├── pages/
│   ├── Products.jsx
│   ├── Wishlist.jsx
│   └── Cart.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   └── CartItem.jsx
│
├── services/
│   └── api.js
│
└── App.jsx
```

### Redux Toolkit approach

```text
src/
│
├── store/
│   └── store.js
│
├── features/
│   └── cart/
│       └── cartSlice.js
│
├── pages/
│   └── Cart.jsx
│
└── components/
    ├── Navbar.jsx
    └── CartItem.jsx
```

---

# 22. ✅ Acceptance Criteria

## Backend

- [ ] User schema contains cart
- [ ] Each cart item stores Product reference + quantity
- [ ] Add Cart API works
- [ ] Re-adding same product increments quantity
- [ ] Get Cart API populates Product
- [ ] Update quantity API works
- [ ] Remove API works
- [ ] Stock limit is validated
- [ ] All cart APIs are protected

## Frontend

- [ ] Global cart state exists
- [ ] Product card can add to cart
- [ ] Cart Page exists
- [ ] Quantity controls work
- [ ] Remove works
- [ ] Subtotal is calculated dynamically
- [ ] Navbar cart count is dynamic
- [ ] Refresh preserves cart
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] No hardcoded cart data

---

# 23. 📊 Evaluation Rubric

| Area                            |         Marks |
| ------------------------------- | ------------: |
| Cart Schema                     |            10 |
| Add to Cart API                 |            15 |
| Get Cart API                    |            15 |
| Quantity Update API             |            10 |
| Remove API                      |            10 |
| Global State Management         |            15 |
| Cart Page + Product Integration |            10 |
| Derived Totals + Navbar Count   |             5 |
| Error / Loading / Empty States  |             5 |
| Code Quality + Viva             |             5 |
| **Total**                 | **100** |

---

# 24. 🎤 TA Viva Questions

Ask any 4–6 based on the student's implementation.

### State Management

1. Why does cart state need to be shared globally?
   **Answer:** The cart is used in more than one place: the cart page displays its items and totals, while the navbar displays the item count. A shared source of truth keeps those views consistent after an add, update, or removal. In this project, `CartContext` holds the cart data and exposes it through `useCart`.

2. Why should the Navbar not independently fetch the cart?
   **Answer:** Fetching the cart separately in the Navbar duplicates a request and creates a second copy of cart state that can become stale or out of sync with the cart page. It is better for the Navbar to read the count from the shared cart state, which is updated after mutations. In this implementation, the Navbar currently fetches the cart once and listens for `cart-changed` events; sharing the context directly would avoid that extra fetch and local copy.

3. What is the difference between server state and frontend state?
   **Answer:** Server state is persisted and authoritative data owned by the backend/database, such as the customer's cart and product stock. Frontend state is the client-side representation used to render the interface, such as `cartItems` in `CartContext`, loading indicators, and error messages. The frontend loads server state through the API and updates its representation when API mutations succeed.

4. What is derived state?
   **Answer:** Derived state is a value calculated from existing state rather than stored independently. Here, `cartCount` is the sum of item quantities and `subtotal` is the sum of each current product price multiplied by its quantity. `CartContext` calculates both from `cartItems`.

5. Why should subtotal not be stored separately?
   **Answer:** A separately stored subtotal can become stale when an item's quantity or product price changes. Calculating it from the current cart items ensures it stays consistent without needing another value to synchronize.

### Backend

6. Why does cart need quantity while wishlist does not?
   **Answer:** A cart represents an intended purchase, so each product needs a quantity for stock checks, line totals, and the order subtotal. A wishlist records whether a customer saved a product; it does not represent how many units they intend to buy.

7. Why should product price not be copied into the cart object?
   **Answer:** The cart stores a reference to the product and its quantity, while the product document remains the source of the current price. Copying the price into the cart could leave a stale value after a product price change. This implementation populates the product reference when returning the cart so the frontend can use the product's current price.

8. How do you prevent quantity from exceeding stock?
   **Answer:** The server validates the requested quantity against the product's available stock before saving the cart update, and rejects an excessive request with a `400` response. The cart page also disables the increase button when the quantity reaches the stock shown for that product. The server-side check is essential because client-side checks can be bypassed.

9. What happens when the same product is added twice?
   **Answer:** The backend checks whether the product is already in the user's cart. If it is, the backend increments that cart item's quantity instead of adding a duplicate entry, after checking that the increased quantity is available in stock.

10. Why does the server identify the user from JWT?
   **Answer:** The JWT is verified by the authentication middleware, which loads the matching customer and attaches it to `req.user`. Cart routes can then operate on the authenticated customer's cart instead of trusting a user ID supplied by the browser, preventing a client from selecting another user's cart by changing a request parameter.

### React

11. How does the cart count update without refreshing the page?
   **Answer:** After a successful cart API mutation, `CartContext` replaces its cart items with the response and dispatches a `cart-changed` event containing the new count. The Navbar listens for that event and updates its badge immediately, without a page refresh. The count is also derived from item quantities in the context.

12. How do you update only one cart item's loading state?
   **Answer:** A per-item loading state can be tracked by product ID (for example, with an `updatingProductId` value or a set of updating IDs), so only that item's controls are disabled while its request is in progress. In the current implementation, `CartContext` has one global `loading` flag rather than a per-item flag, so it does not distinguish which cart item is being updated.

13. What happens if an API mutation fails?
   **Answer:** The context stores an error message and rethrows the error. The cart page catches the rejected promise and logs the failure; because the cart is only replaced after a successful response, the existing cart items remain displayed. The context's error state can be used to show the failure to the user.

14. Why is one shared cart state better than separate local copies?
   **Answer:** A shared cart state provides one source of truth for components such as the cart page and navbar. When a mutation updates it, consumers can show the same current items and count. Separate local copies would each need their own synchronization and could display conflicting values.

---

# 25. 🚫 Common Mistakes

### ❌ Storing subtotal in MongoDB

Subtotal can become stale.

Calculate it from:

```text
price × quantity
```

### ❌ Storing duplicate rows for same product

Avoid:

```text
Keyboard × 1
Keyboard × 1
Keyboard × 1
```

Prefer:

```text
Keyboard × 3
```

### ❌ Keeping independent cart copies

Avoid:

```text
Navbar cart
Cart page cart
Product page cart
```

Use one shared state.

### ❌ Ignoring stock

A user must not be able to request 20 units when only 5 exist.

### ❌ Hardcoding cart count

```jsx
Cart (3)
```

The value must come from state.

---

# 26. 📦 Submission Requirements

Submit the updated ShopKart project with:

- Cart schema
- All cart APIs
- Cart state management
- Product card integration
- Cart page
- Quantity controls
- Navbar count
- Order summary
- Loading / empty / error states

The student must be able to explain:

- Why cart needs global state
- How frontend state is synchronised with backend
- How quantity updates work
- How stock validation works
- How subtotal is derived

---

# 27. 🚀 What Comes Next?

The ShopKart journey now becomes:

```text
Authentication
      ↓
Product Catalog
      ↓
Wishlist
      ↓
Shopping Cart
      ↓
Checkout
      ↓
Orders
```

### Next Lab

Lab-06 will build the **Checkout and Order Creation flow**.

That is where ShopKart will introduce:

- Shipping address
- Final stock verification
- Order snapshot
- Payment-ready flow
- Cart → Order conversion

---

<div align="center">
