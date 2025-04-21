# Smart Album Containerization and Cloud Run Deployment Guide

This guide will help you containerize the Smart Album application and deploy it to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed and configured
2. Docker installed and running
3. Git repository cloned and accessible

## Overview of the Application

The Smart Album application consists of two main components:

1. **Backend**: A Node.js API server that handles image processing, face recognition, and storage operations
2. **Frontend**: A React.js web application that provides the user interface

## Containerization Steps

Each component of the application is containerized separately using Docker:

### Backend Containerization

The backend uses a multi-stage Docker build to create an optimized container:

1. **Build stage**: Compiles TypeScript code
2. **Production stage**: Contains only the necessary runtime dependencies

Key files:
- `backend/Dockerfile.cloudrun`: The Docker configuration file optimized for Cloud Run
- `backend/.dockerignore`: Lists files that should be excluded from the Docker image

### Frontend Containerization

The frontend also uses a multi-stage Docker build:

1. **Build stage**: Builds the React application
2. **Production stage**: Uses Nginx to serve the static files

Key files:
- `frontend/Dockerfile`: The Docker configuration file
- `frontend/.dockerignore`: Lists files that should be excluded from the Docker image
- `frontend/nginx.conf`: Configures Nginx to serve the React application

## Deployment to Cloud Run

The deployment process includes:

1. Building Docker images for both backend and frontend
2. Pushing the images to Google Container Registry
3. Deploying the images to Cloud Run
4. Configuring environment variables and service settings

## Deploy Using the Windows Batch Script

We've created a Windows batch script to automate the deployment process:

1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Run the deployment script:
   ```
   deploy-to-cloudrun.bat
   ```

The script will:
- Create a unique Cloud Storage bucket for your photos
- Build and deploy the backend service
- Build and deploy the frontend service
- Configure all necessary environment variables
- Display the URLs for both services when complete

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Set up environment variables

```
set PROJECT_ID=your-project-id
set REGION=us-central1
set BACKEND_SERVICE_NAME=smart-album-backend
set FRONTEND_SERVICE_NAME=smart-album-frontend
set STORAGE_BUCKET_NAME=%PROJECT_ID%-photos
```

### 2. Create a storage bucket

```
gcloud storage buckets create gs://%STORAGE_BUCKET_NAME% --project=%PROJECT_ID% --location=%REGION%
```

### 3. Build and deploy the backend

```
cd backend
docker build -t gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME% -f Dockerfile.cloudrun .
docker push gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME%
gcloud run deploy %BACKEND_SERVICE_NAME% --image gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --timeout 300s --memory 512Mi --set-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLOUD_PROJECT_ID=%PROJECT_ID%,STORAGE_BUCKET_NAME=%STORAGE_BUCKET_NAME%,FACE_SIMILARITY_THRESHOLD=0.6"
```

### 4. Get the backend URL

```
for /f "tokens=*" %%b in ('gcloud run services describe %BACKEND_SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"') do set BACKEND_URL=%%b
```

### 5. Build and deploy the frontend

```
cd ../frontend
docker build -t gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE_NAME% .
docker push gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE_NAME%
gcloud run deploy %FRONTEND_SERVICE_NAME% --image gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE_NAME% --platform managed --region %REGION% --allow-unauthenticated --set-env-vars "REACT_APP_API_URL=%BACKEND_URL%/api"
```

## Troubleshooting

### Docker Build Issues
- Ensure Docker is running
- Check that your Docker daemon has at least 4GB of memory allocated
- Verify you have sufficient disk space for building images

### Cloud Run Deployment Issues
- Ensure you have the necessary IAM permissions
- Check that the services API is enabled
- Verify the Container Registry API is enabled

### Application Issues
- Check the Cloud Run logs for each service
- Verify environment variables are set correctly
- Ensure the frontend can communicate with the backend API

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Documentation](https://docs.docker.com)
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs) 