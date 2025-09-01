import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RealTimeProvider } from './contexts/RealTimeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navigation from './components/Navigation'

// Page imports
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManagerEvents from './pages/manager/ManagerEvents'
import ParticipantJoin from './pages/participant/ParticipantJoin'
import EventsPage from './pages/EventsPage'

function App() {
  return (
    <AuthProvider>
      <RealTimeProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events" element={<EventsPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Manager routes */}
              <Route path="/manager/*" element={
                <ProtectedRoute requiredRole={["Manager", "Admin"]}>
                  <ManagerEvents />
                </ProtectedRoute>
              } />
              
              {/* Participant routes */}
              <Route path="/participant/*" element={
                <ProtectedRoute requiredRole={["Participant", "Manager", "Admin"]}>
                  <ParticipantJoin />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </RealTimeProvider>
    </AuthProvider>
  )
}

export default App