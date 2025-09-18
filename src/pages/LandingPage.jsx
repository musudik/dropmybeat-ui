import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Music, Users, Calendar, Zap, Star, ArrowRight, Play, Headphones, Radio, Volume2, Mic, Speaker, Disc3, MapPin, Clock } from 'lucide-react'
import { containerVariants, slideInVariants, fadeVariants } from '../lib/animations'
import AnimatedPage from '../components/AnimatedPage'
import { eventAPI } from '../lib/api'
import { toast } from 'react-hot-toast'

const LandingPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch events for the scrolling section
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        // Use the regular events endpoint since it works and returns public events
        const response = await eventAPI.getAll()
        console.log('Events API response:', response)
        
        // Get active and upcoming events for display
        const activeEvents = response.data?.data || []
        const upcomingEvents = activeEvents
          .filter(event => {
            // Filter for active, public events with eventType
            const isActive = event.status === 'Active' || event.isActive
            const isPublic = event.isPublic === true
            const hasEventType = event.eventType && event.eventType.trim() !== ''
            const isFuture = new Date(event.startDate || event.eventDate) >= new Date()
            
            return isActive && isPublic && hasEventType && isFuture
          })
          .slice(0, 6) // Limit to 6 events for the scrolling section
        
        setEvents(upcomingEvents)
        console.log('Filtered upcoming events:', upcomingEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
        // Set empty array if API fails
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const features = [
    {
      icon: Music,
      title: "Interactive Playlists",
      description: "Crowd-sourced music selection with real-time voting and requests",
      color: "text-cyan-400",
      gradient: "from-cyan-500/20 to-blue-500/20"
    },
    {
      icon: Users,
      title: "Live Events",
      description: "Connect with music lovers at live venues and virtual events",
      color: "text-pink-400",
      gradient: "from-pink-500/20 to-purple-500/20"
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant updates and synchronized experiences across all devices",
      color: "text-yellow-400",
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: Speaker,
      title: "Premium Audio",
      description: "High-quality streaming with professional sound management",
      color: "text-green-400",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ]

  const stats = [
    { label: "Live Events", value: "150+", icon: Calendar, color: "text-cyan-400" },
    { label: "Songs Played", value: "10K+", icon: Music, color: "text-pink-400" },
    { label: "Active DJs", value: "500+", icon: Disc3, color: "text-yellow-400" },
    { label: "Cities", value: "50+", icon: Star, color: "text-green-400" }
  ]

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
          
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center py-5">
          <div className="container mx-auto px-4 py-2 relative z-10">
            <motion.div 
              className="text-center space-y-8 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
             
              
              {/* Logo Section */}
              <motion.div 
                variants={slideInVariants.down}
                className="mb-8"
              >
                <img 
                  src="/DropMyBeats.gif" 
                  alt="DropMyBeats Logo" 
                  className="h-32 w-auto mx-auto mb-6 drop-shadow-2xl"
                />
              </motion.div>

               <motion.div variants={slideInVariants.down}>
                <Badge variant="neon" className="mb-6 text-sm px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-cyan-400/50">
                  🎵 Next-Gen Music Experience
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-6xl lg:text-8xl xl:text-9xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent leading-none tracking-tight"
                variants={slideInVariants.up}
              >
                DROP MY BEATS
                <br />
              </motion.h1>
              
              <motion.h6 
                className="text-xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
                variants={slideInVariants.up}
              >
                Where music meets technology. Create, share, and experience 
                <span className="text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text font-semibold">
                  interactive soundscapes
                </span> like never before.
              </motion.h6>


              {/* Scrolling Events Container */}
              <motion.p 
                className="text-xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
                variants={slideInVariants.up}
              >
                <div className="relative overflow-hidden">
                  {events.length > 0 ? (
                    <div 
                      className="animate-vertical-scroll"
                      style={{
                        height: `${(events.length * 2) * 200}px`
                      }}
                    >
                      {/* Duplicate events for seamless scrolling */}
                      {[...events, ...events].map((event, index) => (
                        <motion.div
                          key={`${event.id}-${index}`}
                          className="group border-b border-gray-800 hover:bg-gray-900/30 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: (index % events.length) * 0.1 }}
                        >
                          <div className="flex items-center py-8 px-6 h-[180px]">
                            {/* Date Block */}
                            <div className="flex-shrink-0 w-20 text-center">
                              <div className="text-4xl font-bold text-white">
                                {new Date(event.startDate || event.eventDate).getDate()}
                              </div>
                              <div className="text-sm text-gray-400 uppercase tracking-wider">
                                {new Date(event.startDate || event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              <div className="text-xs text-gray-500">
                                '{new Date(event.startDate || event.eventDate).getFullYear().toString().slice(-2)}
                              </div>
                            </div>
                            
                            {/* Vertical Line */}
                            <div className="w-px h-16 bg-gray-700 mx-8"></div>
                            
                            {/* Event Details */}
                            <div className="flex-grow">
                              <div className="mb-2">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide group-hover:text-cyan-400 transition-colors duration-300">
                                  {event.name}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm text-gray-400">
                                  <span className="text-white font-medium">VENUE</span>
                                </div>
                                <div className="text-sm text-gray-300">
                                  {event.location}
                                </div>
                              </div>
                            </div>
                            
                            {/* Price and Button */}
                            <div className="flex-shrink-0 text-right">
                              <div className="mb-4">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                  TICKETS
                                </div>
                                <div className="text-2xl font-bold text-white">
                                  $19
                                </div>
                              </div>
                              
                              <Button 
                                asChild 
                                size="sm" 
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-6 py-2 text-xs uppercase tracking-wider font-medium"
                              >
                                <Link to={`/event/${event.id}`}>
                                  🎫 BUY TICKET
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <Calendar className="h-16 w-16 text-gray-600 mx-auto" />
                        <p className="text-xl text-gray-400">No upcoming events available</p>
                        <p className="text-gray-500">Check back soon for exciting musical experiences!</p>
                      </div>
                    </div>
                  )}
                </div>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-0"
                  variants={slideInVariants.up}
                >
                  <Button asChild size="lg" className="text-lg px-12 py-8 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 border-0 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all duration-300">
                    <Link to="/auth/register">
                      <Play className="mr-3 h-6 w-6" />
                      Start Creating
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-12 py-8 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300">
                    <Link to="/auth/login">
                      <Headphones className="mr-3 h-6 w-6" />
                      Join Session
                    </Link>
                  </Button>
              </motion.div>
              </motion.p>
            </motion.div>
          </div>
      
            
          
          {/* Floating Audio Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large Vinyl Record */}
            <motion.div
              className="absolute top-1/4 -left-20 text-cyan-400/10"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Disc3 className="h-40 w-40" />
            </motion.div>
            
            {/* Floating Music Notes */}
            <motion.div
              className="absolute top-20 right-10 text-pink-400/20"
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Music className="h-16 w-16" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-1/4 right-20 text-purple-400/15"
              animate={{
                y: [0, 25, 0],
                rotate: [0, -15, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Speaker className="h-24 w-24" />
            </motion.div>
            
            <motion.div
              className="absolute top-1/2 left-10 text-yellow-400/20"
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <Mic className="h-12 w-12" />
            </motion.div>
          </div>
          
          {/* Audio Visualizer Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
            <div className="flex items-end justify-center space-x-1 h-full">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-t from-cyan-500 to-pink-500 w-1"
                  animate={{
                    height: ["5%", `${Math.random() * 80 + 20}%`, "5%"]
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    variants={slideInVariants.up}
                    custom={index}
                    className="text-center space-y-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group"
                  >
                    <Icon className={`h-12 w-12 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                    <div className="text-4xl font-black text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Events Section */}
        {/* <section className="relative py-20 bg-black overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center space-y-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-wider">
                UPCOMING EVENTS
              </h2>
            </motion.div>

            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-4"
              >
                <Link to="/events">
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section> */}

        {/* Features Section */}
        {/* <section className="relative py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center space-y-6 mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                EXPERIENCE
                <br />
                THE FUTURE
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Revolutionary features that transform how you create, share, and experience music
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div key={feature.title} variants={slideInVariants.up} custom={index}>
                    <Card className={`h-full bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 group overflow-hidden relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="relative z-10 pb-4">
                        <Icon className={`h-16 w-16 mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                        <CardTitle className="text-2xl font-bold text-white">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <CardDescription className="text-lg text-gray-300 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section> */}

        {/* CTA Section */}
        {/* <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-purple-500/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center space-y-10 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                READY TO
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                  DROP THE BEAT?
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join the revolution. Create unforgettable musical experiences.
                <br />
                Your sound, your crowd, your moment.
              </p>
              <motion.div
                className="pt-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="text-xl px-16 py-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-400 hover:via-purple-400 hover:to-cyan-400 border-0 shadow-[0_0_50px_rgba(236,72,153,0.3)] hover:shadow-[0_0_80px_rgba(236,72,153,0.5)] transition-all duration-300">
                  <Link to="/auth/register">
                    <Volume2 className="mr-4 h-8 w-8" />
                    START YOUR JOURNEY
                    <ArrowRight className="ml-4 h-8 w-8" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section> */}
      </div>
    </AnimatedPage>
  )
}

export default LandingPage