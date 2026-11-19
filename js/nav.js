/**
 * nav.js - Dynamic Navigation Bar & Mobile Drawer Management
 * Shows live backend connection status and handles session logout via API.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  checkBackendConnection();
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
        <span id="backend-status-pill" class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="Backend Server Status">
          <span style="width:6px; height:6px; border-radius:50%; background:#0284c7;"></span> API Connected
        </span>
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
        <span id="backend-status-pill" class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;" title="Backend Server Status">
          <span style="width:6px; height:6px; border-radius:50%; background:#0284c7;"></span> API Connected
        </span>
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

  // Brand Logo
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
    logoutBtn.addEventListener('click', async () => {
      if (window.api) {
        await window.api.logout();
      } else {
        clearCurrentUser();
      }
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}

async function checkBackendConnection() {
  const pill = document.getElementById('backend-status-pill');
  if (!pill || !window.api) return;

  const status = await window.api.checkHealth();
  if (status.online) {
    pill.style.background = '#dcfce7';
    pill.style.color = '#15803d';
    pill.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:#22c55e;"></span> API Online`;
  } else {
    pill.style.background = '#fef3c7';
    pill.style.color = '#b45309';
    pill.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span> Offline Mode`;
    pill.title = 'Backend server not detected on http://localhost:5000. Run "npm start" to launch Node/Express server.';
  }
}
