import React, { createContext, useContext, useState, useEffect } from 'react'

const GuestContext = createContext()

export const useGuest = () => {
  const context = useContext(GuestContext)
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider')
  }
  return context
}

export const GuestProvider = ({ children }) => {
  const [guestData, setGuestData] = useState(null)
  const [isGuest, setIsGuest] = useState(false)

  // Load guest data from localStorage on mount
  useEffect(() => {
    const savedGuestData = localStorage.getItem('guestSession')
    if (savedGuestData) {
      try {
        const parsedData = JSON.parse(savedGuestData)
        setGuestData(parsedData)
        setIsGuest(true)
      } catch (error) {
        console.error('Error parsing guest session data:', error)
        localStorage.removeItem('guestSession')
      }
    }
  }, [])

  const setGuestSession = (userData, eventId, token) => {
    const guestSessionData = {
      ...userData,
      eventId,
      joinedAt: new Date().toISOString(),
      sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    setGuestData(guestSessionData)
    setIsGuest(true)
    localStorage.setItem('guestSession', JSON.stringify(guestSessionData))
    
    // Store guest token if provided
    if (token) {
      localStorage.setItem('guestToken', token)
    }
  }

  const clearGuestSession = () => {
    setGuestData(null)
    setIsGuest(false)
    localStorage.removeItem('guestSession')
    localStorage.removeItem('guestToken') // Clear guest token
  }

  // Add method to check if guest token exists
  const hasGuestToken = () => {
    return !!localStorage.getItem('guestToken')
  }

  const updateGuestData = (updates) => {
    if (guestData) {
      const updatedData = { ...guestData, ...updates }
      setGuestData(updatedData)
      localStorage.setItem('guestSession', JSON.stringify(updatedData))
    }
  }

  const value = {
    guestData,
    isGuest,
    setGuestSession,
    clearGuestSession,
    updateGuestData,
    hasGuestToken
  }

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  )
}

export default GuestContext