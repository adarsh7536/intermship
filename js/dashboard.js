/**
 * dashboard.js - Author Analytics & Blog Post Management
 */

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initDashboard();
});

function initDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  // Display author greeting
  const greetingEl = document.getElementById('user-greeting');
  if (greetingEl) {
    greetingEl.textContent = `Welcome back, ${currentUser.name}!`;
  }

  renderMetrics();
  renderArticlesTable();
}

function renderMetrics() {
  const posts = getPosts();
  const currentUser = getCurrentUser();

  // Filter posts by logged-in user or show all if demo
  const userPosts = posts.filter(p => !currentUser.email || p.author.email === currentUser.email);
  const totalPosts = userPosts.length > 0 ? userPosts.length : posts.length;
  
  const relevantPosts = userPosts.length > 0 ? userPosts : posts;
  const totalLikes = relevantPosts.reduce((acc, p) => acc + (p.likes || 0), 0);
  
  const categories = new Set(relevantPosts.map(p => p.category));

  const totalPostsEl = document.getElementById('metric-total-posts');
  const totalLikesEl = document.getElementById('metric-total-likes');
  const totalCategoriesEl = document.getElementById('metric-total-categories');

  if (totalPostsEl) totalPostsEl.textContent = totalPosts;
  if (totalLikesEl) totalLikesEl.textContent = totalLikes;
  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.size;
}

function renderArticlesTable() {
  const tableBody = document.getElementById('posts-table-body');
  if (!tableBody) return;

  const currentUser = getCurrentUser();
  const allPosts = getPosts();
  
  // Show user posts, or fallback to all posts if user hasn't posted yet
  const posts = allPosts.filter(p => !currentUser.email || p.author.email === currentUser.email);
  const displayPosts = posts.length > 0 ? posts : allPosts;

  if (displayPosts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
          No blog posts found. <a href="create-blog.html" class="btn btn-primary btn-sm" style="margin-left: 0.5rem;">Create Your First Post</a>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = displayPosts.map(post => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--color-text-main);">${escapeHtml(post.title)}</div>
        <span class="badge ${post.badgeClass || 'badge-tech'}" style="margin-top: 4px;">${post.category}</span>
      </td>
      <td>${post.date}</td>
      <td>
        <span title="Total Likes">❤️ ${post.likes || 0}</span>
      </td>
      <td>
        <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--color-success); font-weight: 600; font-size: 0.8rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span> Published
        </span>
      </td>
      <td>
        <div class="flex gap-2">
          <a href="blog-detail.html?id=${post.id}" class="btn btn-outline btn-sm" title="View Article">View</a>
          <a href="create-blog.html?edit=${post.id}" class="btn btn-outline btn-sm" title="Edit Article">Edit</a>
          <button class="btn btn-danger btn-sm" onclick="handleDeletePost('${post.id}')" title="Delete Article">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleDeletePost(id) {
  if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
    deletePost(id);
    showToast('Post removed successfully', 'danger');
    renderMetrics();
    renderArticlesTable();
  }
}
