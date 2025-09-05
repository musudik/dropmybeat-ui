import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, MapPin, Users, Music, Search, Filter, Eye, TrendingUp } from 'lucide-react'

const ParticipantEvents = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [filterGenre, setFilterGenre] = useState('all')
  const [stats, setStats] = useState({
    totalEvents: 0,
    joinedCount: 0,
    upcomingCount: 0
  })

  useEffect(() => {
    fetchEvents()
    fetchJoinedEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll()
      setEvents(response.data)
      
      // Calculate stats
      const now = new Date()
      const upcoming = response.data.filter(event => new Date(event.eventDate) >= now)
      setStats(prev => ({
        ...prev,
        totalEvents: response.data.length,
        upcomingCount: upcoming.length
      }))
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
      setStats(prev => ({
        ...prev,
        joinedCount: response.data.length
      }))
    } catch (error) {
      toast.error('Failed to fetch joined events')
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

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = filterGenre === 'all' || event.genre === filterGenre
      return matchesSearch && matchesGenre
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.eventDate) - new Date(b.eventDate)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'participants':
          return b.currentParticipants - a.currentParticipants
        default:
          return 0
      }
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const genres = [...new Set(events.map(event => event.genre).filter(Boolean))]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          Discover Events
        </h1>
        <p className="text-muted-foreground text-lg">
          Find and join amazing music events in your area
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold text-pink-400">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Joined Events</p>
                <p className="text-3xl font-bold text-green-400">{stats.joinedCount}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold text-blue-400">{stats.upcomingCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterGenre !== 'all' ? 'Try adjusting your search or filters' : 'No events available at the moment'}
            </p>
          </div>
        ) : (
          filteredAndSortedEvents.map((event) => {
            const isJoined = joinedEvents.some(je => je.id === event.id)
            const isFull = event.currentParticipants >= event.maxParticipants
            const isPast = new Date(event.eventDate) < new Date()
            
            return (
              <Card key={event.id} className="neon-border hover:neon-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
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
                      {((event.MemberCount || 0) + (event.guestMemberCount || 0))}/{event.maxParticipants || '∞'}
                      <span className="text-xs text-gray-400 ml-1">
                        ({event.MemberCount || 0} reg + {event.guestMemberCount || 0} guests)
                      </span>
                    </div>
                    {event.genre && (
                      <Badge variant="outline" className="text-xs">
                        {event.genre}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {!isJoined && !isFull && !isPast && (
                      <Button
                        onClick={() => handleJoinEvent(event)}
                        disabled={loading}
                        className="flex-1"
                      >
                        Join Event
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ParticipantEvents