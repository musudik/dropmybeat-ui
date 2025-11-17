import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGuest } from '../../contexts/GuestContext'
import { authAPI } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { loginSchema } from '../../lib/validations'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login } = useAuth()
  const { setGuestSession } = useGuest()
  const navigate = useNavigate()
  const location = useLocation()
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [guestEmail, setGuestEmail] = useState('') // Already initialized correctly
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Test API connectivity on component mount
  useEffect(() => {
    const testAPIConnection = async () => {
      console.log('🧪 LoginPage: Testing API connection on component mount')
      console.log('🌍 LoginPage: Environment check:', {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        BASE_URL: import.meta.env.BASE_URL,
        allViteVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')).reduce((acc, key) => {
          acc[key] = import.meta.env[key];
          return acc;
        }, {})
      })
      
      try {
        const result = await authAPI.testConnection()
        console.log('✅ LoginPage: API connection test successful:', result)
      } catch (error) {
        console.error('🔴 LoginPage: API connection test failed:', error)
        toast.error('Warning: Cannot connect to API server. Please check your network.')
      }
    }

    testAPIConnection()
  }, [])

  const onSubmit = async (data) => {
    console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('🔧 Development Mode:', import.meta.env.DEV)
    
    try {
      console.log('📡 Calling login API...')
      const result = await login(data)
      
      
      if (result.success) {
        console.log('🎉 Login successful, navigating...')
        toast.success('Login successful!')
        const from = location.state?.from?.pathname || '/dashboard'
        console.log('🧭 Redirecting to:', from)
        navigate(from)
      } else {
        console.error('❌ Login failed:', result.error)
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('💥 Login exception caught:', error)
      console.error('📊 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      })
      toast.error('An unexpected error occurred')
    }
  }

  const handleGuestLogin = async (e) => {
    e.preventDefault()
    
    if (!guestEmail.trim()) {
      toast.error('Please enter your email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setIsGuestSubmitting(true)
      
      // Call backend guest login API with required fields
      const response = await authAPI.guestLogin({
        email: guestEmail,
        role: 'Guest' // Required by backend API
      })
      
      // Extract token and user data from response
      const { token, user: guestUser } = response.data.data
      
      // Store guest token in localStorage for API authentication
      localStorage.setItem('guestToken', token)
      
      // Create guest session with backend user data and token
      const guestData = {
        ...guestUser,
        sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Pass token to setGuestSession
      setGuestSession(guestData, null, token)
      toast.success('Logged in as guest!')
      
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/events'
      navigate(from)
      
    } catch (error) {
      console.error('Guest login error:', error)
      toast.error(error.response?.data?.message || 'Failed to login as guest')
    } finally {
      setIsGuestSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neon-pink">
            {isGuestMode ? 'Continue as Guest' : 'Sign In'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isGuestMode ? 'Enter your email to continue' : 'Welcome back to DropMyBeats'}
          </p>
        </div>
        
        {!isGuestMode ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">or</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setIsGuestMode(true)}
              >
                Continue as Guest
              </Button>
              
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-neon-pink hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleGuestLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={guestEmail || ''} // Ensure it's never undefined
                  onChange={(e) => setGuestEmail(e.target.value || '')}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  No password required for guest access
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isGuestSubmitting}
              >
                {isGuestSubmitting ? 'Continuing...' : 'Continue as Guest'}
              </Button>
            </form>
            
            <div className="text-center">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-neon-pink hover:underline"
                onClick={() => setIsGuestMode(false)}
              >
                ← Back to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage