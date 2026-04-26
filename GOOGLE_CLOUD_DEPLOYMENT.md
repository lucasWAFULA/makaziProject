# KaribuMakazi Google Cloud Deployment Guide

This guide deploys the current React + Django + PostgreSQL stack to Google Cloud without rewriting the app.

## Target Architecture

```text
React/Vite frontend
  -> Firebase Hosting + CDN + SSL
  -> /api, /admin, /static rewrites to Cloud Run
Django REST API
  -> Cloud Run container
  -> Cloud SQL PostgreSQL
  -> Cloud Storage for uploaded media
  -> OpenAI API, M-Pesa, WhatsApp links
```

Recommended rollout:

1. Create Cloud SQL PostgreSQL.
2. Store secrets in Secret Manager.
3. Create Cloud Storage for media.
4. Deploy the Cloud Run backend.
5. Run migrations and seed data with Cloud Run Jobs.
6. Deploy the React/Vite frontend to Firebase Hosting.
7. Add custom domains and tighten production hosts/origins.
8. Add PWA/Capacitor later.

## 1. Choose Names

Replace these values with your project details:

```bash
PROJECT_ID="your-gcp-project-id"
REGION="europe-west1"
SERVICE="karibumakazi-api"
REPOSITORY="karibumakazi"
DB_INSTANCE="karibumakazi-db"
DB_NAME="karibumakazi"
DB_USER="karibumakazi"
BUCKET_NAME="your-gcp-project-id-karibumakazi-media"
CLOUD_RUN_SA_NAME="karibumakazi-cloudrun-sa"
CLOUD_RUN_SA_EMAIL="${CLOUD_RUN_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

Use one region consistently for Cloud Run, Cloud SQL, Artifact Registry, and Cloud Storage.

For Kenya and coastal East Africa, prefer:

```bash
REGION="europe-west1"
```

Alternative:

```bash
REGION="me-west1"
```

Avoid `us-central1` unless cost is the only priority.

## 2. Enable Google Cloud APIs

```bash
gcloud config set project "$PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  firebase.googleapis.com
```

## 3. Add Budget Alerts Before Launch

Do this before creating Cloud SQL and Cloud Run. Cloud SQL can create ongoing cost even when the site has low traffic.

In Google Cloud Console:

```text
Billing -> Budgets & alerts -> Create budget
```

Recommended starting alert thresholds:

```text
50% actual spend
80% actual spend
100% actual spend
120% forecasted spend
```

Start with a small monthly budget while testing, then raise it when traffic grows.

## 4. Create a Dedicated Cloud Run Service Account

Do not use the default Compute Engine service account for production. Create a dedicated service account with only the permissions the API needs:

```bash
gcloud iam service-accounts create "$CLOUD_RUN_SA_NAME" \
  --display-name="KaribuMakazi Cloud Run API"
```

Grant only these roles:

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_RUN_SA_EMAIL" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_RUN_SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

Storage access is granted directly on the media bucket in the storage step.

## 5. Create Artifact Registry

```bash
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --description="KaribuMakazi Docker images"
```

## 6. Create Cloud SQL PostgreSQL

```bash
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_15 \
  --region="$REGION" \
  --tier=db-f1-micro \
  --storage-size=20GB

gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE"

gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="CHANGE_ME_STRONG_PASSWORD"
```

Cloud Run connects to Cloud SQL using the instance connection name:

```bash
INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe "$DB_INSTANCE" --format='value(connectionName)')"
echo "$INSTANCE_CONNECTION_NAME"
```

Production `DATABASE_URL` format:

```bash
DATABASE_URL="postgres://DB_USER:DB_PASSWORD@/DB_NAME?host=/cloudsql/INSTANCE_CONNECTION_NAME"
```

Example:

```bash
DATABASE_URL="postgres://karibumakazi:CHANGE_ME_STRONG_PASSWORD@/karibumakazi?host=/cloudsql/project:europe-west1:karibumakazi-db"
```

## 7. Create Cloud Storage Bucket

```bash
gcloud storage buckets create "gs://$BUCKET_NAME" \
  --location="$REGION" \
  --uniform-bucket-level-access
```

Grant the dedicated Cloud Run service account access:

```bash
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="serviceAccount:$CLOUD_RUN_SA_EMAIL" \
  --role="roles/storage.objectAdmin"
```

Do not make every uploaded file public immediately.

Recommended media policy:

```text
Public: listing photos, destination photos, tourism photos, package images
Private: IDs, ownership documents, verification files, payment evidence, receipts
```

For private files, serve them later through signed URLs or authenticated API endpoints.

If you are ready to make only public listing media readable:

```bash
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="allUsers" \
  --role="roles/storage.objectViewer"
```

For launch, you can keep the bucket private and review media visibility after the first test deployment.

## 8. Store Secrets

Create a strong Django secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Use Secret Manager for sensitive values:

```bash
printf "YOUR_DJANGO_SECRET_KEY" | gcloud secrets create django-secret-key --data-file=-
printf "YOUR_DATABASE_URL" | gcloud secrets create database-url --data-file=-
printf "YOUR_OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
```

Optional M-Pesa secrets:

```bash
printf "YOUR_MPESA_CONSUMER_KEY" | gcloud secrets create mpesa-consumer-key --data-file=-
printf "YOUR_MPESA_CONSUMER_SECRET" | gcloud secrets create mpesa-consumer-secret --data-file=-
printf "YOUR_MPESA_PASSKEY" | gcloud secrets create mpesa-passkey --data-file=-
```

## 9. Build and Deploy Backend to Cloud Run

Build and push:

```bash
gcloud builds submit ./backend \
  --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest"
```

Deploy:

```bash
gcloud run deploy "$SERVICE" \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --service-account "$CLOUD_RUN_SA_EMAIL" \
  --set-env-vars "DEBUG=False,SECURE_SSL_REDIRECT=True,ALLOWED_HOSTS=.run.app,yourdomain.com,www.yourdomain.com,api.yourdomain.com,USE_GCS=True,GS_BUCKET_NAME=$BUCKET_NAME,GS_PROJECT_ID=$PROJECT_ID,GS_QUERYSTRING_AUTH=False,MPESA_ENVIRONMENT=production,AI_ASSISTANT_NAME=Makazi AI" \
  --set-secrets "SECRET_KEY=django-secret-key:latest,DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest"
```

Do not keep `ALLOWED_HOSTS=*` in production. During the first Cloud Run test, `.run.app` allows the generated Cloud Run host. After the final domain is connected, replace it with exact hosts:

```bash
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com,YOUR_CLOUD_RUN_HOST
```

Add M-Pesa secrets when ready:

```bash
gcloud run services update "$SERVICE" \
  --region "$REGION" \
  --set-secrets "MPESA_CONSUMER_KEY=mpesa-consumer-key:latest,MPESA_CONSUMER_SECRET=mpesa-consumer-secret:latest,MPESA_PASSKEY=mpesa-passkey:latest"
```

Get the Cloud Run URL:

```bash
API_URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
echo "$API_URL"
```

Health check:

```bash
curl "$API_URL/healthz/"
```

Also test:

```bash
curl -I "$API_URL/admin/"
curl -I "$API_URL/api/"
```

## 10. Run Migrations and Seed Data

Use a Cloud Run Job with the same image:

```bash
gcloud run jobs create karibumakazi-migrate \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest" \
  --region "$REGION" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --service-account "$CLOUD_RUN_SA_EMAIL" \
  --set-env-vars "DEBUG=False,SECURE_SSL_REDIRECT=True,ALLOWED_HOSTS=.run.app,yourdomain.com,www.yourdomain.com,api.yourdomain.com,USE_GCS=True,GS_BUCKET_NAME=$BUCKET_NAME,GS_PROJECT_ID=$PROJECT_ID" \
  --set-secrets "SECRET_KEY=django-secret-key:latest,DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest" \
  --command python \
  --args manage.py,migrate,--noinput

gcloud run jobs execute karibumakazi-migrate --region "$REGION" --wait
```

Seed RBAC, destinations, transport routes, and partners:

```bash
gcloud run jobs create karibumakazi-seed \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest" \
  --region "$REGION" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --service-account "$CLOUD_RUN_SA_EMAIL" \
  --set-env-vars "DEBUG=False,SECURE_SSL_REDIRECT=True,ALLOWED_HOSTS=.run.app,yourdomain.com,www.yourdomain.com,api.yourdomain.com,USE_GCS=True,GS_BUCKET_NAME=$BUCKET_NAME,GS_PROJECT_ID=$PROJECT_ID" \
  --set-secrets "SECRET_KEY=django-secret-key:latest,DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest" \
  --command sh \
  --args "-c,python manage.py seed_roles_permissions && python manage.py seed_transport_routes && python manage.py seed_transport_partners"

gcloud run jobs execute karibumakazi-seed --region "$REGION" --wait
```

Create the first superuser:

```bash
gcloud run jobs create karibumakazi-createsuperuser \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest" \
  --region "$REGION" \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --service-account "$CLOUD_RUN_SA_EMAIL" \
  --set-env-vars "DEBUG=False,SECURE_SSL_REDIRECT=True,ALLOWED_HOSTS=.run.app,yourdomain.com,www.yourdomain.com,api.yourdomain.com,DJANGO_SUPERUSER_USERNAME=admin,DJANGO_SUPERUSER_EMAIL=admin@example.com,DJANGO_SUPERUSER_PASSWORD=CHANGE_ME_NOW" \
  --set-secrets "SECRET_KEY=django-secret-key:latest,DATABASE_URL=database-url:latest" \
  --command python \
  --args manage.py,createsuperuser,--noinput

gcloud run jobs execute karibumakazi-createsuperuser --region "$REGION" --wait
```

After login, assign the `super_admin` RBAC role in Django Admin.

## 11. Deploy Frontend to Firebase Hosting

Install Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use "$PROJECT_ID"
```

If this is the first Firebase deploy, copy the example project file:

```bash
cp .firebaserc.example .firebaserc
```

Then replace `YOUR_FIREBASE_PROJECT_ID` with your real Firebase/GCP project ID.

Create `frontend/.env.production`:

```bash
VITE_API_URL=/api
```

Build:

```bash
cd frontend
npm install
npm run build
cd ..
```

Deploy:

```bash
firebase deploy --only hosting
```

The included `firebase.json` rewrites:

```text
/api/**    -> Cloud Run
/admin/**  -> Cloud Run
/static/** -> Cloud Run
/media/**  -> Cloud Run
/**        -> React index.html
```

If your Cloud Run service name or region is different, edit `firebase.json`.

The included `firebase.json` uses:

```text
serviceId: karibumakazi-api
region: europe-west1
```

Keep that region consistent with Cloud Run.

## 12. Domain and Production Environment

After adding your custom domain to Firebase Hosting, update Cloud Run environment:

```bash
FRONTEND_ORIGIN="https://yourdomain.com"
API_ORIGIN="https://your-cloud-run-or-api-domain"

gcloud run services update "$SERVICE" \
  --region "$REGION" \
  --set-env-vars "ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com,YOUR_CLOUD_RUN_HOST,CORS_ORIGINS=$FRONTEND_ORIGIN,CSRF_TRUSTED_ORIGINS=$FRONTEND_ORIGIN,$API_ORIGIN,MPESA_CALLBACK_BASE_URL=$API_ORIGIN"
```

If you use a custom API subdomain, set:

```bash
VITE_API_URL=https://api.yourdomain.com/api
```

Then rebuild and redeploy Firebase Hosting.

## 13. Production Security Checklist

Confirm these Django settings are active in Cloud Run:

```text
DEBUG=False
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com,YOUR_CLOUD_RUN_HOST
```

The project already sets secure cookie and content-sniffing settings when `DEBUG=False`; `SECURE_SSL_REDIRECT` is controlled by environment and should be `True` in production.

## 14. Admin URLs

Firebase-hosted site:

```text
https://yourdomain.com/admin/
```

Direct Cloud Run:

```text
https://YOUR_CLOUD_RUN_URL/admin/
```

## 15. Android App Path

Start as a PWA first:

```text
Firebase Hosting + HTTPS + responsive UI
```

Then wrap with Capacitor:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init KaribuMakazi com.karibumakazi.app
npm run build
npx cap add android
npx cap sync android
```

Use Firebase App Distribution for testers, then publish with Google Play Console. Google Play requires a one-time developer registration fee.

## 16. Operational Checklist

- Set `DEBUG=False`.
- Set `SECURE_SSL_REDIRECT=True`.
- Use Secret Manager for `SECRET_KEY`, `DATABASE_URL`, OpenAI, and M-Pesa credentials.
- Use the dedicated `karibumakazi-cloudrun-sa` service account.
- Keep `ALLOWED_HOSTS` specific. Do not use `*` in production.
- Add `CORS_ORIGINS` and `CSRF_TRUSTED_ORIGINS` for Firebase/custom domains.
- Use Cloud SQL automated backups.
- Keep verification documents and payment evidence private; use signed URLs later.
- Use Cloud Storage lifecycle rules for old private verification documents if needed.
- Verify M-Pesa callback URL points to the Cloud Run or API domain.
- Use Cloud Logging alerts for 5xx errors.
- Add budget alerts before launch.
