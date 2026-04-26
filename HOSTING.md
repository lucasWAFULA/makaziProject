# Hosting KaribuMakazi Online

You have two main options: **Option A** (VPS with Docker) uses your existing `docker-compose` and is full control. **Option B** (PaaS) is simpler but may cost more.

---

## Option A: VPS with Docker (recommended)

Use a single server (e.g. DigitalOcean, Linode, Vultr, or any Ubuntu VPS). Everything runs in Docker.

### 1. Get a server and a domain

1. **VPS**: Create an Ubuntu 22.04 server (e.g. DigitalOcean Droplet, 1 GB RAM minimum). Note the server IP (e.g. `164.92.1.2`).
2. **Domain**: Buy a domain (e.g. Namecheap, GoDaddy, or your registrar). Create an **A record** pointing to the server IP:
   - **Name:** `@` (or `www` if you prefer)
   - **Value:** your server IP
   - **TTL:** 300 or default  
   Example: `karibumakazi.com` → `164.92.1.2`

### 2. Connect and install Docker

SSH into the server:

```bash
ssh root@YOUR_SERVER_IP
```

Install Docker and Docker Compose:

```bash
apt update && apt install -y docker.io docker-compose-v2
systemctl enable docker && systemctl start docker
```

### 3. Upload your project

From your **local machine** (PowerShell or Git Bash):

```bash
# If you use Git:
git clone https://github.com/YOUR_USERNAME/Kusajilisha.git
cd Kusajilisha

# Or upload with SCP (from your PC, in the project folder):
scp -r . root@YOUR_SERVER_IP:/var/www/karibumakazi
```

Then on the **server**:

```bash
cd /var/www/karibumakazi   # or wherever you uploaded
```

### 4. Production `.env` on the server

Create or edit `backend/.env` on the server. Use **strong** values:

```env
DEBUG=False
SECRET_KEY=your-very-long-random-secret-key-here
ALLOWED_HOSTS=karibumakazi.com,www.karibumakazi.com,YOUR_SERVER_IP
DATABASE_URL=postgres://kusajilisha:STRONG_PASSWORD@db:5432/kusajilisha
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=https://karibumakazi.com,https://www.karibumakazi.com

# M-Pesa (required for payments)
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_BASE_URL=https://karibumakazi.com
```

- Generate `SECRET_KEY`: e.g. `python -c "import secrets; print(secrets.token_urlsafe(50))"`.
- `MPESA_CALLBACK_BASE_URL` must be the **exact** URL Safaricom will call (https, no trailing slash in the env; the code adds `/payments/mpesa/callback/`).

### 5. Build frontend and set API URL

From the **project root** you can use the build script (sets API URL and runs build):

**Windows (PowerShell):**
```powershell
.\scripts\build-frontend.ps1 -ApiUrl "https://karibumakazi.com/api"
```

**Linux/Mac:**
```bash
VITE_API_URL=https://karibumakazi.com/api ./scripts/build-frontend.sh
```

Or manually: copy `frontend/.env.production.example` to `frontend/.env`, replace `YOUR_DOMAIN` with your domain, then run `cd frontend && npm run build`. Upload `frontend/dist` to the server if you built locally.

### 6. Nginx config for your domain

In `nginx.conf` replace **YOUR_DOMAIN** with your real domain (e.g. `karibumakazi.com`). The file already has `server_name YOUR_DOMAIN www.YOUR_DOMAIN localhost;`.

(No need to paste config if you only replace YOUR_DOMAIN in the existing `nginx.conf`.)

### 7. Start the stack

```bash
docker compose up -d --build
```

Check logs: `docker compose logs -f backend`

### 8. Add SSL (HTTPS) with Let's Encrypt

On the server, with the stack running on port 80:

```bash
apt install -y certbot
# Use the full path to your frontend/dist on the server (so certbot can write .well-known there)
certbot certonly --webroot -w /var/www/karibumakazi/frontend/dist -d karibumakazi.com -d www.karibumakazi.com --email you@example.com --agree-tos --no-eff-email
```

Then use the production compose override so Nginx serves HTTPS:

1. In **nginx-ssl.conf** replace every `YOUR_DOMAIN` with your domain (e.g. `karibumakazi.com`).
2. Run:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```
   This switches Nginx to the SSL config and mounts `/etc/letsencrypt` so Nginx can read the certs.

---

## Option B: PaaS (no server to manage)

- **Backend:** Deploy Django to [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io). Add a PostgreSQL database from the same provider. Set env vars (including `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, `MPESA_*`). Point `MPESA_CALLBACK_BASE_URL` to your backend URL.
- **Frontend:** Deploy the Vite build to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set **Environment variable** `VITE_API_URL` to your backend URL (e.g. `https://your-backend.onrender.com`) so the built app calls the right API. Build command: `npm run build`; publish directory: `dist`.

You’ll need to configure CORS on the backend to allow your frontend origin (e.g. `https://your-app.vercel.app`).

---

## Checklist before go-live

- [ ] `DEBUG=False`
- [ ] Strong `SECRET_KEY`
- [ ] `ALLOWED_HOSTS` includes your domain(s)
- [ ] `MPESA_CALLBACK_BASE_URL` is https and matches the URL Safaricom will call
- [ ] Frontend built with `VITE_API_URL` set to your API base (e.g. `https://yourdomain.com/api`)
- [ ] HTTPS (SSL) enabled
- [ ] Backups for the database (e.g. `pg_dump` or your provider’s backups)
