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

# Customizations (see CUSTOMIZATION.md): mount a customization.yaml into the
# container and point CUSTOMIZATION_CONFIG at it, or mount it directly to
# /usr/share/nginx/html/customization.yaml. The frontend fetches it at startup.
# Initial data contract: mount a YAML file and point INITIAL_YAML_FILE at it.
# config.json is generated from the environment variables below, unless CONFIG_JSON
# points at a mounted config.json, which is then used as is (see CONFIGURATION.md).
CMD ["sh", "-c", "\
  if [ -n \"$CUSTOMIZATION_CONFIG\" ]; then cp \"$CUSTOMIZATION_CONFIG\" /usr/share/nginx/html/customization.yaml || exit 1; fi && \
  if [ -n \"$INITIAL_YAML_FILE\" ]; then cp \"$INITIAL_YAML_FILE\" /usr/share/nginx/html/data-contract.yaml || exit 1; fi && \
  if [ -n \"$CONFIG_JSON\" ]; then cp \"$CONFIG_JSON\" /usr/share/nginx/html/config.json || exit 1; else \
  echo '{\"ai\":{\"enabled\":'${AI_ENABLED:-false}',\"provider\":\"'${AI_PROVIDER:-openai}'\",\"endpoint\":\"'${AI_ENDPOINT}'\",\"apiKey\":\"'${AI_API_KEY}'\",\"model\":\"'${AI_MODEL}'\",\"authHeader\":\"'${AI_AUTH_HEADER:-bearer}'\"},\"tests\":{\"enabled\":true,\"dataContractCliApiServerUrl\":\"'${TESTS_SERVER_URL}'\"},\"schemaUrl\":\"'${SCHEMA_URL}'\"}' > /usr/share/nginx/html/config.json; fi && \
  nginx -g 'daemon off;' \
"]
