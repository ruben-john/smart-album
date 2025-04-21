import React, { useState, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { photoApi } from '../services/api';

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      setFile(droppedFile);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    let progressInterval: NodeJS.Timeout | undefined;
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      await photoApi.uploadPhoto(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (err: any) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);
      setIsUploading(false);
      
      // Check for the specific duplicate photo error message
      if (err.message.includes('already exists')) {
        setError('This photo already exists in your album.');
      } else {
        setError(err.message || 'Failed to upload photo. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Photo</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          preview ? 'border-green-300' : 'border-gray-300 hover:border-blue-400'
        } transition-colors duration-300`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
          </div>
        ) : (
          <div className="py-8">
            <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your photo here, or click to select
            </p>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          {preview ? 'Change Photo' : 'Select Photo'}
        </label>
      </div>
      
      {error && (
        <div className={`mt-4 text-sm text-center ${error.includes('already exists') ? 'bg-amber-100 text-amber-700 p-3 rounded-md border border-amber-300' : 'text-red-500'}`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 text-green-500 text-sm text-center">
          Photo uploaded successfully!
        </div>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Uploading and analyzing... {uploadProgress}%
          </p>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          !file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Photo'}
      </button>
      
      <p className="mt-4 text-xs text-gray-500 text-center">
        Max file size: 10MB. Supported formats: JPG, PNG, GIF.
      </p>
    </div>
  );
};

export default UploadForm; 