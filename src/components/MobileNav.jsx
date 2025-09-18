import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { useRealTime } from '../contexts/RealTimeContext'
import { 
  Home, 
  Calendar, 
  Music, 
  Settings, 
  User, 
  Menu, 
  X,
  Bell,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react'

const MobileNav = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount } = useRealTime()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/participant/join', icon: Music, label: 'Join Events' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  const adminItems = [
    { path: '/admin/dashboard', icon: Settings, label: 'Admin' }
  ]

  const managerItems = [
    { path: '/manager/events', icon: Calendar, label: 'Manage Events' }
  ]

  const isActive = (path) => location.pathname === path

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  }

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  }

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1
      }
    })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative p-2"
        >
          <Menu className="h-6 w-6" />
          {isAuthenticated && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Slide-out Menu */}
            <motion.div
              className="fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 md:hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
                    <img 
                      src="/DropMyBeats.gif" 
                      alt="DropMyBeats Logo" 
                      className="h-8 w-auto"
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6">
                  {isAuthenticated ? (
                    <nav className="space-y-2 px-4">
                      {/* Main Navigation */}
                      <div className="space-y-1">
                        {navItems.map((item, index) => {
                          const Icon = item.icon
                          return (
                            <motion.div
                              key={item.path}
                              variants={itemVariants}
                              initial="closed"
                              animate="open"
                              custom={index}
                            >
                              <Link
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                  isActive(item.path)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Role-specific Navigation */}
                      {user?.role === 'Admin' && (
                        <div className="pt-4 border-t border-border">
                          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Admin
                          </p>
                          {adminItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                              <motion.div
                                key={item.path}
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                                custom={navItems.length + index}
                              >
                                <Link
                                  to={item.path}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive(item.path)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span className="font-medium">{item.label}</span>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}

                      {user?.role === 'Manager' && (
                        <div className="pt-4 border-t border-border">
                          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Manager
                          </p>
                          {managerItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                              <motion.div
                                key={item.path}
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                                custom={navItems.length + index}
                              >
                                <Link
                                  to={item.path}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive(item.path)
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <Icon className="h-5 w-5" />
                                  <span className="font-medium">{item.label}</span>
                                </Link>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </nav>
                  ) : (
                    <div className="px-4 space-y-4">
                      <p className="text-center text-muted-foreground mb-6">
                        Please sign in to access the app
                      </p>
                      <Button
                        onClick={() => {
                          navigate('/auth/login')
                          setIsOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        <LogIn className="h-5 w-5 mr-3" />
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/auth/register')
                          setIsOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        <UserPlus className="h-5 w-5 mr-3" />
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {isAuthenticated && (
                  <div className="p-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileNav