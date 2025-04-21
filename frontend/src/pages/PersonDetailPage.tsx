import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { faceGroupApi } from '../services/api';
import { FaceGroup, Photo } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PhotoCard from '../components/PhotoCard';

const PersonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [faceGroup, setFaceGroup] = useState<FaceGroup | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFaceGroup(id);
    }
  }, [id]);

  const fetchFaceGroup = async (groupId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const groupData = await faceGroupApi.getFaceGroupById(groupId);
      setFaceGroup(groupData);
      setEditLabel(groupData.label || '');
      
      // Fetch photos for this face group
      const photosData = await faceGroupApi.getPhotosByFaceGroupId(groupId);
      setPhotos(photosData);
    } catch (err) {
      setError('Failed to load person data. Please try again later.');
      console.error('Error fetching face group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLabel = () => {
    setIsEditing(true);
  };

  const handleSaveLabel = async () => {
    if (!faceGroup) return;
    
    try {
      await faceGroupApi.updateFaceGroup(faceGroup.id, { label: editLabel });
      setFaceGroup({ ...faceGroup, label: editLabel });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating face group label:', err);
      setError('Failed to update name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditLabel(faceGroup?.label || '');
  };

  const handleDelete = async () => {
    if (!faceGroup || !window.confirm('Are you sure you want to delete this person? This will not delete the photos.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await faceGroupApi.deleteFaceGroup(faceGroup.id);
      navigate('/people');
    } catch (err) {
      setError('Failed to delete person. Please try again.');
      console.error('Error deleting face group:', err);
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/people');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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
          Back to People
        </button>
      </div>
    );
  }

  if (!faceGroup) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-gray-500 mb-4">Person not found</div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to People
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
          Back to People
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Person'}
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full">
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="border rounded-md px-3 py-2 flex-grow"
                placeholder="Enter name"
                autoFocus
              />
              <button
                onClick={handleSaveLabel}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                {faceGroup.label || `Person ${faceGroup.id.slice(0, 4)}`}
              </h1>
              <button
                onClick={handleEditLabel}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        
        <div className="text-gray-600">
          <p>{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Photos</h2>
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No photos available for this person.
        </div>
      )}
    </div>
  );
};

export default PersonDetailPage; 