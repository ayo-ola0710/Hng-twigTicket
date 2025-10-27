document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && typeof window.Auth.init === 'function') {
    window.Auth.init();
  }

  const form = document.getElementById('signupForm');
  if (!form) return;

  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const confirmEl = document.getElementById('confirmPassword');

  const errName = document.getElementById('error-name');
  const errEmail = document.getElementById('error-email');
  const errPassword = document.getElementById('error-password');
  const errConfirm = document.getElementById('error-confirmPassword');

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

    setError(nameEl, errName, '');
    setError(emailEl, errEmail, '');
    setError(passwordEl, errPassword, '');
    setError(confirmEl, errConfirm, '');

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmEl.value;

    let hasError = false;
    if (name.length < 2) { setError(nameEl, errName, 'Name must be at least 2 characters.'); hasError = true; }
    if (password.length < 6) { setError(passwordEl, errPassword, 'Password must be at least 6 characters.'); hasError = true; }
    if (confirmPassword !== password) { setError(confirmEl, errConfirm, 'Passwords do not match.'); hasError = true; }
    if (hasError) return;

    try {
      await window.Auth.signup({ name, email, password });
      try {
        const resp = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, password, name }).toString(),
        });
        if (!resp.ok) {
          if (window.Toastify) {
            Toastify({ text: 'Could not sync session with server.', duration: 2500, gravity: 'top', position: 'right', backgroundColor: '#ef4444' }).showToast();
          }
        }
      } catch (_) { /* no-op */ }

      window.location.href = '/user/dashboard';
    } catch (err) {}
  });
});
