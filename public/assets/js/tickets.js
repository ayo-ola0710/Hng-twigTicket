document.addEventListener("DOMContentLoaded", () => {
  if (window.Auth && typeof window.Auth.init === "function") {
    window.Auth.init();
  }

  if (window.Auth && typeof window.Auth.isAuthenticated === "function") {
    if (!window.Auth.isAuthenticated()) {
      if (window.Toastify) {
        Toastify({
          text: "Please log in to continue.",
          duration: 2500,
          gravity: "top",
          position: "right",
          backgroundColor: "#3b82f6",
        }).showToast();
      }
      window.location.href = "/auth/login";
      return;
    }
  }

  const modal = document.getElementById("ticketModal");
  const modalTitle = document.getElementById("modalTitle");
  const openCreateBtn = document.getElementById("openCreateBtn");
  const emptyCreateBtn = document.getElementById("emptyCreateBtn");
  const statusFilter = document.getElementById("status-filter");
  const grid = document.getElementById("ticketsGrid");
  const emptyState = document.getElementById("emptyState");
  const emptyText = document.getElementById("emptyText");
  const loadingState = document.getElementById("loadingState");

  const form = document.getElementById("ticketForm");
  const cancelBtn = document.getElementById("cancelBtn");
  const errorTitle = document.getElementById("error-title");
  const errorDescription = document.getElementById("error-description");
  const submitBtn = document.getElementById("submitBtn");

  let editingId = null;

  const STATUS_CLASS = {
    open: "bg-green-100 text-green-800",
    in_progress: "bg-amber-100 text-amber-800",
    closed: "bg-gray-100 text-gray-800",
  };
  const PRIORITY_CLASS = {
    low: "text-green-600 bg-green-50",
    medium: "text-blue-600 bg-blue-50",
    high: "text-red-600 bg-red-50",
  };

  function loadTickets() {
    try {
      return JSON.parse(localStorage.getItem("tickets") || "[]");
    } catch {
      return [];
    }
  }
  function saveTickets(tickets) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }

  function humanStatus(s) {
    return (s || "").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  function cap(s) {
    return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "";
    }
  }

  function closeModal() {
    modal.classList.add("hidden");
    editingId = null;
    if (form) form.reset();
    if (errorTitle) errorTitle.classList.add("hidden");
    if (errorDescription) errorDescription.classList.add("hidden");
    if (submitBtn) submitBtn.textContent = "Create Ticket";
  }
  function openModal(title) {
    modalTitle.textContent = title;
    modal.classList.remove("hidden");
  }

  function setFormValues(ticket) {
    form.title.value = ticket.title || "";
    form.description.value = ticket.description || "";
    form.status.value = ticket.status || "open";
    form.priority.value = ticket.priority || "low";
  }

  function currentFilter() {
    return (statusFilter && statusFilter.value) || "all";
  }

  function render() {
    const filter = currentFilter();
    const all = loadTickets();
    const items =
      filter === "all" ? all : all.filter((t) => t.status === filter);

    grid.innerHTML = "";

    if (items.length === 0) {
      emptyState.classList.remove("hidden");
      emptyText.textContent =
        filter === "all"
          ? "Get started by creating a new ticket."
          : `No ${filter.replace("_", " ")} tickets found.`;
      return;
    }
    emptyState.classList.add("hidden");

    const frag = document.createDocumentFragment();
    items.forEach((ticket) => {
      const card = document.createElement("div");
      card.className = "bg-white overflow-hidden shadow rounded-lg";
      card.innerHTML = `
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium leading-6 text-gray-900">${escapeHtml(
              ticket.title
            )}</h3>
            <div class="flex space-x-2">
              <button data-edit="${
                ticket.id
              }" class="text-gray-400 hover:text-blue-500" title="Edit ticket">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button data-del="${
                ticket.id
              }" class="text-gray-400 hover:text-red-500" title="Delete ticket">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          ${
            ticket.description
              ? `<p class="mt-2 text-sm text-gray-600 line-clamp-3">${escapeHtml(
                  ticket.description
                )}</p>`
              : ""
          }
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              STATUS_CLASS[ticket.status] || STATUS_CLASS.closed
            }">${humanStatus(ticket.status)}</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              PRIORITY_CLASS[ticket.priority] || PRIORITY_CLASS.medium
            }">${cap(ticket.priority)}</span>
          </div>
          <div class="mt-4 text-xs text-gray-500">Created: ${formatDate(
            ticket.createdAt
          )}</div>
        </div>
      `;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  openCreateBtn &&
    openCreateBtn.addEventListener("click", () => {
      editingId = null;
      form && form.reset();
      openModal("Create New Ticket");
      if (submitBtn) submitBtn.textContent = "Create Ticket";
    });
  emptyCreateBtn &&
    emptyCreateBtn.addEventListener("click", () => {
      editingId = null;
      form && form.reset();
      openModal("Create New Ticket");
      if (submitBtn) submitBtn.textContent = "Create Ticket";
    });
  cancelBtn &&
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });

  statusFilter &&
    statusFilter.addEventListener("change", () => {
      render();
    });

  grid.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;
    const idEdit = target.getAttribute("data-edit");
    const idDel = target.getAttribute("data-del");
    if (idEdit) {
      handleEdit(idEdit);
    }
    if (idDel) {
      handleDelete(idDel);
    }
  });

  // Add input listeners to hide errors when user starts typing
  if (form) {
    form.title.addEventListener("input", () => {
      if (errorTitle) errorTitle.classList.add("hidden");
    });
    form.description.addEventListener("input", () => {
      if (errorDescription) errorDescription.classList.add("hidden");
    });
  }

  form &&
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = form.title.value.trim();
      const description = form.description.value.trim();
      const status = form.status.value;
      const priority = form.priority.value;

      if (title.length < 3) {
        if (errorTitle) {
          errorTitle.textContent = "Title must be at least 3 characters long.";
          errorTitle.classList.remove("hidden");
        }
        return;
      } else {
        if (errorTitle) {
          errorTitle.classList.add("hidden");
        }
      }

      if (!description || description.length < 3) {
        if (errorDescription) {
          errorDescription.textContent =
            "Description must be at least 3 characters long.";
          errorDescription.classList.remove("hidden");
        }
        return;
      } else {
        if (errorDescription) {
          errorDescription.classList.add("hidden");
        }
      }

      // Additional validation
      const allowedStatus = ["open", "in_progress", "closed"];
      const allowedPriority = ["low", "medium", "high"];
      if (!allowedStatus.includes(status)) {
        toast("Invalid status selected.", "#ef4444");
        return;
      }
      if (!allowedPriority.includes(priority)) {
        toast("Invalid priority selected.", "#ef4444");
        return;
      }
      if (description && description.length > 2000) {
        if (errorDescription) {
          errorDescription.textContent =
            "Description is too long (max 2000 characters).";
          errorDescription.classList.remove("hidden");
        }
        return;
      } else {
        if (errorDescription) {
          errorDescription.classList.add("hidden");
        }
      }

      const tickets = loadTickets();

      if (editingId) {
        const idx = tickets.findIndex(
          (t) => String(t.id) === String(editingId)
        );
        if (idx !== -1) {
          tickets[idx] = {
            ...tickets[idx],
            title,
            description,
            status,
            priority,
          };
          saveTickets(tickets);
          toast("✅ Ticket updated successfully!", "#22c55e");
        }
      } else {
        const ticket = {
          id: Date.now(),
          title,
          description,
          status,
          priority,
          createdAt: new Date().toISOString(),
        };
        tickets.push(ticket);
        saveTickets(tickets);
        toast("✅ Ticket created successfully!", "#22c55e");
      }

      closeModal();
      render();
    });

  function handleEdit(id) {
    const t = loadTickets().find((x) => String(x.id) === String(id));
    if (!t) return;
    editingId = t.id;
    setFormValues(t);
    openModal("Edit Ticket");
    if (submitBtn) submitBtn.textContent = "Update Ticket";
  }
  function handleDelete(id) {
    const tickets = loadTickets();
    const idx = tickets.findIndex((t) => String(t.id) === String(id));
    if (idx === -1) return;
    tickets.splice(idx, 1);
    saveTickets(tickets);
    toast("🗑️ Ticket deleted", "#ef4444");
    render();
  }

  window.handleEdit = handleEdit;
  window.handleDelete = handleDelete;

  function toast(msg, color) {
    if (window.Toastify) {
      Toastify({
        text: msg,
        duration: 2500,
        gravity: "top",
        position: "right",
        backgroundColor: color || "#3b82f6",
      }).showToast();
    }
  }

  (function init() {
    loadingState && loadingState.classList.add("hidden");
    render();
  })();

  document.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (
      target.tagName.toLowerCase() === "button" &&
      target.textContent &&
      target.textContent.trim() === "Logout"
    ) {
      e.preventDefault();
      try {
        window.Auth && window.Auth.logout && window.Auth.logout();
      } catch (_) {}
      try {
        await fetch("/auth/logout", {
          method: "GET",
          credentials: "same-origin",
        });
      } catch (_) {}
      window.location.href = "/";
    }
  });
});
