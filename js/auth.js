// ============================================
// AUTHENTICATIE LOGICA
// ============================================

const ADMIN_EMAIL = 'maarten.arts@labsintniklaas.be';
const ADMIN_CODE = '852874179639';

// Check of gebruiker ingelogd is
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Redirect naar root
    if (window.location.pathname.includes('/pages/')) {
      window.location.href = '../index.html';
    } else {
      window.location.href = './index.html';
    }
    return null;
  }
  return JSON.parse(currentUser);
}

// Check of gebruiker admin is
function isAdmin() {
  const user = checkAuth();
  return user && user.email === ADMIN_EMAIL;
}

// Login functie
async function login(email) {
  try {
    // Normaliseer email (lowercase, trim)
    email = email.toLowerCase().trim();
    
    // Check of admin login
    if (email === ADMIN_EMAIL) {
      const code = prompt('Voer de admin code in:');
      if (code !== ADMIN_CODE) {
        alert('Incorrecte code');
        return false;
      }
      
      // Admin login
      localStorage.setItem('currentUser', JSON.stringify({
        email: ADMIN_EMAIL,
        name: 'Maarten Arts',
        isAdmin: true
      }));
      
      window.location.href = './pages/dashboard.html';
      return true;
    }
    
    // Leerling login - check of email in database bestaat
    const userData = await DB.getUser(email);
    
    if (!userData) {
      alert('Dit emailadres is niet geregistreerd. Vraag je leerkracht om je toe te voegen.');
      return false;
    }
    
    // Opslaan in localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      email: userData.email,
      name: userData.name,
      isAdmin: false
    }));
    
    // Update last active
    await DB.updateUserProgress(email, 'dummy', 'dummy', {});
    
    window.location.href = './pages/overview.html';
    return true;
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Er ging iets mis bij het inloggen. Probeer opnieuw.');
    return false;
  }
}

// Logout functie
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('lessonCache');
  
  // Redirect naar root
  if (window.location.pathname.includes('/pages/')) {
    window.location.href = '../index.html';
  } else {
    window.location.href = './index.html';
  }
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Initialize auth check on page load (behalve index.html)
if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
  document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;
    
    // Update UI met gebruikersnaam
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      el.textContent = user.name;
    });
    
    // Check admin pages
    if (window.location.pathname.includes('dashboard') && !user.isAdmin) {
      alert('Je hebt geen toegang tot deze pagina');
      window.location.href = './overview.html';
    }
  });
}
