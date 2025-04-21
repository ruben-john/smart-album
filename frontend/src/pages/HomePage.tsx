import React, { useState, useEffect } from 'react';
import { photoApi } from '../services/api';
import { Photo, SearchFilters } from '../types';
import PhotoCard from '../components/PhotoCard';
import SearchBar from '../components/SearchBar';

const HomePage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await photoApi.getAllPhotos();
      setPhotos(data);
    } catch (err) {
      setError('Failed to load photos. Please try again later.');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    
    if (!query.trim()) {
      fetchPhotos();
      return;
    }
    
    try {
      console.log("Searching for:", query);
      
      // Split the query into keywords
      const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Try a more comprehensive search that checks everything
      let results = [];
      
      // First check landmarks
      console.log("Searching landmarks for:", keywords);
      const landmarkResults = await photoApi.searchPhotosByLandmarks(keywords);
      if (landmarkResults.length > 0) {
        results = landmarkResults;
        console.log("Found results in landmarks:", results.length);
      } else {
        // Then try objects
        console.log("Searching objects for:", keywords);
        const objectResults = await photoApi.searchPhotosByObjects(keywords);
        if (objectResults.length > 0) {
          results = objectResults;
          console.log("Found results in objects:", results.length);
        } else {
          // Finally try tags
          console.log("Searching tags for:", keywords);
          const tagResults = await photoApi.searchPhotosByTags(keywords);
          results = tagResults;
          console.log("Found results in tags:", results.length);
        }
      }
      
      setPhotos(results);
    } catch (err) {
      setError('Failed to search photos. Please try again.');
      console.error('Error searching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Smart Photo Album</h1>
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {photos.length > 0
              ? `Search results for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </h2>
          {photos.length === 0 && !loading && (
            <button
              onClick={fetchPhotos}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear search and show all photos
            </button>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No photos found. Upload some photos to get started!
        </div>
      )}
    </div>
  );
};

export default HomePage; 