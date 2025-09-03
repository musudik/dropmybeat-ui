import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuest } from '../../contexts/GuestContext'
import { eventAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Clock, MapPin, Users, Music, Search, UserCheck, LogOut } from 'lucide-react'
import { Role } from '../../lib/constants'

const GuestDashboard = () => {
  const { guestData, logout } = useGuest()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchJoinedEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventAPI.getAll()
      const publicEvents = response.data.filter(event => 
        event.isPublic && 
        new Date(event.eventDate) >= new Date() && 
        event.status === 'active'
      )
      setEvents(publicEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      // For guests, we need to check which events they've joined
      // This would typically be stored in the guest context or fetched from API
      const response = await eventAPI.getAll()
      const guestEvents = response.data.filter(event => 
        event.guestMembers?.some(guest => guest.email === guestData?.email)
      )
      setJoinedEvents(guestEvents)
    } catch (error) {
      console.error('Failed to fetch joined events:', error)
    }
  }

  const handleJoinEvent = async (event) => {
    try {
      setLoading(true)
      await eventAPI.joinAsGuest(event.id, {
        email: guestData.email,
        firstName: guestData.firstName,
        lastName: guestData.lastName
      })
      fetchJoinedEvents()
      fetchEvents()
    } catch (error) {
      console.error('Failed to join event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!guestData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Guest Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome, {guestData.firstName}! Explore and join public events.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{guestData.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Guest Info Card */}
      <Card className="mb-8 bg-gradient-to-r from-neon-pink/10 to-neon-blue/10 border-neon-pink/20">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-neon-pink rounded-full flex items-center justify-center text-white font-bold text-xl">
              {guestData.firstName?.[0]}{guestData.lastName?.[0]}
            </div>
            <div>
              <CardTitle className="text-xl">{guestData.firstName} {guestData.lastName}</CardTitle>
              <CardDescription className="text-lg">{guestData.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <UserCheck className="w-4 h-4 mr-1" />
              Guest User
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{joinedEvents.length}</h3>
                <p className="text-muted-foreground">Events Joined</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{events.length}</h3>
                <p className="text-muted-foreground">Available Events</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Events */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Available Public Events</h2>
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
                      <span>{(event.Members?.length || 0) + (event.guestMembers?.length || 0)} / {event.maxMembers} attendees</span>
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
                      <span>Can request songs</span>
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

export default GuestDashboard