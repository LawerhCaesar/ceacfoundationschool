import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, Download, CheckCircle, Clock, Award } from 'lucide-react';
import { Class, Enrollment, User } from '@/types';
import { exportClassStudents } from '@/lib/exports';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { navigateToUserProfile } from '@/lib/navigation';

interface TeacherClassesProps {
  classes: Class[];
  enrollments: Enrollment[];
  students: User[];
}

export const TeacherClasses = ({ classes, enrollments, students }: TeacherClassesProps) => {
  const handleExportClass = (classData: Class, format: 'csv' | 'xlsx' = 'csv') => {
    exportClassStudents(classData, enrollments, students, format);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">My Classes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your teaching classes</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-sm sm:text-base text-muted-foreground">You haven't been assigned any classes yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Students will select you as their teacher when enrolling
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {classes.map((classItem) => {
            const classEnrollments = enrollments.filter(e => e.classId === classItem.id);
            const completedStudents = classEnrollments.filter(e => e.completed).length;
            const graduatedStudents = classEnrollments.filter(e => e.graduated).length;
            
            return (
              <Card key={classItem.id} className="hover-scale">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl">{classItem.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {classItem.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg sm:text-xl font-bold">{classEnrollments.length}</div>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <BookOpen className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg sm:text-xl font-bold">{completedStudents}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <GraduationCap className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg sm:text-xl font-bold">{graduatedStudents}</div>
                        <p className="text-xs text-muted-foreground">Graduated</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Completion Progress</span>
                        <span className="font-medium">
                          {classEnrollments.length > 0 
                            ? `${Math.round((completedStudents / classEnrollments.length) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${classEnrollments.length > 0 ? (completedStudents / classEnrollments.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Class Details */}
                    <div className="text-xs sm:text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Schedule: </span>
                      <span className="font-medium">{classItem.schedule}</span>
                    </div>

                    {/* Student Progress List */}
                    {classEnrollments.length > 0 && (
                      <div className="pt-2 border-t">
                        <h4 className="text-xs sm:text-sm font-semibold mb-2 text-foreground">
                          Student Progress
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {classEnrollments.map((enrollment) => {
                            const student = students.find(s => s.id === enrollment.studentId);
                            if (!student) return null;
                            
                            return (
                              <div 
                                key={enrollment.id} 
                                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => navigateToUserProfile(student.id, student.role)}
                              >
                                <div className="flex-1 min-w-0">
                                  <UserAvatar 
                                    user={student} 
                                    size="sm" 
                                    showName={true}
                                    clickable={true}
                                    onClick={() => navigateToUserProfile(student.id, student.role)}
                                  />
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                  {enrollment.graduated ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                      <Award className="w-3 h-3 mr-1" />
                                      Graduated
                                    </Badge>
                                  ) : enrollment.completed ? (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Export Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                      <Button
                        onClick={() => handleExportClass(classItem, 'csv')}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm"
                        disabled={classEnrollments.length === 0}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button
                        onClick={() => handleExportClass(classItem, 'xlsx')}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm"
                        disabled={classEnrollments.length === 0}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

