/**
 * create-blog.js - Blog Post Creation, Editing, & Real-Time Preview
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogEditor();
});

function initBlogEditor() {
  const form = document.getElementById('blog-form');
  if (!form) return;

  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const imageInput = document.getElementById('coverImage');
  const excerptInput = document.getElementById('excerpt');
  const contentInput = document.getElementById('content');
  const tagsInput = document.getElementById('tags');

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
    existingPost = getPostById(editPostId);
    if (existingPost) {
      document.getElementById('editor-heading').textContent = 'Edit Blog Post';
      document.getElementById('submit-btn').textContent = 'Save Changes';
      
      titleInput.value = existingPost.title;
      categorySelect.value = existingPost.category;
      imageInput.value = existingPost.coverImage;
      excerptInput.value = existingPost.excerpt;
      contentInput.value = existingPost.content;
      tagsInput.value = Array.isArray(existingPost.tags) ? existingPost.tags.join(', ') : '';
    }
  }

  // Update live preview function
  function updatePreview() {
    if (previewTitle) {
      previewTitle.textContent = titleInput.value.trim() || 'Your Catchy Blog Post Title';
    }
    if (previewCategory) {
      previewCategory.textContent = categorySelect.value || 'Technology';
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

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const coverImage = imageInput.value.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    const excerpt = excerptInput.value.trim();
    const content = contentInput.value.trim();
    const rawTags = tagsInput.value.trim();
    const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : ['General'];

    // Word count & read time
    const wordsCount = content.split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.ceil(wordsCount / 200))} min read`;

    // Author detection
    const currentUser = getCurrentUser() || {
      name: 'Guest Contributor',
      email: 'guest@example.com',
      avatar: 'GC'
    };

    if (existingPost) {
      // Update existing post
      updatePost(existingPost.id, {
        title,
        category,
        coverImage,
        excerpt,
        content,
        tags,
        readTime
      });
      showToast('Article updated successfully!', 'success');
      setTimeout(() => {
        window.location.href = `blog-detail.html?id=${existingPost.id}`;
      }, 600);
    } else {
      // Create new post
      const newPost = savePost({
        title,
        category,
        coverImage,
        excerpt,
        content,
        tags,
        readTime,
        author: {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar || currentUser.name.charAt(0)
        }
      });
      showToast('Article published successfully!', 'success');
      setTimeout(() => {
        window.location.href = `blog-detail.html?id=${newPost.id}`;
      }, 600);
    }
  });
}
