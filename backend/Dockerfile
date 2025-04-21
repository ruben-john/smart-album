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

# Install dependencies with canvas rebuild
RUN npm ci

# Copy source files
COPY . .

# Special handling for canvas
RUN npm rebuild canvas --update-binary

# Build TypeScript
RUN npm run build

# Add a script to fix canvas issues
RUN echo '#!/bin/sh\n\
echo "Checking for canvas in node_modules..."\n\
if [ -d "node_modules/canvas" ]; then\n\
  echo "Canvas found. Running rebuild..."\n\
  npm rebuild canvas --update-binary\n\
else\n\
  echo "Canvas not found. Installing..."\n\
  npm install canvas\n\
fi\n\
\n\
echo "Starting application..."\n\
node dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Start server with canvas fix script
CMD ["/app/start.sh"]