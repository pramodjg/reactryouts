//services/apiService.js
import axios from "axios";
import authService from "./authService";

const API_BASE_URL ="http://localhost:5173/api/";

// Create axios instance with secure defaults
const apiService = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true, // Always include cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token from memory
apiService.interceptors.request.use(
    (config) => {
        const token = authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with secure refresh token handling
apiService.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (authService.isRefreshing) {
                // Queue request if refresh is in progress
                return new Promise((resolve, reject) => {
                    authService.addToQueue(resolve, reject);
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiService(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            authService.isRefreshing = true;

            try {
                const newToken = await authService.refreshToken();

                // Process queued requests
                authService.processQueue(null, newToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiService(originalRequest);
            } catch (refreshError) {
                // Refresh failed, process queue with error
                authService.processQueue(refreshError, null);

                // Clear tokens and redirect to login
                await authService.logout();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                authService.isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiService;