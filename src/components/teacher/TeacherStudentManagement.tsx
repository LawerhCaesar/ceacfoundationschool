import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { User, Class, Enrollment } from '@/types';
import { UserPlus, GraduationCap, Loader2, Search } from 'lucide-react';
import { BulkEnrollmentManager } from '@/components/shared/BulkEnrollmentManager';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { navigateToUserProfile } from '@/lib/navigation';

interface TeacherStudentManagementProps {
  teacherId: string;
  teacherChurch?: string;
  onUpdate: () => void;
  userRole?: 'teacher';
}

export const TeacherStudentManagement = ({ teacherId, teacherChurch, onUpdate, userRole = 'teacher' }: TeacherStudentManagementProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [classSearch, setClassSearch] = useState<string>('');
  const [enrollmentSearch, setEnrollmentSearch] = useState<string>('');

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const [usersData, classesData, enrollmentsData, currentTeacher] = await Promise.all([
        supabaseDb.getUsers(),
        supabaseDb.getClasses(),
        supabaseDb.getEnrollments(),
        teacherChurch ? Promise.resolve(null) : supabaseDb.getUsers().then(users => users.find(u => u.id === teacherId)),
      ]);
      
      // Get teacher's church
      const teacherChurchName = teacherChurch || currentTeacher?.church;
      
      // Teachers can see all classes (no class-specific assignments)
      setClasses(classesData);
      
      // Regular teacher: only their assigned data
      // SECURITY: Only show students from teacher's church
      const churchStudents = usersData.filter(u => 
        u.role === 'student' && u.church === teacherChurchName
      );
      setStudents(churchStudents);
      
      // Only show enrollments where this teacher is the assigned teacher
      const teacherEnrollments = enrollmentsData.filter(e => e.assignedTeacherId === teacherId);
      setEnrollments(teacherEnrollments);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please refresh.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedClass) {
      toast({ title: 'Please select both student and class', variant: 'destructive' });
      return;
    }

    const existingEnrollment = enrollments.find(
      e => e.studentId === selectedStudent && e.classId === selectedClass
    );

    if (existingEnrollment) {
      toast({ title: 'Student already enrolled in this class', variant: 'destructive' });
      return;
    }

    try {
      // Teachers enroll students and assign themselves as the teacher
      const newEnrollment = await supabaseDb.addEnrollment({
        studentId: selectedStudent,
        classId: selectedClass,
        assignedTeacherId: teacherId, // Assign the current teacher
        enrolledAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        graduated: false,
        graduatedAt: null,
      });

      if (newEnrollment) {
        await fetchData();
        toast({ title: 'Student enrolled successfully with you as their teacher' });
        setSelectedStudent('');
        setSelectedClass('');
        onUpdate();
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({ title: 'Enrollment failed', variant: 'destructive' });
    }
  };

  const handleGraduate = async (enrollmentId: string) => {
    try {
      await supabaseDb.updateEnrollment(enrollmentId, { 
        graduated: true,
        graduatedAt: new Date().toISOString(),
      });
      await fetchData();
      toast({ title: 'Student marked as graduated' });
      onUpdate();
    } catch (error) {
      console.error('Graduate error:', error);
      toast({ title: 'Failed to mark as graduated', variant: 'destructive' });
    }
  };

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const search = studentSearch.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.church?.toLowerCase().includes(search)
    );
  }, [students, studentSearch]);

  // Filter classes based on search
  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    const search = classSearch.toLowerCase();
    return classes.filter(classItem => 
      classItem.name.toLowerCase().includes(search) ||
      classItem.description.toLowerCase().includes(search)
    );
  }, [classes, classSearch]);

  // Filter enrollments table based on search
  const filteredEnrollments = useMemo(() => {
    if (!enrollmentSearch.trim()) return enrollments;
    const search = enrollmentSearch.toLowerCase();
    return enrollments.filter(enrollment => {
      const student = students.find(s => s.id === enrollment.studentId);
      const classItem = classes.find(c => c.id === enrollment.classId);
      return (
        student?.name.toLowerCase().includes(search) ||
        student?.email.toLowerCase().includes(search) ||
        classItem?.name.toLowerCase().includes(search) ||
        student?.church?.toLowerCase().includes(search)
      );
    });
  }, [enrollments, enrollmentSearch, students, classes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Teachers can teach all classes, no need to check for assignment

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Enrollment</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Enroll Student</CardTitle>
          <CardDescription>Assign students to your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Select Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student-search">Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="student-search"
                    placeholder="Search by name, email, or church..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No students found
                      </div>
                    ) : (
                      filteredStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center gap-3">
                            <UserAvatar user={student} size="sm" />
                            <div className="flex flex-col">
                              <span>{student.name}</span>
                              <span className="text-xs text-muted-foreground">{student.email}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredStudents.length > 0 && studentSearch && (
                  <p className="text-xs text-muted-foreground">
                    Found {filteredStudents.length} student(s)
                  </p>
                )}
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class-search">Search Your Classes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="class-search"
                    placeholder="Search by class name..."
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No classes found
                      </div>
                    ) : (
                      filteredClasses.map(classItem => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredClasses.length > 0 && classSearch && (
                  <p className="text-xs text-muted-foreground">
                    Found {filteredClasses.length} class(es)
                  </p>
                )}
              </div>
            </div>

            {/* Enroll Button */}
            <div className="flex justify-end">
              <Button onClick={handleEnroll} size="lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll Student in Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Student Enrollments</CardTitle>
          <CardDescription>Manage enrollments and graduations for your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Enrollments */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search enrollments by student, class, or church..."
                value={enrollmentSearch}
                onChange={(e) => setEnrollmentSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {enrollmentSearch && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredEnrollments.length} of {enrollments.length} enrollment(s)
              </p>
            )}

            {/* Enrollments Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {enrollmentSearch ? 'No enrollments match your search' : 'No enrollments yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map(enrollment => {
                      const student = students.find(s => s.id === enrollment.studentId);
                      const classItem = classes.find(c => c.id === enrollment.classId);
                      
                      // Check if student has completed ALL their enrollments (100%)
                      const studentEnrollments = enrollments.filter(e => e.studentId === enrollment.studentId);
                      const completedEnrollments = studentEnrollments.filter(e => e.completed);
                      const hasCompletedAll = studentEnrollments.length > 0 && 
                                             studentEnrollments.length === completedEnrollments.length;
                      const canGraduate = enrollment.completed && hasCompletedAll && !enrollment.graduated;
                      
                      return (
                        <TableRow 
                          key={enrollment.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            if (student) {
                              navigateToUserProfile(student.id, student.role);
                            }
                          }}
                        >
                          <TableCell>
                            {student && (
                              <UserAvatar 
                                user={student} 
                                size="md" 
                                showName={true}
                                clickable={true}
                                onClick={() => navigateToUserProfile(student.id, student.role)}
                              />
                            )}
                          </TableCell>
                          <TableCell>{classItem?.name}</TableCell>
                          <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {enrollment.graduated ? (
                              <span className="text-accent font-medium">Graduated</span>
                            ) : enrollment.completed ? (
                              <span className="text-green-600 font-medium">Completed</span>
                            ) : (
                              <span className="text-muted-foreground">Active</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!enrollment.graduated && (
                              <Button 
                                size="sm" 
                                onClick={() => handleGraduate(enrollment.id)}
                                disabled={!canGraduate}
                                title={
                                  !enrollment.completed 
                                    ? 'Student must complete this class first'
                                    : !hasCompletedAll
                                    ? `Student must complete all enrolled classes (${completedEnrollments.length}/${studentEnrollments.length} completed)`
                                    : 'Mark this student as graduated'
                                }
                              >
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Mark Graduated
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6 mt-6">
          <BulkEnrollmentManager
            students={students}
            classes={classes}
            filterByChurch={teacherChurch}
            assignedTeacherId={teacherId}
            onUpdate={() => {
              fetchData();
              onUpdate();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};



