# Guardian Vision Backend

Go backend API for the Guardian Vision school monitoring platform.

## Setup

1. Run `migrations/001_init.sql` in phpMyAdmin.
2. Copy `.env.example` values into your environment, or keep the defaults for local MySQL.
3. Start the API:

```bash
go run .
```

Default URL:

```text
http://localhost:8081
```

## Demo Login

All demo users use password:

```text
123456
```

| Grade | National ID | Major |
|---|---|---|
| First | `30001011234567` | General |
| Second | `30002021234567` | IT |
| Second | `30003031234567` | Communications |
| Third | `30004041234567` | Networking |

## Seed Demo Data

If the tables exist but the app has no demo data, run:

```bash
go run ./cmd/seed
```

## Main Endpoints

| Method | URL |
|---|---|
| GET | `/api/health` |
| POST | `/api/auth/login` |
| GET | `/api/grades` |
| GET | `/api/majors` |
| GET | `/api/students/me` |
| GET | `/api/students/me/performance` |
| GET | `/api/students/me/subjects` |
| GET | `/api/students/me/subjects/{id}` |
| GET | `/api/uniform/products` |
| GET | `/api/uniform/sizes` |
| POST | `/api/uniform/orders` |
| GET | `/api/uniform/orders/me` |
