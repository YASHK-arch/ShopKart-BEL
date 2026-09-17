# TA Viva Questions and Answers

### 1. Why do we use **bcrypt** instead of encrypting passwords?
**Answer:**
We use **bcrypt** because it is a **hashing** algorithm, whereas encryption is a reversible process. 
- **One-way function:** Hashing is irreversible. Even if a database is compromised, an attacker cannot reverse the hash to get the original password. Encryption requires a key to decrypt; if an attacker steals the database and the encryption key, they have all the plain-text passwords.
- **Built-in Salting:** Bcrypt automatically generates and incorporates a unique random salt for every password. This protects against rainbow table attacks (pre-computed hash tables).
- **Computational Cost (Work Factor):** Bcrypt is designed to be slow and computationally expensive. You can adjust its "cost factor," which dictates how long it takes to calculate the hash. This intentionally slows down brute-force and dictionary attacks, making them computationally infeasible for attackers.

### 2. What information is typically stored inside a JWT payload?
**Answer:**
A JWT (JSON Web Token) payload typically contains **non-sensitive** claims (pieces of information) asserted about a subject.
- **User Identifiers:** Information needed to identify the user uniquely, such as `userId`, `role` (e.g., admin, user), or `email`. This allows the server to know who is making the request without needing to query the database every time.
- **Registered (Standard) Claims:** Standard metadata like `exp` (expiration time), `iat` (issued at time), `iss` (issuer), and `sub` (subject).
- **Crucial Note:** You should **never** store sensitive information like passwords or highly confidential data in a JWT payload. The payload is only Base64Url encoded, not encrypted, meaning anyone who intercepts the token can easily decode and read the payload data.

### 3. Why is the **HttpOnly** flag important for cookies?
**Answer:**
The **HttpOnly** flag is a critical security measure that prevents client-side scripts (such as JavaScript) from accessing the cookie. 
- When a cookie is set with `HttpOnly`, `document.cookie` in JavaScript cannot read or modify it. 
- **Mitigates XSS:** This primarily protects against Cross-Site Scripting (XSS) attacks. If an attacker manages to inject malicious JavaScript into your web page, they cannot use that script to steal the user's authentication cookie (e.g., a JWT or session ID) and hijack their session.

### 4. Why should passwords never be returned to the frontend?
**Answer:**
Passwords (even hashed ones) should never be returned to the frontend for several reasons:
- **No Legitimate Use Case:** The frontend never needs to know the user's password after the initial login attempt. It only needs an authentication token (like a JWT or session cookie) to maintain the session.
- **Security Risk:** Transmitting the password back over the network unnecessarily exposes it. If it's sent in plain text, it can be intercepted. If it's a hash, a malicious actor who gains access to the frontend could potentially extract the hash and attempt to crack it offline.
- **Principle of Least Privilege:** A system should only have access to the information absolutely necessary for its function. The frontend has no business handling passwords post-authentication.

### 5. What is the purpose of authentication middleware?
**Answer:**
Authentication middleware acts as a **security gatekeeper** in a web application. Its purpose is to intercept incoming HTTP requests *before* they reach the main route handlers or controllers.
- **Verification:** It extracts the authentication credentials (like a JWT from the `Authorization` header or an `HttpOnly` cookie) from the request.
- **Validation:** It verifies the token's signature, checks if it has expired, and ensures it's valid.
- **Context Injection:** If the token is valid, the middleware decodes it and attaches the user's information (like the `userId` from the JWT payload) to the request object (e.g., `req.user = decodedToken`). This allows subsequent route handlers to know exactly who is making the request.
- **Protection:** If the token is missing, invalid, or expired, the middleware immediately blocks the request and sends back a `401 Unauthorized` response, preventing unauthorized access to protected routes. This centralizes security logic, keeping route handlers clean and focused on business logic.
