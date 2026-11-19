/**
 * blog-detail.js - Full Article View, Likes, & Discussion
 * Connected to Node.js & Express REST API (GET /api/blogs/:id, POST /api/blogs/:id/like, POST /api/blogs/:id/comments)
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogDetail();
});

async function initBlogDetail() {
  const container = document.getElementById('article-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Article Not Found</h2>
        <p>No article specified in URL.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Home</a>
      </div>
    `;
    return;
  }

  // Show loading indicator
  container.innerHTML = `
    <div style="text-align: center; padding: 4rem; color: var(--color-text-muted);">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <p>Loading article details from backend...</p>
    </div>
  `;

  let post = null;
  try {
    post = await api.getBlogById(postId);
  } catch (err) {
    console.warn('API error fetching article, falling back to local storage:', err);
    post = getPostById(postId);
  }

  if (!post) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Article Not Found</h2>
        <p>The requested article could not be located or has been deleted.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Home</a>
      </div>
    `;
    return;
  }

  // Update page title
  document.title = `${post.title} - DevBlog`;

  const badgeClass = post.badgeClass || getCategoryBadgeClass(post.category);
  const formattedContent = formatMarkdown(post.content);
  const authorName = post.author && post.author.name ? post.author.name : 'Author';
  const authorAvatar = post.author && post.author.avatar ? post.author.avatar : authorName.charAt(0);

  container.innerHTML = `
    <article>
      <header class="article-header">
        <span class="badge ${badgeClass}" style="margin-bottom: 0.75rem;">${escapeHtml(post.category)}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="flex items-center justify-center gap-4 text-muted" style="color: var(--color-text-muted); font-size: var(--font-size-sm);">
          <div class="author-info">
            <div class="author-avatar">${authorAvatar}</div>
            <span class="author-name">${escapeHtml(authorName)}</span>
          </div>
          <span>•</span>
          <span>${post.date}</span>
          <span>•</span>
          <span>${post.readTime || '3 min read'}</span>
        </div>
      </header>

      <img src="${post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'}" alt="${escapeHtml(post.title)}" class="article-featured-img">

      <div class="article-body">
        ${formattedContent}
      </div>

      <!-- Tags & Action Bar -->
      <div style="max-width: 780px; margin: 3rem auto 0 auto; padding-top: 1.5rem; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div class="flex gap-2" style="flex-wrap: wrap;">
          ${(post.tags || []).map(t => `<span class="chip">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <div>
          <button id="like-btn" class="btn btn-outline" style="border-radius: var(--radius-full);">
            ❤️ <span id="like-count">${post.likes || 0}</span> Likes
          </button>
        </div>
      </div>

      <!-- Comment Section -->
      <section style="max-width: 780px; margin: 3rem auto 0 auto;">
        <h3 style="font-size: var(--font-size-xl); margin-bottom: 1.5rem;">Discussion (<span id="comment-count">${(post.comments || []).length}</span>)</h3>
        
        <form id="comment-form" style="margin-bottom: 2rem;">
          <div class="form-group">
            <textarea id="comment-text" class="form-control" rows="3" placeholder="Share your thoughts or ask a question..." required style="min-height: 90px;"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
        </form>

        <div id="comments-list" class="flex flex-col gap-4">
          ${renderComments(post.comments || [])}
        </div>
      </section>
    </article>
  `;

  // Like button handler via REST API
  const likeBtn = document.getElementById('like-btn');
  const likeCountEl = document.getElementById('like-count');
  if (likeBtn && likeCountEl) {
    likeBtn.addEventListener('click', async () => {
      try {
        const newLikes = await api.likeBlog(post.id);
        likeCountEl.textContent = newLikes;
        showToast('Thanks for liking!', 'success');
      } catch (err) {
        console.warn('API like error, falling back:', err);
        const newLikes = likePost(post.id);
        likeCountEl.textContent = newLikes;
        showToast('Liked!', 'success');
      }
      likeBtn.classList.add('pulse');
      setTimeout(() => likeBtn.classList.remove('pulse'), 400);
    });
  }

  // Comment submission handler via REST API
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');
  const commentsList = document.getElementById('comments-list');
  const commentCountEl = document.getElementById('comment-count');

  if (commentForm && commentText && commentsList) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = commentText.value.trim();
      if (!text) return;

      const currentUser = getCurrentUser();
      const authorName = currentUser ? currentUser.name : 'Anonymous Reader';

      try {
        const comments = await api.addComment(post.id, { author: authorName, text });
        commentsList.innerHTML = renderComments(comments);
        if (commentCountEl) commentCountEl.textContent = comments.length;
        commentText.value = '';
        showToast('Comment posted successfully!', 'success');
      } catch (err) {
        console.warn('API comment error, falling back:', err);
        const newComment = {
          author: authorName,
          text,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        const comments = addCommentToPost(post.id, newComment);
        commentsList.innerHTML = renderComments(comments);
        if (commentCountEl) commentCountEl.textContent = comments.length;
        commentText.value = '';
        showToast('Comment posted (offline mode)', 'info');
      }
    });
  }
}

function renderComments(comments) {
  if (!comments || comments.length === 0) {
    return `<p class="text-muted" style="color: var(--color-text-muted); font-style: italic;">No comments yet. Start the conversation!</p>`;
  }

  return comments.map(c => `
    <div style="background-color: var(--color-surface); padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
        <span style="font-weight: 600; color: var(--color-text-main); font-size: var(--font-size-sm);">${escapeHtml(c.author)}</span>
        <span style="font-size: var(--font-size-xs); color: var(--color-text-subtle);">${c.date || 'Recently'}</span>
      </div>
      <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin: 0; line-height: 1.5;">${escapeHtml(c.text)}</p>
    </div>
  `).join('');
}
