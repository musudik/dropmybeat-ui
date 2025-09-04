import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventAPI, songRequestAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, Users, Music, Search, Filter, Plus, Send, Heart, Star } from 'lucide-react'

const ParticipantJoin = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [joinedEvents, setJoinedEvents] = useState([])
  const [songRequests, setSongRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showSongRequestForm, setShowSongRequestForm] = useState(false)
  const [songRequestForm, setSongRequestForm] = useState({
    songTitle: '',
    artist: '',
    genre: '',
    notes: ''
  })

  useEffect(() => {
    fetchEvents()
    fetchJoinedEvents()
    if (eventId) {
      fetchEventDetails(eventId)
    }
  }, [eventId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll()
      const activeEvents = response.data.filter(event => 
        new Date(event.eventDate) >= new Date() && event.status === 'active'
      )
      setEvents(activeEvents)
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      const response = await eventAPI.getJoinedEvents()
      setJoinedEvents(response.data)
      
      // Fetch song requests for joined events
      const allSongRequests = []
      for (const event of response.data) {
        try {
          const requestsResponse = await songRequestAPI.getByEvent(event.id)
          allSongRequests.push(...requestsResponse.data.filter(req => req.requestedBy === user.id))
        } catch (error) {
          console.error(`Failed to fetch song requests for event ${event.id}:`, error)
        }
      }
      setSongRequests(allSongRequests)
    } catch (error) {
      toast.error('Failed to fetch joined events')
    }
  }

  const fetchEventDetails = async (id) => {
    try {
      const response = await eventAPI.getById(id)
      setSelectedEvent(response.data)
    } catch (error) {
      toast.error('Failed to fetch event details')
    }
  }

  const handleJoinEvent = async (event) => {
    try {
      setLoading(true)
      await eventAPI.join(event.id)
      toast.success(`Successfully joined ${event.name}!`)
      fetchJoinedEvents()
      fetchEvents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join event')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveEvent = async (eventId) => {
    try {
      setLoading(true)
      await eventAPI.leave(eventId)
      toast.success('Successfully left the event')
      fetchJoinedEvents()
      fetchEvents()
    } catch (error) {
      toast.error('Failed to leave event')
    } finally {
      setLoading(false)
    }
  }

  const handleSongRequest = async (e) => {
    e.preventDefault()
    if (!selectedEvent) {
      toast.error('Please select an event first')
      return
    }
  
    try {
      setLoading(true)
      console.log(selectedEvent.id)
      await songRequestAPI.create(selectedEvent.id, {
        title: songRequestForm.songTitle,
        artist: songRequestForm.artist,
        genre: songRequestForm.genre,
        notes: songRequestForm.notes,
        eventId: selectedEvent.id
      })
      toast.success('Song request submitted successfully!')
      setSongRequestForm({ songTitle: '', artist: '', genre: '', notes: '', eventId: '' })
      setShowSongRequestForm(false)
      fetchJoinedEvents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit song request')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const isJoined = joinedEvents.some(je => je.id === event.id)
    
    if (filterStatus === 'joined') return isJoined && matchesSearch
    if (filterStatus === 'available') return !isJoined && matchesSearch
    return matchesSearch
  })

  const getEventStatusBadge = (event) => {
    const isJoined = joinedEvents.some(je => je.id === event.id)
    const isFull = event.currentParticipants >= event.maxParticipants
    const isPast = new Date(event.eventDate) < new Date()
    
    if (isPast) return <Badge variant="secondary">Past</Badge>
    if (isJoined) return <Badge variant="neon">Joined</Badge>
    if (isFull) return <Badge variant="destructive">Full</Badge>
    return <Badge variant="default">Available</Badge>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          Join Events & Request Songs
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing events and request your favorite songs
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* My Joined Events Summary */}
      {joinedEvents.length > 0 && (
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              My Events ({joinedEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-card/50 border border-pink-500/20">
                  <h4 className="font-semibold text-pink-400">{event.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.eventDate)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(event)}
                    className="mt-2 text-pink-400 hover:text-pink-300"
                  >
                    Request Song
                  </Button>
                </div>
              ))}
            </div>
            {joinedEvents.length > 3 && (
              <p className="text-center text-muted-foreground mt-4">
                And {joinedEvents.length - 3} more events...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No events available at the moment'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isJoined = joinedEvents.some(je => je.id === event.id)
            const isFull = event.currentParticipants >= event.maxParticipants
            const isPast = new Date(event.eventDate) < new Date()
            
            return (
              <Card key={event.id} className="neon-border hover:neon-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    {getEventStatusBadge(event)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatTime(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isJoined ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleLeaveEvent(event.id)}
                          disabled={loading || isPast}
                          className="flex-1"
                        >
                          Leave Event
                        </Button>
                        <Button
                          variant="neon"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowSongRequestForm(true)
                          }}
                          disabled={isPast}
                          className="flex-1"
                        >
                          <Music className="h-4 w-4 mr-2" />
                          Request Song
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleJoinEvent(event)}
                        disabled={loading || isFull || isPast}
                        className="w-full"
                        variant={isFull || isPast ? "secondary" : "default"}
                      >
                        {isPast ? 'Event Ended' : isFull ? 'Event Full' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Song Request Form Modal */}
      {showSongRequestForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Request Song for {selectedEvent.name}
              </CardTitle>
              <CardDescription>
                Submit your song request for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSongRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="songTitle">Song Title *</Label>
                  <Input
                    id="songTitle"
                    value={songRequestForm.songTitle}
                    onChange={(e) => setSongRequestForm(prev => ({ ...prev, songTitle: e.target.value }))}
                    placeholder="Enter song title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    value={songRequestForm.artist}
                    onChange={(e) => setSongRequestForm(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Enter artist name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={songRequestForm.genre}
                    onValueChange={(value) => setSongRequestForm(prev => ({ ...prev, genre: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="hip-hop">Hip Hop</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="r&b">R&B</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={songRequestForm.notes}
                    onChange={(e) => setSongRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special notes or requests..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSongRequestForm(false)
                      setSongRequestForm({ songTitle: '', artist: '', genre: '', notes: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Song Requests */}
      {songRequests.length > 0 && (
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              My Song Requests ({songRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {songRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-yellow-500/20">
                  <div>
                    <h4 className="font-semibold">{request.songTitle}</h4>
                    <p className="text-sm text-muted-foreground">by {request.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Event: {joinedEvents.find(e => e.id === request.eventId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <Badge 
                    variant={request.status === 'approved' ? 'neon' : 
                            request.status === 'rejected' ? 'destructive' : 'secondary'}
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
              {songRequests.length > 5 && (
                <p className="text-center text-muted-foreground">
                  And {songRequests.length - 5} more requests...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ParticipantJoin