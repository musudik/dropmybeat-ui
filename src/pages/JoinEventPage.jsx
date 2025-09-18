import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Music, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Badge } from '../components/ui/Badge'
import toast from 'react-hot-toast'
import { eventAPI } from '../lib/api'
import { useGuest } from '../contexts/GuestContext'

const JoinEventPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { setGuestSession } = useGuest()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      // Use public API endpoint that doesn't require authentication
      const response = await eventAPI.getPublic(eventId)
      setEvent(response.data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Event not found or not available for public joining')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleJoinEvent = async (e) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setJoining(true)
      await eventAPI.joinPublic(eventId, formData)
      
      // Store guest session data
      setGuestSession(formData, eventId)
      
      toast.success('Successfully joined the event!')
      setJoined(true)
      
      // Redirect to event details page after a short delay
      setTimeout(() => {
        navigate(`/event/${eventId}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error joining event:', error)
      toast.error(error.response?.data?.message || 'Failed to join event')
    } finally {
      setJoining(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear()
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-oswald">Loading event...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-oswald">Event not found</div>
      </div>
    )
  }

  const dateInfo = formatDate(event.startDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Remove Navigation component to make it truly public */}
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Event Details Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 text-white">
                <div className="font-oswald text-3xl font-bold leading-none">
                  {dateInfo.day}
                </div>
                <div className="font-oswald text-sm font-medium mt-1 opacity-90">
                  {dateInfo.month}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="font-oswald text-3xl font-bold text-white tracking-wide">
                    {event.title || event.name}
                  </h1>
                  <Badge className="bg-purple-600/20 border-purple-500/50 text-purple-300 font-oswald font-medium tracking-wide">
                    {event.eventType?.toUpperCase() || 'EVENT'}
                  </Badge>
                </div>
                
                <p className="text-gray-300 font-roboto leading-relaxed mb-6">
                  {event.description || 'Join this amazing event and enjoy great music!'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="font-roboto">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="font-roboto">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="font-roboto">{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="font-roboto">
                      {event.totalParticipantCount || event.MemberCount || 0} / {event.maxParticipants || '∞'} participants
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {joined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-900/20 border border-green-500/50 rounded-xl p-6 mb-8 text-center"
            >
              <div className="text-green-400 text-2xl mb-2">🎉</div>
              <h3 className="font-oswald text-xl font-bold text-green-400 mb-2">
                Welcome to {event.title || event.name}!
              </h3>
              <p className="text-green-300 font-roboto">
                You've successfully joined the event. Redirecting to event details...
              </p>
            </motion.div>
          )}

          {/* Join Form */}
          {!joined && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Music className="w-6 h-6 text-purple-400" />
                <h2 className="font-oswald text-2xl font-bold text-white tracking-wide">
                  Join as Guest
                </h2>
              </div>
              
              <form onSubmit={handleJoinEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300 font-roboto font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-roboto focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300 font-roboto font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-roboto focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-roboto font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 font-roboto focus:border-purple-500 focus:ring-purple-500/20"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={joining}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-oswald font-bold text-lg py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {joining ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining Event...
                    </div>
                  ) : (
                    'Join Event'
                  )}
                </Button>
              </form>
              
              <p className="text-gray-400 text-sm font-roboto text-center mt-4">
                By joining, you agree to participate respectfully and follow event guidelines.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default JoinEventPage