import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          setUser(response.data.data.user || response.data.data)
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    console.log('🔐 AuthContext: Starting login process')
    console.log('📧 AuthContext: Credentials received:', { 
      email: credentials.email, 
      passwordProvided: !!credentials.password 
    })
    
    try {
      console.log('🌐 AuthContext: Making API call to login endpoint')
      const response = await authAPI.login(credentials)
      
      console.log('📡 AuthContext: Raw API response:', response)
      console.log('📦 AuthContext: Response status:', response.status)
      console.log('📦 AuthContext: Response headers:', response.headers)
      console.log('💾 AuthContext: Response data structure:', {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        dataStructure: response.data
      })
      
      if (response.data?.data) {
        const { token, user: userData } = response.data.data
        
        console.log('🎟️ AuthContext: Token received:', { 
          tokenExists: !!token, 
          tokenLength: token?.length,
          tokenPrefix: token?.substring(0, 20) + '...'
        })
        console.log('👤 AuthContext: User data received:', userData)
        
        if (token && userData) {
          localStorage.setItem('token', token)
          setUser(userData)
          setIsAuthenticated(true)
          
          console.log('✅ AuthContext: Login successful, user authenticated')
          return { success: true }
        } else {
          console.error('❌ AuthContext: Missing token or user data in response')
          return { success: false, error: 'Invalid response format from server' }
        }
      } else {
        console.error('❌ AuthContext: Invalid response structure:', response.data)
        return { success: false, error: 'Invalid response format from server' }
      }
    } catch (error) {
      console.error('💥 AuthContext: Login error caught:', error)
      console.error('📊 AuthContext: Error analysis:', {
        isAxiosError: error.isAxiosError,
        hasResponse: !!error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
          data: error.config?.data
        },
        networkError: !error.response,
        message: error.message,
        stack: error.stack
      })
      
      const errorMessage = error.response?.data?.message || 'Login failed'
      console.error('🔴 AuthContext: Returning error:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { token, user: newUser } = response.data.data
      
      localStorage.setItem('token', token)
      setUser(newUser)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      setUser(response.data.data.user || response.data.data)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed'
      return { success: false, error: errorMessage }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}