import axios from 'axios'
import toast from 'react-hot-toast'

// Use '/api' to leverage Vite's proxy in development
const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'https://dropmybeat-api.replit.app')

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
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
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
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  guestLogin: (guestData) => api.post('/auth/guest-login', guestData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
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
  getQueue: (eventId) => api.get(`/events/${eventId}/song-requests/queue`),
  getStats: (eventId) => api.get(`/events/${eventId}/song-requests/stats`),
}

// Health Check API
export const healthAPI = {
  check: () => axios.get('https://dropmybeat-api.replit.app'), // Direct call without /api prefix
}

export default api