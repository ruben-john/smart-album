# Smart Photo Album with Enhanced Visual Recognition

A full-stack web application that leverages Google Cloud services to automatically analyze and organize photos. The application uses Google Cloud Vision API for advanced image analysis—including object recognition, landmark detection, and face detection with grouping functionality—stores metadata in Firestore, and runs the backend on Cloud Run.

## Features

- **Image Analysis with Google Cloud Vision API**
  - Object Recognition: Automatically detect and label objects within uploaded images
  - Landmark Detection: Identify landmarks present in photos and tag them accordingly
  - Face Detection & Grouping: Detect faces in images and group photos of the same person together
  - Tag Generation: Store all recognized objects, landmarks, and face group identifiers as tags

- **Modern Frontend**
  - Responsive design for both desktop and mobile
  - Gallery view with smooth animations and transitions
  - Drag-and-drop image upload
  - Intelligent search functionality
  - Detailed view of photo metadata and analysis results

- **Scalable Backend**
  - RESTful API built with Express.js
  - Google Cloud Firestore for metadata storage
  - Google Cloud Storage for image storage
  - Google Cloud Vision API for image analysis
  - Containerized with Docker for deployment on Cloud Run

## Project Structure

- `frontend/`: React.js frontend application
- `backend/`: Node.js backend application
- `docs/`: Additional documentation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account with the following services enabled:
  - Cloud Storage
  - Cloud Firestore
  - Cloud Vision API
- Google Cloud service account key with appropriate permissions

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your Google Cloud credentials and configuration

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```
   npm start
   ```

## Deployment

### Backend (Google Cloud Run)

1. Build the Docker image:
   ```
   cd backend
   docker build -t gcr.io/[PROJECT_ID]/smart-album-backend .
   ```

2. Push the image to Google Container Registry:
   ```
   docker push gcr.io/[PROJECT_ID]/smart-album-backend
   ```

3. Deploy to Cloud Run:
   ```
   gcloud run deploy smart-album-backend \
     --source backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --timeout 300s \
     --memory 512Mi \
     --set-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLOUD_PROJECT_ID=[YOUR_PROJECT_ID],STORAGE_BUCKET_NAME=smart-album-photos,FACE_SIMILARITY_THRESHOLD=0.6"
   ```

Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud Project ID.

### Frontend (Firebase Hosting)

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase:
   ```
   cd frontend
   firebase init
   ```

4. Build the application:
   ```
   npm run build
   ```

5. Deploy to Firebase:
   ```
   firebase deploy
   ```

## Cloud Run Deployment Instructions

### Deploying the Backend

To deploy the backend to Cloud Run, use the following command:

```bash
gcloud run deploy smart-album-backend \
  --source backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 300s \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,PORT=8080,GOOGLE_CLOUD_PROJECT_ID=[YOUR_PROJECT_ID],STORAGE_BUCKET_NAME=smart-album-photos,FACE_SIMILARITY_THRESHOLD=0.6"
```

Replace `[YOUR_PROJECT_ID]` with your actual Google Cloud Project ID.

### Deploying the Frontend

To deploy the frontend to Cloud Run, first make sure the backend is deployed, then:

```bash
gcloud run deploy smart-album-frontend \
  --source frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "REACT_APP_API_URL=https://smart-album-backend-[REGION].a.run.app/api"
```

Replace `[REGION]` with the region where your backend is deployed (e.g., `us-central1`).

### Troubleshooting

If your deployment fails with a timeout error, check the following:

1. Make sure your container is properly listening on port 8080
2. Ensure all required environment variables are set
3. Check the Cloud Run logs for specific error messages

## License

MIT 