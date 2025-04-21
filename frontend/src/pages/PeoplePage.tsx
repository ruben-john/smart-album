import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { faceGroupApi, photoApi } from '../services/api';
import { FaceGroup, Photo } from '../types';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

const PeoplePage: React.FC = () => {
  const [faceGroups, setFaceGroups] = useState<FaceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [groupPhotos, setGroupPhotos] = useState<Record<string, Photo[]>>({});

  useEffect(() => {
    fetchFaceGroups();
  }, []);

  const fetchFaceGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await faceGroupApi.getAllFaceGroups();
      console.log('Face Groups received:', data);
      setFaceGroups(data);
      
      // Fetch representative photos for each face group
      const photosMap: Record<string, Photo[]> = {};
      
      for (const group of data) {
        console.log(`Processing group ${group.id} with ${group.photoIds.length} photos`);
        
        if (group.photoIds.length > 0) {
          try {
            console.log(`Fetching photos for group ${group.id} with photoIds:`, group.photoIds);
            const photos = await faceGroupApi.getPhotosByFaceGroupId(group.id);
            console.log(`Received ${photos.length} photos for group ${group.id}:`, photos);
            photosMap[group.id] = photos.slice(0, 4); // Get up to 4 photos per group
          } catch (err) {
            console.error(`Error fetching photos for group ${group.id}:`, err);
          }
        }
      }
      
      console.log('Final photos map:', photosMap);
      setGroupPhotos(photosMap);
    } catch (err) {
      setError('Failed to load face groups. Please try again later.');
      console.error('Error fetching face groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLabel = (group: FaceGroup) => {
    setEditingId(group.id);
    setEditLabel(group.label || '');
  };

  const handleSaveLabel = async (groupId: string) => {
    try {
      await faceGroupApi.updateFaceGroup(groupId, { label: editLabel });
      
      // Update local state
      setFaceGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? { ...group, label: editLabel } : group
        )
      );
      
      setEditingId(null);
    } catch (err) {
      console.error('Error updating face group label:', err);
      setError('Failed to update label. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
          onClick={fetchFaceGroups}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">People</h1>
      
      {faceGroups.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No people found. Upload photos with faces to see them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faceGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  {editingId === group.id ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="border rounded-md px-2 py-1 flex-grow"
                        placeholder="Enter name"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveLabel(group.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                        <h2 className="text-xl font-semibold">
                          {group.label || `Person ${group.id.slice(0, 4)}`}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleEditLabel(group)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {group.photoIds.length} photo{group.photoIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {groupPhotos[group.id] && groupPhotos[group.id].length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {groupPhotos[group.id].map(photo => {
                      console.log(`Rendering photo for group ${group.id}:`, photo);
                      return (
                        <Link
                          key={photo.id}
                          to={`/photos/${photo.id}`}
                          className="block rounded-md overflow-hidden bg-gray-100"
                        >
                          <img
                            src={photo.thumbnailUrl || photo.storageUrl}
                            alt={photo.fileName}
                            className="w-full h-24 object-cover"
                            onError={(e) => {
                              console.error(`Error loading image for photo ${photo.id}:`, e);
                              e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No photos available
                  </div>
                )}
                
                {group.photoIds.length > 4 && (
                  <div className="mt-3 text-center">
                    <Link
                      to={`/people/${group.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View all photos
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeoplePage; 