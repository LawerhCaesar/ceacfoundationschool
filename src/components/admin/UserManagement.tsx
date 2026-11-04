import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { User } from '@/types';
import { Search, Users, Loader2, UserCog, RefreshCw, X, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Building2 } from 'lucide-react';

type SortColumn = 'name' | 'email' | 'church' | 'role' | 'registeredAt';
type SortDirection = 'asc' | 'desc';

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<'student' | 'teacher' | 'admin' | 'pastor'>('student');
  const [changingRoles, setChangingRoles] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    church: '',
    fellowship: '',
    cell: '',
  });
  const [savingChurchInfo, setSavingChurchInfo] = useState(false);

  useEffect(() => {
    fetchUsers();

    // Auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await supabaseDb.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-100';
      case 'pastor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-100';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100';
    }
  };

  // Get unique values for filters
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(users.map(u => u.role))).sort();
  }, [users]);

  const uniqueChurches = useMemo(() => {
    const churches = users
      .map(u => u.church)
      .filter((c): c is string => !!c);
    return Array.from(new Set(churches)).sort();
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    // First, filter the users
    const filtered = users.filter(user => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.church?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fellowship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cell?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Church filter
      const matchesChurch = churchFilter === 'all' || user.church === churchFilter;

      return matchesSearch && matchesRole && matchesChurch;
    });

    // Then, sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'church':
          aValue = (a.church || '').toLowerCase();
          bValue = (b.church || '').toLowerCase();
          break;
        case 'role':
          // Sort by role hierarchy: admin > pastor > teacher > student
          const roleOrder = { admin: 4, pastor: 3, teacher: 2, student: 1 };
          aValue = roleOrder[a.role as keyof typeof roleOrder] || 0;
          bValue = roleOrder[b.role as keyof typeof roleOrder] || 0;
          break;
        case 'registeredAt':
          aValue = new Date(a.registeredAt).getTime();
          bValue = new Date(b.registeredAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, searchTerm, roleFilter, churchFilter, sortColumn, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setChurchFilter('all');
  };

  // Handle sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Handle church info edit
  const handleEditChurchInfo = (user: User) => {
    setEditingUser(user);
    setEditForm({
      church: user.church || '',
      fellowship: user.fellowship || '',
      cell: user.cell || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveChurchInfo = async () => {
    if (!editingUser) return;

    setSavingChurchInfo(true);

    try {
      await supabaseDb.updateUser(editingUser.id, {
        church: editForm.church || null,
        fellowship: editForm.fellowship || null,
        cell: editForm.cell || null,
      });

      await fetchUsers();
      setEditDialogOpen(false);
      setEditingUser(null);

      toast({
        title: 'Church info updated',
        description: `Updated church information for ${editingUser.name}`,
      });
    } catch (error) {
      console.error('Error updating church info:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update church information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingChurchInfo(false);
    }
  };

  // Handle single user role change
  const handleRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin' | 'pastor') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check if teacher requires church
    if (newRole === 'teacher' && !user.church) {
      toast({
        title: 'Cannot change role',
        description: 'User must have a church assigned before being promoted to teacher',
        variant: 'destructive',
      });
      return;
    }

    setChangingRoles(prev => new Set(prev).add(userId));
    
    try {
      await supabaseDb.updateUser(userId, { role: newRole });
      await fetchUsers();
      toast({
        title: 'Role updated',
        description: `${user.name}'s role has been changed to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChangingRoles(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  // Handle bulk selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Handle bulk role change
  const handleBulkRoleChange = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user to change roles',
        variant: 'destructive',
      });
      return;
    }

    // Check if any selected user lacks church for teacher role
    if (bulkRole === 'teacher') {
      const usersWithoutChurch = Array.from(selectedUsers)
        .map(id => users.find(u => u.id === id))
        .filter(u => u && !u.church);
      
      if (usersWithoutChurch.length > 0) {
        toast({
          title: 'Cannot change roles',
          description: `${usersWithoutChurch.length} selected user(s) don't have a church assigned`,
          variant: 'destructive',
        });
        return;
      }
    }

    const count = selectedUsers.size;
    const selectedUserIds = Array.from(selectedUsers);
    
    setChangingRoles(new Set(selectedUserIds));

    try {
      // Update all selected users
      await Promise.all(
        selectedUserIds.map(userId => 
          supabaseDb.updateUser(userId, { role: bulkRole })
        )
      );

      await fetchUsers();
      setSelectedUsers(new Set());
      
      toast({
        title: 'Bulk update successful',
        description: `Updated ${count} user(s) to ${bulkRole} role`,
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: 'Bulk update failed',
        description: 'Some users may not have been updated. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChangingRoles(new Set());
    }
  };

  // Calculate role statistics
  const roleStats = useMemo(() => {
    return {
      admin: users.filter(u => u.role === 'admin').length,
      pastor: users.filter(u => u.role === 'pastor').length,
      teacher: users.filter(u => u.role === 'teacher').length,
      student: users.filter(u => u.role === 'student').length,
    };
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">User Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Admins</CardTitle>
            <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{roleStats.admin}</div>
            <p className="text-xs text-muted-foreground mt-1">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pastors</CardTitle>
            <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{roleStats.pastor}</div>
            <p className="text-xs text-muted-foreground mt-1">Church pastors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Teachers</CardTitle>
            <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{roleStats.teacher}</div>
            <p className="text-xs text-muted-foreground mt-1">Class teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{roleStats.student}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedUsers.size > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm sm:text-base">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Select value={bulkRole} onValueChange={(value: any) => setBulkRole(value)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleBulkRoleChange}
                  disabled={changingRoles.size > 0}
                  className="w-full sm:w-auto"
                >
                  {changingRoles.size > 0 ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Change to {bulkRole}
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => setSelectedUsers(new Set())}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
          <CardDescription>Filter users by search, role, or church</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, email, church..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Church Filter */}
            <div className="space-y-2">
              <Label htmlFor="church-filter">Church</Label>
              <Select value={churchFilter} onValueChange={setChurchFilter}>
                <SelectTrigger id="church-filter">
                  <SelectValue placeholder="All Churches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Churches</SelectItem>
                  {uniqueChurches.map(church => (
                    <SelectItem key={church} value={church}>{church}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || roleFilter !== 'all' || churchFilter !== 'all') && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Users List</CardTitle>
          <CardDescription>
            {filteredUsers.length === users.length 
              ? `Showing all ${users.length} users`
              : `Showing ${filteredUsers.length} of ${users.length} users`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all users"
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-foreground transition-colors font-medium"
                    >
                      Name
                      {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center hover:text-foreground transition-colors font-medium"
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('church')}
                      className="flex items-center hover:text-foreground transition-colors font-medium"
                    >
                      Church
                      {getSortIcon('church')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center hover:text-foreground transition-colors font-medium"
                    >
                      Current Role
                      {getSortIcon('role')}
                    </button>
                  </TableHead>
                  <TableHead>Change Role</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('registeredAt')}
                      className="flex items-center hover:text-foreground transition-colors font-medium"
                    >
                      Registered
                      {getSortIcon('registeredAt')}
                    </button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm || roleFilter !== 'all' || churchFilter !== 'all'
                        ? 'No users match your filters'
                        : 'No users found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => {
                    const isChanging = changingRoles.has(user.id);
                    const isSelected = selectedUsers.has(user.id);

                    return (
                      <TableRow key={user.id} className={isSelected ? 'bg-accent/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{user.church || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: any) => handleRoleChange(user.id, value)}
                            disabled={isChanging}
                          >
                            <SelectTrigger className="w-32">
                              {isChanging ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs">Updating...</span>
                                </span>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="pastor">Pastor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(user.registeredAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditChurchInfo(user)}
                            title="Edit church information"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Church Info Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Edit Church Information
            </DialogTitle>
            <DialogDescription>
              Update church, fellowship, and cell assignment for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-church">Church</Label>
              <Input
                id="edit-church"
                placeholder="Enter church name"
                value={editForm.church}
                onChange={(e) => setEditForm({ ...editForm, church: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fellowship">Fellowship</Label>
              <Input
                id="edit-fellowship"
                placeholder="Enter fellowship name"
                value={editForm.fellowship}
                onChange={(e) => setEditForm({ ...editForm, fellowship: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cell">Cell</Label>
              <Input
                id="edit-cell"
                placeholder="Enter cell name"
                value={editForm.cell}
                onChange={(e) => setEditForm({ ...editForm, cell: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={savingChurchInfo}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChurchInfo}
              disabled={savingChurchInfo}
            >
              {savingChurchInfo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

