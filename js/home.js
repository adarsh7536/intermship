/**
 * home.js - Home Page Feed, Live Search, & Category Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
});

let currentCategory = 'all';
let currentSearchQuery = '';

function initHomePage() {
  const postsGrid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('search-input');
  const categoryChips = document.querySelectorAll('.category-chips .chip');

  if (!postsGrid) return;

  // Render initial posts
  renderPosts();

  // Search filter listener (with debounce for smooth typing)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderPosts();
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

function renderPosts() {
  const postsGrid = document.getElementById('blog-grid');
  if (!postsGrid) return;

  const allPosts = getPosts();

  // Filter posts
  const filtered = allPosts.filter(post => {
    const matchesCategory = (currentCategory === 'all') || (post.category.toLowerCase() === currentCategory.toLowerCase());
    
    const postTags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : '';
    const matchesSearch = !currentSearchQuery || 
      post.title.toLowerCase().includes(currentSearchQuery) || 
      post.excerpt.toLowerCase().includes(currentSearchQuery) ||
      postTags.includes(currentSearchQuery) ||
      post.author.name.toLowerCase().includes(currentSearchQuery);

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    postsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No articles found</h3>
        <p>Try refining your search keyword or clearing category filters.</p>
      </div>
    `;
    return;
  }

  postsGrid.innerHTML = filtered.map(post => createPostCardHtml(post)).join('');
}

function createPostCardHtml(post) {
  const badgeClass = post.badgeClass || getCategoryBadgeClass(post.category);
  const cover = post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';

  return `
    <article class="card">
      <div class="card-img-wrapper">
        <span class="badge ${badgeClass} card-badge">${post.category}</span>
        <a href="blog-detail.html?id=${post.id}">
          <img src="${cover}" alt="${post.title}" loading="lazy">
        </a>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${post.date}</span>
          <span>•</span>
          <span>${post.readTime || '3 min read'}</span>
        </div>
        <h2 class="card-title">
          <a href="blog-detail.html?id=${post.id}">${post.title}</a>
        </h2>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-footer">
          <div class="author-info">
            <div class="author-avatar">${post.author.avatar || post.author.name.charAt(0)}</div>
            <span class="author-name">${post.author.name}</span>
          </div>
          <a href="blog-detail.html?id=${post.id}" class="btn btn-outline btn-sm">Read Article →</a>
        </div>
      </div>
    </article>
  `;
}
