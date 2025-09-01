import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { personAPI } from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Badge } from '../../components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/Select'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'
import { Toast, ToastTitle, ToastDescription } from '../../components/ui/Toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedManager, setSelectedManager] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'manager',
    organization: '',
    favoriteGenres: []
  })
  const [toast, setToast] = useState(null)

  // Fetch managers on component mount
  useEffect(() => {
    fetchManagers()
  }, [])

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const response = await personAPI.getAll({ role: 'manager,admin' })
      setManagers(response.data.data || [])
    } catch (error) {
      showToast('Error fetching managers', 'destructive')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, variant = 'default') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 5000)
  }

  const handleCreateManager = async (e) => {
    e.preventDefault()
    try {
      await personAPI.create(formData)
      showToast('Manager created successfully', 'success')
      setIsCreateModalOpen(false)
      resetForm()
      fetchManagers()
    } catch (error) {
      showToast('Error creating manager', 'destructive')
    }
  }

  const handleUpdateManager = async (e) => {
    e.preventDefault()
    try {
      await personAPI.update(selectedManager.id, formData)
      showToast('Manager updated successfully', 'success')
      setIsEditModalOpen(false)
      resetForm()
      fetchManagers()
    } catch (error) {
      showToast('Error updating manager', 'destructive')
    }
  }

  const handleDeleteManager = async () => {
    try {
      await personAPI.delete(selectedManager.id)
      showToast('Manager deleted successfully', 'success')
      setIsDeleteModalOpen(false)
      setSelectedManager(null)
      fetchManagers()
    } catch (error) {
      showToast('Error deleting manager', 'destructive')
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'manager',
      organization: '',
      favoriteGenres: []
    })
    setSelectedManager(null)
  }

  const openEditModal = (manager) => {
    setSelectedManager(manager)
    setFormData({
      firstName: manager.firstName || '',
      lastName: manager.lastName || '',
      email: manager.email || '',
      password: '', // Don't populate password for security
      role: manager.role || 'manager',
      organization: manager.organization || '',
      favoriteGenres: manager.favoriteGenres || []
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (manager) => {
    setSelectedManager(manager)
    setIsDeleteModalOpen(true)
  }

  // Filter managers based on search and role
  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || manager.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'neon'
      case 'manager': return 'default'
      case 'participant': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-pink"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neon-pink mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage managers and system users</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="neon-button"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Manager
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <svg className="h-4 w-4 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-pink">{managers.filter(m => m.role === 'manager').length}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <svg className="h-4 w-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">{managers.filter(m => m.role === 'admin').length}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{managers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="neon-card">
        <CardHeader>
          <CardTitle>Manager Management</CardTitle>
          <CardDescription>Search and filter system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                {selectedRole === 'all' ? 'All Roles' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Managers List */}
          <div className="space-y-4">
            {filteredManagers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No managers found matching your criteria.
              </div>
            ) : (
              filteredManagers.map((manager) => (
                <div key={manager.id} className="flex items-center justify-between p-4 border rounded-lg neon-border bg-dark-card/50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={manager.profilePicture} />
                      <AvatarFallback>
                        {manager.firstName?.[0]}{manager.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {manager.firstName} {manager.lastName}
                        </h3>
                        <Badge variant={getRoleBadgeVariant(manager.role)}>
                          {manager.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{manager.email}</p>
                      {manager.organization && (
                        <p className="text-xs text-muted-foreground">{manager.organization}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(manager)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteModal(manager)}
                      disabled={manager.id === user?.id} // Prevent self-deletion
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Manager Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Manager</DialogTitle>
            <DialogDescription>
              Add a new manager to the system. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateManager} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="neon-button">
                Create Manager
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Manager Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
            <DialogDescription>
              Update manager information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateManager} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="editPassword">New Password (optional)</Label>
              <Input
                id="editPassword"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Leave empty to keep current password"
              />
            </div>
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editOrganization">Organization</Label>
              <Input
                id="editOrganization"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="neon-button">
                Update Manager
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manager</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedManager?.firstName} {selectedManager?.lastName}? 
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteManager}>
              Delete Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast variant={toast.variant}>
            <ToastTitle>
              {toast.variant === 'success' ? 'Success' : toast.variant === 'destructive' ? 'Error' : 'Notification'}
            </ToastTitle>
            <ToastDescription>{toast.message}</ToastDescription>
          </Toast>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard