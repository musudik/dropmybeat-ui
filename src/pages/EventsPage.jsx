import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Music, Plus, Edit, Trash2, Search, QrCode, Copy, X, Power } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button } from '../components/ui/button'
import { Badge, Badge1 } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectItem } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useGuest } from '../contexts/GuestContext'
import { useNavigate } from 'react-router-dom'
import { eventAPI } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

const EventsPage = () => {
  const { user } = useAuth()
  const { guestData, isGuest } = useGuest()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [joinedEvents, setJoinedEvents] = useState(new Set())
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [qrEvent, setQrEvent] = useState(null)

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getAll(),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  })

  useEffect(() => {
    if (eventsData) {
      const events = eventsData.data || []
      setEvents(Array.isArray(events.data) ? events.data : [])
      
      // Handle joined events for authenticated users
      if (user && Array.isArray(events.data)) {
        const userJoinedEvents = events.data
          .filter(event => {
            // Check both participants array and user-specific fields
            return event.Members?.some(p => p.user === user.id || p._id === user.id) ||
                   event.joinedUsers?.includes(user.id)
          })
          .map(event => event.id)
        setJoinedEvents(new Set(userJoinedEvents))
      }
      
      // Handle joined events for guest users
      if (isGuest && guestData && Array.isArray(events.data)) {
        const guestJoinedEvents = events.data
          .filter(event => {
            return event.guestMembers?.some(guestMember => 
              guestMember.email === guestData.email
            )
          })
          .map(event => event.id)
        setJoinedEvents(new Set(guestJoinedEvents))
      }
    }
  }, [eventsData, user, isGuest, guestData])

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll()
      
      const eventsData = response.data || []
      setEvents(Array.isArray(eventsData.data) ? eventsData.data : [])
      
      // Handle joined events for authenticated users
      if (user && Array.isArray(eventsData.data)) {
        const userJoinedEvents = eventsData.data
          .filter(event => event.Members?.some(p => p.user === user.id))
          .map(event => event.id)
        setJoinedEvents(new Set(userJoinedEvents))
      }
      
      // Handle joined events for guest users
      if (isGuest && guestData && Array.isArray(eventsData.data)) {
        // For guests, check if they've joined any events by email
        const guestJoinedEvents = eventsData.data
          .filter(event => {
            // Check if guest has joined this event by checking guestMembers array
            return event.guestMembers?.some(guestMember => 
              guestMember.email === guestData.email
            )
          })
          .map(event => event.id)
        setJoinedEvents(new Set(guestJoinedEvents))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
      setEvents([])
    }
  }

  // Add navigation handler
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`)
  }

  // Add handler functions for activate/deactivate
  const handleActivateEvent = async (eventId) => {
    try {
      await eventAPI.activate(eventId)
      toast.success('Event activated successfully!')
      fetchEvents() // Refresh the events list
    } catch (error) {
      console.error('Error activating event:', error)
      toast.error(error.response?.data?.message || 'Failed to activate event')
    }
  }

  const handleDeactivateEvent = async (eventId) => {
    try {
      await eventAPI.deactivate(eventId)
      toast.success('Event deactivated successfully!')
      fetchEvents() // Refresh the events list
    } catch (error) {
      console.error('Error deactivating event:', error)
      toast.error(error.response?.data?.message || 'Failed to deactivate event')
    }
  }

  // Helper function to determine if event can be activated
  const canActivateEvent = (event) => {
    const status = event.status?.toLowerCase()
    return status !== 'active' && status !== 'completed' && status !== 'cancelled'
  }

  // Helper function to determine if event can be deactivated
  const canDeactivateEvent = (event) => {
    const status = event.status?.toLowerCase()
    return status === 'active'
  }

  const handleJoinEvent = async (eventId) => {
    try {
      if (isGuest && guestData) {
        // For guests, use the guest join endpoint
        await eventAPI.joinPublic(eventId, {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email
        })
      } else {
        // For authenticated users
        await eventAPI.join(eventId)
      }
      
      setJoinedEvents(prev => new Set([...prev, eventId]))
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          const currentMembers = event.MemberCount || 0
          const currentGuests = event.guestMemberCount || 0
          
          if (isGuest) {
            return {
              ...event,
              guestMemberCount: currentGuests + 1,
              totalMemberCount: currentMembers + currentGuests + 1
            }
          } else {
            return {
              ...event,
              MemberCount: currentMembers + 1,
              totalMemberCount: currentMembers + 1 + currentGuests
            }
          }
        }
        return event
      }))
      toast.success('Successfully joined the event!')
    } catch (error) {
      console.error('Error joining event:', error)
      toast.error(error.response?.data?.message || 'Failed to join event')
    }
  }

  const handleLeaveEvent = async (eventId) => {
    try {
      await eventAPI.leave(eventId)
      setJoinedEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          const currentMembers = event.MemberCount || 0
          const currentGuests = event.guestMemberCount || 0
          
          if (isGuest) {
            return {
              ...event,
              guestMemberCount: Math.max(currentGuests - 1, 0),
              totalMemberCount: Math.max(currentMembers + currentGuests - 1, 0)
            }
          } else {
            return {
              ...event,
              MemberCount: Math.max(currentMembers - 1, 0),
              totalMemberCount: Math.max(currentMembers - 1 + currentGuests, 0)
            }
          }
        }
        return event
      }))
      toast.success('Left the event successfully')
    } catch (error) {
      console.error('Error leaving event:', error)
      toast.error(error.response?.data?.message || 'Failed to leave event')
    }
  }

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await eventAPI.update(eventId, { status: newStatus })
      toast.success(`Event status updated to ${newStatus}!`)
      setIsEditModalOpen(false)
      fetchEvents()
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error(error.response?.data?.message || 'Failed to update event status')
    }
  }

  const closePopup = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedEvent(null)
  }

  const handleShowQR = (event) => {
    setQrEvent(event)
    setIsQRModalOpen(true)
  }

  const handleCopyJoinLink = (eventId) => {
    const joinLink = `${window.location.origin}/join/${eventId}`
    navigator.clipboard.writeText(joinLink)
    toast.success('Join link copied to clipboard!')
  }

  const handleCreateEvent = async (eventData) => {
    try {
      // Create event data with exact fields as specified
      const eventDataWithCreator = {
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        isPublic: eventData.isPublic,
        allowSongRequests: eventData.allowSongRequests,
        timeBombEnabled: eventData.timeBombEnabled,
        timeBombDuration: eventData.timeBombDuration,
        Venue: eventData.Venue,
        'venue.name': eventData['venue.name'],
        'venue.address': eventData['venue.address'],
        'venue.city': eventData['venue.city'],
        eventType: eventData.eventType,
        createdBy: user?.id
      }
      
      await eventAPI.create(eventDataWithCreator)
      toast.success('Event created successfully!')
      setIsCreateModalOpen(false)
      fetchEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.message || 'Failed to create event')
    }
  }
  
  const handleUpdateEvent = async (eventData) => {
    try {
      await eventAPI.update(selectedEvent.id, eventData)
      toast.success('Event updated successfully!')
      setIsEditModalOpen(false)
      fetchEvents()
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.response?.data?.message || 'Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventAPI.delete(eventId)
        toast.success('Event deleted successfully!')
        fetchEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
        toast.error(error.response?.data?.message || 'Failed to delete event')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return { day: '??', month: '???' }
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || event.eventType === filterType
    
    return matchesSearch && matchesFilter
  }) : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-oswald text-2xl">LOADING EVENTS...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-roboto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Guest Welcome Message */}
            {isGuest && guestData && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  Welcome, {guestData.firstName || 'Guest'}! You're browsing events as a guest.
                </p>
              </div>
            )}
            
            {/* Existing header content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">EVENT MANAGEMENT</h1>
              </div>

            
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-roboto">
              Discover amazing music events, concerts, and performances
            </p>
          </motion.div>

            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto"
            >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search events, venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 pl-10 h-12 font-roboto"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Birthday">Birthday</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Club">Club</SelectItem>
              <SelectItem value="Festival">Festival</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </Select>
            {/* Hide Add Event button for guests */}
            {!isGuest && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="neon-button"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </Button>
            )}
          </motion.div>
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-oswald text-2xl">CREATE NEW EVENT</DialogTitle>
          </DialogHeader>
          <EventForm 
            onSubmit={handleCreateEvent} 
            closePopup={closePopup}
          />
        </DialogContent>
      </Dialog>

      {/* Events Table */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
            <h2 className="font-oswald text-2xl font-bold text-white tracking-wider">UPCOMING EVENTS</h2>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-800">
            <AnimatePresence>
              {filteredEvents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-roboto text-lg">No events found</p>
                </div>
              ) : (
                filteredEvents.map((event, index) => {
                  const dateInfo = formatDate(event.startDate)
                  
                  // Check if user/guest has joined this event
                  let isJoined = false
                  
                  if (user) {
                    // For authenticated users, check the joinedEvents set and also check participants array
                    isJoined = joinedEvents.has(event.id) || 
                              event.Members?.some(p => p.user === user.id || p._id === user.id) ||
                              event.joinedUsers?.includes(user.id)
                  } else if (isGuest && guestData) {
                    // For guest users, check if their email is in the guestMembers array
                    isJoined = joinedEvents.has(event.id) ||
                              event.guestMembers?.some(guestMember => 
                                guestMember.email === guestData.email
                              )
                  }
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`group hover:bg-gray-800/50 transition-all duration-300 cursor-pointer ${
                        event.status?.toLowerCase() === 'active' 
                          ? 'neon-wave-animation relative overflow-hidden' 
                          : ''
                      }`}
                      onClick={() => handleEventClick(event.id)}
                    >
                      {/* Add neon wave overlay for active events */}
                      {event.status?.toLowerCase() === 'active' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="neon-wave-overlay"></div>
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center px-4 md:px-6 py-6 gap-4 md:gap-0 relative z-10">
                        {/* Mobile: Event Header */}
                        <div className="flex items-start gap-4 md:hidden">
                          {/* Date Column - Mobile */}
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-3 text-white">
                              <div className="font-oswald text-xl font-bold leading-none">
                                {dateInfo.day}
                              </div>
                              <div className="font-oswald text-xs font-medium mt-1 opacity-90">
                                {dateInfo.month}
                              </div>
                            </div>
                          </div>
                          
                          {/* Event Title and Badge - Mobile */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-oswald text-lg font-bold text-white tracking-wide group-hover:text-purple-400 transition-colors">
                                {event.title || event.name}
                              </h3>
                              <Badge1 
                                variant="outline" 
                                className="bg-purple-600/20 border-purple-500/50 text-purple-300 font-oswald font-medium tracking-wide text-xs ml-2"
                              >
                                {event.eventType?.toUpperCase() || 'EVENT'}
                              </Badge1>
                            </div>
                          </div>
                        </div>

                        {/* Desktop: Date Column */}
                        <div className="hidden md:flex flex-shrink-0 w-20 text-center">
                          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-3 text-white">
                            <div className="font-oswald text-2xl font-bold leading-none">
                              {dateInfo.day}
                            </div>
                            <div className="font-oswald text-xs font-medium mt-1 opacity-90">
                              {dateInfo.month}
                            </div>
                          </div>
                        </div>

                        {/* Event Info Column */}
                        <div className="flex-1 md:ml-6">
                          {/* Desktop Title */}
                          <div className="hidden md:flex items-start justify-between">
                            <div className="flex-1">
                                  <Badge variant="outline" 
                                        > <h2 className="font-oswald text-3xl font-bold text-white tracking-wide group-hover:text-purple-400 transition-colors">
                                          {event.title || event.name}
                                        </h2>
                                  </Badge>
                                  &nbsp;
                                  <Badge1 variant="neon" className="bg-blue-600/20 border-blue-500/50 text-blue-300 font-oswald font-medium tracking-wide text-xs">
                                    <h5 className="font-oswald text-xl font-bold text-white  tracking-wide group-hover:text-purple-400 transition-colors">
                                      {event.eventType?.toUpperCase() || 'EVENT'}
                                    </h5>
                                  </Badge1>
                              <p className="text-gray-400 font-roboto text-sm mb-2 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-purple-400" />
                                  <span className="font-roboto">{event.venue?.name || 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                  <span className="font-roboto">{formatTime(event.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-purple-400" />
                                  <span className="font-roboto">
                                    {event.totalMemberCount || ((event.MemberCount || 0) + (event.guestMemberCount || 0))}/{event.maxParticipants || '∞'}
                                    <span className="text-xs text-gray-400 ml-1">
                                      ({event.MemberCount || 0} members + {event.guestMemberCount || 0} guests)
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            
                          </div>

                          {/* Mobile Description and Details */}
                          <div className="md:hidden">
                            <p className="text-gray-400 font-roboto text-sm mb-3 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-300 mb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <span className="font-roboto">{event.venue?.name || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <span className="font-roboto">{formatTime(event.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <span className="font-roboto">
                                  {event.totalMemberCount || ((event.MemberCount || 0) + (event.guestMemberCount || 0))}/{event.maxParticipants || '∞'} participants
                                  <span className="text-xs text-gray-400 block">
                                    {event.MemberCount || 0} members + {event.guestMemberCount || 0} guests
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          {/* QR Code Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent row click
                              handleShowQR(event)
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>

                          {/* Copy Link Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent row click
                              handleCopyJoinLink(event.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          {/* Join/Leave Button */}
                          {(user || isGuest) && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click
                                isJoined ? handleLeaveEvent(event.id) : handleJoinEvent(event.id)
                              }}
                              variant={isJoined ? "secondary" : "default"}
                              size="sm"
                              className={isJoined 
                                ? "bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 font-oswald font-medium tracking-wide"
                                : "neon-button font-oswald font-medium tracking-wide"
                              }
                            >
                              {isJoined ? 'JOINED' : 'JOIN'}
                            </Button>
                          )}

                          {/* Admin/Manager Actions */}
                          {user && (user.role === 'Admin' || user.role === 'Manager') && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent row click
                                  setSelectedEvent(event)
                                  setIsEditModalOpen(true)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent row click
                                  handleDeleteEvent(event.id)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>

                              {/* Activate/Deactivate Button */}
                              {canActivateEvent(event) && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation() // Prevent row click
                                    handleActivateEvent(event.id)
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {canDeactivateEvent(event) && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation() // Prevent row click
                                    handleDeactivateEvent(event.id)
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        {/* Desktop: Price Column */}
                        <div className="hidden md:flex flex-shrink-0 w-24 text-center ml-6">
                          <div className="font-oswald text-lg font-bold text-white">
                             {event.status?.toUpperCase() || 'PUBLISHED'}
                          </div>
                        </div>


                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>

          {/* View All Events Button */}
          {filteredEvents.length > 0 && (
            <div className="bg-gray-900/50 px-6 py-6 text-center border-t border-gray-800">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white font-oswald font-semibold tracking-wide px-8 py-3"
              >
                VIEW ALL EVENTS
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-oswald text-2xl">EDIT EVENT</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              initialData={selectedEvent} 
              onSubmit={handleUpdateEvent}
              closePopup={closePopup}
              handleUpdateEventStatus={handleUpdateEventStatus}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <div className="text-center">
              <h2 className="font-oswald text-xl font-bold text-pink-400 mb-2">
                SHARE EVENT
              </h2>
              <h3 className="font-oswald text-lg font-semibold text-white mb-2">
                {qrEvent?.title || qrEvent?.name || 'EVENT NAME'}
              </h3>
              <p className="text-gray-400 text-sm">
                Scan QR code or share the link to join this event
              </p>
            </div>
          </DialogHeader>
          
          {qrEvent && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg">
                  <QRCode
                    value={`${window.location.origin}/join/${qrEvent.id}`}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 200 200`}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-600">
                  <input 
                    type="text" 
                    value={`${window.location.origin}/join/${qrEvent.id}`}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-300 outline-none font-mono"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyJoinLink(qrEvent.id)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                  Anyone with this link can join the event with their email and name
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsQRModalOpen(false)}
              className="w-full font-oswald font-semibold tracking-wide bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Event Form Component with proper DialogFooter
const EventForm = ({ initialData, onSubmit, closePopup, handleUpdateEventStatus }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    location: initialData?.location || '',
    maxParticipants: initialData?.maxParticipants || 500,
    isPublic: initialData?.isPublic ?? true,
    allowSongRequests: initialData?.allowSongRequests ?? true,
    timeBombEnabled: initialData?.timeBombEnabled ?? false,
    timeBombDuration: initialData?.timeBombDuration || 120,
    Venue: initialData?.Venue || '',
    'venue.name': initialData?.['venue.name'] || '',
    'venue.address': initialData?.['venue.address'] || '',
    'venue.city': initialData?.['venue.city'] || '',
    eventType: initialData?.eventType || 'Festival',
  })

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'draft':
        return 'Published'
      case 'published':
        return 'Active'
      case 'active':
        return 'Completed'
      default:
        return 'Published'
    }
  }

  const getStatusButtonText = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'draft':
        return 'PUBLISH'
      case 'published':
        return 'ACTIVATE'
      case 'active':
        return 'COMPLETE'
      default:
        return 'PUBLISH'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Submit data with exact field structure
    const submitData = {
      name: formData.name,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      location: formData.location,
      maxParticipants: formData.maxParticipants,
      isPublic: formData.isPublic,
      allowSongRequests: formData.allowSongRequests,
      timeBombEnabled: formData.timeBombEnabled,
      timeBombDuration: formData.timeBombDuration,
      Venue: formData.Venue,
      'venue.name': formData['venue.name'],
      'venue.address': formData['venue.address'],
      'venue.city': formData['venue.city'],
      eventType: formData.eventType
    }
    onSubmit(submitData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white font-roboto">Event Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
            required
          />
        </div>
        <div>
          <Label htmlFor="eventType" className="text-white font-roboto">Event Type</Label>
          <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
            <SelectItem value="Wedding">Wedding</SelectItem>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Club">Club</SelectItem>
            <SelectItem value="Festival">Festival</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-white font-roboto">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white font-roboto"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime" className="text-white font-roboto">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="text-white font-roboto">End Time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-white font-roboto">Start Date</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-white font-roboto">End Date</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location" className="text-white font-roboto">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
        <div>
          <Label htmlFor="maxParticipants" className="text-white font-roboto">Max Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="venue" className="text-white font-roboto">Venue</Label>
          <Input
            id="venue"
            value={formData.Venue}
            onChange={(e) => handleChange('Venue', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
        <div>
          <Label htmlFor="venueName" className="text-white font-roboto">Venue Name</Label>
          <Input
            id="venueName"
            value={formData['venue.name']}
            onChange={(e) => handleChange('venue.name', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
        <div>
          <Label htmlFor="venueCity" className="text-white font-roboto">Venue City</Label>
          <Input
            id="venueCity"
            value={formData['venue.city']}
            onChange={(e) => handleChange('venue.city', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="venueAddress" className="text-white font-roboto">Venue Address</Label>
        <Input
          id="venueAddress"
          value={formData['venue.address']}
          onChange={(e) => handleChange('venue.address', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white font-roboto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleChange('isPublic', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <Label htmlFor="isPublic" className="text-white font-roboto">Public Event</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowSongRequests"
            checked={formData.allowSongRequests}
            onChange={(e) => handleChange('allowSongRequests', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <Label htmlFor="allowSongRequests" className="text-white font-roboto">Allow Song Requests</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="timeBombEnabled"
            checked={formData.timeBombEnabled}
            onChange={(e) => handleChange('timeBombEnabled', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800"
          />
          <Label htmlFor="timeBombEnabled" className="text-white font-roboto">Enable TimeBomb</Label>
        </div>
        {formData.timeBombEnabled && (
          <div>
            <Label htmlFor="timeBombDuration" className="text-white font-roboto">TimeBomb Duration (minutes)</Label>
            <Input
              id="timeBombDuration"
              type="number"
              value={formData.timeBombDuration}
              onChange={(e) => handleChange('timeBombDuration', parseInt(e.target.value))}
              className="bg-gray-800 border-gray-600 text-white font-roboto"
              min="5"
              max="180"
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={closePopup}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white font-oswald font-semibold tracking-wide"
        >
          CANCEL
        </Button>
        
        {initialData ? (
          <Button 
            type="button"
            onClick={() => {
              const nextStatus = getNextStatus(initialData.status)
              handleUpdateEventStatus(initialData.id, nextStatus)
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-oswald font-semibold tracking-wide"
          >
            {getStatusButtonText(initialData.status)}
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-oswald font-semibold tracking-wide"
          >
            CREATE EVENT
          </Button>
        )}
      </DialogFooter>
    </form>
  )
}

export default EventsPage