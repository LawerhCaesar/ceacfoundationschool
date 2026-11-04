import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Class } from '@/types';
import { supabaseDb } from '@/lib/supabase-db';
import { toast } from 'sonner';
import { Search, Users, Filter, CheckSquare, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkEnrollmentManagerProps {
  students: User[];
  classes: Class[];
  onUpdate?: () => void;
  filterByChurch?: string; // For teachers - only show students from their church
  assignedTeacherId?: string; // For teachers - assign enrolled students to this teacher
}

export const BulkEnrollmentManager = ({ 
  students, 
  classes, 
  onUpdate,
  filterByChurch,
  assignedTeacherId
}: BulkEnrollmentManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFellowship, setSelectedFellowship] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Filter students by church if needed (for teachers)
  const churchFilteredStudents = useMemo(() => {
    if (filterByChurch) {
      return students.filter(s => s.church === filterByChurch);
    }
    return students;
  }, [students, filterByChurch]);

  // Get unique fellowships from students
  const fellowships = useMemo(() => {
    const uniqueFellowships = new Set<string>();
    churchFilteredStudents.forEach(student => {
      if (student.fellowship) {
        uniqueFellowships.add(student.fellowship);
      }
    });
    return Array.from(uniqueFellowships).sort();
  }, [churchFilteredStudents]);

  // Filter students based on search and fellowship
  const filteredStudents = useMemo(() => {
    return churchFilteredStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFellowship = selectedFellowship === 'all' || 
                               student.fellowship === selectedFellowship;
      
      return matchesSearch && matchesFellowship;
    });
  }, [churchFilteredStudents, searchTerm, selectedFellowship]);

  // Toggle individual student selection
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Select all visible students
  const selectAll = () => {
    const allIds = new Set(filteredStudents.map(s => s.id));
    setSelectedStudents(allIds);
  };

  // Deselect all students
  const deselectAll = () => {
    setSelectedStudents(new Set());
  };

  // Toggle all students
  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  // Check if all visible students are selected
  const allSelected = filteredStudents.length > 0 && 
                     selectedStudents.size === filteredStudents.length;

  // Check if some (but not all) students are selected
  const someSelected = selectedStudents.size > 0 && 
                      selectedStudents.size < filteredStudents.length;

  // Handle bulk enrollment
  const handleBulkEnroll = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsEnrolling(true);
    
    try {
      const enrollmentPromises = Array.from(selectedStudents).map(studentId => 
        supabaseDb.addEnrollment({
          studentId: studentId,
          classId: selectedClass,
          enrolledAt: new Date().toISOString(),
          completed: false,
          completedAt: null,
          graduated: false,
          graduatedAt: null,
          status: 'in_progress',
          assignedTeacherId: assignedTeacherId || null, // Assign to teacher if provided
        })
      );

      await Promise.all(enrollmentPromises);

      toast.success(`Successfully enrolled ${selectedStudents.size} student(s) in the class!`);
      
      // Clear selections
      setSelectedStudents(new Set());
      setSelectedClass('');
      
      // Trigger refresh
      onUpdate?.();
    } catch (error) {
      console.error('Bulk enrollment error:', error);
      toast.error('Failed to enroll some students. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Student Enrollment</CardTitle>
        <CardDescription>
          Filter students by fellowship/cell and enroll multiple students at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Students</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Fellowship Filter */}
          <div className="space-y-2">
            <Label htmlFor="fellowship">Filter by Fellowship/Cell</Label>
            <Select value={selectedFellowship} onValueChange={setSelectedFellowship}>
              <SelectTrigger id="fellowship">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Fellowships" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fellowships</SelectItem>
                {fellowships.length === 0 && (
                  <SelectItem value="none" disabled>No fellowships set</SelectItem>
                )}
                {fellowships.map(fellowship => (
                  <SelectItem key={fellowship} value={fellowship}>
                    {fellowship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Info and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="gap-2"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedStudents.size} of {filteredStudents.length} selected
              </span>
            </div>

            {selectedFellowship !== 'all' && (
              <Badge variant="secondary">
                {selectedFellowship}
              </Badge>
            )}
          </div>

          {selectedStudents.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
            >
              Clear Selection
            </Button>
          )}
        </div>

        {/* Student List */}
        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.has(student.id);
                
                return (
                  <div
                    key={student.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-accent cursor-pointer transition-colors",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleStudent(student.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {student.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {student.fellowship && (
                        <Badge variant="outline" className="text-xs">
                          {student.fellowship}
                        </Badge>
                      )}
                      {student.church && (
                        <Badge variant="secondary" className="text-xs">
                          {student.church}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bulk Enrollment Action */}
        {selectedStudents.size > 0 && (
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="space-y-2">
              <Label htmlFor="class-select">Enroll Selected Students In:</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="none" disabled>No classes available</SelectItem>
                  ) : (
                    classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBulkEnroll}
              disabled={!selectedClass || isEnrolling}
              className="w-full"
              size="lg"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Enroll {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info message */}
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Tip:</strong> Use the fellowship filter to quickly find students from specific cell groups.
            Select multiple students and enroll them all at once.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


