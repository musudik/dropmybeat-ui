import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Heart, Music, Clock, Users, MapPin, Calendar, Send, ArrowLeft, Star, ThumbsUp, Search, Play, ExternalLink } from 'lucide-react'
import { eventAPI, songRequestAPI } from '../lib/api'
import { searchYouTube } from '../lib/youtube'
import { useAuth } from '../contexts/AuthContext'
import { useGuest } from '../contexts/GuestContext'
import toast from 'react-hot-toast'

function EventDetailsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { guestData, isGuest } = useGuest()
  const [event, setEvent] = useState(null)
  const [songRequests, setSongRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [likedSongs, setLikedSongs] = useState(new Set())
  const [songRequestForm, setSongRequestForm] = useState({
    songTitle: '',
    artist: '',
    genre: '',
    notes: ''
  })
  const [participants, setParticipants] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // YouTube search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)

  // Define current user (either authenticated user or guest)
  const currentUser = user || (isGuest && guestData ? { id: guestData.sessionId, ...guestData } : null)

  useEffect(() => {
    fetchEventDetails()
    fetchSongRequests()
    fetchParticipants()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      let response;
      if (user) {
        // Authenticated user - use regular API
        response = await eventAPI.getById(eventId)
      } else {
        // Guest user - use public API
        response = await eventAPI.getPublic(eventId)
      }
      setEvent(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching event details:', error)
      if (error.response?.status === 404) {
        toast.error('Event not found')
        navigate('/events')
      } else if (error.response?.status === 403) {
        toast.error('This event is not available for public viewing')
        navigate('/events')
      } else {
        toast.error('Failed to fetch event details')
        // Don't redirect on other errors, let user stay on page
      }
    }
  }

  const fetchSongRequests = async () => {
    try {
      setLoading(true)
      const response = await songRequestAPI.getEventRequests(eventId)
      // Fix: Access the nested data structure correctly
      const requests = response.data?.data || response.data || []
      
      // Sort by likes count (descending) then by request date (ascending)
      const sortedRequests = requests.sort((a, b) => {
        // Fix: Use likeCount instead of likesCount to match API response
        const aLikes = a.likeCount || 0
        const bLikes = b.likeCount || 0
        if (bLikes !== aLikes) {
          return bLikes - aLikes
        }
        return new Date(a.createdAt) - new Date(b.createdAt)
      })
      
      setSongRequests(sortedRequests)
      
      // Track which songs the current user has liked
      const userLikedSongs = new Set()
      if (currentUser) {
        requests.forEach(request => {
          // Fix: Use likes array instead of likedBy
          if (request.likes && request.likes.includes(currentUser.id)) {
            userLikedSongs.add(request.id)
          }
        })
      }
      setLikedSongs(userLikedSongs)
    } catch (error) {
      console.error('Failed to fetch song requests:', error)
      // Don't show error toast for empty results, just set empty array
      setSongRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await eventAPI.getGuestParticipants(eventId)
      setParticipants(response.data.data || [])
    } catch (error) {
      console.error('Error fetching participants:', error)
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleYouTubeSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    try {
      setIsSearching(true)
      const results = await searchYouTube(searchQuery)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('YouTube search error:', error)
      toast.error('Failed to search YouTube. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSong = (song) => {
    // Extract artist and title from YouTube title
    const titleParts = song.title.split(' - ')
    let artist = song.channelTitle
    let title = song.title
    
    // If title contains ' - ', assume format is "Artist - Song Title"
    if (titleParts.length >= 2) {
      artist = titleParts[0].trim()
      title = titleParts.slice(1).join(' - ').trim()
    }
    
    setSongRequestForm(prev => ({
      ...prev,
      songTitle: title,
      artist: artist,
      notes: `YouTube: ${song.title} (${song.channelTitle})`
    }))
    
    setSelectedSong(song)
    setShowSearchResults(false)
    setSearchQuery('')
    toast.success('Song selected from YouTube!')
  }

  const clearSelectedSong = () => {
    setSelectedSong(null)
    setSongRequestForm(prev => ({
      ...prev,
      songTitle: '',
      artist: '',
      notes: ''
    }))
  }

  const handleSongRequest = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      toast.error('Please join the event to request songs')
      return
    }

    try {
      setSubmittingRequest(true)
      await songRequestAPI.create(eventId, {
        title: songRequestForm.songTitle,
        artist: songRequestForm.artist,
        genre: songRequestForm.genre,
        notes: songRequestForm.notes
      })
      
      toast.success('Song request submitted successfully!')
      setSongRequestForm({ songTitle: '', artist: '', genre: '', notes: '' })
      setShowRequestForm(false)
      fetchSongRequests() // Refresh the list
    } catch (error) {
      toast.error('Failed to submit song request')
    } finally {
      setSubmittingRequest(false)
    }
  }

  const handleLikeSong = async (requestId) => {
    if (!currentUser) {
      toast.error('Please join the event to like songs')
      return
    }

    try {
      const isLiked = likedSongs.has(requestId)
      
      if (isLiked) {
        await songRequestAPI.unlike(eventId, requestId)
        setLikedSongs(prev => {
          const newSet = new Set(prev)
          newSet.delete(requestId)
          return newSet
        })
      } else {
        await songRequestAPI.like(eventId, requestId)
        setLikedSongs(prev => new Set([...prev, requestId]))
      }
      
      // Update the song request in the list
      setSongRequests(prev => prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            likeCount: isLiked ? (request.likeCount || 0) - 1 : (request.likeCount || 0) + 1
          }
        }
        return request
      }))
      
      // Re-sort the list after like count change
      setTimeout(() => {
        setSongRequests(prev => [...prev].sort((a, b) => {
          const aLikes = a.likeCount || 0
          const bLikes = b.likeCount || 0
          if (bLikes !== aLikes) {
            return bLikes - aLikes
          }
          return new Date(a.createdAt) - new Date(b.createdAt)
        }))
      }, 100)
      
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500'
      case 'upcoming': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-pink"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Event not found</h2>
        <Button onClick={() => navigate('/events')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button 
        onClick={() => navigate('/events')} 
        variant="outline" 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      {/* Guest Welcome Message */}
      {isGuest && guestData && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            Welcome, {guestData.firstName}! You're viewing this event as a guest.
          </p>
        </div>
      )}

      {/* Event Hero Section */}
      <Card className="neon-border bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Event Image */}
            <div className="lg:w-1/3">
              {event.bannerImage || event.logo ? (
                <img 
                  src={event.bannerImage || event.logo} 
                  alt={event.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg neon-border"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg neon-border flex items-center justify-center">
                  <Music className="h-20 w-20 text-white/50" />
                </div>
              )}
            </div>
            
            {/* Event Details */}
            <div className="lg:w-2/3 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-white">{event.name}</h1>
                <Badge className={`${getStatusColor(event.status)} text-white`}>
                  {event.status}
                </Badge>
              </div>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                {event.description || 'No description provided'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p className="text-sm">{event.startDate ? formatDate(event.startDate) : 'Invalid Date'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p className="text-sm">{event.endDate ? formatDate(event.endDate) : 'Invalid Date'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm">
                      {event.venue ? 
                        `${event.venue.name}, ${event.venue.address}, ${event.venue.city}` : 
                        'Location TBD'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Users className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-semibold">Participants</p>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>
                        {participants.length} / {event.maxParticipants || 'Unlimited'}
                      </span>
                    </div>
                    {event.guestParticipantCount > 0 && (
                      <p className="text-xs text-gray-400">
                        ({event.guestParticipantCount} guests)
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {event.rules && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">Event Rules</h3>
                  <p className="text-sm text-gray-300">{event.rules}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Song Requests Section */}
      <Card className="neon-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Music className="h-5 w-5 text-neon-pink" />
            SONG QUEUE ({songRequests.length})
          </CardTitle>
          {currentUser && (
            <Button 
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="bg-neon-pink hover:bg-neon-pink/80"
            >
              <Send className="h-4 w-4 mr-2" />
              Request Song
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Song Request Form */}
          {showRequestForm && currentUser && (
            <Card className="mb-6 bg-gray-800/50">
              <CardContent className="p-4">
                {/* YouTube Search Section */}
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Search YouTube
                  </h3>
                  
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for songs on YouTube..."
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSearch()}
                    />
                    <Button 
                      onClick={handleYouTubeSearch}
                      disabled={isSearching}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {showSearchResults && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No results found</p>
                      ) : (
                        searchResults.map((song) => (
                          <div 
                            key={song.id}
                            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => handleSelectSong(song)}
                          >
                            <img 
                              src={song.thumbnail} 
                              alt={song.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{song.title}</h4>
                              <p className="text-gray-400 text-sm truncate">{song.channelTitle}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              Select
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Selected Song Display */}
                  {selectedSong && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedSong.thumbnail} 
                            alt={selectedSong.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="text-green-400 font-medium text-sm">Selected from YouTube:</p>
                            <p className="text-white text-sm">{selectedSong.title}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedSong.id}`, '_blank')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={clearSelectedSong}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSongRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="songTitle" className="text-white">Song Title *</Label>
                      <Input
                        id="songTitle"
                        value={songRequestForm.songTitle}
                        onChange={(e) => setSongRequestForm(prev => ({ ...prev, songTitle: e.target.value }))}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter song title or search YouTube above"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artist" className="text-white">Artist *</Label>
                      <Input
                        id="artist"
                        value={songRequestForm.artist}
                        onChange={(e) => setSongRequestForm(prev => ({ ...prev, artist: e.target.value }))}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter artist name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="genre" className="text-white">Genre</Label>
                    <Select onValueChange={(value) => setSongRequestForm(prev => ({ ...prev, genre: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select genre (optional)" />
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
                  <div>
                    <Label htmlFor="notes" className="text-white">Notes</Label>
                    <Textarea
                      id="notes"
                      value={songRequestForm.notes}
                      onChange={(e) => setSongRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Any special notes or requests (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={submittingRequest}
                      className="bg-neon-pink hover:bg-neon-pink/80"
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowRequestForm(false)
                        setShowSearchResults(false)
                        setSelectedSong(null)
                        setSearchQuery('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Song Requests List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-pink"></div>
            </div>
          ) : songRequests.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No song requests yet</p>
              <p className="text-gray-500 text-sm">Be the first to request a song!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songRequests.map((request, index) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-neon-pink/20 rounded-full text-neon-pink font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{request.title}</h4>
                      <p className="text-gray-400 text-sm">{request.artist}</p>
                      {request.genre && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {request.genre}
                        </Badge>
                      )}
                      {request.notes && (
                        <p className="text-gray-500 text-xs mt-1 italic">{request.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Requested by</p>
                      <p className="text-sm text-white">{request.requestedBy?.firstName || 'Anonymous'}</p>
                    </div>
                    {currentUser && (
                      <Button
                        onClick={() => handleLikeSong(request.id)}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${
                          likedSongs.has(request.id) 
                            ? 'text-neon-pink hover:text-neon-pink/80' 
                            : 'text-gray-400 hover:text-neon-pink'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${
                          likedSongs.has(request.id) ? 'fill-current' : ''
                        }`} />
                        <span>{request.likeCount || 0}</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EventDetailsPage