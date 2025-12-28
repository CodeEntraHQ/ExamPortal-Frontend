# Runtime Environment Configuration for Kubernetes

> **TL;DR:** Vite environment variables are baked at build time. This document explains how we inject configuration at container startup (runtime) for Kubernetes deployments using a simple approach.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Files Changed](#files-changed)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting](#troubleshooting)

---

## Problem Statement

### The Issue

Vite's `import.meta.env.VITE_*` variables are **baked into the JavaScript bundle at BUILD TIME**:

```typescript
// ❌ This value cannot be changed after build
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Why This Is a Problem

- Need separate Docker images for dev/staging/production
- Config change = rebuild entire image
- Slow deployments, wasted CI/CD resources

### Desired Workflow

```
Build Once → Same Docker Image → Deploy anywhere with different env vars
```

---

## Solution Overview

Inject environment variables at **container startup** using:

1. A simple `env-config.js` file that sets `window.__ENV__`
2. An entrypoint script that generates this file from environment variables
3. Application reads from `window.__ENV__` first, then falls back to `import.meta.env`

---

## Files Changed

### 1. `src/config/env.ts` (Modified)

Added runtime config fallback:

```typescript
// Runtime config from window (injected at container startup)
const runtime = (typeof window !== 'undefined' && (window as any).__ENV__) || {};

export const envConfig = Object.freeze({
  // Priority: runtime → build-time → default
  apiBaseUrl: runtime.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8000',
  appName: runtime.APP_NAME || env.VITE_APP_NAME || 'ExamEntra',
  // ... other config
});
```

### 2. `index.html` (Modified)

Added one script tag:

```html
<head>
  <script src="/env-config.js"></script>
</head>
```

### 3. `public/env-config.js` (New)

Empty config for local development:

```javascript
window.__ENV__ = {};
```

### 4. `docker-entrypoint.sh` (New)

Simple script to generate config at startup:

```bash
#!/bin/sh
cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
  API_BASE_URL: "${VITE_API_BASE_URL:-}",
  API_TIMEOUT: "${VITE_API_TIMEOUT:-}",
  APP_NAME: "${VITE_APP_NAME:-}",
  APP_VERSION: "${VITE_APP_VERSION:-}",
};
EOF
exec "$@"
```

### 5. `Dockerfile` (Modified)

Added entrypoint:

```dockerfile
FROM node:22-alpine3.21 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                  CONTAINER STARTUP                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Kubernetes passes env vars                           │
│     VITE_API_BASE_URL="https://api.example.com"         │
│                         │                                │
│                         ▼                                │
│  2. docker-entrypoint.sh generates env-config.js        │
│     window.__ENV__ = { API_BASE_URL: "https://..." }    │
│                         │                                │
│                         ▼                                │
│  3. nginx starts and serves static files                 │
│                         │                                │
│                         ▼                                │
│  4. Browser loads:                                       │
│     index.html → env-config.js → main.js                │
│                         │                                │
│                         ▼                                │
│  5. App reads window.__ENV__.API_BASE_URL               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Config Priority

```
window.__ENV__.X  →  import.meta.env.VITE_X  →  default value
   (runtime)            (build-time)
```

---

## Usage

### Local Development

No changes needed:

```bash
npm run dev
# Uses import.meta.env from .env.local
```

### Docker Testing

```bash
# Build once
docker build -t examentra-frontend .

# Run with custom API URL
docker run -p 8080:80 \
  -e VITE_API_BASE_URL="https://api.example.com" \
  -e VITE_APP_NAME="ExamEntra" \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  examentra-frontend
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: examentra-frontend
spec:
  template:
    spec:
      containers:
        - name: frontend
          image: your-registry/examentra-frontend:v1.0.0
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_BASE_URL
              value: "https://api-examentra.homelabcraft.ovh"
            - name: VITE_APP_NAME
              value: "ExamEntra"
          # Or use ConfigMap:
          envFrom:
            - configMapRef:
                name: frontend-config
```

---

## Environment Variables Reference

| Variable | Runtime Key | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | `API_BASE_URL` | `http://localhost:8000` |
| `VITE_API_TIMEOUT` | `API_TIMEOUT` | `30000` |
| `VITE_APP_NAME` | `APP_NAME` | `ExamEntra` |
| `VITE_APP_VERSION` | `APP_VERSION` | `1.0.0` |

---

## Troubleshooting

### Config Not Loading

1. Check if env-config.js exists:
   ```bash
   docker exec <container> cat /usr/share/nginx/html/env-config.js
   ```

2. Check browser console for `window.__ENV__`

### Empty Values

Ensure environment variables are passed to container:
```bash
docker run -e VITE_API_BASE_URL="https://..." ...
```

### Cache Issues

Add `Cache-Control: no-store` for env-config.js in nginx config:
```nginx
location = /env-config.js {
    add_header Cache-Control "no-store";
}
```
