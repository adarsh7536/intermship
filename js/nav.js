/**
 * nav.js - Dynamic Navigation Bar & Mobile Drawer Management
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});

function renderNavbar() {
  const navContainer = document.querySelector('.navbar .container');
  if (!navContainer) return;

  const currentUser = getCurrentUser();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  // Build nav links based on auth status
  const navLinksHtml = `
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html" class="${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">Home</a></li>
      ${currentUser ? `
        <li><a href="dashboard.html" class="${currentPath === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
        <li><a href="create-blog.html" class="${currentPath === 'create-blog.html' ? 'active' : ''}">Create Blog</a></li>
      ` : ''}
    </ul>
  `;

  // Build right action buttons
  let navActionsHtml = '';
  if (currentUser) {
    navActionsHtml = `
      <div class="nav-actions">
        <a href="create-blog.html" class="btn btn-primary btn-sm">＋ Write</a>
        <div class="author-info" style="cursor: pointer;" title="Logged in as ${currentUser.name}" onclick="location.href='dashboard.html'">
          <div class="author-avatar">${currentUser.avatar || 'U'}</div>
          <span class="author-name" style="display:none; @media(min-width:640px){display:inline;}">${currentUser.name}</span>
        </div>
        <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
      </div>
    `;
  } else {
    navActionsHtml = `
      <div class="nav-actions">
        <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
      </div>
    `;
  }

  // Hamburger toggle button
  const toggleBtnHtml = `
    <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Navigation">
      ☰
    </button>
  `;

  // Insert or update inner content
  const brandHtml = `
    <a href="index.html" class="brand-logo">
      <div class="logo-icon">B</div>
      <span>Dev<span>Blog</span></span>
    </a>
  `;

  navContainer.innerHTML = `
    ${brandHtml}
    ${navLinksHtml}
    ${navActionsHtml}
    ${toggleBtnHtml}
  `;

  // Mobile menu toggle listener
  const toggleBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Logout listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearCurrentUser();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}
