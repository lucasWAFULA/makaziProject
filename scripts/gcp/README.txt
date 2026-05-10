GCP helpers for karibumakazi-api (Cloud Run)

Prerequisites
  - Google Cloud SDK (gcloud) installed and on PATH
  - gcloud auth login
  - gcloud config set project makazi240097

1) Env vars (Console or gcloud)
  - Copy backend/.env.gcp.example → set every variable in Cloud Run → karibumakazi-api → Edit & deploy new revision → Variables & Secrets.
  - For Zoho SMTP (password reset): use the EMAIL_* keys from that file; use a Zoho "App Password", not your login password.

2) CORS for Firebase Hosting (quick)
  PowerShell (repo root):
    cd scripts/gcp
    .\patch-cors-firebase-hosting.ps1
  Git Bash / WSL:
    ./patch-cors-firebase-hosting.sh
    # optional override: ./patch-cors-firebase-hosting.sh makazi240097

3) Migrations / seed (Cloud Run Jobs)
  - Get the same container image URI your API revision uses (Artifact Registry).
  - Copy scripts/gcp/cloud-run-env.local.yaml.example → cloud-run-env.local.yaml and fill values (file is gitignored).
  - Migrate (defaults: project makazi240097, Cloud SQL makazi240097:europe-west1:karibumakazi-db, SA karibumakazi-cloudrun-sa@makazi240097.iam.gserviceaccount.com):
    .\run-cloud-run-job-migrate.ps1 -ImageUri "europe-west1-docker.pkg.dev/makazi240097/karibumakazi/karibumakazi-api:TAG" -EnvVarsFile .\cloud-run-env.local.yaml
  - Seed demo data:
    .\run-cloud-run-job-seed-demo.ps1 -ImageUri "europe-west1-docker.pkg.dev/makazi240097/karibumakazi/karibumakazi-api:TAG" -HostEmail admin@makazi-plus.com -EnvVarsFile .\cloud-run-env.local.yaml
  - Re-seed from scratch (destructive for demo data):
    .\run-cloud-run-job-seed-demo.ps1 -ImageUri "..." -Clear -EnvVarsFile .\cloud-run-env.local.yaml

Notes
  - patch-cors-*. uses gcloud --update-env-vars (adds/overrides those two keys only; does not delete other env vars).
  - If --env-vars-file on jobs overwrites all job env vars, always include every required key in YAML or use Console to maintain the job env after create.
