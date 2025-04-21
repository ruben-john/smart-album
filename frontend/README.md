# Smart Photo Album Frontend

This is the frontend application for the Smart Photo Album project. It provides a modern, responsive user interface for uploading, viewing, and searching photos that are analyzed by the backend using Google Cloud Vision API.

## Features

- Modern, responsive UI built with React and Tailwind CSS
- Photo gallery with search functionality
- Photo upload with drag-and-drop support
- Detailed view of photos with metadata and analysis results
- People view for browsing photos by detected faces
- Responsive design for both desktop and mobile

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README for setup instructions)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```
   Update the URL to match your backend API endpoint.

## Running the Application

### Development Mode

```
npm start
```

This will start the development server at http://localhost:3000.

### Production Build

```
npm run build
```

This will create a production-ready build in the `build` directory.

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components for different routes
- `src/services`: API service for communicating with the backend
- `src/types`: TypeScript type definitions
- `src/App.tsx`: Main application component with routing

## Deployment

### Firebase Hosting

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
   firebase init
   ```
   Select Hosting and follow the prompts.

4. Build the application:
   ```
   npm run build
   ```

5. Deploy to Firebase:
   ```
   firebase deploy
   ```

## License

MIT
