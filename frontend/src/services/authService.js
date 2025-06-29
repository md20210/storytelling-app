// frontend/src/services/authService.js
import api from '../utils/api.js';

class AuthService {
    constructor() {
        this.token = null;
    }

    // Set authentication token for API calls
    setAuthToken(token) {
        this.token = token;
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }

    // Register new user
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }

    // Login user
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    }

    // Get current user profile
    async getProfile() {
        const response = await api.get('/auth/profile');
        return response.data;
    }

    // Update user profile
    async updateProfile(profileData) {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }

    // Refresh token
    async refreshToken() {
        const response = await api.post('/auth/refresh-token');
        return response.data;
    }

    // Logout (client-side cleanup)
    logout() {
        this.setAuthToken(null);
        localStorage.removeItem('storytelling_token');
        localStorage.removeItem('storytelling_user');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token || !!localStorage.getItem('storytelling_token');
    }

    // Get stored token
    getStoredToken() {
        return localStorage.getItem('storytelling_token');
    }

    // Get stored user
    getStoredUser() {
        const userData = localStorage.getItem('storytelling_user');
        return userData ? JSON.parse(userData) : null;
    }
}

export default new AuthService();