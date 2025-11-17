import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RealTimeProvider } from './contexts/RealTimeContext'
import { GuestProvider } from './contexts/GuestContext'
import { GDPRProvider } from './contexts/GDPRContext'
import { useAuth } from './contexts/AuthContext'
import { useGuest } from './contexts/GuestContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import GuestNavigation from './components/GuestNavigation'
import GDPRConsentBanner from './components/GDPRConsentBanner'
import GDPRConsentManager from './components/GDPRConsentManager'
import Footer from './components/Footer'

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
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import CookiePolicyPage from './pages/legal/CookiePolicyPage'
import GDPRDataRights from './components/GDPRDataRights'
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
          
          {/* Legal pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/data-rights" element={<GDPRDataRights />} />
          
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
      
      {/* Footer */}
      <Footer />
      
      {/* GDPR Components */}
      <GDPRConsentBanner />
      <GDPRConsentManager />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <GuestProvider>
        <GDPRProvider>
          <RealTimeProvider>
            <AppContent />
          </RealTimeProvider>
        </GDPRProvider>
      </GuestProvider>
    </AuthProvider>
  )
}

export default App