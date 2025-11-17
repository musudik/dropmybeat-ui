import axios from 'axios'
import toast from 'react-hot-toast'

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Use proxy in development
  : (import.meta.env.VITE_API_BASE_URL || 'https://dropmybeat-api.replit.app/api')

console.log('🌐 API Configuration:', {
  ENV_VAR: import.meta.env.VITE_API_BASE_URL,
  FINAL_URL: API_BASE_URL,
  IS_DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  ALL_ENV_VARS: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')).reduce((acc, key) => {
    acc[key] = import.meta.env[key];
    return acc;
  }, {})
})

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request interceptor:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    })
    
    // Add auth token if available (regular user)
    const token = localStorage.getItem('token')
    // Add guest token if available (guest user)
    const guestToken = localStorage.getItem('guestToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 API: Added user token to request')
    } else if (guestToken) {
      config.headers.Authorization = `Bearer ${guestToken}`
      console.log('🔑 API: Added guest token to request')
    } else {
      console.log('⚠️ API: No token found in localStorage')
    }
    
    return config
  },
  (error) => {
    console.error('💥 API Request interceptor error:', error)
    return Promise.reject(error)
  }
)
// Add request cache
const requestCache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

// Add caching interceptor
api.interceptors.request.use(
  (config) => {
    // Temporarily disable caching to fix adapter issue
    // TODO: Re-implement caching with proper adapter handling
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response interceptor - Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config?.url,
      method: response.config?.method?.toUpperCase(),
      data: response.data,
      headers: response.headers
    })
    return response
  },
  (error) => {
    console.error('❌ API Response interceptor - Error:', {
      isAxiosError: error.isAxiosError,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestHeaders: error.config?.headers,
      baseURL: error.config?.baseURL,
      networkError: !error.response
    })
    
    const message = error.response?.data?.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      console.log('🔒 API: 401 Unauthorized - Clearing tokens and redirecting')
      // Clear both regular and guest tokens on 401
      localStorage.removeItem('token')
      localStorage.removeItem('guestToken')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      console.log('🚫 API: 403 Forbidden')
      toast.error('You do not have permission to perform this action.')
    } else {
      console.log('⚠️ API: Other error occurred:', message)
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    console.log('🔐 authAPI.login called with:', { 
      email: credentials.email, 
      passwordLength: credentials.password?.length 
    })
    return api.post('/auth/login', credentials)
  },
  guestLogin: (guestData) => api.post('/auth/guest-login', guestData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
  // Test API connectivity
  testConnection: () => {
    console.log('🧪 Testing API connectivity to:', API_BASE_URL)
    // Health endpoint is at /health, not /api/health
    const healthUrl = API_BASE_URL.includes('/api') ? 
      API_BASE_URL.replace('/api', '/health') : 
      `${API_BASE_URL}/health`
    
    return axios.get(healthUrl).then(response => {
      console.log('✅ API health check successful:')
      return { status: 'healthy', data: response.data }
    }).catch(error => {
      console.error('🔴 API health check failed:', error)
      // Try the root API endpoint
      return axios.get(API_BASE_URL.replace('/api', '')).then(response => {
        console.log('✅ Base URL accessible:', response.status)
        return { status: 'base_accessible', data: response.data }
      }).catch(baseError => {
        console.error('🔴 Base URL also not accessible:', baseError)
        throw baseError
      })
    })
  }
}

// Role-based Dashboard APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getManagers: () => api.get('/admin/managers'),
  getAnalytics: () => api.get('/admin/analytics'),
}

export const managerAPI = {
  getDashboard: () => api.get('/manager/dashboard'),
  getEvents: () => api.get('/manager/events'),
  getEventAnalytics: (eventId) => api.get(`/manager/events/${eventId}/analytics`),
}

export const memberAPI = {
  getDashboard: () => api.get('/member/dashboard'),
  getEvents: () => api.get('/member/events'),
  getSongRequests: () => api.get('/member/song-requests'),
}

export const guestAPI = {
  getDashboard: () => api.get('/guest/dashboard'),
  getEvents: () => api.get('/guest/events'),
  getSongRequests: () => api.get('/guest/song-requests'),
}

// Person Management API (Admin only)
export const personAPI = {
  getAll: (params = {}) => api.get('/persons', { params }),
  getById: (id) => api.get(`/persons/${id}`),
  create: (personData) => api.post('/persons', personData),
  update: (id, personData) => api.put(`/persons/${id}`, personData),
  delete: (id) => api.delete(`/persons/${id}`),
}

// Event Management API
export const eventAPI = {
  getAll: () => api.get('/events'),
  allEvents: () => api.get('/allEvents'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  activate: (id) => api.put(`/events/${id}/activate`),
  deactivate: (id) => api.put(`/events/${id}/deactivate`),
  join: (id, userData) => api.post(`/events/${id}/join`, userData),
  leave: (id) => api.post(`/events/${id}/leave`),
  getMembers: (id) => api.get(`/events/${id}/Members`),
  getGuestMembers: (id) => api.get(`/events/${id}/guest-Members`),
  joinPublic: (id, userData) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.post(`/events/${id}/join-guest`, userData);
  },
  getPublic: (id) => {
    // Use the regular endpoint since there's no separate public endpoint yet
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Public API URL:', `${API_BASE_URL}/events/${id}`)
    return publicApi.get(`/events/${id}`);
  },
  getGuestParticipants: (id) => api.get(`/events/${id}/guest-participants`),
  
  // Image upload endpoints
  uploadLogo: (id, formData) => {
    return api.post(`/events/${id}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  uploadBanner: (id, formData) => {
    return api.post(`/events/${id}/upload-banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getLogo: (id) => api.get(`/events/${id}/logo`, { responseType: 'blob' }),
  getBanner: (id) => api.get(`/events/${id}/banner`, { responseType: 'blob' }),
  deleteLogo: (id) => api.delete(`/events/${id}/logo`),
  deleteBanner: (id) => api.delete(`/events/${id}/banner`),
  
  // Keep the existing uploadImage method for backward compatibility
  uploadImage: (id, formData) => {
    return api.post(`/events/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Event Feedback API
export const feedbackAPI = {
  // Get all approved feedback for an event (public)
  getAll: (eventId, params = {}) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get(`/events/${eventId}/feedback`, { params });
  },
  
  // Submit new feedback (public)
  submit: (eventId, feedbackData) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.post(`/events/${eventId}/feedback`, feedbackData);
  },
  
  // Get feedback statistics (public)
  getStats: (eventId) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get(`/events/${eventId}/feedback/stats`);
  },
  
  // Get single feedback (public)
  getById: (eventId, feedbackId) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get(`/events/${eventId}/feedback/${feedbackId}`);
  },
  
  // Approve feedback (Admin/Manager only)
  approve: (eventId, feedbackId) => api.put(`/events/${eventId}/feedback/${feedbackId}/approve`),
  
  // Delete feedback (Admin/Manager only)
  delete: (eventId, feedbackId) => api.delete(`/events/${eventId}/feedback/${feedbackId}`),
  
  // Get all feedback including pending (Admin/Manager only)
  getAllForModeration: (eventId, params = {}) => api.get(`/events/${eventId}/feedback/moderation`, { params }),
}

// Song Request API
export const songRequestAPI = {
  getEventRequests: (eventId, params = {}) => api.get(`/events/${eventId}/song-requests`, { params }),
  getById: (eventId, requestId) => api.get(`/events/${eventId}/song-requests/${requestId}`),
  create: (eventId, requestData) => api.post(`/events/${eventId}/song-requests`, requestData),
  update: (eventId, requestId, requestData) => api.put(`/events/${eventId}/song-requests/${requestId}`, requestData),
  delete: (eventId, requestId) => api.delete(`/events/${eventId}/song-requests/${requestId}`),
  like: (eventId, requestId) => api.post(`/events/${eventId}/song-requests/${requestId}/like`),
  unlike: (eventId, requestId) => api.delete(`/events/${eventId}/song-requests/${requestId}/like`),
  approve: (eventId, requestId, approvalData) => api.post(`/events/${eventId}/song-requests/${requestId}/approve`, approvalData),
  reject: (eventId, requestId, rejectionData) => api.post(`/events/${eventId}/song-requests/${requestId}/reject`, rejectionData),
  markAsPlayed: (eventId, requestId) => api.post(`/events/${eventId}/song-requests/${requestId}/mark-played`),
  removeFromQueue: (eventId, requestId) => api.delete(`/events/${eventId}/song-requests/${requestId}/remove-queue`),
  getQueue: (eventId) => api.get(`/events/${eventId}/song-requests/queue`),
  getStats: (eventId) => api.get(`/events/${eventId}/song-requests/stats`),
  getUserRequestCount: (eventId, userId) => api.get(`/events/${eventId}/song-requests/user/${userId}/count`),
}

// Health Check API
export const healthAPI = {
  check: () => axios.get('https://dropmybeat-api.replit.app/health'), // Correct health endpoint
}

export default api