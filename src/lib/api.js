import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dropmybeat-api.replit.app'

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
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/updateprofile', profileData),
  changePassword: (passwordData) => api.put('/auth/changepassword', passwordData),
  logout: () => api.post('/auth/logout'),
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
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  join: (id) => api.post(`/events/${id}/join`),
  leave: (id) => api.post(`/events/${id}/leave`),
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