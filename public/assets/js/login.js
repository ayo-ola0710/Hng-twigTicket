document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && typeof window.Auth.init === 'function') {
    window.Auth.init();
  }

  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const rememberEl = document.getElementById('remember-me');

  const errEmail = document.getElementById('error-email');
  const errPassword = document.getElementById('error-password');

  function setError(el, errEl, msg) {
    if (!errEl) return;
    if (msg) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
      el && el.classList.add('border-red-300');
    } else {
      errEl.textContent = '';
      errEl.classList.add('hidden');
      el && el.classList.remove('border-red-300');
    }
  }

  function isValidEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasError = false;

    setError(emailEl, errEmail, '');
    setError(passwordEl, errPassword, '');

    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const rememberMe = !!(rememberEl && rememberEl.checked);

    if (!isValidEmail(email)) { setError(emailEl, errEmail, 'Please enter a valid email.'); hasError = true; }
    if (!password) { setError(passwordEl, errPassword, 'Password is required.'); hasError = true; }
    if (hasError) return;

    try {
      await window.Auth.login({ email, password });

      try {
        const resp = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, password }).toString(),
        });
        if (!resp.ok) {
          if (window.Toastify) {
            Toastify({ text: 'Could not sync session with server.', duration: 2500, gravity: 'top', position: 'right', backgroundColor: '#ef4444' }).showToast();
          }
        }
      } catch (_) {}

      if (rememberMe) {
        localStorage.setItem('ticketapp_remember', '1');
      } else {
        localStorage.removeItem('ticketapp_remember');
      }
      window.location.href = '/user/dashboard';
    } catch (err) {}
  });
});
