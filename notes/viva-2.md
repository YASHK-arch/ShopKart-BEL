# Lab 02 Viva Notes — Frontend Auth (Login → Home → Logout)

These notes cover **Engineering Lab 02**: the React customer UI that talks to the Lab 01 ShopKart backend. They explain the concepts we actually implemented, how the files fit together, and answers to every TA viva question in the Lab 02 problem statement.

## What Lab 02 Built

The backend APIs already existed. Lab 02 added a React frontend so a customer can:

1. Register at `/register`
2. Log in at `/login` (HttpOnly cookie is set automatically)
3. Land on a protected `/home` that loads their profile from `GET /customers/me`
4. Log out from the navbar (`POST /customers/logout`) and return to `/login`

Tech used: **React**, **React Router DOM**, **Axios**, **Tailwind CSS**. Not used: Firebase, Clerk, Auth0, Redux.

```text
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Home.jsx
├── components/
│   └── Navbar.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```

---

## Mental Model (Lab 02)

```text
Browser (localhost:5173)
        │  Axios + withCredentials: true
        ▼
Vite proxy  /customers  →  Express (localhost:3000)
        │
        ▼
POST /customers/register   → create customer (no cookie)
POST /customers/login      → verify password, Set-Cookie: token (HttpOnly)
GET  /customers/me         → protect middleware, return profile
POST /customers/logout     → clear cookie
```

HTTP is **stateless**. After login, the browser does not “remember” the user unless something is stored. We store identity in an **HttpOnly cookie**, not in `localStorage`. Every later request that needs identity must send that cookie.

---

## Concepts Implemented

### 1. React Router (client-side routing)

`main.jsx` wraps the app in `BrowserRouter`. `App.jsx` maps URLs to pages:

| Route | Page | Access |
|---|---|---|
| `/` | Redirect to `/login` | Public |
| `/register` | Registration form | Public |
| `/login` | Login form | Public |
| `/home` | Profile dashboard | Protected |

`Navigate` is used for the `/` redirect. After register we `navigate('/login')`. After login we `navigate('/home')`. After logout we `navigate('/login')`. If `/customers/me` fails, Home uses `navigate('/login', { replace: true })`.

This is **SPA navigation**: the URL changes without a full page reload. The React tree unmounts one page and mounts another.

### 2. Axios service (`services/api.js`)

One Axios instance is shared by all pages:

- `baseURL` is empty in dev so requests go to the Vite origin (`http://localhost:5173`)
- `withCredentials: true` so the browser attaches cookies on every call

Functions:

- `registerCustomer` → `POST /customers/register`
- `loginCustomer` → `POST /customers/login`
- `getCustomerProfile` → `GET /customers/me`
- `logoutCustomer` → `POST /customers/logout`

Pages never call `fetch` themselves. That keeps URLs and cookie settings in one place.

### 3. `withCredentials` + CORS

The frontend origin is `http://localhost:5173`. The API origin is `http://localhost:3000`. Those are **different origins** (different ports).

By default, browsers:

- do **not** send cookies on cross-origin XHR/fetch
- do **not** let JS read the response unless CORS allows the requesting origin

Backend `cors({ origin: 'http://localhost:5173', credentials: true })` tells the browser: this origin is allowed, and credentialed requests are allowed.

Frontend `withCredentials: true` tells Axios: include cookies on the request.

Both sides are required. If either is missing, login may “succeed” but `/customers/me` still returns 401.

### 4. Vite proxy (same-origin cookies in development)

`vite.config.js` proxies `/customers` to `http://localhost:3000`.

From the browser’s point of view, `/customers/login` is still on `localhost:5173`. The `Set-Cookie` therefore belongs to the frontend origin. Later `/customers/me` automatically includes that cookie.

This avoids a common localhost trap: cookie set by port 3000, later requests from port 5173 not sending it the way you expect.

### 5. Controlled components and validation

Register and Login inputs use React state (`value` + `onChange`). The form is the source of truth, not the DOM.

Register checks:

- all fields present (Full Name, Email, Password, Phone)
- password at least 6 characters (matches backend)
- basic email format

On API failure, the backend message is shown (for example “Email already exists”).

On success, Register redirects to Login. It does **not** log the user in automatically, matching the lab.

Login checks email + password are present. On 401 it shows the exact lab string **Invalid Credentials**.

### 6. HttpOnly JWT cookie (not `localStorage`)

Login does **not** store a token in `localStorage`. Lab 01’s `generateToken` sets:

```text
Set-Cookie: token=<jwt>; HttpOnly; Path=/; SameSite=Strict
```

- **HttpOnly** — `document.cookie` cannot read it; XSS cannot steal it easily
- **Path=/** — sent to all routes
- **SameSite=Strict** — cookie is not sent on cross-site navigations from other sites
- JWT payload is `{ id: customerId }` plus `iat` / `exp` — not the password

JavaScript only knows the user is logged in because `GET /customers/me` succeeds.

### 7. Protected Home (`/home`)

Home is protected in the **frontend** by calling the **backend** gate:

1. Page mounts
2. `getCustomerProfile()` runs
3. `protect` middleware reads `req.cookies.token`
4. JWT is verified with `JWT_SECRET`
5. Customer is loaded from MongoDB **without** the password (`.select('-password')`)
6. Profile JSON is rendered: welcome message, full name, email, phone
7. If the request fails (no cookie / bad token), redirect to `/login`

`/home` is called a protected route because an unauthenticated visitor must not see it. The real enforcement is still the backend: anyone can type `/home` in the URL, but without a valid cookie they never get user data.

### 8. Navbar and logout

Navbar receives `authenticated` as a prop:

- Login / Register → Login + Register links
- Home → Home link + **Logout** button

Logout flow (Lab 02 Task 4):

1. User clicks Logout
2. `POST /customers/logout` with credentials
3. Server `clearCookie('token')` with the same flags used when setting it (`httpOnly`, `sameSite`, `path`)
4. Frontend navigates to `/login`
5. Visiting `/home` again hits `/customers/me` → 401 → back to login

Logout is **not** behind `protect`. If we required a valid token to log out, a half-broken session could never clear the cookie.

### 9. Why we do not keep the user object in React state globally

Lab forbids Redux and asks you to fetch `/customers/me`. Refreshing `/home` re-asks the server who the user is. That is the source of truth. Stale name/email in `localStorage` would still look “logged in” after logout or cookie expiry.

---

## API Contract Used by the UI

| Method | Path | Cookie | Success | Typical failure |
|---|---|---|---|---|
| POST | `/customers/register` | No | 201 + customer (no password) | 400 validation, 409 email exists |
| POST | `/customers/login` | Set `token` | 200 `{ success, message }` | 401 Invalid credentials |
| GET | `/customers/me` | Required | 200 user document without password | 401 no/invalid token |
| POST | `/customers/logout` | Cleared | 200 logged out | — |

---

## Lab 02 TA Viva Questions (from the problem statement)

### 1. Why do we use `withCredentials: true`?

**Answer:**

Axios (and `fetch`) do **not** send cookies on cross-origin requests unless you opt in. ShopKart’s React app and Express API run on different origins during development (`5173` vs `3000`).

`withCredentials: true` tells the browser:

- include the HttpOnly `token` cookie on `POST /customers/login` follow-up requests such as `GET /customers/me` and `POST /customers/logout`
- allow the browser to **accept** `Set-Cookie` from the API on a credentialed CORS response

Without it, login can return 200, but the cookie is never stored or never sent again, so Home always redirects to Login.

The backend must match this with CORS `credentials: true` and a **specific** `origin` (not `*`). A wildcard origin is illegal for credentialed requests.

We also proxy `/customers` through Vite so, in practice, the browser talks to the same origin as the UI and cookies behave like first-party cookies.

### 2. Why can't JavaScript read an HttpOnly cookie?

**Answer:**

The **HttpOnly** flag is enforced by the **browser**, not by React. When the server sends `Set-Cookie: token=...; HttpOnly`, the cookie is stored in the browser’s cookie jar and is attached automatically to matching HTTP requests. It is **not** exposed on `document.cookie`.

So:

- `localStorage.getItem('token')` cannot see it
- XSS that runs `document.cookie` cannot copy the JWT
- The frontend proves login only by calling an API that **the browser** sends the cookie with

That is why Navbar does not check `localStorage` for a token. JavaScript is not allowed to read this cookie, which is the point of Lab 02 (and viva question 3 from Lab 01).

### 3. Why is `/home` called a protected route?

**Answer:**

A **protected route** is a page that should only be usable after authentication.

`/home` is protected because:

- It is meant to show **that customer’s** name, email, and phone
- On mount it calls `GET /customers/me`, which runs `protect` middleware
- No valid JWT cookie → 401 → automatic redirect to `/login`
- The Logout button only appears on this authenticated layout

“Protected” in React is a **UX gate** (hide the page, redirect). **Authorization on the server** is the real protection. Anyone can still request `/home`; they just will not get profile data without the cookie.

### 4. Why do we fetch `/customers/me` instead of storing the user manually?

**Answer:**

After login you *could* save `{ fullName, email, phone }` in `useState`, `localStorage`, or a global store. Lab 02 forbids Redux and asks for `/customers/me` because:

- The HttpOnly cookie is the session. The server, not the client, knows if it is still valid.
- Manual storage goes **stale**: password change, deleted account, expired JWT, logout on another tab.
- `localStorage` user data is readable by any script on the page (XSS). The cookie is HttpOnly; the profile should be fetched over HTTPS from the API when needed.
- Refreshing `/home` must still work. A cookie survives refresh; in-memory React state does not. Re-fetching `/me` rebuilds the page from the database (minus password).
- Viva idea: **never trust the client as the source of identity.** Ask the server.

Login only needs to succeed and set the cookie. Home then asks: “who is this cookie for?”

### 5. What is the difference between authentication and authorization?

**Answer:**

**Authentication** answers: *Who are you?*

In ShopKart, authentication is:

- Register (create identity)
- Login (email + password vs bcrypt hash)
- Issuing a JWT in an HttpOnly cookie
- `protect` verifying that JWT on later requests

**Authorization** answers: *What are you allowed to do?*

That is permission after identity is known: admin vs customer, “can this user update this order?”, role checks, etc.

Lab 02 is almost entirely **authentication**. `/home` being “protected” means “you must be authenticated.” We are not yet splitting admin/customer roles. `protect` currently only checks “valid logged-in customer,” which is authentication used as a coarse authorization rule: *anonymous users cannot read `/customers/me`.*

Short line for viva: **authentication identifies; authorization permits.**

---

## Extra questions TAs often ask (from this implementation)

### Why not store the JWT in `localStorage`?

`localStorage` is readable by JavaScript. Any XSS can steal the token and impersonate the user until it expires. HttpOnly cookies are not readable by JS. Lab 02 explicitly says the login page should store the HttpOnly cookie automatically.

### Why `POST` for logout instead of `GET`?

Logout **changes server/browser state** (clears the session cookie). `POST` is the safe method for actions with side effects. `GET` logout links can be triggered by prefetch, crawlers, or `<img src>`.

### What happens if someone opens `/home` without logging in?

Home calls `/customers/me`. Middleware finds no cookie → 401 `{ message: 'Not authorized, no token' }` → `navigate('/login')`. They never see another customer’s data.

### Why does the backend omit the password on `/customers/me`?

`.select('-password')` so the hash never leaves the server. The frontend has no reason to display or store it.

### What does the JWT contain?

Payload `{ id: <MongoDB customer _id> }`, signed with `JWT_SECRET`, expiry ~30 days. It is Base64 **encoded**, not encrypted. Anyone can decode the payload; they cannot forge a valid signature without the secret.

### Why controlled inputs?

So validation and the request body always match what the user sees. Uncontrolled inputs (`ref` / native DOM) make it easier to submit stale or empty values.

### What is the difference between 401 and 403?

- **401 Unauthorized** — not authenticated (missing/bad token). This is what `protect` returns.
- **403 Forbidden** — authenticated but not allowed. Not used in Lab 02.

(HTTP naming is historically messy; in viva, 401 = “we don’t know who you are,” 403 = “we know who you are and you may not.”)

---

## One-minute walkthrough (say this in viva)

Register posts customer fields to `/customers/register` and then we go to Login. Login posts email and password with `withCredentials`. The server checks bcrypt, signs a JWT, and sets an HttpOnly cookie. React never reads that cookie. Home calls `/customers/me`; middleware verifies the cookie and returns name, email, and phone. Logout posts `/customers/logout`, the cookie is cleared, and we return to Login.
