#!/usr/bin/env bash
# Patch CORS / CSRF for Firebase Hosting + custom domains on Cloud Run.
# Usage:
#   chmod +x patch-cors-firebase-hosting.sh
#   ./patch-cors-firebase-hosting.sh [PROJECT_ID]
#
# Requires: gcloud auth login; optional: gcloud config set project ID

set -euo pipefail

PROJECT_ID="${1:-makazi240097}"
REGION="${REGION:-europe-west1}"
SERVICE="${SERVICE:-karibumakazi-api}"
FB_HOST="${FB_HOST:-makazi240097.web.app}"
FB_ALT="${FB_ALT:-makazi240097.firebaseapp.com}"
CLOUD_RUN_API="${CLOUD_RUN_API:-https://karibumakazi-api-dpifguofja-ew.a.run.app}"

# Commas inside values must be escaped for gcloud
CORS="https://makazi-plus.com\,https://www.makazi-plus.com\,https://${FB_HOST}\,https://${FB_ALT}"
CSRF="https://makazi-plus.com\,https://www.makazi-plus.com\,https://admin.makazi-plus.com\,${CLOUD_RUN_API}\,https://${FB_HOST}\,https://${FB_ALT}"

gcloud run services update "${SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --update-env-vars "CORS_ORIGINS=${CORS},CSRF_TRUSTED_ORIGINS=${CSRF}"

echo "Done."
