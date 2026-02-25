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

        // If error is 401 and message is "Access token expired" and we haven't retried yet
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.message === "Access token expired" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint to get a new accessToken cookie
                await axios.get(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    withCredentials: true,
                });

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (e.g., refreshToken also expired), redirect to login
                console.error("Session expired. Please log in again.");
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
