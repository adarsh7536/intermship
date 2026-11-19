/**
 * api.js - Centralized REST API Service for DevBlog Frontend
 * Connects frontend client pages with Node.js & Express backend.
 */

const API_CONFIG = {
  // If served directly from Express server (port 5000), use relative '/api'
  // If opened via file:// or another static server (e.g. port 3000), use absolute URL
  baseUrl: (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '5000'
    ? '/api'
    : 'http://localhost:5000/api',
  tokenKey: 'devblog_auth_token'
};

const api = {
  getToken() {
    return localStorage.getItem(API_CONFIG.tokenKey) || null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(API_CONFIG.tokenKey, token);
    }
  },

  clearToken() {
    localStorage.removeItem(API_CONFIG.tokenKey);
  },

  /**
   * Generic fetch wrapper with headers, token auth, and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Check for network connection issues
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn(`[DevBlog API] Could not connect to backend server at ${API_CONFIG.baseUrl}. Ensure 'npm start' or 'node server.js' is running.`);
        const netErr = new Error(`Cannot connect to backend server at ${API_CONFIG.baseUrl}. Please ensure the Node.js server is running.`);
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw err;
    }
  },

  // ---------------- Health & Server Status ----------------
  async checkHealth() {
    try {
      const data = await this.request('/health', { method: 'GET' });
      return { online: true, data };
    } catch (e) {
      return { online: false, error: e.message };
    }
  },

  // ---------------- Authentication APIs ----------------

  /**
   * Register a new user
   * POST /api/auth/register (or /api/register)
   */
  async register({ name, username, email, password }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password })
    });

    if (data.token) {
      this.setToken(data.token);
    }
    if (data.user) {
      setCurrentUser(data.user);
    }
    return data;
  },

  /**
   * Log in user
   * POST /api/auth/login (or /api/login)
   */
  async login({ email, password }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.token) {
      this.setToken(data.token);
    }
    if (data.user) {
      setCurrentUser(data.user);
    }
    return data;
  },

  /**
   * Log out user
   */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearToken();
      clearCurrentUser();
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    return await this.request('/auth/me', { method: 'GET' });
  },

  // ---------------- Blog Post APIs ----------------

  /**
   * Fetch all blog posts with optional filtering
   * GET /api/blogs?category=...&search=...&author=...
   */
  async getBlogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.author) {
      params.append('author', filters.author);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request(`/blogs${query}`, { method: 'GET' });
    return res.blogs || [];
  },

  /**
   * Fetch single blog post by ID
   * GET /api/blogs/:id
   */
  async getBlogById(id) {
    const res = await this.request(`/blogs/${encodeURIComponent(id)}`, { method: 'GET' });
    return res.blog;
  },

  /**
   * Create a new blog post
   * POST /api/blogs (or /api/create-blog)
   */
  async createBlog(blogData) {
    const res = await this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
    return res.blog;
  },

  /**
   * Update an existing blog post
   * PUT /api/blogs/:id
   */
  async updateBlog(id, blogData) {
    const res = await this.request(`/blogs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
    return res.blog;
  },

  /**
   * Delete a blog post by ID
   * DELETE /api/blogs/:id
   */
  async deleteBlog(id) {
    const res = await this.request(`/blogs/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res;
  },

  /**
   * Like a blog post
   * POST /api/blogs/:id/like
   */
  async likeBlog(id) {
    const res = await this.request(`/blogs/${encodeURIComponent(id)}/like`, {
      method: 'POST'
    });
    return res.likes;
  },

  /**
   * Add a comment to a blog post
   * POST /api/blogs/:id/comments
   */
  async addComment(id, { author, text }) {
    const res = await this.request(`/blogs/${encodeURIComponent(id)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ author, text })
    });
    return res.comments;
  }
};

// Export to window for browser scripts
window.api = api;
