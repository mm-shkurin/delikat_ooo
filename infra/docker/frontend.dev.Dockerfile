FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

# Assets: bind-mount ../site/assets → /app/public/assets in compose (see docker-compose.yml).

ENV FRONTEND_HOST=0.0.0.0
ENV FRONTEND_PORT=5173

EXPOSE 5173

CMD ["sh", "-c", "if [ ! -x node_modules/.bin/vite ]; then npm ci; fi && npm run dev -- --host 0.0.0.0 --port ${FRONTEND_PORT}"]
