# Engineering Lab 03 — Fullstack Engineering Lab

# ShopKart: Product Catalog & Discovery

**Duration:** 2 Hours  
**Mode:** Individual Lab  
**Total Marks:** 100

---

## The Story

ShopKart's authentication system is now working and customers can successfully enter the application.

But there is a problem:

> **There is nothing to shop yet.** 🛒

The backend team has now exposed a product catalogue API. Your job is to build the **Product Discovery experience** that customers will use to browse products before adding them to their cart.

This lab is the first time you will work with a **real data-driven frontend**.

Instead of hardcoding cards in React, your UI must:

- Fetch products from the backend
- Display products dynamically
- Search products
- Filter products by category
- Open an individual product details page
- Handle loading and error states

> **Important:** This lab extends the ShopKart application from Lab-01 and Lab-02. Continue working in the same project ecosystem.

---

# Learning Objectives

By the end of this lab, you should be able to:

- Create REST APIs for products
- Model product data using Mongoose
- Fetch API data from React
- Render lists dynamically using `.map()`
- Use URL parameters with React Router
- Handle loading, empty and error states
- Implement basic search and filtering
- Separate API/service logic from UI components

---

# What You'll Build

The final ShopKart experience should contain:

```text
Login
   ↓
Home / Products
   ↓
Search / Filter
   ↓
Product Details
```

Your application should provide:

### Backend

- Product Schema
- Create Product API
- Get All Products API
- Get Single Product API
- Search Products
- Category Filtering

### Frontend

- Product Listing Page
- Search Bar
- Category Filter
- Product Card
- Product Details Page
- Loading State
- Error State
- Empty State

---

# Part 1 — Backend Product APIs

## Task 1 — Create Product Model (15 Marks)

Create a `Product` model using Mongoose.

### Product Schema

| Field | Type | Validation |
|---|---|---|
| name | String | Required |
| description | String | Required |
| price | Number | Required, greater than 0 |
| category | String | Required |
| image | String | Required |
| stock | Number | Required, minimum 0 |
| createdAt | Date | Automatic |

Example document:

```json
{
  "name": "Noise Cancelling Headphones",
  "description": "Wireless over-ear headphones with active noise cancellation.",
  "price": 4999,
  "category": "Electronics",
  "image": "https://example.com/headphones.jpg",
  "stock": 25
}
```

### Requirements

- `price` must be greater than `0`.
- `stock` cannot be negative.
- `name`, `description`, `category` and `image` are mandatory.
- `createdAt` should be generated automatically.

---

## Task 2 — Create Product API (15 Marks)

Create an API for inserting a product into MongoDB.

### Endpoint

```http
POST /products
```

### Request Body

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

### Success

Return status `201` with the created product.

### Failure Cases

| Situation | Status Code |
|---|---:|
| Missing required field | 400 |
| Invalid price | 400 |
| Invalid stock | 400 |

> For this lab, product creation can remain an open API. Authentication/authorization for admin operations will be introduced in a later lab.

---

## Task 3 — Get All Products API (10 Marks)

Create an API that returns all products.

### Endpoint

```http
GET /products
```

### Expected Response

```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "...",
      "name": "Mechanical Keyboard",
      "price": 2999,
      "category": "Electronics",
      "image": "https://example.com/keyboard.jpg",
      "stock": 10
    }
  ]
}
```

Do not return unnecessary fields if they are not required by the UI.

---

## Task 4 — Get Single Product API (10 Marks)

Create an API to fetch one product using its MongoDB `_id`.

### Endpoint

```http
GET /products/:id
```

### Example

```http
GET /products/66d123abc456...
```

### Failure Cases

| Situation | Status Code |
|---|---:|
| Invalid product ID | 400 |
| Product not found | 404 |

---

## Task 5 — Search & Category Filtering (10 Marks)

Extend `GET /products` so the API supports query parameters.

### Search

```http
GET /products?search=keyboard
```

The API should return products whose **name** contains the search text.

Search should be **case-insensitive**.

### Category

```http
GET /products?category=Electronics
```

Only products from that category should be returned.

### Combined

```http
GET /products?search=keyboard&category=Electronics
```

Both conditions should be applied.

> You are expected to build the query dynamically rather than creating separate endpoints for every filter.

---

# Backend Folder Structure

Follow MVC architecture.

```text
backend/
│
├── controllers/
│   └── product.controller.js
│
├── models/
│   └── product.model.js
│
├── routes/
│   └── product.routes.js
│
├── middlewares/
│
├── utils/
│
└── index.js
```

---

# Part 2 — Frontend Product Discovery

## Task 6 — Product Listing Page (15 Marks)

Create a new page:

```text
/products
```

The page must fetch products from:

```http
GET /products
```

### Product Card

Each product card should display:

- Product image
- Product name
- Price
- Category
- Stock status
- View Details button

Example:

```text
┌───────────────────────────────┐
│                               │
│        PRODUCT IMAGE          │
│                               │
├───────────────────────────────┤
│ Mechanical Keyboard           │
│ Electronics                   │
│ ₹2,999                        │
│ 10 units left                 │
│                               │
│        View Details           │
└───────────────────────────────┘
```

### Important

Do **not** hardcode product cards.

Products must be rendered dynamically from the API response.

---

## Task 7 — Search & Filter UI (10 Marks)

Add a search bar at the top of the products page.

Example:

```text
Search products...
```

Add a category dropdown:

```text
All Categories
Electronics
Fashion
Books
Home
```

When the user searches or changes the category, fetch the filtered products from the backend.

Example request:

```http
GET /products?search=phone&category=Electronics
```

### Expected Behaviour

```text
User types "phone"
        ↓
React updates state
        ↓
API request
        ↓
Backend filters MongoDB results
        ↓
Products UI updates
```

---

## Task 8 — Product Details Page (10 Marks)

Create a dynamic route:

```text
/products/:id
```

Example:

```text
/products/66d123abc456...
```

Clicking **View Details** from a product card should navigate to this page.

Fetch the product using:

```http
GET /products/:id
```

### Display

- Large product image
- Name
- Description
- Price
- Category
- Stock
- Add to Cart button (UI only for now)

> The Add to Cart button does **not** need backend functionality in this lab. Cart functionality will be introduced later.

---

# State Handling

Your frontend must implement three important UI states.

## Loading State

While the API request is running:

```text
Loading products...
```

Do not show an empty screen.

## Error State

If the API fails:

```text
Something went wrong while loading products.
```

## Empty State

If the API returns zero products:

```text
No products found.
```

---

# Suggested Frontend Structure

```text
src/
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Home.jsx
│   ├── Products.jsx
│   └── ProductDetails.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   └── SearchBar.jsx
│
├── services/
│   └── api.js
│
├── App.jsx
└── main.jsx
```

You may organize the files differently as long as the separation of concerns is maintained.

---

# Routes Summary

## Backend

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/products` | Create product |
| GET | `/products` | Get products |
| GET | `/products/:id` | Get one product |

### Query Examples

```text
/products?search=phone
/products?category=Electronics
/products?search=phone&category=Electronics
```

## Frontend

| Route | Page |
|---|---|
| `/home` | Home |
| `/products` | Product Listing |
| `/products/:id` | Product Details |

---

# Acceptance Criteria

A submission is considered complete when:

- Product schema is correctly created.
- Product data is stored in MongoDB.
- Product creation API works.
- Product listing API works.
- Single product API works.
- Search works through query parameters.
- Category filtering works through query parameters.
- Products are fetched dynamically in React.
- Product cards are rendered using API data.
- Clicking a product opens the details page.
- URL parameters are used for product details.
- Loading state is implemented.
- Error state is implemented.
- Empty state is implemented.
- UI is reasonably responsive.

---

# TA Evaluation Rubric

| Category | Marks |
|---|---:|
| Product Model | 15 |
| Product APIs | 25 |
| Search + Filtering | 10 |
| Product Listing UI | 15 |
| Product Details | 10 |
| React Routing + API Integration | 10 |
| Loading / Error / Empty States | 5 |
| Code Quality / Structure | 5 |
| Viva | 5 |
| **Total** | **100** |

---

# TA Viva Questions

Ask any 3–5 depending on the student's implementation.

1. Why should product data come from MongoDB instead of being hardcoded in React?
2. What is the difference between a URL parameter and a query parameter?
3. When would you use `/products/:id` vs `/products?category=Electronics`?
4. How does `.map()` help us render products dynamically?
5. Why do we need loading and error states in a frontend application?
6. What happens when the backend returns an empty array?
7. Why should search/filtering be handled by the backend instead of filtering a huge dataset only in React?
8. Why should API/service logic be separated from UI components?

1. Why should product data come from MongoDB instead of being hardcoded in React?

**Answer:** MongoDB is the persistent source of truth for the catalogue. Unlike hardcoded React data, products can be added, edited, removed, searched, filtered, and shared across users without rebuilding the frontend. React fetches the current data from `GET /products` and renders the response.

2. What is the difference between a URL parameter and a query parameter?

**Answer:** A URL parameter, or route parameter, is part of the path and identifies a specific resource. In `/products/66d123`, `66d123` is read with `req.params.id`. A query parameter appears after `?` and modifies a request. In `/products?category=Electronics`, `category` is read with `req.query.category`. Route parameters identify resources; query parameters filter or modify collections.

3. When would you use `/products/:id` vs `/products?category=Electronics`?

**Answer:** Use `/products/:id` when one specific product is needed, such as for the product details page. Use `/products?category=Electronics` when a collection of products should be filtered by category. Search and category filters can also be combined with `/products?search=phone&category=Electronics`.

4. How does `.map()` help us render products dynamically?

**Answer:** `.map()` converts every product in the API response into a React element, so cards do not need to be hardcoded:

```jsx
products.map((product) => (
  <ProductCard key={product._id} product={product} />
))
```

React creates the correct number of cards even when the response changes. The `key` gives each product a stable identity for efficient updates.

5. Why do we need loading and error states in a frontend application?

**Answer:** API requests are asynchronous and may take time or fail. The loading state, `Loading products...`, tells the user that the request is in progress. The error state, `Something went wrong while loading products.`, gives a clear result when the network or server fails. These states prevent a blank or misleading interface.

6. What happens when the backend returns an empty array?

**Answer:** The request succeeded, but no products match the current search or category. The frontend checks whether the products array is empty and displays `No products found.` It should not treat this as a server error or try to render product cards.

7. Why should search/filtering be handled by the backend instead of filtering a huge dataset only in React?

**Answer:** Backend filtering avoids downloading the entire catalogue to the browser. MongoDB can filter the data directly using the search and category conditions. This reduces bandwidth, browser memory, and processing, returns only the required products, keeps results consistent, and scales better as the catalogue grows. React manages the controls and sends the values as query parameters.

8. Why should API/service logic be separated from UI components?

**Answer:** Each part then has one clear responsibility. In ShopKart, `services/api.js` contains Axios requests, while pages and components display data and handle interaction. This improves reusability, maintainability, readability, and testing. If an API path or request library changes, the service file can be updated without rewriting the UI.

---

# Bonus Challenge (+10 Marks)

Implement **sorting** using query parameters.

Examples:

```http
GET /products?sort=price_asc
```

```http
GET /products?sort=price_desc
```

The backend should sort products by price accordingly.

---

# Submission Rules

- Continue from your ShopKart application.
- Do not hardcode API responses in the frontend.
- Use MongoDB as the source of truth for products.
- Test backend APIs using Postman before connecting the frontend.
- Use React Router for navigation.
- AI tools may be used for reference, but students must understand their implementation.

---

# What's Next?

You now have the first real shopping journey:

```text
Authentication ✅
       ↓
Product Discovery ✅
       ↓
      Cart 🛒
       ↓
    Checkout 💳
       ↓
     Orders 📦
```

**Lab-04 will extend ShopKart into the Shopping Cart system.**

Students will finally move from:

> "I can see a product"

to
> "I want to buy this product." 😄
