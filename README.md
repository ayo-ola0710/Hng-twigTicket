# TicketDash (Twig)

A lightweight Twig/PHP port of the TicketDash app featuring auth, protected routes, and ticket CRUD with a modern, responsive UI.

## Features

- Wave hero, animated circles, max-width 1440px layout shared across pages.
- Auth with PHP sessions + client helper (localStorage) and protected routes.
- Complete ticket CRUD (create, read, update, delete) with validation and toasts.
- Consistent error handling and redirects for unauthorized access.
- Responsive and accessible-first design (labels, focus rings, sr-only, keyboard-friendly).

## Prerequisites

- PHP 8+
- Composer
- Node.js + pnpm (optional if you want to rebuild CSS)

## Install

```bash
composer install
# If you change CSS via Tailwind, rebuild using your chosen pipeline
# pnpm install
# pnpm tailwind -i ./src/input.css -o ./public/assets/cssoutput.css --minify
```

## Run

Use PHP’s built-in server (from the project root):

```bash
php -S localhost:8000 -t public
```

Then visit:

- Home: http://localhost:8000/
- Login: http://localhost:8000/auth/login
- Signup: http://localhost:8000/auth/signup
- Dashboard (protected): http://localhost:8000/user/dashboard
- Tickets (protected): http://localhost:8000/user/tickets

## Auth model

- Client helper in `public/assets/js/auth.js` manages localStorage and toasts.
- Server session is established on `POST /auth/login` and checked in `src/routes.php` via `requireAuth()`.
- Client pages (Dashboard/Tickets) also check authentication and redirect to `/auth/login` if missing.

## Tickets data

- Stored in `localStorage` under the `tickets` key.
- Managed via `public/assets/js/tickets.js`.
- If you prefer server-rendered tickets, move storage to PHP and render cards via `templates/components/ticketcard.html.twig`.

## Error handling

- Input validation surfaces inline messages and toasts.
- Network failures when syncing session show a toast but do not block local flow.
- Unauthorized access is redirected to `/auth/login` server-side; client guards also redirect.

## Accessibility

- Labels and `sr-only` where appropriate.
- Focus-visible rings on interactive elements.
- Descriptive text for dynamic updates; consider `aria-live` regions if you expand dynamic content.

## Project structure

- `templates/` – Twig templates
- `templates/components/` – Reusable components (button, card, ticketform, footer)
- `public/assets/js/` – Page scripts and auth/tickets helpers
- `src/routes.php` – AltoRouter routes and session-based auth guard

## Customization

- Button macro: `templates/components/button.html.twig`
- Card macro: `templates/components/card.html.twig`
- Ticket form component: `templates/components/ticketform.html.twig`
