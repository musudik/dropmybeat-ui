import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { managerAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Clock, MapPin, Users, Music, Search, Plus, Settings, BarChart3 } from 'lucide-react'
import { Role } from '../../lib/constants'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [myEvents, setMyEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalMembers: 0,
    totalSongRequests: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Use manager-specific API endpoints
      const dashboardResponse = await managerAPI.getDashboard()
      const eventsResponse = await managerAPI.getEvents()
      
      // Set manager's events
      const managerEvents = eventsResponse.data?.data || eventsResponse.data || []
      setMyEvents(Array.isArray(managerEvents) ? managerEvents : [])
      
      // Set stats from dashboard response
      if (dashboardResponse.data) {
        setStats({
          totalEvents: dashboardResponse.data.totalEvents || managerEvents.length,
          activeEvents: dashboardResponse.data.activeEvents || managerEvents.filter(event => event.status === 'active').length,
          totalMembers: dashboardResponse.data.totalMembers || 0,
          totalSongRequests: dashboardResponse.data.totalSongRequests || 0
        })
      } else {
        // Fallback calculation if dashboard doesn't provide stats
        const activeEvents = managerEvents.filter(event => event.status === 'active')
        setStats({
          totalEvents: managerEvents.length,
          activeEvents: activeEvents.length,
          totalMembers: 0, // Managers don't have access to member count
          totalSongRequests: managerEvents.reduce((acc, event) => acc + (event.songRequests?.length || 0), 0)
        })
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = myEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back, {user.firstName}! Manage your events and members.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-pink rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalEvents}</h3>
              <p className="text-muted-foreground">Total Events</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.activeEvents}</h3>
              <p className="text-muted-foreground">Active Events</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalMembers}</h3>
              <p className="text-muted-foreground">Total Members</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neon-purple rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stats.totalSongRequests}</h3>
              <p className="text-muted-foreground">Song Requests</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/events/create')}>
          <div className="flex items-center space-x-3">
            <Plus className="w-8 h-8 text-neon-pink" />
            <div>
              <h3 className="font-semibold text-neon-pink">Create Event</h3>
              <p className="text-sm text-muted-foreground">Start a new event</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/events')}>
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-neon-blue" />
            <div>
              <h3 className="font-semibold text-neon-blue">Manage Events</h3>
              <p className="text-sm text-muted-foreground">Edit existing events</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/members')}>
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-neon-green" />
            <div>
              <h3 className="font-semibold text-neon-green">View Members</h3>
              <p className="text-sm text-muted-foreground">Manage event members</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/manager/analytics')}>
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-neon-purple" />
            <div>
              <h3 className="font-semibold text-neon-purple">Analytics</h3>
              <p className="text-sm text-muted-foreground">View event insights</p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Events</h2>
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
            <Button onClick={() => navigate('/manager/events/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event/${event.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <Badge variant={event.status === 'active' ? 'default' : event.status === 'completed' ? 'secondary' : 'destructive'}>
                    {event.status}
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
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4" />
                    <span>{event.songRequests?.length || 0} song requests</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/manager/events/${event.id}/edit`)
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/event/${event.id}`)
                    }}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard