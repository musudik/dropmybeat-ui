import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { eventAPI, songRequestAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Clock, MapPin, Users, Music, Search, Heart, Star } from 'lucide-react'
import { Role } from '../../lib/constants'

const MemberDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [songRequests, setSongRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchJoinedEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll()
      const activeEvents = response.data.filter(event => 
        new Date(event.eventDate) >= new Date() && event.status === 'active'
      )
      setEvents(activeEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
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
      console.error('Failed to fetch joined events:', error)
    }
  }

  const handleJoinEvent = async (event) => {
    try {
      setLoading(true)
      await eventAPI.join(event.id)
      fetchJoinedEvents()
      fetchEvents()
    } catch (error) {
      console.error('Failed to join event:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Member Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back, {user.firstName}! Manage your events and song requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-pink rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{joinedEvents.length}</h3>
              <p className="text-muted-foreground">Joined Events</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{songRequests.length}</h3>
              <p className="text-muted-foreground">Song Requests</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{events.length}</h3>
              <p className="text-muted-foreground">Available Events</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Events */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Available Events</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isJoined = joinedEvents.some(je => je.id === event.id)
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant={isJoined ? 'default' : 'secondary'}>
                      {isJoined ? 'Joined' : 'Available'}
                    </Badge>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(event.eventDate).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue?.name || 'TBA'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{event.Members?.length || 0} / {event.maxMembers} members</span>
                    </div>
                  </div>
                  
                  {!isJoined && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleJoinEvent(event)
                      }}
                      disabled={loading}
                    >
                      Join Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* My Events */}
      {joinedEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4" />
                      <span>{songRequests.filter(sr => sr.eventId === event.id).length} requests</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/event/${event.id}`)
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberDashboard