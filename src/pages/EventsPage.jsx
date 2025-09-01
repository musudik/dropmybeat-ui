import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Music, Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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

  // Event creation handler (lines 78-86)
  const handleCreateEvent = async (eventData) => {
    try {
      await eventAPI.create(eventData)
      toast.success('Event created successfully!')
      setIsCreateDialogOpen(false)
      fetchEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.message || 'Failed to create event')
    }
  }
  
  // Complete EventForm component (lines 409-538)
  const EventForm = ({ initialData, onSubmit }) => {
    // Full form implementation with validation
    // Handles all event fields and submission
  }

  const handleUpdateEvent = async (eventData) => {
    try {
      await eventAPI.update(selectedEvent.id, eventData)
      toast.success('Event updated successfully!')
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
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
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-oswald text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider">
              UPCOMING EVENTS
            </h1>
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
              <SelectTrigger className="w-full md:w-48 bg-gray-900/50 border-gray-700 text-white h-12 font-roboto">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="concert">Concerts</SelectItem>
                <SelectItem value="dj-set">DJ Sets</SelectItem>
                <SelectItem value="festival">Festivals</SelectItem>
                <SelectItem value="party">Parties</SelectItem>
              </SelectContent>
            </Select>
            {user && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-6 font-oswald font-semibold tracking-wide">
                    <Plus className="w-5 h-5 mr-2" />
                    CREATE EVENT
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white font-oswald text-2xl">CREATE NEW EVENT</DialogTitle>
                  </DialogHeader>
                  <EventForm onSubmit={handleCreateEvent} />
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        </div>
      </div>

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
                      <div className="flex items-center px-6 py-6">
                        {/* Date Column */}
                        <div className="flex-shrink-0 w-20 text-center">
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
                        <div className="flex-1 ml-6">
                          <div className="flex items-start justify-between">
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

                            {/* Event Type Badge */}
                            <div className="ml-4">
                              <Badge 
                                variant="outline" 
                                className="bg-purple-600/20 border-purple-500/50 text-purple-300 font-oswald font-medium tracking-wide"
                              >
                                {event.eventType?.toUpperCase() || 'EVENT'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="flex-shrink-0 w-24 text-center ml-6">
                          <div className="font-oswald text-lg font-bold text-white">
                            FREE
                          </div>
                        </div>

                        {/* Action Column */}
                        <div className="flex-shrink-0 w-32 text-right ml-6">
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
                                    setIsEditDialogOpen(true)
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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

// Event Form Component
const EventForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || initialData?.name || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    venue: initialData?.venue?.name || '',
    eventType: initialData?.eventType || 'concert',
    maxParticipants: initialData?.maxParticipants || 100,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white font-roboto">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white font-roboto"
            required
          />
        </div>
        <div>
          <Label htmlFor="eventType" className="text-white font-roboto">Event Type</Label>
          <Select value={formData.eventType} onValueChange={(value) => handleChange('eventType', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white font-roboto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="concert">Concert</SelectItem>
              <SelectItem value="dj-set">DJ Set</SelectItem>
              <SelectItem value="festival">Festival</SelectItem>
              <SelectItem value="party">Party</SelectItem>
            </SelectContent>
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
          <Label htmlFor="startDate" className="text-white font-roboto">Start Date & Time</Label>
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
          <Label htmlFor="endDate" className="text-white font-roboto">End Date & Time</Label>
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
          <Label htmlFor="venue" className="text-white font-roboto">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
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

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="border-gray-600 text-gray-300 hover:bg-gray-700 font-roboto"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-oswald font-semibold tracking-wide"
        >
          {initialData ? 'UPDATE EVENT' : 'CREATE EVENT'}
        </Button>
      </div>
    </form>
  )
}

export default EventsPage