const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

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

function calculateReadTime(text) {
  if (!text) return '1 min read';
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatCurrentDate() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

/**
 * POST /api/blogs
 * Create a new blog post
 */
router.post('/', optionalAuth, (req, res) => {
  try {
    const { title, category, coverImage, excerpt, content, tags, author } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog title is required.'
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog category is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Blog content is required.'
      });
    }

    // Process tags
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      processedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (processedTags.length === 0) {
      processedTags = ['Technology'];
    }

    // Determine author
    let blogAuthor = {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      avatar: 'AM'
    };

    if (req.user) {
      blogAuthor = {
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || req.user.name.charAt(0).toUpperCase()
      };
    } else if (author && author.name) {
      blogAuthor = {
        name: String(author.name).trim(),
        email: author.email ? String(author.email).trim() : 'contributor@example.com',
        avatar: author.avatar || author.name.charAt(0).toUpperCase()
      };
    }

    const trimmedContent = content.trim();
    const finalExcerpt = excerpt && excerpt.trim()
      ? excerpt.trim()
      : trimmedContent.substring(0, 160).replace(/[#*`\n]/g, ' ') + '...';

    const newPost = {
      id: 'post-' + Date.now(),
      title: title.trim(),
      category: category.trim(),
      badgeClass: getCategoryBadgeClass(category),
      excerpt: finalExcerpt,
      content: trimmedContent,
      coverImage: coverImage && coverImage.trim() 
        ? coverImage.trim() 
        : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      author: blogAuthor,
      date: formatCurrentDate(),
      readTime: calculateReadTime(trimmedContent),
      tags: processedTags,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    const savedPost = db.createPost(newPost);

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully!',
      blog: savedPost
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create blog post: ' + err.message
    });
  }
});

/**
 * GET /api/blogs
 * Fetch all blogs with optional filtering (category, search, author)
 */
router.get('/', (req, res) => {
  try {
    let posts = db.getPosts();
    const { category, search, author } = req.query;

    // Filter by category
    if (category && category.toLowerCase() !== 'all') {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by author email or username
    if (author) {
      const lowerAuthor = author.toLowerCase();
      posts = posts.filter(p => 
        (p.author && p.author.email && p.author.email.toLowerCase() === lowerAuthor) ||
        (p.author && p.author.name && p.author.name.toLowerCase() === lowerAuthor)
      );
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase().trim();
      posts = posts.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const excerptMatch = p.excerpt && p.excerpt.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
        const authorMatch = p.author && p.author.name && p.author.name.toLowerCase().includes(q);
        return titleMatch || excerptMatch || tagsMatch || authorMatch;
      });
    }

    return res.status(200).json({
      success: true,
      count: posts.length,
      blogs: posts
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs: ' + err.message
    });
  }
});

/**
 * GET /api/blogs/:id
 * Fetch single blog post by ID
 */
router.get('/:id', (req, res) => {
  try {
    const post = db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found with ID: ' + req.params.id
      });
    }

    return res.status(200).json({
      success: true,
      blog: post
    });
  } catch (err) {
    console.error('Error fetching blog:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post: ' + err.message
    });
  }
});

/**
 * PUT /api/blogs/:id
 * Update an existing blog post
 */
router.put('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getPostById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found with ID: ' + id
      });
    }

    const { title, category, coverImage, excerpt, content, tags } = req.body;

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title.trim();
    if (category !== undefined) {
      updatedFields.category = category.trim();
      updatedFields.badgeClass = getCategoryBadgeClass(category);
    }
    if (coverImage !== undefined) updatedFields.coverImage = coverImage.trim();
    if (excerpt !== undefined) updatedFields.excerpt = excerpt.trim();
    if (content !== undefined) {
      updatedFields.content = content.trim();
      updatedFields.readTime = calculateReadTime(content);
    }
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updatedFields.tags = tags.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        updatedFields.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const updated = db.updatePost(id, updatedFields);

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully!',
      blog: updated
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update blog post: ' + err.message
    });
  }
});

/**
 * DELETE /api/blogs/:id
 * Delete a blog post by ID
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getPostById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found with ID: ' + id
      });
    }

    const deleted = db.deletePost(id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete blog post.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog post: ' + err.message
    });
  }
});

/**
 * POST /api/blogs/:id/like
 * Increment likes counter on a blog post
 */
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const likes = db.likePost(id);
    if (likes === null) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found with ID: ' + id
      });
    }

    return res.status(200).json({
      success: true,
      likes
    });
  } catch (err) {
    console.error('Error liking blog:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to like blog post: ' + err.message
    });
  }
});

/**
 * POST /api/blogs/:id/comments
 * Add a comment to a blog post
 */
router.post('/:id/comments', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.'
      });
    }

    let commentAuthor = 'Anonymous Reader';
    if (req.user && req.user.name) {
      commentAuthor = req.user.name;
    } else if (author && String(author).trim()) {
      commentAuthor = String(author).trim();
    }

    const newComment = {
      id: 'comment-' + Date.now(),
      author: commentAuthor,
      text: text.trim(),
      date: formatCurrentDate()
    };

    const comments = db.addCommentToPost(id, newComment);
    if (!comments) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found with ID: ' + id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully!',
      comments
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to post comment: ' + err.message
    });
  }
});

module.exports = router;
