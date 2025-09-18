import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RealTimeProvider } from './contexts/RealTimeContext'
import { GuestProvider } from './contexts/GuestContext'
import { useAuth } from './contexts/AuthContext'
import { useGuest } from './contexts/GuestContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import GuestNavigation from './components/GuestNavigation'

// Page imports
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManagerEvents from './pages/manager/ManagerEvents'
import ParticipantJoin from './pages/participant/ParticipantJoin'
import EventsPage from './pages/EventsPage'
import JoinEventPage from './pages/JoinEventPage'
import EventDetailsPage from './pages/EventDetailsPage'
import EventFeedbackPage from './pages/EventFeedbackPage'
import MemberDashboard from './pages/member/MemberDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import GuestDashboard from './pages/guest/GuestDashboard'
import { Role } from './lib/constants'

const AppContent = () => {
  const { user } = useAuth()
  const { isGuest } = useGuest()

  return (
    <div className="min-h-screen bg-background">
      {/* Conditional Navigation */}
      {isGuest ? <GuestNavigation /> : <Navigation />}
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/join/:eventId" element={<JoinEventPage />} />
          <Route path="/event/:eventId" element={<EventDetailsPage />} />
          <Route path="/events/:eventId/feedback" element={<EventFeedbackPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole={Role.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Manager routes */}
          <Route path="/manager/*" element={
            <ProtectedRoute requiredRole={[Role.MANAGER, Role.ADMIN]}>
              <ManagerEvents />
            </ProtectedRoute>
          } />
          
          {/* Member routes */}
          <Route path="/member/*" element={
            <ProtectedRoute requiredRole={[Role.MEMBER, Role.MANAGER, Role.ADMIN]}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          {/* Role-specific dashboard routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole={Role.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager/dashboard" element={
            <ProtectedRoute requiredRole={[Role.MANAGER, Role.ADMIN]}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/member/dashboard" element={
            <ProtectedRoute requiredRole={[Role.MEMBER, Role.MANAGER, Role.ADMIN]}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/guest/dashboard" element={
            <GuestDashboard />
          } />
          
          {/* Update existing routes to use Member instead of Participant */}
          <Route path="/member/*" element={
            <ProtectedRoute requiredRole={[Role.MEMBER, Role.MANAGER, Role.ADMIN]}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <GuestProvider>
        <RealTimeProvider>
          <AppContent />
        </RealTimeProvider>
      </GuestProvider>
    </AuthProvider>
  )
}

export default App