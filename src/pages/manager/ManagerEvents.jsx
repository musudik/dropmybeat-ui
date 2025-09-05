import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { eventAPI, songRequestAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { Toast, ToastTitle, ToastDescription } from '../../components/ui/Toast'
import { CheckCircle, X } from 'lucide-react'

const ManagerEvents = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [songRequests, setSongRequests] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    isPublic: true,
    allowSongRequests: true,
    timeBombEnabled: false,
    timeBombDuration: 120,
    eventType: 'Festival',
    'venue.name': '',
    'venue.address': '',
    'venue.city': '',
    genres: [],
    rules: ''
  })
  const [toast, setToast] = useState(null)

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll({ managerId: user?.id })
      setEvents(response.data.data || [])
    } catch (error) {
      showToast('Error fetching events', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  const fetchSongRequests = async (eventId) => {
    try {
      const response = await songRequestAPI.getEventRequests(eventId)
      setSongRequests(response.data.data || [])
    } catch (error) {
      showToast('Error fetching song requests', 'destructive')
    }
  }

  const showToast = (message, variant = 'default') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 5000)
  }

  const handleCreateEvent = async (e) => {
    console.log('handleCreateEvent called');
    alert('Create Event');
    e.preventDefault()
    
    console.log('Form data before processing:', formData);
    console.log('User object:', user);
    
    // Check if required fields are missing - Updated validation
    if (!formData.name || !formData.startTime || !formData.startDate) {
      console.log('Missing required fields:', {
        name: formData.name,
        startTime: formData.startTime,
        startDate: formData.startDate
      });
      showToast('Please fill in all required fields (Name, Start Time, and Start Date)', 'destructive');
      return;
    }
    
    try {
      const eventData = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        maxParticipants: parseInt(formData.maxParticipants) || null,
        createdBy: user?.id, // Fix: Use createdBy instead of managerId
        timeBombDuration: Math.min(parseInt(formData.timeBombDuration) || 120, 180) // Fix: Cap at 180 minutes
      }
      
      // Remove fields that shouldn't be sent to API
      delete eventData.date;
      delete eventData.time;
      delete eventData.managerId;
      
      console.log('Event data:', eventData);
      
      console.log('Making API call...');
      const response = await eventAPI.create(eventData);
      console.log('API response:', response);
      
      showToast('Event created successfully', 'success')
      setIsCreateModalOpen(false)
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Error in handleCreateEvent:', error);
      showToast('Error creating event', 'destructive')
    }
  }

  const handleUpdateEvent = async (e) => {
    e.preventDefault()
    try {
      const eventData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        maxParticipants: parseInt(formData.maxParticipants) || null
      }
      await eventAPI.update(selectedEvent.id, eventData)
      showToast('Event updated successfully', 'success')
      setIsEditModalOpen(false)
      resetForm()
      fetchEvents()
    } catch (error) {
      showToast('Error updating event', 'destructive')
    }
  }

  const handleDeleteEvent = async () => {
    try {
      await eventAPI.delete(selectedEvent.id)
      showToast('Event deleted successfully', 'success')
      setIsDeleteModalOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (error) {
      showToast('Error deleting event', 'destructive')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      venue: '',
      date: '',
      time: '',
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: '',
      isPublic: true,
      allowSongRequests: true,
      timeBombEnabled: false,
      timeBombDuration: 120,
      eventType: 'Festival',
      'venue.name': '',
      'venue.address': '',
      'venue.city': '',
      genres: [],
      rules: ''
    })
    setSelectedEvent(null)
  }

  const openEditModal = (event) => {
    setSelectedEvent(event)
    const eventDate = new Date(event.date)
    setFormData({
      name: event.name || '',
      description: event.description || '',
      venue: event.venue || '',
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().slice(0, 5),
      maxParticipants: event.maxParticipants?.toString() || '',
      isPublic: event.isPublic ?? true,
      genres: event.genres || [],
      rules: event.rules || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (event) => {
    setSelectedEvent(event)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = async (event) => {
    setSelectedEvent(event)
    await fetchSongRequests(event.id)
    setIsViewModalOpen(true)
  }

  const handleSongRequestAction = async (requestId, action, data = {}) => {
    try {
      if (action === 'approve') {
        await songRequestAPI.approve(selectedEvent.id, requestId, data)
        showToast('Song request approved', 'success')
      } else if (action === 'reject') {
        await songRequestAPI.reject(selectedEvent.id, requestId, data)
        showToast('Song request rejected', 'success')
      }
      await fetchSongRequests(selectedEvent.id)
    } catch (error) {
      showToast(`Error ${action}ing song request`, 'destructive')
    }
  }

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const now = new Date()
    const eventDate = new Date(event.date)
    let matchesStatus = true
    
    if (statusFilter === 'upcoming') {
      matchesStatus = eventDate > now
    } else if (statusFilter === 'past') {
      matchesStatus = eventDate < now
    } else if (statusFilter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      matchesStatus = eventDate >= today && eventDate < tomorrow
    }
    
    return matchesSearch && matchesStatus
  })

  const getEventStatus = (event) => {
    const now = new Date()
    const eventDate = new Date(event.date)
    
    if (eventDate < now) return { status: 'past', variant: 'secondary' }
    if (eventDate.toDateString() === now.toDateString()) return { status: 'today', variant: 'neon' }
    return { status: 'upcoming', variant: 'default' }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-pink"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neon-pink mb-2">Manage Events</h1>
          <p className="text-muted-foreground">Create and manage your DJ events</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="neon-button"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <svg className="h-4 w-4 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-pink">{events.length}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {events.filter(e => new Date(e.date) > new Date()).length}
            </div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <svg className="h-4 w-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">
              {events.filter(e => {
                const today = new Date()
                const eventDate = new Date(e.date)
                return eventDate.toDateString() === today.toDateString()
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {events.filter(e => new Date(e.date) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="neon-card">
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>Search and filter your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search events by name, venue, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </Select>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {events.length === 0 ? 'No events created yet. Create your first event!' : 'No events found matching your criteria.'}
              </div>
            ) : (
              filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event)
                return (
                  <div key={event.id} className="flex items-center justify-between p-6 border rounded-lg neon-border bg-dark-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                        <Badge variant={eventStatus.variant}>
                          {eventStatus.status}
                        </Badge>
                        {!event.isPublic && (
                          <Badge variant="outline">Private</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {typeof event.venue === 'object' ? 
                            `${event.venue.name || ''} ${event.venue.address || ''} ${event.venue.city || ''} ${event.venue.state || ''} ${event.venue.zipCode || ''}`.trim() : 
                            event.venue
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          {((event.MemberCount || 0) + (event.guestMemberCount || 0))} participants
                          {event.maxParticipants && ` / ${event.maxParticipants}`}
                          <span className="text-xs text-gray-400 ml-1">
                            ({event.MemberCount || 0} reg + {event.guestMemberCount || 0} guests)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          {event.songRequestCount || 0} song requests
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(event)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(event)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(event)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a new DJ event for participants to join and request songs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            console.log('Form submitted - event object:', e);
            console.log('Current formData at submission:', formData);
            handleCreateEvent(e);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Saturday Night Party"
                />
              </div>
              <div>
                <Label htmlFor="eventType">Event Type</Label>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Event location"
                />
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  required
                  placeholder="Club XYZ"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  value={formData['venue.name']}
                  onChange={(e) => setFormData({...formData, 'venue.name': e.target.value})}
                  placeholder="Venue name"
                />
              </div>
              <div>
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Input
                  id="venueAddress"
                  value={formData['venue.address']}
                  onChange={(e) => setFormData({...formData, 'venue.address': e.target.value})}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="venueCity">Venue City</Label>
                <Input
                  id="venueCity"
                  value={formData['venue.city']}
                  onChange={(e) => setFormData({...formData, 'venue.city': e.target.value})}
                  placeholder="City"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">Max Participants (optional)</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <Label htmlFor="isPublic">Visibility</Label>
                <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({...formData, isPublic: value === 'true'})}>
                  <SelectTrigger>
                    {formData.isPublic ? 'Public' : 'Private'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowSongRequests"
                  checked={formData.allowSongRequests}
                  onChange={(e) => setFormData({...formData, allowSongRequests: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-800"
                />
                <Label htmlFor="allowSongRequests">Allow Song Requests</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="timeBombEnabled"
                  checked={formData.timeBombEnabled}
                  onChange={(e) => setFormData({...formData, timeBombEnabled: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-800"
                />
                <Label htmlFor="timeBombEnabled">Enable TimeBomb</Label>
              </div>
            </div>
            
            {formData.timeBombEnabled && (
              <div>
                <Label htmlFor="timeBombDuration">TimeBomb Duration (minutes)</Label>
                <Input
                  id="timeBombDuration"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.timeBombDuration}
                  onChange={(e) => setFormData({...formData, timeBombDuration: parseInt(e.target.value) || 120})}
                  disabled={!formData.timeBombEnabled}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="rules">Event Rules (optional)</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                placeholder="Any specific rules for song requests..."
                rows={2}
              />
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
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update your event details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Event Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editVenue">Venue</Label>
                <Input
                  id="editVenue"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    console.log('Date changed:', e.target.value);
                    setFormData({...formData, date: e.target.value});
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTime">Time</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    console.log('Time changed:', e.target.value);
                    setFormData({...formData, time: e.target.value});
                  }}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editMaxParticipants">Max Participants</Label>
                <Input
                  id="editMaxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editIsPublic">Visibility</Label>
                <Select value={formData.isPublic.toString()} onValueChange={(value) => setFormData({...formData, isPublic: value === 'true'})}>
                  <SelectTrigger>
                    {formData.isPublic ? 'Public' : 'Private'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editRules">Event Rules</Label>
              <Textarea
                id="editRules"
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="neon-button">
                Update Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event & Song Requests Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              Event details and song request management
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg neon-border bg-dark-card/30">
                <div>
                  <h4 className="font-semibold text-neon-pink mb-2">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Venue:</strong> {selectedEvent.venue}</div>
                    <div><strong>Date:</strong> {formatDate(selectedEvent.date)}</div>
                    <div><strong>Participants:</strong> {((selectedEvent.MemberCount || 0) + (selectedEvent.guestMemberCount || 0))}
                      {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`}
                    </div>
                    <div><strong>Visibility:</strong> {selectedEvent.isPublic ? 'Public' : 'Private'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-neon-pink mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description || 'No description provided'}
                  </p>
                  {selectedEvent.rules && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm">Rules:</h5>
                      <p className="text-xs text-muted-foreground">{selectedEvent.rules}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Song Requests */}
              <div>
                <h4 className="font-semibold text-neon-pink mb-4">Song Requests ({songRequests.length})</h4>
                {songRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg neon-border">
                    No song requests yet
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {songRequests.filter(request => request.status !== 'played').map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg neon-border bg-dark-card/20">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{request.songTitle}</h5>
                            <Badge variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'destructive' : 'default'}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>by {request.artist}</div>
                            <div>Requested by: {request.requesterName}</div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                {request.likeCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPlayed(request.id)}
                            className="text-green-400 border-green-400 hover:bg-green-400/10"
                            title="Mark as Played"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromQueue(request.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400/10"
                            title="Remove from Queue"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.name}"? 
              This action cannot be undone and will remove all associated song requests and participant data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast variant={toast.variant}>
            <ToastTitle>
              {toast.variant === 'success' ? 'Success' : toast.variant === 'destructive' ? 'Error' : 'Notification'}
            </ToastTitle>
            <ToastDescription>{toast.message}</ToastDescription>
          </Toast>
        </div>
      )}
    </div>
  )
}

export default ManagerEvents