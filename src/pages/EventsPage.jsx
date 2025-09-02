import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Music, Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectItem } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { eventAPI } from '../lib/api'

const EventsPage = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [joinedEvents, setJoinedEvents] = useState(new Set())

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll()
      const eventsData = response.data || []
      setEvents(Array.isArray(eventsData.data) ? eventsData.data : [])
      
      if (user && Array.isArray(eventsData.data)) {
        const userJoinedEvents = eventsData.data
          .filter(event => event.participants?.some(p => p.user === user.id))
          .map(event => event.id)
        setJoinedEvents(new Set(userJoinedEvents))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async (eventId) => {
    try {
      await eventAPI.join(eventId)
      setJoinedEvents(prev => new Set([...prev, eventId]))
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, participantCount: (event.participantCount || 0) + 1 }
          : event
      ))
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
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, participantCount: Math.max((event.participantCount || 1) - 1, 0) }
          : event
      ))
      toast.success('Left the event successfully')
    } catch (error) {
      console.error('Error leaving event:', error)
      toast.error(error.response?.data?.message || 'Failed to leave event')
    }
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

  if (loading) {
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
              <SelectItem value="concert">Concerts</SelectItem>
              <SelectItem value="dj-set">DJ Sets</SelectItem>
              <SelectItem value="festival">Festivals</SelectItem>
              <SelectItem value="party">Parties</SelectItem>
            </Select>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="neon-button"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-oswald text-2xl">CREATE NEW EVENT</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleCreateEvent} />
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
                  const isJoined = joinedEvents.has(event.id)
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center px-4 md:px-6 py-6 gap-4 md:gap-0">
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
                              <Badge 
                                variant="outline" 
                                className="bg-purple-600/20 border-purple-500/50 text-purple-300 font-oswald font-medium tracking-wide text-xs ml-2"
                              >
                                {event.eventType?.toUpperCase() || 'EVENT'}
                              </Badge>
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
                              <h3 className="font-oswald text-xl font-bold text-white mb-1 tracking-wide group-hover:text-purple-400 transition-colors">
                                {event.title || event.name}
                              </h3>
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
                                    {event.participantCount || 0}/{event.maxParticipants || '∞'}
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
                                  {event.participantCount || 0}/{event.maxParticipants || '∞'} participants
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Event Type Badge */}
                        <div className="ml-4">
                          <Badge 
                            variant="outline" 
                            className="bg-purple-600/20 border-purple-500/50 text-purple-300 font-oswald font-medium tracking-wide"
                          >
                            {event.eventType?.toUpperCase() || 'EVENT'}
                          </Badge>
                        </div>

                        {/* Mobile: Price and Actions */}
                        <div className="flex items-center justify-between md:hidden">
                          <div className="flex items-center gap-2">
                            {user && (
                              <Button
                                size="sm"
                                onClick={() => isJoined ? handleLeaveEvent(event.id) : handleJoinEvent(event.id)}
                                className={`font-oswald font-semibold tracking-wide px-4 py-2 ${
                                  isJoined 
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                }`}
                              >
                                {isJoined ? 'JOINED' : 'JOIN'}
                              </Button>
                            )}
                            {user?.role === 'manager' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    setIsEditModalOpen(true)
                                  }}
                                  className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-gray-400 hover:text-red-400 hover:bg-gray-700 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Desktop: Price Column */}
                        <div className="hidden md:flex flex-shrink-0 w-24 text-center ml-6">
                          <div className="font-oswald text-lg font-bold text-white">
                            FREE
                          </div>
                        </div>

                        {/* Desktop: Action Column */}
                        <div className="hidden md:flex flex-shrink-0 w-32 text-right ml-6">
                          <div className="flex items-center justify-end gap-2">
                            {user && (
                              <Button
                                size="sm"
                                onClick={() => isJoined ? handleLeaveEvent(event.id) : handleJoinEvent(event.id)}
                                className={`font-oswald font-semibold tracking-wide px-4 py-2 ${
                                  isJoined 
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                }`}
                              >
                                {isJoined ? 'JOINED' : 'JOIN'}
                              </Button>
                            )}
                            {user?.role === 'manager' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEvent(event)
                                    setIsEditModalOpen(true)
                                  }}
                                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Event Form Component with proper DialogFooter
const EventForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    location: initialData?.location || '',
    maxParticipants: initialData?.maxParticipants || 100,
    isPublic: initialData?.isPublic ?? true,
    allowSongRequests: initialData?.allowSongRequests ?? true,
    timeBombEnabled: initialData?.timeBombEnabled ?? false,
    timeBombDuration: initialData?.timeBombDuration || 30,
    Venue: initialData?.Venue || '',
    'venue.name': initialData?.['venue.name'] || '',
    'venue.address': initialData?.['venue.address'] || '',
    'venue.city': initialData?.['venue.city'] || '',
    eventType: initialData?.eventType || 'Private',
  })

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
            <SelectItem value="">Select Event Type</SelectItem>
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
          <Label htmlFor="Venue" className="text-white font-roboto">Venue</Label>
          <Input
            id="Venue"
            value={formData.Venue}
            onChange={(e) => handleChange('Venue', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
        <div>
          <Label htmlFor="venue.name" className="text-white font-roboto">Venue Name</Label>
          <Input
            id="venue.name"
            value={formData['venue.name']}
            onChange={(e) => handleChange('venue.name', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
        <div>
          <Label htmlFor="venue.city" className="text-white font-roboto">Venue City</Label>
          <Input
            id="venue.city"
            value={formData['venue.city']}
            onChange={(e) => handleChange('venue.city', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="venue.address" className="text-white font-roboto">Venue Address</Label>
        <Input
          id="venue.address"
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
        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="neon-button">
          Create Event
        </Button>
      </DialogFooter>
    </form>
  )
}

export default EventsPage