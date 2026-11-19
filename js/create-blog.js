/**
 * create-blog.js - Blog Post Creation, Editing, & Real-Time Preview
 * Connected to Node.js & Express REST API (POST /api/blogs, PUT /api/blogs/:id)
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogEditor();
});

async function initBlogEditor() {
  const form = document.getElementById('blog-form');
  if (!form) return;

  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const imageInput = document.getElementById('coverImage');
  const excerptInput = document.getElementById('excerpt');
  const contentInput = document.getElementById('content');
  const tagsInput = document.getElementById('tags');
  const submitBtn = document.getElementById('submit-btn');

  // Preview elements
  const previewTitle = document.getElementById('preview-title');
  const previewCategory = document.getElementById('preview-category');
  const previewImage = document.getElementById('preview-image');
  const previewBody = document.getElementById('preview-body');

  // Check if we are in Edit Mode
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get('edit');
  let existingPost = null;

  if (editPostId) {
    try {
      existingPost = await api.getBlogById(editPostId);
    } catch (e) {
      existingPost = getPostById(editPostId);
    }

    if (existingPost) {
      const headingEl = document.getElementById('editor-heading');
      if (headingEl) headingEl.textContent = 'Edit Blog Post';
      if (submitBtn) submitBtn.textContent = 'Save Changes';
      
      titleInput.value = existingPost.title || '';
      categorySelect.value = existingPost.category || 'Technology';
      imageInput.value = existingPost.coverImage || '';
      excerptInput.value = existingPost.excerpt || '';
      contentInput.value = existingPost.content || '';
      tagsInput.value = Array.isArray(existingPost.tags) ? existingPost.tags.join(', ') : (existingPost.tags || '');
    }
  }

  // Update live preview function
  function updatePreview() {
    if (previewTitle) {
      previewTitle.textContent = titleInput.value.trim() || 'Your Catchy Blog Post Title';
    }
    if (previewCategory) {
      previewCategory.textContent = categorySelect.value || 'Technology';
      previewCategory.className = `badge ${getCategoryBadgeClass(categorySelect.value)}`;
    }
    if (previewImage) {
      previewImage.src = imageInput.value.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    }
    if (previewBody) {
      const rawText = contentInput.value.trim();
      if (!rawText) {
        previewBody.innerHTML = '<p class="text-muted" style="color:#94a3b8; font-style:italic;">Your article content preview will appear here in real time...</p>';
      } else {
        previewBody.innerHTML = formatMarkdown(rawText);
      }
    }
  }

  // Listeners for live preview
  [titleInput, categorySelect, imageInput, excerptInput, contentInput].forEach(el => {
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  // Initial preview render
  updatePreview();

  // Handle Form Submission via Backend API
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const coverImage = imageInput.value.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    const excerpt = excerptInput.value.trim();
    const content = contentInput.value.trim();
    const rawTags = tagsInput.value.trim();
    const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : ['General'];

    // Current user context
    const currentUser = getCurrentUser() || {
      name: 'Guest Contributor',
      email: 'guest@example.com',
      avatar: 'GC'
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = existingPost ? 'Saving...' : 'Publishing...';
    }

    try {
      if (existingPost) {
        // Update existing post via PUT /api/blogs/:id
        let updatedPost;
        try {
          updatedPost = await api.updateBlog(existingPost.id, {
            title,
            category,
            coverImage,
            excerpt,
            content,
            tags
          });
        } catch (apiErr) {
          if (apiErr.isNetworkError) {
            updatedPost = updatePost(existingPost.id, { title, category, coverImage, excerpt, content, tags });
          } else {
            throw apiErr;
          }
        }

        showToast('Article updated successfully!', 'success');
        setTimeout(() => {
          window.location.href = `blog-detail.html?id=${existingPost.id}`;
        }, 600);
      } else {
        // Create new post via POST /api/blogs (REST API)
        let newPost;
        try {
          newPost = await api.createBlog({
            title,
            category,
            coverImage,
            excerpt,
            content,
            tags,
            author: {
              name: currentUser.name,
              email: currentUser.email,
              avatar: currentUser.avatar || currentUser.name.charAt(0)
            }
          });
        } catch (apiErr) {
          if (apiErr.isNetworkError) {
            newPost = savePost({
              title,
              category,
              coverImage,
              excerpt,
              content,
              tags,
              readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
              author: {
                name: currentUser.name,
                email: currentUser.email,
                avatar: currentUser.avatar || currentUser.name.charAt(0)
              }
            });
          } else {
            throw apiErr;
          }
        }

        showToast('Article published successfully!', 'success');
        setTimeout(() => {
          window.location.href = `blog-detail.html?id=${newPost.id}`;
        }, 600);
      }
    } catch (err) {
      console.error('Failed to save blog post:', err);
      showToast(err.message || 'Failed to save article. Please try again.', 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = existingPost ? 'Save Changes' : 'Publish Article';
      }
    }
  });
}
