import { API_BASE_URL } from '../constants';

interface ApiError {
  message: string;
  code?: number;
}

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('iaev_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'API Error');
      }
      return await response.json() as T;
    } catch (error) {
      console.error('Post error:', error);
      throw error;
    }
  },

  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    try {
      const headers = getHeaders() as Record<string, string>;
      delete headers['Content-Type']; // Let browser set boundary
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers as HeadersInit,
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return await response.json() as T;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
};
