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

# Production stage - using a lightweight server instead of nginx
FROM node:20-alpine

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy built files
COPY --from=build /app/build .

# Create a proper startup script
RUN echo '#!/bin/sh\nserve -s -l ${PORT:-3000}' > start.sh && \
    chmod +x start.sh

# Start the server
CMD ["./start.sh"]