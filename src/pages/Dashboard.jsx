import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
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
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-muted-foreground text-lg">Here's your dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-neon-pink rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.fullName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Login Count:</span>
              <span className="text-sm font-medium">{user.loginCount}</span>
            </div>
          </div>
        </Card>

        {/* Organization Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Organization</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-medium">{user.organizationName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-medium">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </Card>

        {/* Favorite Genres */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {user.favoriteGenres && user.favoriteGenres.length > 0 ? (
              user.favoriteGenres.map((genre, index) => (
                <Badge key={index} variant="outline">
                  {genre}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No genres selected</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'Admin' && (
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-neon-pink">Manage Users</h3>
              <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove users</p>
            </Card>
          )}
          {(user.role === 'Admin' || user.role === 'Manager') && (
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-neon-pink">Manage Events</h3>
              <p className="text-sm text-muted-foreground mt-1">Create and manage events</p>
            </Card>
          )}
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-neon-pink">Join Events</h3>
            <p className="text-sm text-muted-foreground mt-1">Browse and join events</p>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-neon-pink">Profile Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Update your profile</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard