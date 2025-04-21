import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Photo API
export const photoApi = {
  // Get all photos
  getAllPhotos: async () => {
    const response = await api.get('/photos');
    return response.data;
  },
  
  // Get a photo by ID
  getPhotoById: async (id: string) => {
    const response = await api.get(`/photos/${id}`);
    return response.data;
  },
  
  // Upload a photo
  uploadPhoto: async (formData: FormData) => {
    try {
      const response = await api.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.error || 'Failed to upload photo');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error uploading photo. Please try again.');
      }
    }
  },
  
  // Update a photo
  updatePhoto: async (id: string, photoData: any) => {
    const response = await api.put(`/photos/${id}`, photoData);
    return response.data;
  },
  
  // Delete a photo
  deletePhoto: async (id: string) => {
    const response = await api.delete(`/photos/${id}`);
    return response.data;
  },
  
  // Search photos by tags
  searchPhotosByTags: async (tags: string[]) => {
    const response = await api.get('/photos/search/tags', {
      params: { tags },
    });
    return response.data;
  },
  
  // Search photos by objects
  searchPhotosByObjects: async (objects: string[]) => {
    const response = await api.get('/photos/search/objects', {
      params: { objects },
    });
    return response.data;
  },
  
  // Search photos by landmarks
  searchPhotosByLandmarks: async (landmarks: string[]) => {
    console.log("Sending landmark search request:", landmarks);
    const response = await api.get('/photos/search/landmarks', {
      params: { landmarks: landmarks },
      paramsSerializer: params => {
        // This ensures arrays are properly serialized
        return Object.entries(params)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
            }
            return `${key}=${encodeURIComponent(String(value))}`;
          })
          .join('&');
      }
    });
    console.log("Landmark search response:", response.data);
    return response.data;
  },
};

// Face Group API
export const faceGroupApi = {
  // Get all face groups
  getAllFaceGroups: async () => {
    const response = await api.get('/face-groups');
    return response.data;
  },
  
  // Get a face group by ID
  getFaceGroupById: async (id: string) => {
    const response = await api.get(`/face-groups/${id}`);
    return response.data;
  },
  
  // Update a face group
  updateFaceGroup: async (id: string, faceGroupData: any) => {
    const response = await api.put(`/face-groups/${id}`, faceGroupData);
    return response.data;
  },
  
  // Delete a face group
  deleteFaceGroup: async (id: string) => {
    const response = await api.delete(`/face-groups/${id}`);
    return response.data;
  },
  
  // Get photos by face group ID
  getPhotosByFaceGroupId: async (id: string) => {
    const response = await api.get(`/face-groups/${id}/photos`);
    return response.data;
  },
};

export default {
  photoApi,
  faceGroupApi,
}; 