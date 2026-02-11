# User Management App — Admin Dashboard

## About

A minimal, clean, and structured administration panel for managing users.
The project demonstrates authentication, access control, and basic CRUD operations using Supabase as the backend.

## Features

- [x] Registration & login
- [x] Supabase auth integration
- [x] Admin dashboard with user list
- [x] Pagination
- [x] User status management (active, blocked, unverified)
- [x] Blocking/unblocking users
- [x] Deleting individual users
- [x] Deleting unverified accounts
- [x] Automatic logout if the current user is blocked
- [x] Protection of admin panel through server-side access validation
- [x] Clean UI using Bootstrap
- [x] Clear separation of logic, UI components, hooks, utils and helpers

## Project Structure

```
├── public/
│
├── src/
│   ├── assets/
│   │   └── images/
│   │
│   ├── components/
│   ├── data/
│   ├── helpers/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── supabaseClient.js
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

## Stack

# Frontend
- **React 19** - library for building interactive user interfaces
- **React Router 7** - routing and navigation
- **Bootstrap 5** - responsive layout, UI components
- **Bootstrap Icons** - icon set used across the UI
- **Vite** -fast build tool and development server

# Backend
- **Node.js** - JavaScript runtime environment
- **Express 5** - backend HTTP server and REST API
- **CORS** - handling cross-origin HTTP requests
- **dotenv** - environment variables management

# Database & Auth
- **Supabase Auth** - user authentication and access control
- **Supabase Postgres** - relational database
- **Supabase JS SDK (v2)** - client and server access to Supabase APIs

# Email
- **Nodemailer** - transactional email delivery (verification)

# Tooling
- **ESLint** - code quality and consistency
- **concurrently** - run frontend and backend together in development

## Installation & Setup

1. Clone repository
   git clone https://github.com/ViktoriaNH/user-managment.git
2. Navigate into the project
   cd user-management
3. Install dependencies
   npm install
4. Start development servers (frontend + backend)
   npm run dev
5. Open in browser

## Environment Variables

The project relies on environment variables and does not hardcode any URLs or secrets in the codebase.
Different environments (local development and production) use different configuration sources.

- [x] Frontend (Vite)
Used in the browser and must be prefixed with VITE_:

- VITE_SUPABASE_URL=
- VITE_SUPABASE_ANON_KEY=
- VITE_BACKEND_URL=

VITE_BACKEND_URL is required and points to the backend API.
- Local development: http://localhost:3000
- Production: Railway deployment URL

- [x] Backend (Node.js / Express)

Used only on the server:
- SUPABASE_URL=
- SUPABASE_SERVICE_ROLE_KEY=

- EMAIL_USER=
- EMAIL_PASS=
- SMTP_HOST=
- SMTP_PORT=

- FRONTEND_URL=
- PORT=

Production environment variables are managed via the deployment platform (Railway / Vercel) and are not committed to the repository.

## Environment Configuration

- Local development uses a .env file (not committed)
- Production frontend variables are configured in Vercel
- Production backend variables are configured in Railway

## Scripts

- `npm run dev` - run frontend (Vite) and backend (Express) in development mode
- `npm run build` - build the frontend for production
- `npm start` - start the backend server (production mode)
- `npm run preview` - preview the production frontend build
- `npm run lint` - run ESLint to check code quality

## Code Style

- Components named using PascalCase
- API helpers follow single responsibility
- Business logic extracted into:
- UI kept clean and Bootstrap-based

## Live Demo

- Frontend: https://usermanagmentfr.vercel.app
- Backend: https://usermanagmentbc.vercel.app
