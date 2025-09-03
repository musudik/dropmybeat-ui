import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGuest } from '../contexts/GuestContext'
import { Button } from './ui/Button'

const GuestNavigation = () => {
  const { guestData, clearGuestSession } = useGuest()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    clearGuestSession()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/events" className="flex items-center">
              <img 
                src="/src/assets/DropMyBeats.gif" 
                alt="DropMyBeats Logo" 
                className="h-10 w-auto"
              />
            </Link>
            
            <div className="ml-10 flex items-baseline space-x-4">
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
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {guestData?.email || 'Guest'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default GuestNavigation