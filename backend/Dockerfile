FROM node:20-slim

# Install dependencies for canvas and face-api.js
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libvips-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript (if your backend uses TypeScript)
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]