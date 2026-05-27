import axios from 'axios';

const api = axios.create({
  // Automatically uses localhost during `npm run dev` for local testing
  // Automatically switches to Render URL when built for production
  baseURL: import.meta.env.PROD 
    ? 'https://laxmi-health-clinic.onrender.com/api' 
    : 'http://localhost:5000/api'
});

// Production: Inject Token Intercept
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Production: Handle 401 Unauthorized Globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Logging out.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Forcing a hard refresh to bounce user to Login screen securely
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
