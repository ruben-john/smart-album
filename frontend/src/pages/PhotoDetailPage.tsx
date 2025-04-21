import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photoApi } from '../services/api';
import { Photo } from '../types';
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PhotoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPhoto(id);
    }
  }, [id]);

  const fetchPhoto = async (photoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await photoApi.getPhotoById(photoId);
      setPhoto(data);
    } catch (err) {
      setError('Failed to load photo. Please try again later.');
      console.error('Error fetching photo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photo || !window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await photoApi.deletePhoto(photo.id);
      navigate('/');
    } catch (err) {
      setError('Failed to delete photo. Please try again.');
      console.error('Error deleting photo:', err);
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gallery
        </button>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-gray-500 mb-4">Photo not found</div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Photo'}
        </button>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.storageUrl}
                  alt={photo.fileName}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            
            <div className="md:w-1/3">
              <h1 className="text-2xl font-bold mb-4">Photo Details</h1>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {photo.tags.length === 0 && (
                    <span className="text-gray-500 text-sm">No tags available</span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Objects</h2>
                <div className="flex flex-wrap gap-2">
                  {photo.objects.map((object, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {object}
                    </span>
                  ))}
                  {photo.objects.length === 0 && (
                    <span className="text-gray-500 text-sm">No objects detected</span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Landmarks</h2>
                <div className="flex flex-wrap gap-2">
                  {photo.landmarks.map((landmark, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {landmark.name} ({Math.round(landmark.confidence * 100)}%)
                    </span>
                  ))}
                  {photo.landmarks.length === 0 && (
                    <span className="text-gray-500 text-sm">No landmarks detected</span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Metadata</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm mb-1">
                    <span className="font-medium">Dimensions:</span> {photo.metadata.width} x {photo.metadata.height}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Format:</span> {photo.metadata.format}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Uploaded:</span>{' '}
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                  {photo.metadata.location && (
                    <p className="text-sm">
                      <span className="font-medium">Location:</span>{' '}
                      {photo.metadata.location.latitude}, {photo.metadata.location.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPage; 