/**
 * home.js - Home Page Feed, Live Search, & Category Filtering
 * Connected to Node.js & Express REST API (GET /api/blogs)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
});

let currentCategory = 'all';
let currentSearchQuery = '';
let searchDebounceTimer = null;

function initHomePage() {
  const postsGrid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('search-input');
  const categoryChips = document.querySelectorAll('.category-chips .chip');

  if (!postsGrid) return;

  // Render initial posts from backend API
  renderPosts();

  // Search filter listener (with debounce for smooth typing)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderPosts();
      }, 250);
    });
  }

  // Category filter listeners
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category || 'all';
      renderPosts();
    });
  });
}

async function renderPosts() {
  const postsGrid = document.getElementById('blog-grid');
  if (!postsGrid) return;

  // Show subtle loading state if needed
  if (!postsGrid.children.length) {
    postsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏳</div>
        <p>Loading latest articles from server...</p>
      </div>
    `;
  }

  let posts = [];
  try {
    // Fetch from Node.js / Express REST API
    posts = await api.getBlogs({
      category: currentCategory,
      search: currentSearchQuery
    });
  } catch (err) {
    console.warn('Backend API fetch error, falling back to local cache:', err);
    // Graceful offline fallback
    const allPosts = getPosts();
    posts = allPosts.filter(post => {
      const matchesCategory = (currentCategory === 'all') || (post.category.toLowerCase() === currentCategory.toLowerCase());
      const postTags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : '';
      const q = currentSearchQuery.toLowerCase();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) || 
        post.excerpt.toLowerCase().includes(q) ||
        postTags.includes(q) ||
        (post.author && post.author.name && post.author.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }

  if (!posts || posts.length === 0) {
    postsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No articles found</h3>
        <p>Try refining your search keyword or clearing category filters.</p>
      </div>
    `;
    return;
  }

  postsGrid.innerHTML = posts.map(post => createPostCardHtml(post)).join('');
}

function createPostCardHtml(post) {
  const badgeClass = post.badgeClass || getCategoryBadgeClass(post.category);
  const cover = post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
  const authorName = post.author && post.author.name ? post.author.name : 'Author';
  const authorAvatar = post.author && post.author.avatar ? post.author.avatar : authorName.charAt(0);

  return `
    <article class="card">
      <div class="card-img-wrapper">
        <span class="badge ${badgeClass} card-badge">${escapeHtml(post.category)}</span>
        <a href="blog-detail.html?id=${post.id}">
          <img src="${cover}" alt="${escapeHtml(post.title)}" loading="lazy">
        </a>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${post.date}</span>
          <span>•</span>
          <span>${post.readTime || '3 min read'}</span>
        </div>
        <h2 class="card-title">
          <a href="blog-detail.html?id=${post.id}">${escapeHtml(post.title)}</a>
        </h2>
        <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="card-footer">
          <div class="author-info">
            <div class="author-avatar">${authorAvatar}</div>
            <span class="author-name">${escapeHtml(authorName)}</span>
          </div>
          <span style="font-size: var(--font-size-xs); color: var(--color-text-subtle);">❤️ ${post.likes || 0}</span>
        </div>
      </div>
    </article>
  `;
}
