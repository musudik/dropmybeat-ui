import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Music, Users, Calendar, Zap, Star, ArrowRight, Play, Headphones, Radio } from 'lucide-react'
import { containerVariants, slideInVariants, fadeVariants } from '../lib/animations'
import AnimatedPage from '../components/AnimatedPage'

const LandingPage = () => {
  const features = [
    {
      icon: Music,
      title: "Song Requests",
      description: "Request your favorite songs and let the crowd decide what plays next",
      color: "text-pink-400"
    },
    {
      icon: Users,
      title: "Event Management",
      description: "Create and manage events with real-time participant tracking",
      color: "text-blue-400"
    },
    {
      icon: Calendar,
      title: "Live Events",
      description: "Join live music events and connect with other music lovers",
      color: "text-green-400"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about event updates and song approvals",
      color: "text-yellow-400"
    }
  ]

  const stats = [
    { label: "Active Events", value: "50+", icon: Calendar },
    { label: "Song Requests", value: "1000+", icon: Music },
    { label: "Happy Users", value: "500+", icon: Users },
    { label: "Cities", value: "25+", icon: Star }
  ]

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10" />
          <div className="container mx-auto px-4 relative">
            <motion.div 
              className="text-center space-y-8 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={slideInVariants.down}>
                <Badge variant="neon" className="mb-4 text-sm px-4 py-2">
                  🎵 The Future of Music Events
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight"
                variants={slideInVariants.up}
              >
                Drop My Beat
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                variants={slideInVariants.up}
              >
                The ultimate platform for interactive music events. Request songs, join events, and let the crowd control the vibe.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                variants={slideInVariants.up}
              >
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth/register">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth/login">
                    <Play className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating Music Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 text-pink-400/20"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Music className="h-12 w-12" />
            </motion.div>
            <motion.div
              className="absolute top-40 right-20 text-purple-400/20"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Headphones className="h-16 w-16" />
            </motion.div>
            <motion.div
              className="absolute bottom-20 left-20 text-cyan-400/20"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <Radio className="h-10 w-10" />
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
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
                    className="text-center space-y-2"
                  >
                    <Icon className="h-8 w-8 mx-auto text-pink-400" />
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center space-y-4 mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                Why Choose DropMyBeat?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience music events like never before with our cutting-edge features
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div key={feature.title} variants={slideInVariants.up} custom={index}>
                    <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <Icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-pink-500/10 to-purple-600/10">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center space-y-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold">
                Ready to Drop Your Beat?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of music lovers and start creating unforgettable experiences today.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" variant="neon" className="text-lg px-12 py-6">
                  <Link to="/auth/register">
                    Start Your Journey
                    <Music className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </AnimatedPage>
  )
}

export default LandingPage