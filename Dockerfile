FROM node:24-trixie-slim
WORKDIR /react
COPY . .
RUN npm install
RUN npm run build