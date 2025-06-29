// frontend/src/utils/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Get API base URL
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Development default
    if (import.meta.env.DEV) {
        return 'http://localhost:3000/api';
    }
    
    // Production - same origin
    return `${window.location.origin}/api`;
};

// Create axios instance
const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('storytelling_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('📤 Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }

        return response;
    },
    (error) => {
        console.error('📥 Response error:', error);

        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - token might be expired
                    if (data?.message?.includes('expired') || data?.message?.includes('invalid')) {
                        localStorage.removeItem('storytelling_token');
                        localStorage.removeItem('storytelling_user');
                        window.location.href = '/login';
                        toast.error('Session expired. Please login again.');
                    }
                    break;

                case 403:
                    toast.error('You do not have permission to perform this action.');
                    break;

                case 404:
                    if (!error.config.url.includes('/health')) {
                        toast.error('Resource not found.');
                    }
                    break;

                case 429:
                    toast.error('Too many requests. Please try again later.');
                    break;

                case 500:
                    toast.error('Server error. Please try again later.');
                    break;

                default:
                    // Show error message from server if available
                    if (data?.message && !data.message.includes('validation')) {
                        toast.error(data.message);
                    }
            }

        } else if (error.request) {
            // Network error
            console.error('Network error:', error.request);
            toast.error('Network error. Please check your connection.');
            
        } else {
            // Request setup error
            console.error('Request setup error:', error.message);
            toast.error('Request failed. Please try again.');
        }

        return Promise.reject(error);
    }
);

// API helper methods
export const apiHelpers = {
    // Health check
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return null;
        }
    },

    // Upload file (for future use)
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });
    },

    // Download file (for future use)
    async downloadFile(url, filename) {
        const response = await api.get(url, {
            responseType: 'blob',
        });

        // Create download link
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    },

    // Retry failed request
    async retryRequest(originalRequest, maxRetries = 3) {
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                return await api.request(originalRequest);
            } catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, retries) * 1000)
                );
            }
        }
    }
};

export default api;