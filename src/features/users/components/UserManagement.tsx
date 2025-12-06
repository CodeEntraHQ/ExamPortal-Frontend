import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Badge } from '../../../shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Avatar, AvatarFallback } from '../../../shared/components/ui/avatar';
import { 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Shield,
  MoreHorizontal,
  UserPlus,
  Eye,
  UserCheck,
  UserX,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../shared/components/ui/dropdown-menu';
import { Switch } from '../../../shared/components/ui/switch';
import { useNotifications } from '../../../shared/providers/NotificationProvider';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { getUsers, inviteUser, createUser, deregisterUser, deleteUser as deleteUserApi, activateUser, ApiUser } from '../../../services/api/user';
import { getEntities, getEntityById, ApiEntity } from '../../../services/api/entity';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT' | 'REPRESENTATIVE';
  entityId?: string;
  entityName?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  phone_number?: string;
  roll_number?: string;
}

interface UserManagementProps {
  currentEntity?: string;
}

// Map backend status to frontend status (treat ACTIVATION_PENDING as inactive)
const mapBackendStatus = (status: 'ACTIVE' | 'INACTIVE' | 'ACTIVATION_PENDING'): 'active' | 'inactive' => {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
    case 'ACTIVATION_PENDING':
      return 'inactive';
    default:
      return 'inactive';
  }
};

// Map API user to UI user
const mapApiUserToUiUser = (apiUser: ApiUser, entitiesMap: Map<string, ApiEntity>): User => {
  return {
    id: apiUser.id,
    name: apiUser.name || 'N/A',
    email: apiUser.email,
    role: apiUser.role,
    entityId: apiUser.entity_id,
    entityName: apiUser.entity_id ? entitiesMap.get(apiUser.entity_id)?.name : undefined,
    status: mapBackendStatus(apiUser.status),
    lastLogin: apiUser.last_login_at || undefined,
    createdAt: apiUser.created_at || new Date().toISOString(),
    phone_number: apiUser.phone_number,
    roll_number: apiUser.roll_number,
  };
};

export function UserManagement({ currentEntity }: UserManagementProps) {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<ApiEntity[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, ApiEntity>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateRepresentativeDialogOpen, setIsCreateRepresentativeDialogOpen] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAdminCardExpanded, setIsAdminCardExpanded] = useState(true);
  const [isStudentCardExpanded, setIsStudentCardExpanded] = useState(true);
  const [isRepresentativeCardExpanded, setIsRepresentativeCardExpanded] = useState(true);
  const limit = 10; // Backend limit is max 10

  // Fetch entities for mapping entity_id to entity name
  const fetchEntities = useCallback(async () => {
    try {
      const map = new Map<string, ApiEntity>();
      
      // Only SUPERADMIN can fetch all entities
      // ADMIN users can only fetch their own entity
      if (currentUser?.role === 'SUPERADMIN') {
        // Fetch entities with max limit (10) - if we need more, we can fetch multiple pages
        const response = await getEntities(1, 10);
        setEntities(response.payload.entities);
        response.payload.entities.forEach(entity => {
          map.set(entity.id, entity);
        });
        
        // If we have more pages and need all entities, fetch them
        if (response.payload.totalPages > 1) {
          const allEntities = [...response.payload.entities];
          for (let p = 2; p <= response.payload.totalPages; p++) {
            try {
              const nextResponse = await getEntities(p, 10);
              allEntities.push(...nextResponse.payload.entities);
              nextResponse.payload.entities.forEach(entity => {
                map.set(entity.id, entity);
              });
            } catch (err) {
              console.error(`Failed to fetch entities page ${p}:`, err);
              break; // Stop fetching if we hit an error
            }
          }
          setEntities(allEntities);
        }
      } else if (currentUser?.role === 'ADMIN' && currentUser?.entityId) {
        // ADMIN users can only fetch their own entity
        try {
          const response = await getEntityById(currentUser.entityId);
          if (response?.payload) {
            setEntities([response.payload]);
            map.set(response.payload.id, response.payload);
          }
        } catch (err) {
          // Silently fail - entity names will just not be displayed
          console.error('Failed to fetch entity:', err);
        }
      }
      // For other roles or users without entityId, skip fetching
      
      setEntitiesMap(map);
    } catch (err) {
      console.error('Failed to fetch entities:', err);
      // Don't show error for entities, just continue without entity names
    }
  }, [currentUser?.role, currentUser?.entityId]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend validation requires both entity_id and role
      // If user wants all roles, we need to fetch ADMIN and STUDENT separately
      const entityId = currentEntity || currentUser?.entityId;
      
      if (!entityId) {
        setError('Entity ID is required');
        showError('Entity ID is required to fetch users');
        setLoading(false);
        return;
      }

      // Fetch ADMIN, STUDENT, and REPRESENTATIVE users
      // Representatives are now bound to entities, so pass entity_id for them too
      const [adminResponse, studentResponse, representativeResponse] = await Promise.all([
        getUsers({ entity_id: entityId, role: 'ADMIN', page, limit: 10 }),
        getUsers({ entity_id: entityId, role: 'STUDENT', page, limit: 10 }),
        getUsers({ entity_id: entityId, role: 'REPRESENTATIVE', page, limit: 10 }).catch(() => ({
          payload: { users: [], total: 0, totalPages: 0 }
        })),
      ]);
      
      const allUsers = [
        ...adminResponse.payload.users, 
        ...studentResponse.payload.users,
        ...representativeResponse.payload.users
      ];
      const totalCount = adminResponse.payload.total + studentResponse.payload.total + representativeResponse.payload.total;
      const maxPages = Math.max(
        adminResponse.payload.totalPages, 
        studentResponse.payload.totalPages,
        representativeResponse.payload.totalPages
      );

      const mappedUsers = allUsers.map(apiUser => 
        mapApiUserToUiUser(apiUser, entitiesMap)
      );
      setUsers(mappedUsers);
      setTotal(totalCount);
      setTotalPages(maxPages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentEntity, page, entitiesMap, showError, currentUser?.entityId]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Separate users by role
  const adminUsers = filteredUsers.filter(user => user.role === 'ADMIN' || user.role === 'SUPERADMIN');
  const studentUsers = filteredUsers.filter(user => user.role === 'STUDENT');
  const representativeUsers = filteredUsers.filter(user => user.role === 'REPRESENTATIVE');

  const getRoleBadgeVariant = (role: User['role']) => {
    const variants = {
      SUPERADMIN: { variant: 'destructive' as const, className: 'bg-destructive text-destructive-foreground' },
      ADMIN: { variant: 'default' as const, className: 'bg-primary text-primary-foreground' },
      STUDENT: { variant: 'secondary' as const, className: 'bg-secondary text-secondary-foreground' },
      REPRESENTATIVE: { variant: 'outline' as const, className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300' }
    };
    return variants[role];
  };

  const getStatusBadgeVariant = (status: User['status']) => {
    const variants = {
      active: { variant: 'default' as const, className: 'bg-green-600 text-white dark:bg-green-500' },
      inactive: { variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' }
    };
    return variants[status];
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      // If user is active, deactivate them
      if (user.status === 'active') {
        await deregisterUser(userId);
        success('User deactivated successfully');
      } else {
        // User is inactive - activate directly
        await activateUser(userId);
        success('User activated successfully');
      }

      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user status';
      showError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUserApi(userId);
      success('User deleted successfully');
      await fetchUsers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      showError(errorMessage);
    }
  };

  // Calculate stats from real data
  // Exclude representatives from entity user counts (they're external users)
  const entityUsers = users.filter(u => u.role !== 'REPRESENTATIVE');
  const totalUsers = entityUsers.length;
  const activeUsers = entityUsers.filter(u => u.status === 'active').length;
  const inactiveUsers = entityUsers.filter(u => u.status === 'inactive').length;
  const totalRepresentatives = representativeUsers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users and their permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateRepresentativeDialogOpen} onOpenChange={setIsCreateRepresentativeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Representative
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Representative</DialogTitle>
                <DialogDescription>
                  Create a new representative account. Representatives will be bound to the current entity.
                </DialogDescription>
              </DialogHeader>
              <CreateRepresentativeForm 
                entityId={currentEntity}
                onClose={() => setIsCreateRepresentativeDialogOpen(false)}
                onSuccess={async () => {
                  setIsCreateRepresentativeDialogOpen(false);
                  await fetchUsers();
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign appropriate permissions
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <CreateUserForm 
                  onClose={() => setIsCreateDialogOpen(false)}
                  onSuccess={async () => {
                    setIsCreateDialogOpen(false);
                    await fetchUsers();
                  }}
                  currentEntity={currentEntity}
                  entities={entities}
                  currentUser={currentUser}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">entity users</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{activeUsers}</div>
                  <p className="text-xs text-muted-foreground">active</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Inactive Users</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{inactiveUsers}</div>
                  <p className="text-xs text-muted-foreground">inactive</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Representatives</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{totalRepresentatives}</div>
                  <p className="text-xs text-muted-foreground">external</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdminCardExpanded(!isAdminCardExpanded)}
                className="h-8 w-8 p-0"
              >
                {isAdminCardExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div>
                <CardTitle>Admins</CardTitle>
                <CardDescription>Manage admin accounts</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{adminUsers.length}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </CardHeader>
        {isAdminCardExpanded && (
          <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchUsers()}
              >
                Retry
              </Button>
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admins found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.phone_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                          />
                          <Badge 
                            variant={getStatusBadgeVariant(user.status).variant}
                            className={getStatusBadgeVariant(user.status).className}
                          >
                            {user.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowUserDetail(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        )}
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStudentCardExpanded(!isStudentCardExpanded)}
                className="h-8 w-8 p-0"
              >
                {isStudentCardExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student accounts</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{studentUsers.length}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </CardHeader>
        {isStudentCardExpanded && (
          <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchUsers()}
              >
                Retry
              </Button>
            </div>
          ) : studentUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.roll_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.phone_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                          />
                          <Badge 
                            variant={getStatusBadgeVariant(user.status).variant}
                            className={getStatusBadgeVariant(user.status).className}
                          >
                            {user.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowUserDetail(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        )}
      </Card>

      {/* Representatives Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRepresentativeCardExpanded(!isRepresentativeCardExpanded)}
                className="h-8 w-8 p-0"
              >
                {isRepresentativeCardExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div>
                <CardTitle>Representatives</CardTitle>
                <CardDescription>Manage representative accounts</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{representativeUsers.length}</div>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </CardHeader>
        {isRepresentativeCardExpanded && (
          <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchUsers()}
              >
                Retry
              </Button>
            </div>
          ) : representativeUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No representatives found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {representativeUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.phone_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                          />
                          <Badge 
                            variant={getStatusBadgeVariant(user.status).variant}
                            className={getStatusBadgeVariant(user.status).className}
                          >
                            {user.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowUserDetail(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      <Dialog open={!!showUserDetail} onOpenChange={(open) => !open && setShowUserDetail(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information and participation summary for {showUserDetail?.name || 'User'}
            </DialogDescription>
          </DialogHeader>
          {showUserDetail && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(showUserDetail.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{showUserDetail.name || 'N/A'}</h3>
                  <p className="text-muted-foreground">{showUserDetail.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getRoleBadgeVariant(showUserDetail.role).variant}
                      className={getRoleBadgeVariant(showUserDetail.role).className}
                    >
                      {showUserDetail.role}
                    </Badge>
                    <Badge 
                      variant={getStatusBadgeVariant(showUserDetail.status).variant}
                      className={getStatusBadgeVariant(showUserDetail.status).className}
                    >
                      {showUserDetail.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entity:</span>
                      <span className="text-sm">{showUserDetail.entityName || showUserDetail.entityId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{new Date(showUserDetail.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <span className="text-sm">
                        {showUserDetail.lastLogin 
                          ? new Date(showUserDetail.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Exams Taken:</span>
                      <span className="text-sm font-semibold">
                        {showUserDetail.role === 'STUDENT' ? 'N/A' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Score:</span>
                      <span className="text-sm font-semibold">
                        {showUserDetail.role === 'STUDENT' ? 'N/A' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate:</span>
                      <span className="text-sm font-semibold">
                        {showUserDetail.role === 'STUDENT' ? 'N/A' : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CreateUserFormProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  currentEntity?: string;
  entities: ApiEntity[];
  currentUser: any;
}

function CreateUserForm({ onClose, onSuccess, currentEntity, entities, currentUser }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '' as '' | 'ADMIN' | 'STUDENT',
    entityId: currentEntity || '',
    phone_number: '',
    address: '',
    bio: '',
    gender: '' as '' | 'MALE' | 'FEMALE',
    roll_number: '',
  });
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotifications();
  const isStudent = formData.role === 'STUDENT';

  // Filter entities based on user role
  const availableEntities = currentUser?.role === 'SUPERADMIN' 
    ? entities 
    : currentEntity 
      ? entities.filter(e => e.id === currentEntity)
      : [];

  useEffect(() => {
    if (currentEntity) {
      setFormData(prev => ({ ...prev, entityId: currentEntity }));
    } else if (currentUser?.entityId) {
      setFormData(prev => ({ ...prev, entityId: currentUser.entityId }));
    }
  }, [currentEntity, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.role) {
      showError('Please fill in all required fields');
      return;
    }

    if (!formData.entityId && currentUser?.role === 'SUPERADMIN') {
      showError('Please select an entity');
      return;
    }

    if (isStudent && !formData.roll_number.trim()) {
      showError('Roll number is required for student users');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        role: formData.role,
        entity_id: formData.entityId || undefined,
      };

      // Add optional fields only if they have values
      if (formData.name) payload.name = formData.name;
      if (formData.phone_number) {
        // Convert phone number to integer (remove non-digits first)
        const phoneDigits = formData.phone_number.replace(/\D/g, '');
        if (phoneDigits.length > 0) {
          const phoneNum = parseInt(phoneDigits, 10);
          // Backend validation requires phone_number to be between 6000000000 and 9999999999
          if (phoneNum >= 6000000000 && phoneNum <= 9999999999) {
            payload.phone_number = phoneNum;
          }
        }
      }
      if (formData.address) payload.address = formData.address;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.roll_number) payload.roll_number = formData.roll_number.trim();

      await createUser(payload);
      const roleName = formData.role === 'STUDENT' ? 'Student' : formData.role === 'ADMIN' ? 'Admin' : 'User';
      success(`${roleName} created successfully. An email with a password setup link has been sent to the user.`);
      await onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create user';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Entity Information (if currentEntity is provided) */}
      {currentEntity && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-md border">
          <div>
            <h3 className="text-sm font-semibold mb-2">Entity Details</h3>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-base font-semibold">
                {entities.find(e => e.id === currentEntity)?.name || 'Current Entity'}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            User will be created for this entity
          </p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({ ...formData, gender: value as 'MALE' | 'FEMALE' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isStudent && (
          <div className="space-y-2">
            <Label htmlFor="roll_number">Roll Number *</Label>
            <Input
              id="roll_number"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
              placeholder="Enter roll number"
              required={isStudent}
            />
            <p className="text-xs text-muted-foreground">Required for student accounts</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Enter bio"
            rows={3}
          />
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => 
            setFormData((prev) => ({
              ...prev,
              role: value as 'ADMIN' | 'STUDENT',
              roll_number: value === 'STUDENT' ? prev.roll_number : '',
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {currentUser?.role === 'SUPERADMIN' && (
              <SelectItem value="ADMIN">Admin</SelectItem>
            )}
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Selection (only for SUPERADMIN when no currentEntity) */}
      {currentUser?.role === 'SUPERADMIN' && !currentEntity && (
        <div className="space-y-2">
          <Label htmlFor="entity">Entity *</Label>
          <Select 
            value={formData.entityId} 
            onValueChange={(value) => setFormData({ ...formData, entityId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              {availableEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}

interface CreateRepresentativeFormProps {
  entityId?: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function CreateRepresentativeForm({ entityId, onClose, onSuccess }: CreateRepresentativeFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone_number: '',
    address: '',
    bio: '',
    gender: '' as '' | 'MALE' | 'FEMALE',
  });
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      showError('Please fill in all required fields');
      return;
    }

    if (!entityId) {
      showError('Entity ID is required to create a representative');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: formData.email,
        role: 'REPRESENTATIVE',
        entity_id: entityId, // Representatives are now bound to entities
      };

      // Add optional fields only if they have values
      if (formData.name) payload.name = formData.name;
      if (formData.phone_number) {
        // Convert phone number to integer (remove non-digits first)
        const phoneDigits = formData.phone_number.replace(/\D/g, '');
        if (phoneDigits.length > 0) {
          const phoneNum = parseInt(phoneDigits, 10);
          // Backend validation requires phone_number to be between 6000000000 and 9999999999
          if (phoneNum >= 6000000000 && phoneNum <= 9999999999) {
            payload.phone_number = phoneNum;
          }
        }
      }
      if (formData.address) payload.address = formData.address;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.gender) payload.gender = formData.gender;

      await createUser(payload);
      success('Representative created successfully. An email with a password setup link has been sent to the user.');
      await onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create representative';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rep-name">Full Name</Label>
            <Input
              id="rep-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rep-email">Email Address *</Label>
            <Input
              id="rep-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rep-phone_number">Phone Number</Label>
            <Input
              id="rep-phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rep-gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({ ...formData, gender: value as 'MALE' | 'FEMALE' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rep-address">Address</Label>
          <Input
            id="rep-address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rep-bio">Bio</Label>
          <Textarea
            id="rep-bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Enter bio"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Representative'
          )}
        </Button>
      </div>
    </form>
  );
}
