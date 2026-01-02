# Runtime Configuration Changes Summary

> Quick reference for changes made to enable runtime environment configuration in Kubernetes.

---

## 🔴 The Problem

```
Vite's import.meta.env.VITE_* variables are BAKED INTO the JavaScript 
bundle at BUILD TIME. Once built, you cannot change apiBaseUrl without 
rebuilding the entire Docker image.
```

---

## 🟢 The Solution

Inject environment variables at **container startup** using `window.__ENV__`.

---

## 📁 Files Changed (Only 5!)

| File | Change | Lines |
|------|--------|-------|
| `src/config/env.ts` | Added `runtime \|\|` fallback | +3 lines |
| `index.html` | Added `<script src="/env-config.js">` | +1 line |
| `public/env-config.js` | New file (empty for dev) | 2 lines |
| `docker-entrypoint.sh` | New file (generates config) | 8 lines |
| `Dockerfile` | Added entrypoint | +3 lines |

---

## 📝 Key Code Changes

### 1. env.ts

```typescript
// Add runtime fallback
const runtime = (typeof window !== 'undefined' && (window as any).__ENV__) || {};

export const envConfig = Object.freeze({
  // Priority: runtime → build-time → default
  apiBaseUrl: runtime.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8000',
});
```

### 2. index.html

```html
<head>
  <script src="/env-config.js"></script>  <!-- Add this line -->
</head>
```

### 3. public/env-config.js

```javascript
window.__ENV__ = {};
```

### 4. docker-entrypoint.sh

```bash
#!/bin/sh
cat > /usr/share/nginx/html/env-config.js << EOF
window.__ENV__ = {
  API_BASE_URL: "${VITE_API_BASE_URL:-}",
  APP_NAME: "${VITE_APP_NAME:-}",
};
EOF
exec "$@"
```

### 5. Dockerfile

```dockerfile
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────┐
│  Local Dev:                                      │
│  env-config.js = {}  →  Uses import.meta.env    │
├─────────────────────────────────────────────────┤
│  Kubernetes:                                     │
│  Entrypoint generates env-config.js             │
│  window.__ENV__ = { API_BASE_URL: "..." }       │
│  App reads window.__ENV__ first                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Usage

### Docker

```bash
docker build -t examentra-frontend .

docker run -p 8080:80 \
  -e VITE_API_BASE_URL="https://api.example.com" \
  examentra-frontend
```

### Kubernetes

```yaml
env:
  - name: VITE_API_BASE_URL
    value: "https://api-examentra.homelabcraft.ovh"
```

---

## ✅ Benefits

| Before | After |
|--------|-------|
| Rebuild for each environment | One image for all |
| Config baked at build | Config injected at runtime |
| Complex CI/CD | Simple deployment |

---

## 🔗 Related

- [Detailed Documentation](./RUNTIME_CONFIGURATION.md)
