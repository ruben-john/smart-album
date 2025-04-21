# Smart Photo Album Backend

This is the backend service for the Smart Photo Album application. It provides APIs for photo upload, analysis, and retrieval, leveraging Google Cloud services for image analysis and storage.

## Features

- Photo upload and storage using Google Cloud Storage
- Image analysis using Google Cloud Vision API
  - Object detection
  - Landmark detection
  - Face detection and grouping
  - Tag generation
- Photo metadata storage in Firestore
- RESTful API for photo management
- Face grouping algorithm to organize photos by people

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account with the following services enabled:
  - Cloud Storage
  - Cloud Firestore
  - Cloud Vision API
- Google Cloud service account key with appropriate permissions

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your Google Cloud credentials and configuration
5. Build the application:
   ```
   npm run build
   ```

## Running the Application

### Development Mode

```
npm run dev
```

This will start the server in development mode with hot reloading.

### Production Mode

```
npm run build
npm start
```

## API Endpoints

### Photos

- `POST /api/photos` - Upload a new photo
- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get a photo by ID
- `PUT /api/photos/:id` - Update a photo
- `DELETE /api/photos/:id` - Delete a photo
- `GET /api/photos/search/tags` - Search photos by tags
- `GET /api/photos/search/objects` - Search photos by objects
- `GET /api/photos/search/landmarks` - Search photos by landmarks

### Face Groups

- `GET /api/face-groups` - Get all face groups
- `GET /api/face-groups/:id` - Get a face group by ID
- `PUT /api/face-groups/:id` - Update a face group
- `DELETE /api/face-groups/:id` - Delete a face group
- `GET /api/face-groups/:id/photos` - Get photos by face group ID

## Google Cloud Setup

### Service Account

1. Create a service account in the Google Cloud Console
2. Grant the following roles to the service account:
   - Storage Admin
   - Firestore Admin
   - Cloud Vision API User
3. Create and download a JSON key for the service account
4. Set the path to the key file in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Storage Bucket

1. Create a Cloud Storage bucket
2. Update the `STORAGE_BUCKET_NAME` environment variable with the bucket name
3. Set appropriate CORS configuration for the bucket

### Firestore

1. Create a Firestore database in Native mode
2. Set up appropriate security rules

## Deployment

### Google Cloud Run

1. Build the Docker image:
   ```
   docker build -t gcr.io/[PROJECT_ID]/smart-album-backend .
   ```
2. Push the image to Google Container Registry:
   ```
   docker push gcr.io/[PROJECT_ID]/smart-album-backend
   ```
3. Deploy to Cloud Run:
   ```
   gcloud run deploy smart-album-backend \
     --image gcr.io/[PROJECT_ID]/smart-album-backend \
     --platform managed \
     --region [REGION] \
     --allow-unauthenticated
   ```

## License

MIT 