# 🚀 DevBlog - Modern Full Stack Blog Application

A complete, responsive, full-stack technical Blog Application built with a **Node.js & Express.js REST API Backend** and a clean, accessible **Semantic HTML5, Modern CSS3, and Vanilla JavaScript Frontend**.

---

## 📑 Table of Contents
1. [Backend Architecture & REST APIs](#backend-architecture--rest-apis)
2. [REST API Documentation](#rest-api-documentation)
3. [How to Run the Application](#how-to-run-the-application)
4. [Running Automated API Tests](#running-automated-api-tests)
5. [Frontend & Backend Integration](#frontend--backend-integration)
6. [Demo Credentials & Testing](#demo-credentials--testing)
7. [Directory Structure](#directory-structure)

---

## Backend Architecture & REST APIs

The backend is built with **Node.js** and **Express.js**, adhering to RESTful API conventions:
- **Modular Routing**: Separated into `routes/auth.js` for user management and `routes/blogs.js` for article management.
- **Data Persistence**: Uses a clean, robust file-based JSON store in `data/users.json` and `data/posts.json` that persists across server restarts without requiring heavy external database installations.
- **Security & Cryptography**:
  - Secure HMAC SHA-256 password hashing with salt.
  - Cryptographically secure random session tokens.
  - Cross-Origin Resource Sharing (CORS) configured for smooth frontend-backend communication.
- **Static Asset Serving**: Express serves the complete frontend application directly on `http://localhost:5000/`.

---

## REST API Documentation

### Base URL: `http://localhost:5000/api`

### 1. User Registration
Creates a new author account with hashed credentials.
- **Endpoint**: `POST /api/auth/register` *(or convenient alias `POST /api/register`)*
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Sarah Connor",
    "username": "sconnor",
    "email": "sarah@example.com",
    "password": "password123"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registration successful!",
    "token": "devblog_9f82...",
    "user": {
      "id": "user-1795093...",
      "name": "Sarah Connor",
      "username": "sconnor",
      "email": "sarah@example.com",
      "avatar": "SC",
      "bio": ""
    }
  }
  ```

### 2. User Login
Authenticates an existing user and returns a session token.
- **Endpoint**: `POST /api/auth/login` *(or convenient alias `POST /api/login`)*
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
  *(Note: The `email` field also accepts a username, e.g. `"alexm"`)*
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Welcome back, Alex Morgan!",
    "token": "devblog_4a12...",
    "user": {
      "id": "user-1",
      "name": "Alex Morgan",
      "username": "alexm",
      "email": "alex@example.com",
      "avatar": "AM"
    }
  }
  ```

### 3. Create Blog Post
Creates a new technical article with calculated reading time and tags.
- **Endpoint**: `POST /api/blogs` *(or convenient alias `POST /api/create-blog`)*
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` *(optional)*
- **Request Body**:
  ```json
  {
    "title": "Mastering Microservices Architecture",
    "category": "Web Dev",
    "excerpt": "A deep dive into decoupled system architecture and API gateways.",
    "content": "## Architectural Patterns\nDecoupled services allow independent scaling...",
    "tags": ["Architecture", "Node.js", "Microservices"],
    "coverImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Blog post created successfully!",
    "blog": {
      "id": "post-1795093...",
      "title": "Mastering Microservices Architecture",
      "category": "Web Dev",
      "badgeClass": "badge-dev",
      "excerpt": "A deep dive into decoupled system architecture and API gateways.",
      "content": "...",
      "coverImage": "https://images.unsplash.com/...",
      "author": { "name": "Alex Morgan", "email": "alex@example.com", "avatar": "AM" },
      "date": "Nov 19, 2026",
      "readTime": "3 min read",
      "tags": ["Architecture", "Node.js", "Microservices"],
      "likes": 0,
      "comments": []
    }
  }
  ```

### 4. Additional Blog Management Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/blogs` | Get all blog posts (supports `?category=...&search=...&author=...`) |
| `GET` | `/api/blogs/:id` | Get details of a single article by ID |
| `PUT` | `/api/blogs/:id` | Update an existing blog article |
| `DELETE` | `/api/blogs/:id` | Delete an article |
| `POST` | `/api/blogs/:id/like` | Increment the likes counter |
| `POST` | `/api/blogs/:id/comments` | Post a comment to an article discussion thread |
| `GET` | `/api/health` | Server health check endpoint |

---

## How to Run the Application

### 1. Start the Node.js / Express Server
In the root directory, simply run:
```bash
npm start
```
*(or `node server.js`)*

### 2. Open in Browser
Visit:
```text
http://localhost:5000/
```
The Express server serves both:
1. The **Full Frontend Web App** at `http://localhost:5000/`
2. The **REST API** at `http://localhost:5000/api`

---

## Running Automated API Tests

An automated test suite (`test-api.js`) is included to verify all REST endpoints:
```bash
npm test
```
This suite verifies:
- Health check status
- User registration validation and duplicate prevention (409)
- User login authentication and invalid credential rejection (401)
- Blog creation (`POST /api/blogs`)
- Article feed retrieval and keyword searching
- Single blog loading, updates, likes, and comment threads
- Article deletion (`DELETE /api/blogs/:id`) and 404 verification

---

## Frontend & Backend Integration

The frontend seamlessly communicates with the backend via a centralized API service layer in `js/api.js`:
- **`js/api.js`**: Reusable asynchronous wrapper handling `fetch()`, request headers, `Authorization: Bearer <token>`, JSON encoding, and network fallback.
- **`js/auth.js`**: Connected to `api.login()` and `api.register()`.
- **`js/create-blog.js`**: Connected to `api.createBlog()` and `api.updateBlog()`.
- **`js/home.js`**: Connected to `api.getBlogs()` with live search and category filtering.
- **`js/dashboard.js`**: Connected to `api.getBlogs()` and `api.deleteBlog()`.
- **`js/blog-detail.js`**: Connected to `api.getBlogById()`, `api.likeBlog()`, and `api.addComment()`.
- **`js/nav.js`**: Connected to `api.logout()` and features an active **API Online** status indicator.

---

## Demo Credentials & Testing

The server is pre-seeded with a demo user account and 4 detailed blog articles:
- **Email**: `alex@example.com`
- **Password**: `password123`

You can use the **"Auto-fill Demo Credentials"** button on `login.html` or register a new user via `register.html`.

---

## Directory Structure
```text
adi_project/
├── data/
│   ├── posts.json            # Persistent blog articles store
│   └── users.json            # Persistent user store (with hashed passwords)
├── middleware/
│   └── auth.js               # Express auth middleware (token verification)
├── routes/
│   ├── auth.js               # REST APIs for registration, login, profile
│   └── blogs.js              # REST APIs for blog CRUD, likes, comments
├── utils/
│   ├── auth.js               # Cryptographic hashing & token helpers
│   └── db.js                 # Safe JSON file data access layer
├── js/
│   ├── api.js                # Frontend REST API client
│   ├── auth.js               # Login & Register handlers
│   ├── blog-detail.js        # Article view, like, comment handlers
│   ├── create-blog.js        # Blog draft/edit & live preview handlers
│   ├── dashboard.js          # Author stats & article management
│   ├── home.js               # Feed rendering & search filters
│   ├── nav.js                # Navbar state & connection status indicator
│   └── storage.js            # Client storage & markdown formatting helpers
├── css/
│   └── style.css             # Responsive design system & token styles
├── index.html                # Home feed page
├── login.html                # User login page
├── register.html             # User registration page
├── create-blog.html          # Create / edit article page
├── dashboard.html            # Author dashboard page
├── blog-detail.html          # Single blog reading page
├── server.js                 # Node.js & Express server entry point
├── test-api.js               # Automated REST API integration test suite
├── package.json              # Dependencies and run scripts
└── README.md                 # Complete documentation
```
