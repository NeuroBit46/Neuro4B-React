# ---------- Build React ----------
FROM node:24 AS builder
WORKDIR /app

# Copiar solo package*.json para aprovechar cache de dependencias
COPY package*.json ./
RUN npm ci || npm install

# Test con Jest
RUN npm install --save-dev jest

# Copiar el resto del proyecto
COPY . .

# Si usas VITE_API_BASE, lo dejamos disponible
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:1.29.1

# Archivos estáticos generados por Vite/React
COPY --from=builder /app/dist /var/www/react

# Config genérica de Nginx + entrypoint
COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
