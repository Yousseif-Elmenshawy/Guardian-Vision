# Deployment Guide: Single-Port Architecture

## 📋 Overview

This project has been restructured to support **two modes of operation**:

| Mode | Backend Port | Frontend Port | Description |
|------|-------------|---------------|-------------|
| **Development** | `:8081` | `:5173` | Frontend runs via Vite dev server. Vite proxies `/api` requests to Go backend. Fast iteration with hot-reload. |
| **Production** | `:8080` | Same as backend | Go serves both API + React SPA on a single port. Single binary deployment. |

---

## 🚀 How It Works

### Architecture Diagram

```
┌─────────────┐         ┌──────────────┐
│   Browser   │         │   Browser    │
│ :5173 (Vite)│         │ :8080 (Go)   │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │  /api/*               │  /api/*  → Go API Handler
       ▼                       │  /*       → React SPA (index.html)
┌──────────────┐               │
│ Vite Proxy   │               │
│ localhost:8081│              │
└──────┬───────┘               │
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│  Go Backend  │      │   Go Backend     │
│  port 8081   │      │  port 8080       │
│  (API only)  │      │  (API + Static)  │
└──────────────┘      └──────────────────┘

   DEVELOPMENT               PRODUCTION
```

### Key Components

1. **`Backend/internal/static/embed.go`** - Embeds the React build (`dist/`) into the Go binary using `//go:embed`
2. **`Backend/internal/routes/ui.go`** - SPA handler that serves static files and falls back to `index.html` for React Router routes
3. **`Backend/internal/routes/routes.go`** - `NewWithSPA()` wraps API routes with SPA serving
4. **`Backend/internal/config/config.go`** - Reads `GV_ENV` to choose development or production mode

---

## 💻 Development Mode

### Terminal 1: Start Go Backend
```bash
cd Backend
set GV_ENV=development
set GV_PORT=8081
go run .   # API only on :8081
```

### Terminal 2: Start React Frontend
```bash
cd frontend  # (project root)
npm run dev  # Vite dev server on :5173
```

**How it works:** Vite's `vite.config.js` has a proxy that forwards `/api/*` requests to `http://localhost:8081`. The browser talks to `localhost:5173` only — no CORS issues.

### Vite Configuration (already fixed)
```js
// vite.config.js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8081",  // was broken: http//localhost:8081
      changeOrigin: true,
      secure: false,
    },
  },
},
```

> **Note:** The original config had a typo: `http//localhost:8081` (missing colon). This has been fixed to `http://localhost:8081`.

---

## 🏭 Production Mode (Single Binary)

### Build Pipeline

```bash
# Step 1: Build React frontend
cd frontend
npm run build
# Output: dist/ directory

# Step 2: Copy build to Go backend
cp -r dist/ ../Backend/internal/static/dist/

# Step 3: Build Go binary (embeds the React build)
cd ../Backend
set CGO_ENABLED=0
go build -ldflags="-s -w" -o server.exe .

# Step 4: Run (single process, single port)
set GV_ENV=production
set GV_PORT=8080
server.exe
# → Open http://localhost:8080
```

### Or use the build script:
```bash
# Requires bash (Git Bash on Windows, or WSL)
./scripts/build.sh production
```

---

## 🔄 Request Flow (Production)

```
Browser → GET http://localhost:8080/
  ↓
Go Server (port 8080)
  ↓
main.go → routes.NewWithSPA()
  ↓
  ├── /api/health       → Go API handler
  ├── /api/auth/login   → Go API handler
  ├── /api/students/me  → Go API handler (with auth)
  │
  ├── / (root)          → serve index.html (React app)
  ├── /assets/*.js      → serve static JS files
  ├── /assets/*.css     → serve static CSS files
  ├── /dashboard        → serve index.html (SPA fallback)
  ├── /profile          → serve index.html (SPA fallback)
  └── ...               → any non-API path → index.html
```

---

## 📁 Files Changed/Added

| File | Status | Description |
|------|--------|-------------|
| `Backend/internal/static/embed.go` | **NEW** | Embeds `dist/` directory into Go binary |
| `Backend/internal/static/dist/index.html` | **NEW** | Placeholder until actual build is copied |
| `Backend/internal/routes/ui.go` | **NEW** | SPA handler with file server + fallback routing |
| `Backend/internal/routes/routes.go` | **MODIFIED** | Added `NewWithSPA()` function |
| `Backend/main.go` | **MODIFIED** | Selects router based on `GV_ENV` |
| `Backend/internal/config/config.go` | **MODIFIED** | Added `IsProduction` field, `GV_ENV` support |
| `vite.config.js` | **MODIFIED** | Fixed proxy URL (`http//` → `http://`) |
| `Backend/.env.example` | **MODIFIED** | Added `GV_ENV` documentation |
| `scripts/build.sh` | **NEW** | Automation script for full build pipeline |

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GV_ENV` | `development` | `development` or `production` |
| `GV_PORT` | `8081` (dev) / `8080` (prod) | Port the Go server listens on |
| `GV_DB_DSN` | MySQL DSN | Database connection string |
| `GV_TOKEN_SECRET` | `dev-secret-change-me` | JWT signing secret |
| `GV_ALLOWED_ORIGINS` | Auto-detected | CORS allowed origins |

---

## Excel student accounts and database workbook export

The `Students` sheet does not contain passwords. To enable Excel-only students to
sign in, install the Python requirements and run the local import command from
the repository root:

```powershell
python -m pip install -r python\requirements.txt
python python\import_excel_students.py
```

The command asks the administrator to set and confirm a separate password for
each student not already in MySQL. It imports those students and their Excel
grades/performance into the database, then refreshes the database worksheets
and `Report` sheet. It never replaces existing student passwords or overwrites
scores already stored in MySQL. Passwords are stored as PBKDF2 hashes in MySQL,
not in Excel. Use `--dry-run` to validate the input without making database
changes.

To export the current database contents back into the existing workbook:

```powershell
python python\sync_database_to_excel.py
```

This refreshes `DB_<table>` worksheets and a per-student `Report` worksheet in
`python\students_data.xlsx`, while preserving the original `Students`, `Grades`
and `MonthlyPerformance` sheets. Database values are a one-way snapshot; the
export excludes `password_hash` and does not write Excel changes back to MySQL.
Set `GV_DB_DSN` to the same Go MySQL DSN used by the backend when the default
local database connection is not applicable.

---

The student dashboard reads grades and report data from the authenticated Go
API. Restart the backend after updating it so the API's empty-month and login
validation fixes take effect.