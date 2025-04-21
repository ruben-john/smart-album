#!/bin/bash

# Exit on error
set -e

# Set variables
PROJECT_ID=$(gcloud config get-value project)
REGION=us-central1
BACKEND_SERVICE_NAME=smart-album-backend
FRONTEND_SERVICE_NAME=smart-album-frontend
STORAGE_BUCKET_NAME=smart-album-photos

echo "Using Google Cloud Project: $PROJECT_ID"
echo "Deploying to region: $REGION"

# Build and deploy backend
echo "Building and deploying backend..."
cd backend

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME .

# Push to Container Registry
echo "Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 300s \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,STORAGE_BUCKET_NAME=$STORAGE_BUCKET_NAME,FACE_SIMILARITY_THRESHOLD=0.6"

# Get the deployed URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# Return to root directory
cd ..

# Build and deploy frontend
echo "Building and deploying frontend..."
cd frontend

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME .

# Push to Container Registry
echo "Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "REACT_APP_API_URL=${BACKEND_URL}/api"

# Get the deployed URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment completed successfully!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL" 