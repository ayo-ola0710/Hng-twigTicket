document.addEventListener('DOMContentLoaded', () => {
  if (window.Auth && typeof window.Auth.init === 'function') {
    window.Auth.init();
  }

  if (window.Auth && typeof window.Auth.isAuthenticated === 'function') {
    if (!window.Auth.isAuthenticated()) {
      if (window.Toastify) {
        Toastify({ text: 'Please log in to continue.', duration: 2500, gravity: 'top', position: 'right', backgroundColor: '#3b82f6' }).showToast();
      }
      window.location.href = '/auth/login';
      return;
    }
  }

  const statsGrid = document.getElementById('statsGrid');
  const recentList = document.getElementById('recentList');
  const noActivity = document.getElementById('noActivity');

  function loadTickets() {
    try {
      return JSON.parse(localStorage.getItem('tickets') || '[]');
    } catch {
      return [];
    }
  }

  function textIconPath(status) {
    if (status === 'closed') {
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    } else if (status === 'in_progress') {
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    } else {
      return 'M12 6v6m0 0v6m0-6h6m-6 0H6';
    }
  }

  function formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  }

  function renderStats(tickets) {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const resolved = tickets.filter(t => t.status === 'closed').length;
    const avgResolutionTime = resolved > 0 ? '2.5h' : 'N/A';

    const map = [
      { id: 'stat-total', value: String(total), changeId: 'stat-total-change', change: '+0%', changeType: 'increase' },
      { id: 'stat-open', value: String(open), changeId: 'stat-open-change', change: '+0%', changeType: 'increase' },
      { id: 'stat-resolved', value: String(resolved), changeId: 'stat-resolved-change', change: '+0%', changeType: 'increase' },
      { id: 'stat-avg', value: avgResolutionTime, changeId: 'stat-avg-change', change: '0h', changeType: 'neutral' },
    ];

    map.forEach(s => {
      const valEl = document.getElementById(s.id);
      if (valEl) valEl.textContent = s.value;
      const chEl = document.getElementById(s.changeId);
      if (chEl) {
        chEl.textContent = s.change;
        chEl.classList.remove('text-green-600', 'text-red-600', 'text-gray-500');
        chEl.classList.add(s.changeType === 'increase' ? 'text-green-600' : s.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500');
      }
    });
  }

  function renderRecent(tickets) {
    const list = tickets.slice(0, 5);
    if (list.length === 0) {
      recentList.innerHTML = '';
      noActivity.classList.remove('hidden');
      return;
    }
    noActivity.classList.add('hidden');
    recentList.innerHTML = list.map(t => `
      <li class="px-6 py-4">
        <div class="flex items-center">
          <div class="shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${textIconPath(t.status)}" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-900">Ticket #${String(t.id || '').slice(-4)} ${t.status === 'closed' ? 'has been resolved' : t.status === 'in_progress' ? 'is in progress' : 'has been created'}</p>
            <p class="text-sm text-gray-500">${formatDate(t.createdAt)}</p>
          </div>
        </div>
      </li>
    `).join('');
  }

  function refresh() {
    const tickets = loadTickets();
    renderStats(tickets);
    renderRecent(tickets);
  }

  refresh();

  document.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.tagName.toLowerCase() === 'button' && target.textContent && target.textContent.trim() === 'Logout') {
      e.preventDefault();
      try { window.Auth && window.Auth.logout && window.Auth.logout(); } catch (_) {}
      try { await fetch('/auth/logout', { method: 'GET', credentials: 'same-origin' }); } catch (_) {}
      window.location.href = '/auth/login';
    }
  });
});
