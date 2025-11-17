import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGDPR } from '../contexts/GDPRContext'
import { Button } from './ui/Button'
import NotificationCenter from './NotificationCenter'
import { useRealTime } from '../contexts/RealTimeContext'

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { openConsentManager } = useGDPR()
  const { isConnected } = useRealTime()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Check if current route is feedback page
  const isFeedbackPage = location.pathname.includes('/feedback')

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <img 
                src="/DropMyBeats.gif" 
                alt="DropMyBeats Logo" 
                className="h-10 w-auto"
              />
            </Link>
            
            {isAuthenticated && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link
                  to="/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/events')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Events
                </Link>
                
                {user?.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                
                {user?.role === 'Manager' && (
                  <Link
                    to="/manager/events"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/manager')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Manage Events
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName} {user?.lastName}
                </span>
                
                {/* Privacy Settings Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground p-2 rounded-md"
                    title="Privacy Settings"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.5V11.5C15.4,11.5 16,12.4 16,13V16C16,17 15.4,17.5 14.8,17.5H9.2C8.6,17.5 8,17 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10.5C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10.5V11.5H13.5V10.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
                    </svg>
                  </button>
                  
                  {showPrivacyDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          openConsentManager()
                          setShowPrivacyDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cookie Settings
                      </button>
                      <Link
                        to="/data-rights"
                        onClick={() => setShowPrivacyDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Data Rights (GDPR)
                      </Link>
                      <Link
                        to="/privacy-policy"
                        onClick={() => setShowPrivacyDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        to="/cookie-policy"
                        onClick={() => setShowPrivacyDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cookie Policy
                      </Link>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
                
                {/* Connection Status Indicator */}
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} title={isConnected ? 'Connected' : 'Disconnected'} />
                
                {/* Notification Center */}
                <NotificationCenter />
              </>
            ) : (
              // Hide login/signup buttons on feedback pages
              !isFeedbackPage && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation