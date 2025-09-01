import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useRealTimeNotifications } from '../hooks/useRealTime'
import { toast } from 'react-hot-toast'

const RealTimeContext = createContext()

export const useRealTime = () => {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}

export const RealTimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [eventUpdates, setEventUpdates] = useState([])
  const [songRequestUpdates, setSongRequestUpdates] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications } = useRealTimeNotifications()

  // Mock data for development (since no backend is running)
  const mockEvents = [
    {
      id: 1,
      title: 'Summer Music Festival',
      description: 'Join us for an amazing summer music experience',
      date: '2024-07-15',
      time: '18:00',
      location: 'Central Park',
      status: 'active',
      createdBy: 'manager1'
    },
    {
      id: 2,
      title: 'Jazz Night',
      description: 'Smooth jazz evening with local artists',
      date: '2024-07-20',
      time: '20:00',
      location: 'Blue Note Club',
      status: 'active',
      createdBy: 'manager2'
    }
  ]

  const mockSongRequests = [
    {
      id: 1,
      eventId: 1,
      songTitle: 'Bohemian Rhapsody',
      artist: 'Queen',
      requestedBy: 'user1',
      status: 'pending',
      likes: 5,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      eventId: 1,
      songTitle: 'Hotel California',
      artist: 'Eagles',
      requestedBy: 'user2',
      status: 'approved',
      likes: 8,
      timestamp: new Date().toISOString()
    }
  ]

  // Simulate connection status
  useEffect(() => {
    if (isAuthenticated) {
      setIsConnected(true)
      // Show a one-time notification about demo mode
      const hasShownDemoNotice = localStorage.getItem('demo_mode_notice_shown')
      if (!hasShownDemoNotice) {
        toast.success('Demo mode active - using mock data')
        localStorage.setItem('demo_mode_notice_shown', 'true')
      }
      
      // Load mock data
      setEventUpdates(mockEvents)
      setSongRequestUpdates(mockSongRequests)
      
      // Simulate some online users
      setOnlineUsers([
        { id: 'user1', name: 'John Doe', status: 'online' },
        { id: 'user2', name: 'Jane Smith', status: 'online' },
        { id: 'user3', name: 'Mike Johnson', status: 'away' }
      ])
    } else {
      setIsConnected(false)
      setEventUpdates([])
      setSongRequestUpdates([])
      setOnlineUsers([])
    }
  }, [isAuthenticated])

  // Simulate periodic updates
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      // Simulate random notifications
      if (Math.random() > 0.8) {
        const notifications = [
          {
            id: Date.now(),
            type: 'info',
            title: 'New Song Request',
            message: 'Someone requested \"Imagine\" by John Lennon',
            timestamp: new Date().toISOString()
          },
          {
            id: Date.now() + 1,
            type: 'success',
            title: 'Event Update',
            message: 'Summer Music Festival has been updated',
            timestamp: new Date().toISOString()
          }
        ]
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        addNotification(randomNotification)
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, addNotification])

  const sendMessage = (message) => {
    // Simulate sending message
    console.log('Demo mode: Message would be sent:', message)
    toast.success('Message sent (demo mode)')
  }

  const joinEvent = (eventId) => {
    // Simulate joining event
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Event Joined',
      message: `Successfully joined event ${eventId}`,
      timestamp: new Date().toISOString()
    })
    toast.success(`Joined event ${eventId}`)
  }

  const leaveEvent = (eventId) => {
    // Simulate leaving event
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Event Left',
      message: `Left event ${eventId}`,
      timestamp: new Date().toISOString()
    })
    toast.info(`Left event ${eventId}`)
  }

  const value = {
    // Connection status
    isConnected,
    connectionStatus: isConnected ? 'Connected (Demo Mode)' : 'Disconnected',
    
    // Data
    eventUpdates,
    songRequestUpdates,
    onlineUsers,
    
    // Notifications
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    
    // Actions
    sendMessage,
    joinEvent,
    leaveEvent,
    
    // Loading states
    isLoading
  }

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  )
}