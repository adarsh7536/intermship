/**
 * auth.js - Authentication Handling (Login, Register, Route Protection)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
});

function initAuthPage() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const demoLoginBtn = document.getElementById('demo-login-btn');

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorAlert = document.getElementById('auth-error');

      const users = getUsers();
      const user = users.find(u => (u.email === email || u.username === email) && u.password === password);

      if (user) {
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } else {
        if (errorAlert) {
          errorAlert.textContent = 'Invalid email or password. Please try again.';
          errorAlert.style.display = 'block';
        }
      }
    });

    // Helper button to auto-fill demo credentials
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', () => {
        document.getElementById('email').value = 'alex@example.com';
        document.getElementById('password').value = 'password123';
        showToast('Demo credentials filled!', 'info');
      });
    }
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errorAlert = document.getElementById('auth-error');
      const termsCheck = document.getElementById('terms');

      // Validation
      if (termsCheck && !termsCheck.checked) {
        showError(errorAlert, 'Please agree to the Terms & Privacy Policy.');
        return;
      }

      if (password !== confirmPassword) {
        showError(errorAlert, 'Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        showError(errorAlert, 'Password must be at least 6 characters.');
        return;
      }

      const users = getUsers();
      if (users.some(u => u.email === email)) {
        showError(errorAlert, 'An account with this email already exists.');
        return;
      }

      if (users.some(u => u.username === username)) {
        showError(errorAlert, 'Username is already taken.');
        return;
      }

      // Save user & set current session
      const newUser = saveUser({ name, username, email, password });
      setCurrentUser(newUser);

      showToast('Registration successful! Welcome aboard.', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }
}

function showError(el, message) {
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

// Route Protection: call this on pages that require login
function requireAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // If not authenticated, redirect to login page with a return hint
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}
