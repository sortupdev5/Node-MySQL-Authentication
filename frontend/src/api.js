import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and (token is expired OR token is missing)
        if (
            error.response &&
            error.response.status === 401 &&
            (error.response.data.message === "Access token expired" || error.response.data.message === "No Token Provided") &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;

            try {
                // Silent refresh call
                await api.get('/auth/refresh');

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Session expired. Please log in again.");
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
