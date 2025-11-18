# ---------- Build React ----------
FROM node:24 AS builder
WORKDIR /react

# copia de paquetes para cache eficiente
COPY react/package*.json ./
RUN npm ci || npm install

# copia del proyecto React
COPY react/ .

# build con Vite (puedes dejar VITE_API_BASE vacío si usas proxy /api)
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:1.29.1
# archivos estaticos
COPY --from=builder /react/dist /var/www/react

# ⬇️ MUY IMPORTANTE: copiar la config
COPY nginx/nginx-setup.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080