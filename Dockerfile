FROM node:20-alpine AS build

# Copy files as a non-root user. The `node` user is built in the Node image.
WORKDIR /usr/src/app
RUN chown node:node ./
USER node
# Defaults to production, docker-compose overrides this to development on build and run.
ARG NODE_ENV=dev
ENV NODE_ENV=$NODE_ENV
# Install dependencies first, as they change less often than code.
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY ./src ./src
COPY ./scripts ./scripts
COPY ./*js ./
USER root
RUN npm install
RUN npm run update-templates
# Execute NodeJS (not NPM script) to handle SIGTERM and SIGINT signals.
USER node
RUN npm run build

FROM httpd:alpine3.21
COPY --from=build /usr/src/app/dist/index* /usr/local/apache2/htdocs/
COPY --from=build /usr/src/app/dist/assets/* /usr/local/apache2/htdocs/assets/
COPY ./images/* /usr/local/apache2/htdocs/images/
