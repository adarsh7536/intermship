/**
 * auth.js - Authentication Handling (Login, Register, Route Protection)
 * Connected to Node.js & Express REST APIs (/api/auth/login & /api/auth/register)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
});

function initAuthPage() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const demoLoginBtn = document.getElementById('demo-login-btn');

  // Handle Login via REST API
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorAlert = document.getElementById('auth-error');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (errorAlert) errorAlert.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';
      }

      try {
        // Send login request to Node.js / Express REST API
        const data = await api.login({ email, password });
        showToast(data.message || `Welcome back, ${data.user.name}!`, 'success');
        
        // Retrieve optional redirect destination or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'dashboard.html';

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 600);
      } catch (err) {
        console.error('Login request failed:', err);
        // Fallback for offline mode if backend is not reachable
        if (err.isNetworkError) {
          const users = getUsers();
          const user = users.find(u => (u.email === email || u.username === email) && u.password === password);
          if (user) {
            setCurrentUser(user);
            showToast(`Logged in (offline mode): ${user.name}`, 'info');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
            return;
          }
        }

        if (errorAlert) {
          errorAlert.textContent = err.message || 'Invalid email/username or password. Please try again.';
          errorAlert.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In to Dashboard';
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

  // Handle Registration via REST API
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errorAlert = document.getElementById('auth-error');
      const termsCheck = document.getElementById('terms');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (errorAlert) errorAlert.style.display = 'none';

      // Client-side validations
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

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
      }

      try {
        // Send registration request to Node.js / Express REST API
        const data = await api.register({ name, username, email, password });
        showToast(data.message || 'Registration successful! Welcome aboard.', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } catch (err) {
        console.error('Registration failed:', err);
        // Fallback for offline mode if backend is not reachable
        if (err.isNetworkError) {
          const users = getUsers();
          if (users.some(u => u.email === email)) {
            showError(errorAlert, 'An account with this email already exists.');
            return;
          }
          const newUser = saveUser({ name, username, email, password });
          setCurrentUser(newUser);
          showToast('Registered in local storage (server offline)', 'info');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
          return;
        }

        showError(errorAlert, err.message || 'Registration failed. Please check your details and try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Author Account';
        }
      }
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
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}
