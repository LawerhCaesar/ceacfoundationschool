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

interface StudentManagementProps {
  onUpdate: () => void;
}

export const StudentManagement = ({ onUpdate }: StudentManagementProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [availableTeachers, setAvailableTeachers] = useState<User[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [classSearch, setClassSearch] = useState<string>('');
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [enrollmentSearch, setEnrollmentSearch] = useState<string>('');

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, classesData, enrollmentsData] = await Promise.all([
        supabaseDb.getUsers(),
        supabaseDb.getClasses(),
        supabaseDb.getEnrollments(),
      ]);
      setStudents(usersData.filter(u => u.role === 'student'));
      setClasses(classesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please refresh.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load available teachers when student is selected
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find(s => s.id === selectedStudent);
      if (student?.church) {
        loadTeachersForChurch(student.church);
      }
    } else {
      setAvailableTeachers([]);
      setSelectedTeacher('');
    }
  }, [selectedStudent, students]);

  const loadTeachersForChurch = async (church: string) => {
    try {
      const teachers = await supabaseDb.getTeachersForChurch(church);
      setAvailableTeachers(teachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'Error loading teachers',
        description: 'Could not load teachers for this church',
        variant: 'destructive',
      });
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedClass || !selectedTeacher) {
      toast({ title: 'Please select student, class, and teacher', variant: 'destructive' });
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
      const newEnrollment = await supabaseDb.addEnrollment({
      studentId: selectedStudent,
      classId: selectedClass,
        assignedTeacherId: selectedTeacher,
      enrolledAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
      graduated: false,
        graduatedAt: null,
      });

      if (newEnrollment) {
        await fetchData();
        toast({ title: 'Student enrolled successfully with assigned teacher' });
        setSelectedStudent('');
        setSelectedClass('');
        setSelectedTeacher('');
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

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return availableTeachers;
    const search = teacherSearch.toLowerCase();
    return availableTeachers.filter(teacher => 
      teacher.name.toLowerCase().includes(search) ||
      teacher.email.toLowerCase().includes(search)
    );
  }, [availableTeachers, teacherSearch]);

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
          <CardDescription>Search and assign students to classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Select Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="class-search">Search Class</Label>
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

              {/* Teacher Selection */}
              <div className="space-y-2">
                <Label htmlFor="teacher-search">Assign Teacher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="teacher-search"
                    placeholder="Search teacher..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="pl-10"
                    disabled={!selectedStudent}
                  />
                </div>
                <Select 
                  value={selectedTeacher} 
                  onValueChange={setSelectedTeacher}
                  disabled={!selectedStudent || availableTeachers.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      !selectedStudent 
                        ? "Select student first" 
                        : availableTeachers.length === 0
                        ? "No teachers available"
                        : "Select Teacher"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeachers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {selectedStudent ? "No teachers found for this church" : "Select a student first"}
                      </div>
                    ) : (
                      filteredTeachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          <div className="flex items-center gap-3">
                            <UserAvatar user={teacher} size="sm" />
                            <div className="flex flex-col">
                              <span>{teacher.name}</span>
                              <span className="text-xs text-muted-foreground">{teacher.email}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
              </SelectContent>
            </Select>
                {availableTeachers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {filteredTeachers.length} teacher(s) available
                  </p>
                )}
              </div>
            </div>

            {/* Info Alert */}
            {selectedStudent && availableTeachers.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>No teachers available for this student's church.</strong> Please contact an admin to assign teachers to this church first.
                </p>
              </div>
            )}

            {/* Enroll Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleEnroll} 
                size="lg"
                disabled={!selectedStudent || !selectedClass || !selectedTeacher}
              >
              <UserPlus className="w-4 h-4 mr-2" />
                Enroll Student with Teacher
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Enrollments</CardTitle>
          <CardDescription>Manage student enrollments and graduations</CardDescription>
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
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6 mt-6">
          <BulkEnrollmentManager
            students={students}
            classes={classes}
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
