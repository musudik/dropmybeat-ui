import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, ArrowLeft, MessageCircle, BarChart3, Users, Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Shield, Trash2, Check, X, Filter } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog'
import toast from 'react-hot-toast'
import { eventAPI, feedbackAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const EventFeedbackPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Event and feedback state
  const [event, setEvent] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [feedbackPerPage] = useState(10)
  
  // Filter state
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  
  // Moderation state (for Admin/Manager)
  const [showModeration, setShowModeration] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [moderationAction, setModerationAction] = useState(null)

  // Check if user can moderate
  const canModerate = user && (user.role === 'Admin' || user.role === 'Manager')

  useEffect(() => {
    loadEventData()
    loadFeedback()
    loadStats()
    checkSubmissionStatus()
  }, [eventId, currentPage, ratingFilter, sortBy])

  const loadEventData = async () => {
    try {
      let response;
      if (user) {
        // Authenticated user - use regular API
        response = await eventAPI.getById(eventId)
      } else {
        // Guest user - use public API
        response = await eventAPI.getPublic(eventId)
      }
      const eventData = response.data.data || response.data
      
      // Process logo and banner images if they exist
      if (eventData.logo) {
        // Convert GridFS ID to image URL
        eventData.logoUrl = `${import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'https://dropmybeat-api.replit.app')}/events/${eventId}/logo`
      }
      
      if (eventData.bannerImage) {
        // Convert GridFS ID to image URL with error handling
        const bannerUrl = `${import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'https://dropmybeat-api.replit.app')}/events/${eventId}/banner`
        
        // Test if banner URL is accessible
        try {
          const bannerResponse = await fetch(bannerUrl, { method: 'HEAD' })
          if (bannerResponse.ok) {
            eventData.bannerImageUrl = bannerUrl
          } else {
            console.warn('Banner image not accessible:', bannerResponse.status)
            eventData.bannerImageUrl = null
          }
        } catch (bannerError) {
          console.warn('Banner image fetch failed:', bannerError)
          eventData.bannerImageUrl = null
        }
      }
      
      setEvent(eventData)
    } catch (error) {
      console.error('Error fetching event details:', error)
      if (error.response?.status === 404) {
        toast.error('Event not found')
        navigate('/events')
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this event')
        navigate('/events')
      } else {
        toast.error('Failed to load event details')
        navigate('/events')
      }
    }
  }

  const loadFeedback = async () => {
    try {
        setLoading(true);
        const response = await feedbackAPI.getAll(eventId, {
            page: currentPage,
            rating: ratingFilter,
            sort: sortBy
        });
        
        console.log('Feedback API Response:', response); // Debug log
        
        // Access the data property from the response
        const feedbackData = response?.data;
        if (Array.isArray(feedbackData.data)) {
            setFeedback(feedbackData.data);
            console.log('Feedback set:', feedback); // Debug log
        } else {
            console.warn('API response data is not an array:', feedbackData);
            setFeedback([]);
        }
        
        setTotalPages(response?.pagination?.pages || 1);
        } catch (error) {
            console.error('Error loading feedback:', error);
            setFeedback([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await feedbackAPI.getStats(eventId);
            console.log('Stats API Response:', response); // Debug log
            
            // Fix: Access the nested data property
            setStats(response.data?.data || response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

  const getClientIdentifier = () => {
    // Use a more stable identifier for tracking submissions
    if (user) {
      // For authenticated users, use their user ID
      return `user_${user.id}`
    } else {
      // For anonymous users, create a stable browser fingerprint
      // This combines user agent with screen resolution and timezone for better stability
      const fingerprint = btoa(
        navigator.userAgent + 
        screen.width + 'x' + screen.height + 
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ).slice(0, 16)
      return `anon_${fingerprint}`
    }
  }

  const checkSubmissionStatus = async () => {
    try {
        // Remove all submission restrictions - allow unlimited feedback
        setHasSubmitted(false)
    } catch (error) {
        console.error('Error in checkSubmissionStatus:', error)
        setHasSubmitted(false) // Always allow submissions on error
    }
  }

  const getClientIP = () => {
    // In a real app, you'd get this from the server
    // For now, use a combination of user agent and timestamp as a pseudo-IP
    return btoa(navigator.userAgent + Date.now().toString()).slice(0, 16)
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
        toast.error('Please select a rating')
        return
    }

    setSubmitting(true)
    
    try {
        const feedbackData = {
        rating,
        firstName: firstName.trim() || 'Anonymous',
        comment: comment.trim(),
        // Include user ID if authenticated
        ...(user && { userId: user.id })
    }
    
    await feedbackAPI.submit(eventId, feedbackData)
    
    // Don't mark as submitted - allow multiple submissions
    // setHasSubmitted(true)
    
    // Reset form for next submission
    setRating(0)
    setFirstName('')
    setComment('')
    
    toast.success('Thank you for your feedback!')
    
    // Reload feedback and stats
    loadFeedback()
    loadStats()
    
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to submit feedback'
        toast.error(message)
    } finally {
        setSubmitting(false)
    }
  }

  // Add this missing function after handleSubmitFeedback
  const handleModerationAction = async (feedbackId, action) => {
    try {
      if (action === 'approve') {
        await feedbackAPI.approve(eventId, feedbackId)
        toast.success('Feedback approved successfully')
      } else if (action === 'delete') {
        await feedbackAPI.delete(eventId, feedbackId)
        toast.success('Feedback deleted successfully')
      }
      
      // Close the moderation dialog
      setSelectedFeedback(null)
      setModerationAction(null)
      
      // Reload feedback and stats to reflect changes
      loadFeedback()
      loadStats()
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} feedback`
      toast.error(message)
    }
  }

  const renderStars = (currentRating, interactive = false, size = 'w-6 h-6') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors ${
              star <= (interactive ? (hoverRating || currentRating) : currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-yellow-400'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!stats?.distribution) return null

    const maxCount = Math.max(...Object.values(stats.distribution))
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating] || 0
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-oswald text-2xl">LOADING EVENT FEEDBACK...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event not found</h2>
          <Button onClick={() => navigate('/events')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const eventDate = formatDate(event.startDate)

  return (
    <div className="min-h-screen bg-black text-white font-roboto">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* <Button 
              onClick={() => navigate('/events')} 
              variant="ghost" 
              className="mb-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button> */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-2 font-oswald">EVENT FEEDBACK</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-lg">Share your experience and help us improve</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Event Info Card */}
          <Card className="bg-gray-900/50 border-gray-700 overflow-hidden">
            {/* Event Banner */}
            {event.bannerImageUrl && (
              <div className="relative h-48 lg:h-64 overflow-hidden">
                <img
                  src={event.bannerImageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('Banner image failed to load')
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                
                {/* Event Title Overlay on Banner */}
                <div className="absolute bottom-4 left-6 right-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white font-oswald mb-2">
                    {event.name}
                  </h1>
                  <Badge 
                    variant={event.status === 'Active' ? 'default' : 'secondary'}
                    className={`${
                      event.status === 'Active' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white font-oswald`}
                  >
                    {event.status || 'TBD'}
                  </Badge>
                </div>
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 text-white text-center">
                    <div className="font-oswald text-3xl font-bold leading-none">
                      {eventDate.day}
                    </div>
                    <div className="font-oswald text-sm font-medium mt-1 opacity-90">
                      {eventDate.month}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  {/* Only show title here if no banner image */}
                  {!event.bannerImageUrl && (
                    <h2 className="text-2xl font-bold mb-2 font-oswald">{event.name}</h2>
                  )}
                  <p className="text-gray-400 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>{event.venue?.address || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{eventDate.time}</span>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>{event.totalMemberCount || 0} participants</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Feedback Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Statistics Overview */}
              {stats && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-oswald">
                      <BarChart3 className="w-5 h-5" />
                      FEEDBACK STATISTICS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 font-oswald">
                          {stats.averageRating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex justify-center mb-2">
                          {renderStars(Math.round(stats.averageRating || 0))}
                        </div>
                        <div className="text-sm text-gray-400">Average Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 font-oswald">
                          {stats.totalFeedback || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 font-oswald">
                          {stats.recommendationRate || 0}%
                        </div>
                        <div className="text-sm text-gray-400">Would Recommend</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Feedback Form */}
              {/* Submit Feedback Form - Always show, remove hasSubmitted condition */}
                <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-oswald">
                    <MessageCircle className="w-5 h-5" />
                    SHARE YOUR FEEDBACK
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    
                    {/* Rating */}
                    <div>
                        <Label className="text-base font-medium mb-3 block">
                        How would you rate this event? *
                        </Label>
                        <div className="flex items-center gap-4">
                        {renderStars(rating, true, 'w-8 h-8')}
                        <span className="text-sm text-gray-400">
                            {rating > 0 && (
                            rating === 5 ? 'Excellent!' :
                            rating === 4 ? 'Very Good' :
                            rating === 3 ? 'Good' :
                            rating === 2 ? 'Fair' : 'Poor'
                            )}
                        </span>
                        </div>
                    </div>

                    {/* First Name (Optional) */}
                    <div>
                        <Label htmlFor="firstName" className="text-base font-medium mb-2 block">
                            Your Name
                        </Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name or leave blank to remain anonymous"
                            className="bg-gray-800 border-gray-600 text-white"
                            maxLength={50}
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <Label htmlFor="comment" className="text-base font-medium mb-2 block">
                        Your Comments
                        </Label>
                        <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                        maxLength={500}
                        />
                        <div className="text-xs text-gray-400 mt-1">
                        {comment.length}/500 characters
                        </div>
                    </div>

                    {/* Submit Button - Only disabled when submitting or no rating */}
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-oswald font-semibold tracking-wide"
                    >
                        {submitting ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            SUBMITTING...
                        </div>
                        ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            SUBMIT FEEDBACK
                        </>
                        )}
                    </Button>
                    </form>
                </CardContent>
                </Card>

              {/* Feedback List */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2 font-oswald">
                      <MessageCircle className="w-5 h-5" />
                      FEEDBACK ({stats?.totalFeedback || 0})
                    </CardTitle>
                    
                    {/* Filters */}
                    <div className="flex gap-2">
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                          <SelectItem value="highest">Highest Rated</SelectItem>
                          <SelectItem value="lowest">Lowest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {feedback.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No feedback yet. Be the first to share your experience!</p>
                        </div>
                    ) : (
                        Array.isArray(feedback) && feedback.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                            >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {(item.firstName || item.displayName || 'A')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-medium">{item.displayName || 'Anonymous'}</div>
                                      <div className="flex items-center gap-2">
                                        {renderStars(item.rating, false, 'w-4 h-4')}
                                        <span className="text-xs text-gray-400">
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Moderation Controls */}
                                  {canModerate && (
                                    <div className="flex gap-2">
                                      {!item.approved && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleModerationAction(item.id, 'approve')}
                                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedFeedback(item)
                                          setModerationAction('delete')
                                        }}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                
                                {item.comment && (
                                  <p className="text-gray-300 leading-relaxed">{item.comment}</p>
                                )}
                                
                                {!item.approved && canModerate && (
                                  <Badge variant="outline" className="mt-2 text-yellow-400 border-yellow-400">
                                    Pending Approval
                                  </Badge>
                                )}
                              </motion.div>
                            ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Event Poster */}
              {event && event.bannerImageUrl && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg font-oswald">EVENT POSTER</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={event.bannerImageUrl}
                        alt={event.name}
                        className="w-full h-full object-contain bg-gray-800"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rating Distribution */}
              {stats && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg font-oswald">RATING BREAKDOWN</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderRatingDistribution()}
                  </CardContent>
                </Card>
              )}

              {/* Moderation Panel */}
              {canModerate && (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-oswald">
                      <Shield className="w-5 h-5" />
                      MODERATION
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Reviews</span>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          {stats?.pendingCount || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Reviews</span>
                        <Badge variant="outline">
                          {stats?.totalFeedback || 0}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowModeration(!showModeration)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        {showModeration ? 'Show All' : 'Show Pending Only'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-oswald">QUICK STATS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event Date</span>
                      <span>{eventDate.day} {eventDate.month} {eventDate.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants</span>
                      <span>{event.totalMemberCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Feedback Rate</span>
                      <span>
                        {event.totalMemberCount > 0 
                          ? Math.round(((stats?.totalFeedback || 0) / event.totalMemberCount) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Confirmation Dialog */}
      <Dialog open={!!selectedFeedback && !!moderationAction} onOpenChange={() => {
        setSelectedFeedback(null)
        setModerationAction(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === 'delete' ? 'Delete Feedback' : 'Approve Feedback'}
            </DialogTitle>
            <DialogDescription>
              {moderationAction === 'delete' 
                ? 'Are you sure you want to delete this feedback? This action cannot be undone.'
                : 'Are you sure you want to approve this feedback? It will be visible to all users.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <strong>{selectedFeedback.firstName || selectedFeedback.displayName || 'Anonymous'}</strong>
                {renderStars(selectedFeedback.rating, false, 'w-4 h-4')}
              </div>
              {selectedFeedback.comment && (
                <p className="text-gray-700">{selectedFeedback.comment}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFeedback(null)
                setModerationAction(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant={moderationAction === 'delete' ? 'destructive' : 'default'}
              onClick={() => handleModerationAction(selectedFeedback.id, moderationAction)}
            >
              {moderationAction === 'delete' ? 'Delete' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Powered by footer */}
      <div className="mt-12 py-6 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Powered by{' '}
              <a 
                href="https://fkgpt.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                fkgpt.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventFeedbackPage
