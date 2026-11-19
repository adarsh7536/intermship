/**
 * storage.js - LocalStorage Persistence & Initial Data Seeding
 * Powers the Blog Application without requiring a backend database.
 */

const STORAGE_KEYS = {
  POSTS: 'adi_blog_posts',
  USERS: 'adi_blog_users',
  SESSION: 'adi_blog_session'
};

// Default seed data to ensure the blog is populated on first launch
const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Mastering Modern Frontend: From Semantic HTML to Responsive CSS',
    category: 'Web Dev',
    badgeClass: 'badge-dev',
    excerpt: 'Explore how semantic HTML5 elements, flexible CSS Grid, and custom properties allow developers to create maintainable, responsive web experiences.',
    content: `Building modern websites requires a solid foundation in the core triad of the web: HTML, CSS, and JavaScript.

## 1. Why Semantic HTML Matters
Semantic elements like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, and \`<footer>\` do not just improve search engine discoverability—they provide crucial structure for assistive technologies and screen readers. Writing clean HTML is the first step toward universal accessibility.

## 2. The Power of Responsive CSS
CSS has evolved dramatically. With modern CSS Variables (custom properties), CSS Grid, and Flexbox, we no longer need heavy external layout frameworks for standard responsive designs. Media queries allow our layouts to smoothly transition from handheld smartphones to multi-column desktop displays.

\`\`\`css
/* Clean responsive grid layout */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
\`\`\`

## 3. Dynamic JavaScript Enhancements
JavaScript brings our pages to life. By leveraging modern ES6+ features like array methods, template literals, and \`localStorage\`, we can store and render dynamic blog data seamlessly in the browser.`,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      avatar: 'AM'
    },
    date: 'Nov 18, 2026',
    readTime: '4 min read',
    tags: ['HTML5', 'CSS3', 'Web Development'],
    likes: 24,
    comments: [
      { author: 'Jane Doe', text: 'Clear and insightful explanation of modern CSS techniques!', date: 'Nov 19, 2026' }
    ]
  },
  {
    id: 'post-2',
    title: 'The Rise of Agentic AI: How Autonomous Agents Work',
    category: 'AI',
    badgeClass: 'badge-ai',
    excerpt: 'An accessible guide into how autonomous LLM agents plan, reason, invoke external tools, and collaborate to solve complex programming challenges.',
    content: `Artificial intelligence has shifted from basic chat completions to autonomous agentic workflows that plan, reason, and act.

## Understanding Agentic Workflows
Traditional language models generate a single response to a single prompt. In contrast, an agent follows a continuous loop:
1. **Perceive**: Read user goals and inspect environment state.
2. **Plan**: Formulate steps and identify necessary tools.
3. **Act**: Execute commands, inspect files, or browse web resources.
4. **Evaluate**: Verify the result and adjust the approach if errors occur.

> "The true leap in AI productivity happens when models transition from conversational advisors to autonomous task solvers."

## Future Implications for Developers
Developers are moving into orchestrator roles—defining constraints, reviewing system architectures, and writing verification tests while agents assist in scaffolding and implementations.`,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Dr. Elena Rostova',
      email: 'elena@example.com',
      avatar: 'ER'
    },
    date: 'Nov 17, 2026',
    readTime: '6 min read',
    tags: ['Artificial Intelligence', 'LLM', 'Future Tech'],
    likes: 42,
    comments: []
  },
  {
    id: 'post-3',
    title: 'Design Systems for Scalable Web Applications',
    category: 'Design',
    badgeClass: 'badge-design',
    excerpt: 'Learn the fundamentals of building a cohesive design system using design tokens, harmonious spacing, accessible contrast, and reusable components.',
    content: `A design system is the single source of truth that unites designers and engineers around a shared visual language.

## Design Tokens: The Backbone
Design tokens store visual attributes like color palettes, font weights, elevation shadows, and border radii in a technology-agnostic format. In pure CSS, we declare these as custom properties:

- **Colors**: Primary brand color, surface tints, neutral grays, semantic alert colors.
- **Elevation**: Multi-layered box-shadows representing physical depth.
- **Rhythm**: Consistent 4px or 8px grid spacing across all margins and paddings.

Consistent design creates familiarity, increases user trust, and dramatically speeds up UI feature development.`,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Samira Chen',
      email: 'samira@example.com',
      avatar: 'SC'
    },
    date: 'Nov 15, 2026',
    readTime: '5 min read',
    tags: ['UI/UX', 'Design Systems', 'CSS'],
    likes: 19,
    comments: []
  },
  {
    id: 'post-4',
    title: 'Essential JavaScript Concepts Every Beginner Should Know',
    category: 'Technology',
    badgeClass: 'badge-tech',
    excerpt: 'Demystifying scope, closures, promises, event loops, and DOM manipulation to help you transition from beginner to confident web developer.',
    content: `JavaScript is the runtime engine of interactive browsers. Understanding its core primitives is the secret to debugging complex behaviors.

## The Document Object Model (DOM)
The DOM represents your HTML document as a tree of nodes. JavaScript allows you to query elements (\`document.querySelector\`), attach event listeners (\`addEventListener\`), and dynamically manipulate HTML content without full page reloads.

## Managing State with LocalStorage
Web applications often need to persist state between browser sessions. The Web Storage API provides \`localStorage\`, a simple key-value store that survives tab refreshes. Combining this with \`JSON.stringify()\` and \`JSON.parse()\` gives you an instant client-side database.`,
    coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      avatar: 'AM'
    },
    date: 'Nov 12, 2026',
    readTime: '4 min read',
    tags: ['JavaScript', 'Web Dev', 'Programming'],
    likes: 31,
    comments: []
  }
];

const INITIAL_USERS = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    username: 'alexm',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'AM',
    bio: 'Frontend enthusiast and open web advocate.'
  }
];

// Initialize Storage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
}

// ---------------- Post CRUD Operations ----------------
function getPosts() {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
  } catch (e) {
    console.error('Failed to parse posts from localStorage', e);
    return [];
  }
}

function getPostById(id) {
  const posts = getPosts();
  return posts.find(p => p.id === id);
}

function savePost(postData) {
  const posts = getPosts();
  const newPost = {
    ...postData,
    id: 'post-' + Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    likes: 0,
    comments: []
  };
  posts.unshift(newPost);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  return newPost;
}

function updatePost(id, updatedFields) {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  }
  return null;
}

function deletePost(id) {
  let posts = getPosts();
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  return true;
}

function likePost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (post) {
    post.likes = (post.likes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post.likes;
  }
  return 0;
}

function addCommentToPost(id, comment) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (post) {
    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post.comments;
  }
  return [];
}

// ---------------- User & Auth Storage ----------------
function getUsers() {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch (e) {
    return [];
  }
}

function saveUser(userData) {
  const users = getUsers();
  const newUser = {
    ...userData,
    id: 'user-' + Date.now(),
    avatar: userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  // Never save raw password in session
  const safeUser = { ...user };
  delete safeUser.password;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// ---------------- UI Helpers (Toast notifications) ----------------
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Lightweight markdown formatter helper
function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\`\`\`([\s\S]*?)\`\`\`/gim, '<pre><code>$1</code></pre>')
    .replace(/\`([^`]+)\`/gim, '<code>$1</code>');

  return html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<pre')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

// Global Category Badge class helper
function getCategoryBadgeClass(category) {
  if (!category) return 'badge-tech';
  switch (category.toLowerCase()) {
    case 'web dev': return 'badge-dev';
    case 'ai': return 'badge-ai';
    case 'design': return 'badge-design';
    case 'lifestyle': return 'badge-lifestyle';
    default: return 'badge-tech';
  }
}

// Global HTML sanitization helper
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Seed on script load
initializeStorage();
