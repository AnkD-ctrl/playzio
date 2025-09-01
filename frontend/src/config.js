// Configuration API - Auto-detect environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://playzio-production.up.railway.app')
