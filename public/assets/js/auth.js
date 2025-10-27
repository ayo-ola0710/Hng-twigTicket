(function () {
  const STORAGE_SESSION_KEY = 'ticketapp_session';
  const STORAGE_USERS_KEY = 'users';

  function toastSuccess(msg) {
    if (window.Toastify) {
      Toastify({ text: `✅ ${msg}`, duration: 3000, gravity: 'top', position: 'right', backgroundColor: '#22c55e' }).showToast();
    } else {
      console.log('[SUCCESS]', msg);
    }
  }
  function toastError(msg) {
    if (window.Toastify) {
      Toastify({ text: `❌ ${msg}`, duration: 3000, gravity: 'top', position: 'right', backgroundColor: '#ef4444' }).showToast();
    } else {
      console.error('[ERROR]', msg);
    }
  }
  function toastInfo(msg) {
    if (window.Toastify) {
      Toastify({ text: `ℹ️ ${msg}`, duration: 3000, gravity: 'top', position: 'right', backgroundColor: '#3b82f6' }).showToast();
    } else {
      console.log('[INFO]', msg);
    }
  }

  let currentUser = null;
  const listeners = new Set();

  function notify() {
    listeners.forEach((cb) => {
      try { cb(currentUser); } catch (e) { console.error(e); }
    });
  }

  function loadSession() {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw || raw === 'undefined') return null;
    try { return JSON.parse(raw); } catch (e) { localStorage.removeItem(STORAGE_SESSION_KEY); return null; }
  }

  function saveSession(user) {
    if (user) localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_SESSION_KEY);
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]'); } catch { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  async function signup({ name, email, password }) {
    const users = loadUsers();
    if (users.find((u) => u.email === email)) {
      const msg = 'User already exists';
      toastError(msg);
      throw new Error(msg);
    }
    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);
    currentUser = newUser;
    saveSession(newUser);
    notify();
    toastSuccess('Account created successfully!');
    return newUser;
  }

  async function login({ email, password }) {
    const users = loadUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      const msg = 'Invalid email or password';
      toastError(msg);
      throw new Error(msg);
    }
    currentUser = found;
    saveSession(found);
    notify();
    toastSuccess('Logged in successfully!');
    return found;
  }

  function logout() {
    currentUser = null;
    saveSession(null);
    notify();
    toastInfo('Logged out successfully');
  }

  function init() {
    currentUser = loadSession();
    notify();
  }

  function getUser() { return currentUser; }
  function isAuthenticated() { return !!currentUser; }
  function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

  window.Auth = { init, signup, login, logout, getUser, isAuthenticated, onChange };
})();
