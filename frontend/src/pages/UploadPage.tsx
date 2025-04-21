import React from 'react';
import UploadForm from '../components/UploadForm';

const UploadPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Upload Photo</h1>
      <UploadForm />
      
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">About Smart Photo Analysis</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-4">
            When you upload a photo, our smart analysis system automatically:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Detects objects in your photos</li>
            <li>Identifies landmarks</li>
            <li>Recognizes faces and groups similar faces together</li>
            <li>Generates relevant tags for easy searching</li>
          </ul>
          <p className="text-sm text-gray-600">
            All processing is done securely using Google Cloud Vision API. Your photos are stored
            privately and can only be accessed by you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPage; 