import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { User } from '@/types';
import { Search, Users, GraduationCap, Loader2, Filter, UserMinus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { navigateToUserProfile } from '@/lib/navigation';

interface AdminTeachersProps {
  preFilteredUsers?: User[]; // Optional: pre-filtered users
}

export const AdminTeachers = ({ preFilteredUsers }: AdminTeachersProps = {}) => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [fellowshipFilter, setFellowshipFilter] = useState<string>('all');
  const [cellFilter, setCellFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (preFilteredUsers) {
      // Use pre-filtered data
      const teachersData = preFilteredUsers.filter(u => u.role === 'teacher');
      setTeachers(teachersData);
      setLoading(false);
    } else {
      // Fetch all data (for admin)
      fetchTeachers();

      // Auto-refresh every 5 seconds
      const intervalId = setInterval(() => {
        fetchTeachers();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [preFilteredUsers]);

  const fetchTeachers = async () => {
    try {
      const usersData = await supabaseDb.getUsers();
      const teachersData = usersData.filter(u => u.role === 'teacher');
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueChurches = useMemo(() => {
    const churches = teachers
      .map(t => t.church)
      .filter((c): c is string => !!c);
    return Array.from(new Set(churches)).sort();
  }, [teachers]);

  const uniqueFellowships = useMemo(() => {
    const fellowships = teachers
      .map(t => t.fellowship)
      .filter((f): f is string => !!f);
    return Array.from(new Set(fellowships)).sort();
  }, [teachers]);

  const uniqueCells = useMemo(() => {
    const cells = teachers
      .map(t => t.cell)
      .filter((c): c is string => !!c);
    return Array.from(new Set(cells)).sort();
  }, [teachers]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  // Filter and sort teachers
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.church?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.fellowship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.cell?.toLowerCase().includes(searchTerm.toLowerCase());

      // Church filter
      const matchesChurch = churchFilter === 'all' || teacher.church === churchFilter;

      // Fellowship filter
      const matchesFellowship = fellowshipFilter === 'all' || teacher.fellowship === fellowshipFilter;

      // Cell filter
      const matchesCell = cellFilter === 'all' || teacher.cell === cellFilter;

      return matchesSearch && matchesChurch && matchesFellowship && matchesCell;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField as keyof User];
        let bValue: any = b[sortField as keyof User];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Convert to strings for comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [teachers, searchTerm, churchFilter, fellowshipFilter, cellFilter, sortField, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setChurchFilter('all');
    setFellowshipFilter('all');
    setCellFilter('all');
  };

  const handleDemoteToStudent = async (teacher: User) => {
    try {
      await supabaseDb.updateUser(teacher.id, { role: 'student' });
      await fetchTeachers(); // Refresh data
      toast({
        title: 'User demoted',
        description: `${teacher.name} has been changed to student role`,
      });
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: 'Demotion failed',
        description: 'Failed to change user to student. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Teachers Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage all registered teachers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Churches</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{uniqueChurches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Different churches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Fellowships</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{uniqueFellowships.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Different fellowships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Filtered Results</CardTitle>
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{filteredTeachers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Matching criteria</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
          <CardDescription>Filter teachers by search, church, fellowship, or cell</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
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

            {/* Fellowship Filter */}
            <div className="space-y-2">
              <Label htmlFor="fellowship-filter">Fellowship</Label>
              <Select value={fellowshipFilter} onValueChange={setFellowshipFilter}>
                <SelectTrigger id="fellowship-filter">
                  <SelectValue placeholder="All Fellowships" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fellowships</SelectItem>
                  {uniqueFellowships.map(fellowship => (
                    <SelectItem key={fellowship} value={fellowship}>{fellowship}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cell Filter */}
            <div className="space-y-2">
              <Label htmlFor="cell-filter">Cell</Label>
              <Select value={cellFilter} onValueChange={setCellFilter}>
                <SelectTrigger id="cell-filter">
                  <SelectValue placeholder="All Cells" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cells</SelectItem>
                  {uniqueCells.map(cell => (
                    <SelectItem key={cell} value={cell}>{cell}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || churchFilter !== 'all' || fellowshipFilter !== 'all' || cellFilter !== 'all') && (
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

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Teachers List</CardTitle>
          <CardDescription>
            {filteredTeachers.length === teachers.length 
              ? `Showing all ${teachers.length} teachers`
              : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Name
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('email')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Email
                      {getSortIcon('email')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('church')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Church
                      {getSortIcon('church')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('fellowship')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Fellowship
                      {getSortIcon('fellowship')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('cell')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Cell
                      {getSortIcon('cell')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('registeredAt')}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Registered
                      {getSortIcon('registeredAt')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm || churchFilter !== 'all' || fellowshipFilter !== 'all' || cellFilter !== 'all'
                        ? 'No teachers match your filters'
                        : 'No teachers registered yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map(teacher => (
                    <TableRow 
                      key={teacher.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigateToUserProfile(teacher.id, teacher.role)}
                    >
                      <TableCell>
                        <UserAvatar 
                          user={teacher} 
                          size="md" 
                          showName={true}
                          clickable={true}
                          onClick={() => navigateToUserProfile(teacher.id, teacher.role)}
                        />
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.church || '-'}</TableCell>
                      <TableCell>{teacher.fellowship || '-'}</TableCell>
                      <TableCell>{teacher.cell || '-'}</TableCell>
                      <TableCell>{new Date(teacher.registeredAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary text-primary-foreground">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Teacher
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemoteToStudent(teacher)}
                          title="Change to student role"
                        >
                          <UserMinus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Demote</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

