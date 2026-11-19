const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// ---------------- User Operations ----------------

function getUsers() {
  return readJsonFile(USERS_FILE, []);
}

function findUserByEmailOrUsername(identifier) {
  if (!identifier) return null;
  const users = getUsers();
  const lower = identifier.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower) || null;
}

function findUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  writeJsonFile(USERS_FILE, users);
  return user;
}

// ---------------- Post Operations ----------------

function getPosts() {
  return readJsonFile(POSTS_FILE, []);
}

function getPostById(id) {
  const posts = getPosts();
  return posts.find(p => p.id === id) || null;
}

function createPost(postData) {
  const posts = getPosts();
  posts.unshift(postData);
  writeJsonFile(POSTS_FILE, posts);
  return postData;
}

function updatePost(id, updatedFields) {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...updatedFields, updatedAt: new Date().toISOString() };
  writeJsonFile(POSTS_FILE, posts);
  return posts[index];
}

function deletePost(id) {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;

  writeJsonFile(POSTS_FILE, filtered);
  return true;
}

function likePost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return null;

  post.likes = (post.likes || 0) + 1;
  writeJsonFile(POSTS_FILE, posts);
  return post.likes;
}

function addCommentToPost(id, comment) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return null;

  if (!Array.isArray(post.comments)) {
    post.comments = [];
  }
  post.comments.push(comment);
  writeJsonFile(POSTS_FILE, posts);
  return post.comments;
}

module.exports = {
  getUsers,
  findUserByEmailOrUsername,
  findUserById,
  saveUser,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addCommentToPost
};
