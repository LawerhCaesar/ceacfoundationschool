import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Download, CheckCircle } from 'lucide-react';
import { User, Class, Enrollment } from '@/types';
import { NotificationToggle } from '@/components/shared/NotificationToggle';
import { NewBatchResetDialog } from '@/components/admin/NewBatchResetDialog';

interface AdminOverviewProps {
  users: User[];
  classes: Class[];
  enrollments: Enrollment[];
  onExportStudents?: (format: 'csv' | 'xlsx') => void;
  onExportGraduates?: (format: 'csv' | 'xlsx') => void;
  onResetBatch?: () => void;
  userRole?: string;
}

export const AdminOverview = ({ 
  users, 
  classes, 
  enrollments,
  onExportStudents,
  onExportGraduates,
  onResetBatch,
  userRole = 'admin'
}: AdminOverviewProps) => {
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const completedEnrollments = enrollments.filter(e => e.completed);
  const graduatedEnrollments = enrollments.filter(e => e.graduated);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Overview</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor and manage the foundation school</p>
        </div>
        <NotificationToggle 
          userRole={userRole} 
          variant="compact"
          className="self-start sm:self-center"
        />
      </div>

      {/* Main Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{students.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{teachers.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active teachers
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{classes.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Foundation classes
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Enrollments</CardTitle>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{enrollments.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Total enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Stats */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Completion Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed Classes</span>
                <span className="font-medium">{completedEnrollments.length} / {enrollments.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {enrollments.length > 0 
                  ? `${Math.round((completedEnrollments.length / enrollments.length) * 100)}% completion rate`
                  : 'No enrollments yet'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Graduation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Graduated Students</span>
                <span className="font-medium">{graduatedEnrollments.length} / {completedEnrollments.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${completedEnrollments.length > 0 ? (graduatedEnrollments.length / completedEnrollments.length) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedEnrollments.length > 0 
                  ? `${Math.round((graduatedEnrollments.length / completedEnrollments.length) * 100)}% graduation rate`
                  : 'No completed classes yet'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Export All Students */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Export All Students</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Download complete list of {students.length} students
                </p>
              </div>
              {onExportStudents && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExportStudents('csv')}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExportStudents('xlsx')}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              )}
            </div>

            {/* Export Graduates */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Export Graduates</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Download list of {graduatedEnrollments.length} graduated students
                </p>
              </div>
              {onExportGraduates && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExportGraduates('csv')}
                    disabled={graduatedEnrollments.length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExportGraduates('xlsx')}
                    disabled={graduatedEnrollments.length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              )}
            </div>

            {/* New Batch Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div>
                <h3 className="font-medium text-sm sm:text-base text-destructive">Start New Batch</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Clear all enrollments &amp; exam data — keep student accounts
                </p>
              </div>
              <NewBatchResetDialog onReset={onResetBatch} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {enrollments.filter(e => !e.completed).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Students in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {completedEnrollments.filter(e => {
                const completedDate = new Date(e.completedAt || '');
                const now = new Date();
                return completedDate.getMonth() === now.getMonth() && 
                       completedDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Classes completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Classes per Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {students.length > 0 
                ? (enrollments.length / students.length).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enrollment average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};











