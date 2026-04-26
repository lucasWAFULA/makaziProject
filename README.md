# Kusajilisha

Airbnb-style booking platform with Kiswahili UI. React + Vite frontend, Django + DRF backend, PostgreSQL, Redis, M-Pesa.

## Quick start (development)

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed (default: SQLite, no Redis required for basic run)
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

For **PostgreSQL**: create a user and database (see below), then set `DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DATABASE` in `backend/.env`.

**PostgreSQL setup (one-time):**

1. Open `psql` (or pgAdmin → Query Tool) and run:

```sql
CREATE USER kusajilisha WITH PASSWORD 'your_password';
CREATE DATABASE kusajilisha OWNER kusajilisha;
```

2. In `backend/.env` set:
   `DATABASE_URL=postgres://kusajilisha:your_password@localhost:5432/kusajilisha`
   (Use the same password you set above. If PostgreSQL is on another host/port, change `localhost` and `5432`.)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` if the API is not proxied (Vite proxies `/api` to port 8000 by default).

### Production (Docker)

1. Build frontend: `cd frontend && npm run build`
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`, `MPESA_*`, etc.
3. Run: `docker-compose up -d`

Nginx serves the frontend from `frontend/dist` and proxies `/api` and `/admin` to the backend.

### Hosting online

See **[HOSTING.md](HOSTING.md)** for step-by-step: VPS with Docker, domain, SSL (Let's Encrypt), and production `.env`. PaaS options (Render, Vercel) are also summarized there.

## API endpoints

- `POST /auth/register/` — Register (username, email, password, password_confirm, role, phone_number)
- `POST /auth/login/` — Login (username, password) → JWT
- `GET /auth/me/` — Current user
- `GET /properties/` — List (filters: location, price_min, price_max; mine=1 for host)
- `GET /properties/:id/` — Property detail
- `POST /properties/` — Create property (host)
- `PATCH /properties/:id/` — Update property (host)
- `GET /bookings/availability/:property_id/` — Availability list
- `POST /bookings/` — Create booking (property, check_in, check_out)
- `GET /bookings/my/` — My bookings
- `POST /payments/mpesa/initiate/` — M-Pesa STK Push (booking_id, phone)
- `POST /payments/mpesa/callback/` — Daraja callback (no auth)
- `GET /reviews/property/:id/` — Reviews for property
- `POST /reviews/` — Create review (booking, rating, comment_sw)

## i18n

Default language: Kiswahili. Switch via the SW/EN button in the nav. Keys in `frontend/src/locales/sw.json` and `en.json`.
