# Build stage
FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4173

CMD ["sh", "-c", "\
  echo '{\"ai\":{\"enabled\":'${AI_ENABLED:-false}',\"endpoint\":\"'${AI_ENDPOINT}'\",\"apiKey\":\"'${AI_API_KEY}'\",\"model\":\"'${AI_MODEL:-gpt-4o}'\",\"authHeader\":\"'${AI_AUTH_HEADER:-bearer}'\"},\"tests\":{\"enabled\":true,\"dataContractCliApiServerUrl\":\"'${TESTS_SERVER_URL}'\"}}' > /app/dist/config.json && \
  serve -s /app/dist -l 4173 \
"]
