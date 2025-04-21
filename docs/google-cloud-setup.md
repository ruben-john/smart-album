# Google Cloud Setup Guide

This guide provides step-by-step instructions for setting up the required Google Cloud services for the Smart Photo Album application.

## Prerequisites

- Google Cloud Platform account
- Google Cloud SDK installed locally (optional, but recommended)

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name and select a billing account
5. Click "Create"

## 2. Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Cloud Vision API
   - Cloud Firestore API
   - Cloud Storage API
   - Cloud Run API

## 3. Create a Service Account

1. In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a service account name and description
4. Click "Create and Continue"
5. Assign the following roles:
   - Cloud Vision API User
   - Cloud Datastore User (for Firestore)
   - Storage Admin
   - Cloud Run Admin (if deploying to Cloud Run)
6. Click "Continue" and then "Done"

## 4. Create and Download a Service Account Key

1. In the service accounts list, find the service account you just created
2. Click the three dots menu on the right and select "Manage keys"
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create"
6. The key file will be downloaded to your computer
7. Move this file to your backend directory and update the `GOOGLE_APPLICATION_CREDENTIALS` environment variable in your `.env` file to point to this file

## 5. Create a Cloud Storage Bucket

1. In the Google Cloud Console, go to "Storage" > "Browser"
2. Click "Create Bucket"
3. Enter a globally unique name for your bucket
4. Choose a region (preferably the same region where you'll deploy your backend)
5. Choose a storage class (Standard is recommended)
6. Choose an access control method (Fine-grained is recommended)
7. Click "Create"
8. Update the `STORAGE_BUCKET_NAME` environment variable in your `.env` file with the name of your bucket

## 6. Configure CORS for Your Storage Bucket

1. Install the Google Cloud SDK if you haven't already
2. Create a file named `cors.json` with the following content:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "responseHeader": ["Content-Type", "Content-MD5", "Content-Disposition"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
3. Run the following command to set the CORS configuration:
   ```
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```
   Replace `YOUR_BUCKET_NAME` with the name of your bucket

## 7. Create a Firestore Database

1. In the Google Cloud Console, go to "Firestore"
2. Click "Create Database"
3. Choose "Start in Native mode"
4. Select a location for your database (preferably the same region as your storage bucket)
5. Click "Create"

## 8. Set Up Firestore Security Rules

1. In the Firestore section, go to the "Rules" tab
2. Update the rules to allow read/write access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   Note: These rules allow unrestricted access. For production, you should implement proper authentication and authorization.

## 9. Deploy to Cloud Run (Optional)

1. Build your Docker image:
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
     --image gcr.io/[PROJECT_ID]/smart-album-backend \
     --platform managed \
     --region [REGION] \
     --allow-unauthenticated
   ```
4. Note the URL provided after deployment completes
5. Update your frontend's `.env` file with the new API URL

## Troubleshooting

### Permission Issues

If you encounter permission issues, make sure:
- Your service account has the necessary roles
- The `GOOGLE_APPLICATION_CREDENTIALS` environment variable points to the correct key file
- The key file is readable by the application

### CORS Issues

If you encounter CORS issues when accessing your storage bucket:
- Verify that the CORS configuration has been set correctly
- Make sure the origins in your CORS configuration match your frontend URL
- Check that the methods you're using are allowed in the CORS configuration

### Billing Issues

If services stop working unexpectedly:
- Check your billing status in the Google Cloud Console
- Make sure you have billing enabled for your project
- Set up billing alerts to avoid unexpected charges 