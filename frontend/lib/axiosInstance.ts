/**
 * Axios Instance Configuration
 * Centralized HTTP client with authentication and error handling
 */

import axios from "axios";
import { BASE_URL } from "./apiPaths";

/**
 * Create axios instance with default configuration
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Get token from localStorage (Zustand persisted store or direct storage)
 * Checks both Zustand auth-storage and direct token storage for backward compatibility
 */
const getToken = (): string | null => {
  // First try to get from direct localStorage (backward compatibility)
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }
  
  // Then try to get from Zustand persisted store
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error parsing auth storage:", error);
  }
  
  return null;
};

/**
 * Request Interceptor
 * Automatically attaches JWT token to all requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = getToken();
    
    // Check if this is a public route that doesn't require authentication
    const isPublicRoute = config.url?.includes('/admin-public') || 
                          config.url?.includes('/public') ||
                          config.url?.includes('/auth/') ||
                          config.url?.includes('/otp/');
    
    // Debug logging (reduced for public routes)
    if (!isPublicRoute) {
      console.log('[axiosInstance] Request to:', config.url);
      console.log('[axiosInstance] Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (!isPublicRoute) {
        console.log('[axiosInstance] Authorization header set');
      }
    } else if (!isPublicRoute) {
      console.warn('[axiosInstance] NO TOKEN - Request will be unauthorized');
    }
    
    // Don't override Content-Type if it's already set (e.g., for multipart/form-data)
    // Axios will automatically set the correct Content-Type for FormData
    if (config.data instanceof FormData && config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common error scenarios
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const isPublicRoute = error.config?.url?.includes('/admin-public') || 
                            error.config?.url?.includes('/public') ||
                            error.config?.url?.includes('/auth/') ||
                            error.config?.url?.includes('/otp/');
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          // Don't log for public routes as they may not require auth
          if (!isPublicRoute) {
            console.error("Unauthorized access - please login again");
          }
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          console.error("Access forbidden:", error.response.data);
          break;
          
        case 404:
          // Not found
          console.error("Resource not found:", error.response.data);
          break;
          
        case 500:
          // Server error
          console.error("Server error:", error.response.data);
          alert("An unexpected error occurred. Please try again later.");
          break;
          
        default:
          console.error("API error:", error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      // Request timeout
      console.error("Request timeout:", error.message);
      alert("Request timed out. Please check your connection and try again.");
    } else if (error.request) {
      // Request made but no response received
      console.error("No response from server:", error.request);
      alert("Unable to connect to server. Please check your connection.");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
