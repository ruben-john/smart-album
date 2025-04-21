FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.template

# Script to replace PORT variable and start nginx
RUN echo '#!/bin/sh\n\
PORT="${PORT:-80}"\n\
sed "s/{{PORT}}/$PORT/g" /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Expose the port
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]