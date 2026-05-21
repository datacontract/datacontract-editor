# Build stage
FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4173

CMD ["sh", "-c", "\
  echo '{\"ai\":{\"enabled\":'${AI_ENABLED:-false}',\"provider\":\"'${AI_PROVIDER:-openai}'\",\"endpoint\":\"'${AI_ENDPOINT}'\",\"apiKey\":\"'${AI_API_KEY}'\",\"model\":\"'${AI_MODEL}'\",\"authHeader\":\"'${AI_AUTH_HEADER:-bearer}'\"},\"tests\":{\"enabled\":true,\"dataContractCliApiServerUrl\":\"'${TESTS_SERVER_URL}'\"}}' > /usr/share/nginx/html/config.json && \
  nginx -g 'daemon off;' \
"]
