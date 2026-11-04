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
import { User, Enrollment } from '@/types';
import { Search, Users, BookOpen, Loader2, Filter, GraduationCap, UserCheck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { navigateToUserProfile } from '@/lib/navigation';

interface AdminStudentsProps {
  preFilteredUsers?: User[]; // Optional: pre-filtered users
  preFilteredEnrollments?: Enrollment[]; // Optional: pre-filtered enrollments
}

export const AdminStudents = ({ preFilteredUsers, preFilteredEnrollments }: AdminStudentsProps = {}) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [fellowshipFilter, setFellowshipFilter] = useState<string>('all');
  const [cellFilter, setCellFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (preFilteredUsers && preFilteredEnrollments) {
      // Use pre-filtered data
      const studentsData = preFilteredUsers.filter(u => u.role === 'student');
      setStudents(studentsData);
      setEnrollments(preFilteredEnrollments);
      setLoading(false);
    } else {
      // Fetch all data (for admin)
      fetchData();

      // Auto-refresh every 5 seconds
      const intervalId = setInterval(() => {
        fetchData();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [preFilteredUsers, preFilteredEnrollments]);

  const fetchData = async () => {
    try {
      const [usersData, enrollmentsData] = await Promise.all([
        supabaseDb.getUsers(),
        supabaseDb.getEnrollments(),
      ]);
      const studentsData = usersData.filter(u => u.role === 'student');
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get student stats
  const getStudentStats = (studentId: string) => {
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    const completed = studentEnrollments.filter(e => e.completed).length;
    const graduated = studentEnrollments.filter(e => e.graduated).length;
    return {
      enrolled: studentEnrollments.length,
      completed,
      graduated,
    };
  };

  // Get unique values for filters
  const uniqueChurches = useMemo(() => {
    const churches = students
      .map(s => s.church)
      .filter((c): c is string => !!c);
    return Array.from(new Set(churches)).sort();
  }, [students]);

  const uniqueFellowships = useMemo(() => {
    const fellowships = students
      .map(s => s.fellowship)
      .filter((f): f is string => !!f);
    return Array.from(new Set(fellowships)).sort();
  }, [students]);

  const uniqueCells = useMemo(() => {
    const cells = students
      .map(s => s.cell)
      .filter((c): c is string => !!c);
    return Array.from(new Set(cells)).sort();
  }, [students]);

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

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.church?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fellowship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cell?.toLowerCase().includes(searchTerm.toLowerCase());

      // Church filter
      const matchesChurch = churchFilter === 'all' || student.church === churchFilter;

      // Fellowship filter
      const matchesFellowship = fellowshipFilter === 'all' || student.fellowship === fellowshipFilter;

      // Cell filter
      const matchesCell = cellFilter === 'all' || student.cell === cellFilter;

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
  }, [students, searchTerm, churchFilter, fellowshipFilter, cellFilter, sortField, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setChurchFilter('all');
    setFellowshipFilter('all');
    setCellFilter('all');
  };

  const handlePromoteToTeacher = async (student: User) => {
    if (!student.church) {
      toast({
        title: 'Cannot promote',
        description: 'Student must have a church assigned before being promoted to teacher',
        variant: 'destructive',
      });
      return;
    }

    try {
      await supabaseDb.updateUser(student.id, { role: 'teacher' });
      await fetchData(); // Refresh data
      toast({
        title: 'User promoted',
        description: `${student.name} has been promoted to teacher and automatically assigned to ${student.church}`,
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Promotion failed',
        description: 'Failed to promote user to teacher. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate totals
  const totalEnrollments = students.reduce((sum, s) => sum + getStudentStats(s.id).enrolled, 0);
  const totalCompleted = students.reduce((sum, s) => sum + getStudentStats(s.id).completed, 0);
  const totalGraduated = students.reduce((sum, s) => sum + getStudentStats(s.id).graduated, 0);

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
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Students Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage all registered students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-1">Class enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Classes completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Graduated</CardTitle>
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalGraduated}</div>
            <p className="text-xs text-muted-foreground mt-1">Total graduates</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
          <CardDescription>Filter students by search, church, fellowship, or cell</CardDescription>
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

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Students List</CardTitle>
          <CardDescription>
            {filteredStudents.length === students.length 
              ? `Showing all ${students.length} students`
              : `Showing ${filteredStudents.length} of ${students.length} students`
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
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Graduated</TableHead>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {searchTerm || churchFilter !== 'all' || fellowshipFilter !== 'all' || cellFilter !== 'all'
                        ? 'No students match your filters'
                        : 'No students registered yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map(student => {
                    const stats = getStudentStats(student.id);
                    return (
                      <TableRow 
                        key={student.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          navigateToUserProfile(student.id, student.role);
                        }}
                      >
                        <TableCell>
                          <UserAvatar 
                            user={student} 
                            size="md" 
                            showName={true}
                            clickable={true}
                            onClick={() => navigateToUserProfile(student.id, student.role)}
                          />
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.church || '-'}</TableCell>
                        <TableCell>{student.fellowship || '-'}</TableCell>
                        <TableCell>{student.cell || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{stats.enrolled}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {stats.completed}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {stats.graduated}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(student.registeredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromoteToTeacher(student)}
                            disabled={!student.church}
                            title={!student.church ? 'Student needs a church before promotion' : 'Promote to teacher'}
                          >
                            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Promote</span>
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
    </div>
  );
};

