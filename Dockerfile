# ---------- Build React ----------
FROM node:24 AS builder
# work inside /react (inside the image)
WORKDIR /react

# 1) Copy only package files first (better layer caching)
COPY react/package*.json ./

# 2) Install deps
# prefer npm ci if you have a lockfile; fallback to npm install
RUN npm ci || npm install

# 3) Copy the rest of the React app
COPY react/ .

# 4) Build with optional API base
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:1.29.1
# Serve the built SPA
COPY --from=builder /react/dist /var/www/react

# Ship nginx config inside the image (no bind-mounts)
COPY nginx/nginx-setup.conf /etc/nginx/conf.d/default.conf
