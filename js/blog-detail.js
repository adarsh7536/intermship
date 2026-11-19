/**
 * blog-detail.js - Full Article View, Likes, & Discussion
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogDetail();
});

function initBlogDetail() {
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

  const post = getPostById(postId);

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

  container.innerHTML = `
    <article>
      <header class="article-header">
        <span class="badge ${badgeClass}" style="margin-bottom: 0.75rem;">${post.category}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="flex items-center justify-center gap-4 text-muted" style="color: var(--color-text-muted); font-size: var(--font-size-sm);">
          <div class="author-info">
            <div class="author-avatar">${post.author.avatar || post.author.name.charAt(0)}</div>
            <span class="author-name">${post.author.name}</span>
          </div>
          <span>•</span>
          <span>${post.date}</span>
          <span>•</span>
          <span>${post.readTime || '3 min read'}</span>
        </div>
      </header>

      <img src="${post.coverImage}" alt="${escapeHtml(post.title)}" class="article-featured-img">

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

  // Like button handler
  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      const newCount = likePost(post.id);
      document.getElementById('like-count').textContent = newCount;
      likeBtn.classList.add('btn-primary');
      likeBtn.classList.remove('btn-outline');
      showToast('Thanks for liking!', 'success');
    });
  }

  // Comment submission handler
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('comment-text').value.trim();
      if (!text) return;

      const user = getCurrentUser() || { name: 'Guest Reader' };
      const newComment = {
        author: user.name,
        text,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      const comments = addCommentToPost(post.id, newComment);
      document.getElementById('comment-text').value = '';
      document.getElementById('comments-list').innerHTML = renderComments(comments);
      document.getElementById('comment-count').textContent = comments.length;
      showToast('Comment posted!', 'success');
    });
  }
}

function renderComments(comments) {
  if (comments.length === 0) {
    return `<p style="color: var(--color-text-subtle); font-style: italic;">No comments yet. Be the first to share your perspective!</p>`;
  }

  return comments.map(c => `
    <div style="background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem;">
      <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
        <span style="font-weight: 700; font-size: var(--font-size-sm);">${escapeHtml(c.author)}</span>
        <span style="color: var(--color-text-subtle); font-size: var(--font-size-xs);">${c.date}</span>
      </div>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">${escapeHtml(c.text)}</p>
    </div>
  `).join('');
}
