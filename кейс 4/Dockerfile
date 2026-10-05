FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
RUN npm prune --omit=dev && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
