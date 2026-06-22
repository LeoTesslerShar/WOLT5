# ── Stage 1: build the React app ──────────────────────────────
FROM node:18-slim AS client-build
WORKDIR /client
COPY src/client/package*.json ./
RUN npm install
COPY src/client/ .
RUN npm run build

# ── Stage 2: run the Express server ───────────────────────────
FROM node:18-slim
WORKDIR /app
COPY src/webserver/package*.json ./
RUN npm install
COPY src/webserver/ .
# Copy the React build output into Express's ./public folder
COPY --from=client-build /client/build ./public
EXPOSE 3000
CMD ["node", "app.js"]
