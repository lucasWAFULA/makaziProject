#!/usr/bin/env bash
# Build frontend for production. Set VITE_API_URL to your live API base.
# Usage:
#   ./scripts/build-frontend.sh
#   VITE_API_URL=https://karibumakazi.com/api ./scripts/build-frontend.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../frontend" && pwd)"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Frontend folder not found: $FRONTEND_DIR"
  exit 1
fi

if [ -n "$VITE_API_URL" ]; then
  echo "VITE_API_URL=$VITE_API_URL" > "$FRONTEND_DIR/.env"
  echo "Set VITE_API_URL=$VITE_API_URL"
elif [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo "VITE_API_URL=/api" > "$FRONTEND_DIR/.env"
  echo "No .env found. Using VITE_API_URL=/api (same-origin)."
fi

cd "$FRONTEND_DIR"
npm run build
echo "Build output: frontend/dist"
