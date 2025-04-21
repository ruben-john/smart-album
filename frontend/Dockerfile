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
FROM node:20-alpine

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy built files
COPY --from=build /app/build /app

# Start the server directly (no script file needed)
CMD ["sh", "-c", "serve -s -l ${PORT:-3000}"]