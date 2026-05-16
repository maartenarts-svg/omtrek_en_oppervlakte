// ============================================
// AUTHENTICATIE LOGICA
// ============================================

// ── Leerlingen: inloggen via e-mail ──────────
async function loginWithEmail(email) {
  const btn     = document.getElementById('emailLoginBtn');
  const errorEl = document.getElementById('loginError');

  if (btn) { btn.disabled = true; btn.textContent = 'Bezig met inloggen…'; }
  if (errorEl) errorEl.classList.add('hidden');

  email = email.toLowerCase().trim();

  try {
    const userData = await DB.getUser(email);

    if (!userData) {
      showLoginError('Dit e-mailadres is niet geregistreerd. Vraag je leerkracht om je toe te voegen.');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({
      email: userData.email,
      name:  userData.name,
      isAdmin: false
    }));

    window.location.href = './pages/overview.html';

  } catch (error) {
    console.error('Login error:', error);
    showLoginError('Er ging iets mis. Probeer opnieuw.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Inloggen'; }
  }
}

// ── Leerkrachten: inloggen via Google ────────
async function loginWithGoogle() {
  const btn     = document.getElementById('googleLoginBtn');
  const errorEl = document.getElementById('loginError');

  if (btn) { btn.disabled = true; btn.textContent = 'Bezig met inloggen…'; }
  if (errorEl) errorEl.classList.add('hidden');

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const email  = result.user.email.toLowerCase().trim();

    const adminFound = await DB.isAdmin(email);
    if (adminFound) {
      localStorage.setItem('currentUser', JSON.stringify({
        email:   email,
        name:    result.user.displayName || email,
        isAdmin: true
      }));
      window.location.href = './pages/dashboard.html';
      return;
    }

    // Geen beheerdersaccount gevonden
    await auth.signOut();
    showLoginError('Je Google-account is niet geregistreerd als leerkracht.');

  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') return;
    console.error('Google login error:', error);
    showLoginError('Inloggen mislukt. Probeer opnieuw.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Inloggen met Google'; }
  }
}

function showLoginError(message) {
  const errorEl = document.getElementById('loginError');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

// ── Uitloggen ─────────────────────────────────
function logout() {
  auth.signOut();
  localStorage.removeItem('currentUser');
  localStorage.removeItem('lessonCache');
  localStorage.removeItem('progressCache');

  if (window.location.pathname.includes('/pages/')) {
    window.location.href = '../index.html';
  } else {
    window.location.href = './index.html';
  }
}

// ── Hulpfuncties ──────────────────────────────
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    if (window.location.pathname.includes('/pages/')) {
      window.location.href = '../index.html';
    } else {
      window.location.href = './index.html';
    }
    return null;
  }
  return JSON.parse(currentUser);
}

function isAdmin() {
  const user = checkAuth();
  return user && user.isAdmin;
}

// ── Init bij paginalading ─────────────────────
if (!window.location.pathname.endsWith('index.html') &&
    window.location.pathname !== '/' &&
    !window.location.pathname.endsWith('/')) {

  document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.name;
    });

    if (window.location.pathname.includes('dashboard') && !user.isAdmin) {
      alert('Je hebt geen toegang tot deze pagina');
      window.location.href = './overview.html';
    }
  });
}
