// Authentication JavaScript

// Demo account credentials
const DEMO_ACCOUNT = {
  email: 'demo@ai-mate.com',
  password: 'demo123',
  name: 'Demo User'
};

// Check if user is already logged in
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  const currentPage = window.location.pathname;
  
  // If not logged in and trying to access protected pages
  if (!isLoggedIn && (currentPage.includes('dashboard.html') || currentPage.includes('editor.html') || currentPage.includes('tools/'))) {
    let loginPath = 'auth/login.html';
    if (currentPage.includes('/app/')) loginPath = '../auth/login.html';
    if (currentPage.includes('/app/tools/')) loginPath = '../../auth/login.html';
    window.location.href = loginPath;
    return false;
  }
  
  // If logged in and trying to access auth pages
  if (isLoggedIn && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
    window.location.href = '../app/dashboard.html';
    return false;
  }
  
  return true;
}

// Login function
function handleLogin(email, password, remember) {
  // Check demo account
  if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
    // Set session
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', DEMO_ACCOUNT.name);
    
    // Set localStorage if remember me is checked
    if (remember) {
      localStorage.setItem('rememberUser', email);
    }
    
    // Show success message
    showMessage('success', 'Login successful! Redirecting...');
    
    // Redirect to projects page after a short delay
    setTimeout(() => {
      window.location.href = '../app/dashboard.html';
    }, 800);
    
    return true;
  } else {
    showMessage('error', 'Invalid email or password. Please use demo credentials.');
    return false;
  }
}

// Register function
function handleRegister(formData) {
  const { fullName, email, password, confirmPassword, terms } = formData;
  
  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    showMessage('error', 'Please fill in all fields.');
    return false;
  }
  
  if (password.length < 6) {
    showMessage('error', 'Password must be at least 6 characters long.');
    return false;
  }
  
  if (password !== confirmPassword) {
    showMessage('error', 'Passwords do not match.');
    return false;
  }
  
  if (!terms) {
    showMessage('error', 'You must agree to the Terms of Service and Privacy Policy.');
    return false;
  }
  
  // In a real app, this would send data to server
  // For demo, we'll create a session with the new user
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('userEmail', email);
  sessionStorage.setItem('userName', fullName);
  
  showMessage('success', 'Account created successfully! Redirecting...');
  
  setTimeout(() => {
    window.location.href = '../app/dashboard.html';
  }, 800);
  
  return true;
}

// Logout function
function handleLogout() {
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('currentProjectId');
  sessionStorage.removeItem('currentProjectName');
  
  window.location.href = 'login.html';
}

// Show message function
function showMessage(type, message) {
  // Remove existing messages
  const existingMessage = document.querySelector('.auth-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `auth-message ${type}`;
  messageEl.textContent = message;
  
  // Add styles
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  if (type === 'success') {
    messageEl.style.background = '#238636';
    messageEl.style.color = '#fff';
  } else {
    messageEl.style.background = '#da3633';
    messageEl.style.color = '#fff';
  }
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(messageEl);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      messageEl.remove();
    }, 300);
  }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  checkAuth();
  
  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('rememberUser');
    if (rememberedEmail) {
      document.getElementById('email').value = rememberedEmail;
      document.getElementById('remember').checked = true;
    }
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      handleLogin(email, password, remember);
    });

    // Demo login button handler
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', () => {
        document.getElementById('email').value = DEMO_ACCOUNT.email;
        document.getElementById('password').value = DEMO_ACCOUNT.password;
        // Optional: Auto-submit
        // loginForm.dispatchEvent(new Event('submit'));
      });
    }
  }
  
  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showMessage('error', 'Registration is currently closed. Please use the demo account.');
      return false;
    });
  }
  
  // Add logout button if user is logged in on projects page
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (isLoggedIn && window.location.pathname.includes('projects.html')) {
    addLogoutButton();
  }
});

// Add logout button to projects page
function addLogoutButton() {
  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !document.getElementById('logoutBtn')) {
    const userName = sessionStorage.getItem('userName') || 'User';
    
    // Create user info
    const userInfo = document.createElement('div');
    userInfo.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #c9d1d9;
      font-size: 0.9rem;
    `;
    userInfo.innerHTML = `
      <span style="color: #8b949e;">Welcome,</span>
      <span style="font-weight: 600;">${userName}</span>
    `;
    
    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.className = 'btn-secondary';
    logoutBtn.innerHTML = '<span>↗</span> Logout';
    logoutBtn.style.marginLeft = '0.5rem';
    logoutBtn.addEventListener('click', handleLogout);
    
    // Insert before other buttons
    headerActions.insertBefore(userInfo, headerActions.firstChild);
    headerActions.appendChild(logoutBtn);
  }
}

// Export functions for use in other scripts
window.authFunctions = {
  checkAuth,
  handleLogout,
  isLoggedIn: () => sessionStorage.getItem('isLoggedIn') === 'true'
};
