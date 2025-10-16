FROM node:24 AS builder
WORKDIR /react
COPY . .
RUN npm install
RUN npm install -g npm@11.6.2
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build
FROM nginx:1.29.1
COPY --from=builder /react/dist /var/www/react