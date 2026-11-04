import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseDb } from '@/lib/supabase-db';
import { Class, User, Enrollment } from '@/types';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ClassCompletionProps {
  teacherId?: string; // Optional: filter by teacher
  churchFilter?: string; // Optional: filter by church
}

export const ClassCompletion = ({ teacherId, churchFilter }: ClassCompletionProps = {}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [teacherId, churchFilter]);

  const fetchData = async () => {
    try {
      const [classesData, usersData, enrollmentsData] = await Promise.all([
        supabaseDb.getClasses(),
        supabaseDb.getUsers(),
        supabaseDb.getEnrollments(),
      ]);
      
      let filteredEnrollments = enrollmentsData;
      let filteredUsers = usersData;

      // Filter by church if churchFilter is provided
      if (churchFilter) {
        const churchStudents = usersData.filter(u => 
          u.role === 'student' && u.church === churchFilter
        );
        const churchStudentIds = new Set(churchStudents.map(s => s.id));
        filteredEnrollments = enrollmentsData.filter(e => churchStudentIds.has(e.studentId));
        filteredUsers = churchStudents;
      }
      // Filter by teacher if teacherId is provided
      else if (teacherId) {
        filteredEnrollments = enrollmentsData.filter(e => e.assignedTeacherId === teacherId);
        const studentIds = new Set(filteredEnrollments.map(e => e.studentId));
        filteredUsers = usersData.filter(u => 
          u.role === 'student' && studentIds.has(u.id)
        );
      }
      
      setClasses(classesData);
      setUsers(filteredUsers);
      setEnrollments(filteredEnrollments);
    } catch (error) {
      console.error('Error fetching completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionData = (classId: string) => {
    const classEnrollments = enrollments.filter(e => e.classId === classId);
    const completed = classEnrollments.filter(e => e.completed);

    return {
      total: classEnrollments.length,
      completed: completed.length,
      percentage: classEnrollments.length > 0 
        ? Math.round((completed.length / classEnrollments.length) * 100) 
        : 0,
      enrollments: classEnrollments
    };
  };

  const getStudentInfo = (studentId: string) => {
    return users.find(u => u.id === studentId);
  };

  // Function to get simplified class name for display
  const getSimplifiedClassName = (className: string) => {
    // Map full class names to simplified versions
    const classMapping: { [key: string]: string } = {
      'Foundation Class 1': 'Class 1',
      'Foundation Class 2': 'Class 2', 
      'Foundation Class 3': 'Class 3',
      'Foundation Class 4A': 'Class 4A',
      'Foundation Class 4B': 'Class 4B',
      'Foundation Class 5': 'Class 5',
      'Foundation Class 6': 'Class 6',
      // Handle variations with descriptions
      'Foundation Class 1: The New Creature': 'Class 1',
      'Foundation Class 2: The Holy Spirit': 'Class 2',
      'Foundation Class 3: Doctrine': 'Class 3',
      'Foundation Class 4A: Evangelism': 'Class 4A',
      'Foundation Class 4B: Discipleship': 'Class 4B',
      'Foundation Class 4B: Discipleship & Leadership': 'Class 4B',
      'Foundation Class 5: Christian Character & Prosper': 'Class 5',
      'Foundation Class 5: Christian Character & Prosperity': 'Class 5',
      'Foundation Class 6: The Local Assembly & Loveworld Inc.': 'Class 6'
    };
    
    // Check for exact match first
    if (classMapping[className]) {
      return classMapping[className];
    }
    
    // Check for partial matches using regex
    const patterns = [
      { pattern: /Foundation Class 1/i, replacement: 'Class 1' },
      { pattern: /Foundation Class 2/i, replacement: 'Class 2' },
      { pattern: /Foundation Class 3/i, replacement: 'Class 3' },
      { pattern: /Foundation Class 4A/i, replacement: 'Class 4A' },
      { pattern: /Foundation Class 4B/i, replacement: 'Class 4B' },
      { pattern: /Foundation Class 5/i, replacement: 'Class 5' },
      { pattern: /Foundation Class 6/i, replacement: 'Class 6' }
    ];
    
    for (const { pattern, replacement } of patterns) {
      if (pattern.test(className)) {
        return replacement;
      }
    }
    
    return className;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Completion Tracking</CardTitle>
        <CardDescription>View which students have completed each class</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={classes[0]?.id || ''} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto">
            {classes.map(classItem => (
              <TabsTrigger 
                key={classItem.id} 
                value={classItem.id} 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap"
              >
                {getSimplifiedClassName(classItem.name)}
              </TabsTrigger>
            ))}
          </TabsList>

          {classes.map(classItem => {
            const completionData = getCompletionData(classItem.id);

            return (
              <TabsContent key={classItem.id} value={classItem.id}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{completionData.total}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completionData.completed}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{completionData.percentage}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  {completionData.enrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Church</TableHead>
                          <TableHead>Enrolled Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completionData.enrollments.map(enrollment => {
                          const student = getStudentInfo(enrollment.studentId);
                          return (
                            <TableRow key={enrollment.id}>
                              <TableCell className="font-medium">{student?.name || 'Unknown'}</TableCell>
                              <TableCell>{student?.email || 'N/A'}</TableCell>
                              <TableCell>{student?.church || 'N/A'}</TableCell>
                              <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {enrollment.completed ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Completed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-amber-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">In Progress</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {enrollment.completedAt 
                                  ? new Date(enrollment.completedAt).toLocaleDateString() 
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No students enrolled in this class yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

