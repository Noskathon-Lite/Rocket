import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1", // Your API base URL
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            "/auth/refresh-token", // Endpoint for refresh token
            { refresh_token: refreshToken }
          );
          const newAccessToken = refreshResponse.data.access_token;

          // Store the new access token
          localStorage.setItem("access_token", newAccessToken);

          // Update the original request with the new token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return apiClient(error.config);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          localStorage.clear();
          window.location.href = "/login"; // Redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
