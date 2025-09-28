# Deployment Guide

This document captures the end-to-end workflow for deploying the **Semantic Flow** application to the production host (currently serving <https://canvas.bitwiki.org>). It synthesizes the operational runbook we followed during the latest release.

## Overview

- **Runtime stack:** Node.js 22, Vite-built React frontend, Express server (`server/index.js`), PM2 process manager, Nginx TLS terminator/static host.
- **Production layout:**
  - Git working copy at `~/semantic_flow`
  - PM2 process name: `semantic-flow` (script: `server/index.js`)
  - Static assets served by Nginx from `/var/www/html/canvas.bitwiki.org`
  - TLS certificates managed by Certbot (`/etc/letsencrypt`)

## Prerequisites

1. SSH access to the production server as a user with sudo privileges.
2. Git remote `origin` must point to the main repository.
3. Node, npm, and PM2 already installed (they live alongside the application).
4. Certbot-managed certificates are kept current via cron/`certbot renew`.

## Deployment Steps

### 1. Prepare the working tree

```bash
cd ~/semantic_flow
git status
```

- Ensure the working tree is clean. If you find unintended lockfile or config changes, restore them before continuing:

```bash
git restore package-lock.json  # example cleanup
```

### 2. Update source code

```bash
git fetch --all
git pull origin main
git rev-parse HEAD
git ls-remote origin HEAD
```

- Confirm the local commit matches the remote. If there are conflicts, resolve them before proceeding.

### 3. Install dependencies (when needed)

Only run a fresh install if `package.json` or `package-lock.json` changed in the new commit:

```bash
npm ci
```

### 4. Build the production bundle

```bash
npm run build
```

- The build outputs to `dist/`. Check timestamps if you want to confirm the build freshness:

```bash
ls -lt dist | head
```

### 5. Restart the PM2 process

Refresh the Node server so it picks up the new build and environment variables:

```bash
pm2 restart semantic-flow --update-env
pm2 logs semantic-flow --lines 30
```

Expected log tail:

```
[server] listening on http://localhost:8081
```

If you still see `VITE vX ready` messages, verify `dist/` exists and `NODE_ENV` is set to `production`.

### 6. Publish static assets to Nginx

Nginx serves the built files from `/var/www/html/canvas.bitwiki.org`. Sync the new bundle and adjust ownership:

```bash
sudo rsync -av --delete ~/semantic_flow/dist/ /var/www/html/canvas.bitwiki.org/
sudo chown -R www-data:www-data /var/www/html/canvas.bitwiki.org
```

*(Optional but recommended)* create a timestamped backup before syncing:

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
sudo mkdir -p /var/www/html/canvas.bitwiki.org_backups/$STAMP
sudo cp -a /var/www/html/canvas.bitwiki.org/. /var/www/html/canvas.bitwiki.org_backups/$STAMP/
```

### 7. Reload Nginx

```bash
sudo nginx -t  # sanity check
sudo nginx -s reload
```

`/etc/nginx/sites-enabled/canvas.bitwiki.org` should include:

```nginx
root /var/www/html/canvas.bitwiki.org;
location / {
    try_files $uri $uri/ /index.html;
}
```

### 8. Verify the deployment

1. **Health endpoint:**

   ```bash
   curl -I http://localhost:8081/api/health
   curl -I https://canvas.bitwiki.org/api/health
   ```

   Expect `HTTP/1.1 200 OK`.

2. **HTML bundle fingerprint:**

   ```bash
   curl -s http://localhost:8081/ | head -n 20
   curl -s https://canvas.bitwiki.org/ | head -n 20
   ```

   Confirm both outputs reference the same hashed asset (e.g. `/assets/index-<hash>.js`). This guarantees the static files and PM2 server are aligned.

3. **Browser spot-check:**
   - Open <https://canvas.bitwiki.org> in a browser with cache disabled / DevTools → Network → “Disable cache”.
   - Optionally inspect the Service Worker or application version banner if present.

### 9. Optional: Expose deployment metadata

To speed up future verifications, consider injecting build metadata during `npm run build`:

- Export `GIT_SHA=$(git rev-parse --short HEAD)` before the build and reference it in the UI or `/api/health` response.
- Include a footer or meta tag in `index.html` with the commit hash and build timestamp.

## Troubleshooting

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| `pm2 logs` shows Vite dev server output after restart | `dist/` missing or `NODE_ENV` not `production` | Ensure `npm run build` succeeded, confirm process environment, restart with `--update-env`. |
| Public site serves old assets (`/assets/index-*.js` hash mismatch) | Nginx doc root not updated or CDN caching | Re-run rsync, clear CDN cache (if any), reload Nginx. |
| `curl` to `/api/health` hangs | Firewall/ingress misconfigured or server down | Check PM2 status, inspect Nginx proxy rules, review system firewall. |
| Git pull blocked by local changes | Leftover edits (e.g., `package-lock.json`) | Use `git restore <file>` or commit the change if intentional. |

## Quick Reference

```bash
# One-liner summary (run only after verifying you need each step)
cd ~/semantic_flow && \
  git pull origin main && \
  npm run build && \
  pm2 restart semantic-flow --update-env && \
  sudo rsync -av --delete dist/ /var/www/html/canvas.bitwiki.org/ && \
  sudo nginx -s reload
```

Always follow up with the verification steps in Section 8.
