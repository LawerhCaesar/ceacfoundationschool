import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, CheckCircle } from 'lucide-react';
import { Class, Enrollment, User } from '@/types';
import { NotificationToggle } from '@/components/shared/NotificationToggle';

interface TeacherOverviewProps {
  classes: Class[];
  enrollments: Enrollment[];
  students: User[];
  userRole?: 'teacher';
  user?: User;
}

export const TeacherOverview = ({ classes, enrollments, students, userRole = 'teacher', user }: TeacherOverviewProps) => {
  const completedCount = enrollments.filter(e => e.completed).length;
  const graduatedCount = enrollments.filter(e => e.graduated).length;
  const activeEnrollments = enrollments.filter(e => !e.completed).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Teacher Overview</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor your classes and student progress</p>
        </div>
        <NotificationToggle 
          userRole={userRole} 
          variant="compact"
          className="self-start sm:self-center"
          userId={user?.id}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{classes.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{students.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Total students
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{activeEnrollments}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Graduated</CardTitle>
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{graduatedCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Total graduates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed Classes</span>
                <span className="font-medium">{completedCount} / {enrollments.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: `${enrollments.length > 0 ? (completedCount / enrollments.length) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {enrollments.length > 0 
                  ? `${Math.round((completedCount / enrollments.length) * 100)}% completion rate`
                  : 'No enrollments yet'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Graduation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Graduated Students</span>
                <span className="font-medium">{graduatedCount} / {completedCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${completedCount > 0 ? (graduatedCount / completedCount) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount > 0 
                  ? `${Math.round((graduatedCount / completedCount) * 100)}% graduation rate`
                  : 'No completed classes yet'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No student enrollments yet</p>
              <p className="text-xs sm:text-sm mt-2">Students will appear here when they enroll in your classes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enrollment) => {
                const student = students.find(s => s.id === enrollment.studentId);
                const classData = classes.find(c => c.id === enrollment.classId);
                
                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student?.name || 'Unknown Student'}</p>
                      <p className="text-xs text-muted-foreground truncate">{classData?.name || 'Unknown Class'}</p>
                    </div>
                    <div className="text-right ml-4">
                      {enrollment.graduated ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Graduated
                        </span>
                      ) : enrollment.completed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};












