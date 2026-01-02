#!/bin/sh
# Generate runtime config from environment variables
cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
  API_BASE_URL: "${VITE_API_BASE_URL:-}",
  API_TIMEOUT: "${VITE_API_TIMEOUT:-}",
  APP_NAME: "${VITE_APP_NAME:-}",
  APP_VERSION: "${VITE_APP_VERSION:-}",
};
EOF
exec "$@"
