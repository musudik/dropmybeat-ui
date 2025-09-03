export const Role = {
  ADMIN: 'Admin',
  MANAGER: 'Manager', 
  MEMBER: 'Member',
  GUEST: 'Guest'
};

export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: {
    canManageUsers: true,
    canManageAllEvents: true,  // Full access to all events
    canManageOwnEvents: true,
    canViewAllEvents: true,
    canManageSystem: true,
    canViewAnalytics: true,
    canJoinEvents: true,
    canRequestSongs: true,
    canLikeSongs: true,
    canViewAllMembers: true
  },
  [Role.MANAGER]: {
    canManageUsers: false,
    canManageAllEvents: false,  // No access to all events
    canManageOwnEvents: true,   // Only access to their own events
    canViewAllEvents: false,    // Cannot view all events
    canViewOwnEvents: true,     // Can view their own events
    canManageSystem: false,
    canViewAnalytics: true,     // Analytics for their events only
    canJoinEvents: false,       // Managers don't join events, they manage them
    canRequestSongs: false,
    canLikeSongs: false,
    canViewEventMembers: true   // Can view members of their events
  },
  [Role.MEMBER]: {
    canManageUsers: false,
    canManageAllEvents: false,
    canManageOwnEvents: false,
    canViewAllEvents: true,     // Can view all events
    canViewOwnEvents: true,
    canManageSystem: false,
    canViewAnalytics: false,
    canJoinEvents: true,        // Can join events
    canRequestSongs: true,      // Can request songs in joined events
    canLikeSongs: true,         // Can like songs in joined events
    canViewJoinedEvents: true
  },
  [Role.GUEST]: {
    canManageUsers: false,
    canManageAllEvents: false,
    canManageOwnEvents: false,
    canViewAllEvents: false,    // Cannot view all events
    canViewOwnEvents: false,
    canManageSystem: false,
    canViewAnalytics: false,
    canJoinEvents: true,        // Can join via link only
    canRequestSongs: true,      // Can request songs in joined events only
    canLikeSongs: true,         // Can like songs in joined events only
    canViewJoinedEvents: true   // Can only access joined events
  }
};

export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[Role.GUEST];
};

// Helper functions for role-based access control
export const canUserAccessEvent = (userRole, userId, event) => {
  const permissions = getRolePermissions(userRole);
  
  if (permissions.canManageAllEvents) return true;
  if (permissions.canManageOwnEvents && event.managerId === userId) return true;
  if (permissions.canViewAllEvents) return true;
  if (permissions.canViewJoinedEvents && event.participants?.some(p => p.userId === userId)) return true;
  
  return false;
};

export const canUserManageEvent = (userRole, userId, event) => {
  const permissions = getRolePermissions(userRole);
  
  if (permissions.canManageAllEvents) return true;
  if (permissions.canManageOwnEvents && event.managerId === userId) return true;
  
  return false;
};