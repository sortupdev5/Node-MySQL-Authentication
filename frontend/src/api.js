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
            !originalRequest._retry
        ) {
            console.log("Access token expired or missing. Attempting silent refresh...");
            originalRequest._retry = true;

            try {
                // Call refresh endpoint to get a new accessToken cookie
                const refreshResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    withCredentials: true,
                });
                console.log("Token refreshed successfully:", refreshResponse.data.message);

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (e.g., refreshToken also expired), redirect to login
                console.error("Refresh failed or session expired. Redirecting to login...", refreshError.response?.data || refreshError.message);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
