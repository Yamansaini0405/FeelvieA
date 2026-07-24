# Feelvie Admin Console (CRM)

An internal admin panel for Feelvie (virtual try-on) built with React + Vite,
React Router, Axios, Tailwind CSS, and lucide-react icons.

## What's included

- **Login** — `/api/auth/login/`, token stored in `localStorage` and attached
  to every request afterwards. A 401 response anywhere logs the session out
  automatically.
- **Dashboard** — quick-link cards to every section, with a live user count.
- **Users** — list, view, create, edit, delete (`/api/admin/users/`).
- **Carousel setting** — list, create, edit, delete (`/api/common/carousels/`).
- **Coupons** — list, create, edit, delete (`/api/wallet/admin/coupons/`).
- **Subscription plans** — read-only list (`/api/wallet/subscription-plans/`),
  since the spec only defines a `GET` for this resource.
- **Credit setting** — read-only list of credit packs
  (`/api/wallet/credit-packs/`), same reasoning as above.
- **Image generation history** — placeholder page. No endpoint was defined in
  the requirements doc yet, so this is scaffolded but not wired up.

## Getting started

\`\`\`bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your backend
npm run dev
\`\`\`

Build for production:

\`\`\`bash
npm run build
\`\`\`

## Project structure

\`\`\`
src/
  api/            axios instance + one file per resource (users, coupons, ...)
  context/        AuthContext (login/logout/token)
  components/
    layout/       Sidebar, Header, DashboardLayout (the shell)
    common/       Button, Input/Select/Textarea, Modal, ConfirmDialog,
                  DataTable, Badge, PageHeader — shared building blocks
    ProtectedRoute.jsx
  pages/          one folder per module, each with a *Page.jsx (list) and,
                  where relevant, a *FormModal.jsx (create/edit)
\`\`\`

## Notes on assumptions

- **Auth response shape**: the login handler looks for `token`, `access`, or
  `access_token` in the response body — adjust `src/context/AuthContext.jsx`
  if your backend returns something else.
- **User roles**: the doc didn't enumerate role values, so the form offers
  `admin`, `staff`, `user`. Update the `ROLES` array in
  `src/pages/users/UserFormModal.jsx` to match your backend's real choices.
- **Carousel `type`**: only `APP` was shown in the spec; `WEB` was added as a
  second reasonable option — adjust `TYPES` in `CarouselFormModal.jsx`.
- **Coupon `target_audience`**: `all` was given; `specific` was added to make
  use of the `allowed_emails` field. Adjust in `CouponFormModal.jsx` if your
  backend uses different values.
- Edit/update calls use `PATCH`. Swap to `PUT` in `src/api/*.js` if your
  backend expects full-object replacement instead.
