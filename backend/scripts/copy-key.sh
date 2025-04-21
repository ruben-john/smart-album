#!/bin/bash

# Check if service-account-key.json exists in builder stage
if [ -f /app/service-account-key.json ]; then
    echo "Service account key found, copying..."
    cp /app/service-account-key.json /app/service-account-key.json
else
    echo "Service account key not found, skipping..."
fi 