import express from 'express';
import cors from 'cors';
import config from './config/env';
import photoRoutes from './routes/photoRoutes';
import faceGroupRoutes from './routes/faceGroupRoutes';
import photoService from './services/photoService';
import faceRecognitionService from './services/faceRecognitionService';

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

// Log startup information
console.log('=== Starting Smart Album Backend ===');
console.log(`Running in environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${port}`);
console.log(`Running in Cloud Run: ${process.env.K_SERVICE !== undefined ? 'Yes' : 'No'}`);
console.log(`Google Cloud Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID || 'Not set'}`);
console.log(`Storage Bucket: ${process.env.STORAGE_BUCKET_NAME || 'Not set'}`);
console.log(`GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Not set'}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
console.log(`CORS allowed origins: ${config.cors.allowedOrigins.join(', ')}`);

// Health check endpoint required by Cloud Run
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({ 
    message: 'Smart Album API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Initialize API routes
app.use('/api/photos', photoRoutes);
app.use('/api/face-groups', faceGroupRoutes);
console.log('API routes initialized');

// Initialize services without blocking server startup
(async () => {
  try {
    console.log('Initializing Firestore collections...');
    await photoService.initializeCollections();
    console.log('Firestore collections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firestore collections:', error);
    // Continue even if initialization fails
  }
  
  try {
    console.log('Loading face recognition models...');
    await faceRecognitionService.loadModels();
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Failed to load face recognition models:', error);
    // Continue even if model loading fails
  }
})();

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at: http://localhost:${port}/api`);
  console.log('=== Server started successfully ===');
});

// Add proper error handling for the server
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

export default app; 