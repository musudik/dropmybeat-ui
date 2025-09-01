import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'

// Custom hook for polling-based real-time updates
export const usePolling = (fetchFunction, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
        console.error('Polling error:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetchFunction, ...dependencies])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    
    fetchData() // Initial fetch
    intervalRef.current = setInterval(fetchData, interval)
  }, [fetchData, interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    startPolling()

    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [startPolling, stopPolling])

  return { data, loading, error, refetch: fetchData, startPolling, stopPolling }
}

// WebSocket hook for real-time updates
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null)
  const [lastMessage, setLastMessage] = useState(null)
  const [readyState, setReadyState] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('Connecting')
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = options.maxReconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        setReadyState(1)
        setConnectionStatus('Connected')
        reconnectAttemptsRef.current = 0
        toast.success('Real-time connection established')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          options.onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        setReadyState(3)
        setConnectionStatus('Disconnected')
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          setConnectionStatus(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          setConnectionStatus('Connection failed')
          toast.error('Real-time connection lost')
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('Error')
      }
      
      setSocket(ws)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('Error')
    }
  }, [url, options, maxReconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socket) {
      socket.close()
    }
  }, [socket])

  const sendMessage = useCallback((message) => {
    if (socket && readyState === 1) {
      socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [socket, readyState])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    socket,
    lastMessage,
    readyState,
    connectionStatus,
    sendMessage,
    connect,
    disconnect
  }
}

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
    setUnreadCount(prev => prev + 1)
    
    // Show toast for important notifications
    if (notification.type === 'urgent' || notification.type === 'event_update') {
      toast(notification.message, {
        icon: notification.type === 'urgent' ? '🚨' : '📢',
        duration: 5000
      })
    }
  }, [])

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}