# ---------- Build React ----------
FROM node:24 AS builder
WORKDIR /react

# Copiar solo package*.json para cache de deps
COPY react/package*.json ./
RUN npm ci || npm install

# Copiar proyecto
COPY react/ .

# Si usas VITE_API_BASE, lo dejamos, pero el proxy /api ya te cubre
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:1.29.1

# Archivos estáticos de React
COPY --from=builder /react/dist /var/www/react

# Config de Nginx como plantilla + entrypoint
COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]