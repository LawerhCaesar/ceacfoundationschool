import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { User, Class, Enrollment } from '@/types';
import { TrendingUp, Users, BookOpen, GraduationCap, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeacherAnalyticsProps {
  teacherId: string;
  teacherChurch: string;
  users: User[];
  classes: Class[];
  enrollments: Enrollment[];
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

export const TeacherAnalytics = ({ teacherId, teacherChurch, users, classes, enrollments }: TeacherAnalyticsProps) => {
  // Filter to only teacher's assigned students (not all church students)
  const assignedStudents = useMemo(() => {
    const assignedStudentIds = new Set(enrollments.map(e => e.studentId));
    return users.filter(u => u.role === 'student' && assignedStudentIds.has(u.id));
  }, [users, enrollments]);

  // Enrollments are already filtered to teacher's assigned students from parent component
  const teacherEnrollments = useMemo(() => {
    return enrollments;
  }, [enrollments]);

  // Calculate completion rate trends over time
  const completionTrends = useMemo(() => {
    const monthlyData: Record<string, { completed: number; total: number }> = {};
    
    teacherEnrollments.forEach(enrollment => {
      if (enrollment.completedAt) {
        const date = new Date(enrollment.completedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { completed: 0, total: 0 };
        }
        monthlyData[monthKey].completed++;
      }
    });

    teacherEnrollments.forEach(enrollment => {
      const date = new Date(enrollment.enrolledAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { completed: 0, total: 0 };
      }
      monthlyData[monthKey].total++;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        completed: data.completed,
        total: data.total,
      }));
  }, [teacherEnrollments]);

  // Student performance metrics by class (only for teacher's assigned students)
  const studentPerformanceByClass = useMemo(() => {
    return classes.map(cls => {
      const classEnrollments = teacherEnrollments.filter(e => e.classId === cls.id);
      const completed = classEnrollments.filter(e => e.status === 'completed').length;
      const graduated = classEnrollments.filter(e => e.graduated).length;
      const inProgress = classEnrollments.filter(e => e.status === 'in_progress').length;
      
      return {
        name: cls.name.length > 20 ? cls.name.substring(0, 20) + '...' : cls.name,
        fullName: cls.name,
        enrolled: classEnrollments.length,
        completed,
        graduated,
        inProgress,
        completionRate: classEnrollments.length > 0 
          ? Math.round((completed / classEnrollments.length) * 100)
          : 0,
      };
    })
    .filter(c => c.enrolled > 0) // Only show classes with students from this church
    .sort((a, b) => b.enrolled - a.enrolled);
  }, [classes, teacherEnrollments]);

  // Class popularity statistics (teacher's assigned students only)
  const classPopularity = useMemo(() => {
    return classes
      .map(cls => ({
        name: cls.name.length > 15 ? cls.name.substring(0, 15) + '...' : cls.name,
        fullName: cls.name,
        students: teacherEnrollments.filter(e => e.classId === cls.id).length,
      }))
      .filter(c => c.students > 0) // Only show classes with students
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);
  }, [classes, teacherEnrollments]);

  // Enrollment status distribution (teacher's assigned students only)
  const enrollmentStatusData = useMemo(() => {
    const inProgress = teacherEnrollments.filter(e => e.status === 'in_progress').length;
    const completed = teacherEnrollments.filter(e => e.status === 'completed').length;
    const graduated = teacherEnrollments.filter(e => e.graduated).length;
    
    return [
      { name: 'In Progress', value: inProgress, color: COLORS.warning },
      { name: 'Completed', value: completed, color: COLORS.info },
      { name: 'Graduated', value: graduated, color: COLORS.success },
    ].filter(item => item.value > 0); // Only show non-zero categories
  }, [teacherEnrollments]);

  // Student enrollment trends (teacher's assigned students only)
  const enrollmentTrends = useMemo(() => {
    const monthlyEnrollments: Record<string, number> = {};
    
    teacherEnrollments.forEach(enrollment => {
      const date = new Date(enrollment.enrolledAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyEnrollments[monthKey] = (monthlyEnrollments[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyEnrollments)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        enrollments: count,
      }));
  }, [teacherEnrollments]);

  // Overall statistics (teacher's assigned students only)
  const stats = useMemo(() => {
    const totalStudents = assignedStudents.length;
    const totalEnrollments = teacherEnrollments.length;
    const totalGraduated = teacherEnrollments.filter(e => e.graduated).length;
    const totalCompleted = teacherEnrollments.filter(e => e.status === 'completed').length;
    const avgCompletionRate = totalEnrollments > 0 
      ? Math.round((totalCompleted / totalEnrollments) * 100)
      : 0;

    return {
      totalStudents,
      totalEnrollments,
      totalGraduated,
      totalCompleted,
      avgCompletionRate,
    };
  }, [assignedStudents, teacherEnrollments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Insights for your assigned students
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">My Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{studentPerformanceByClass.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalEnrollments}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalGraduated}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Graduated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.avgCompletionRate}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {stats.totalEnrollments > 0 ? (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="popularity">Popularity</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Completion Rate Trends */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4">
              {completionTrends.length > 0 && (
                <Card>
              <CardHeader>
                <CardTitle>Completion Rate Trends</CardTitle>
                <CardDescription>Monthly completion rate for your assigned students (last 6 months)</CardDescription>
              </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={completionTrends}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="completionRate" 
                          stroke={COLORS.primary} 
                          fillOpacity={1} 
                          fill="url(#colorRate)"
                          name="Completion Rate (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {enrollmentTrends.length > 0 && (
                <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trends</CardTitle>
                  <CardDescription>Monthly enrollments for your assigned students (last 12 months)</CardDescription>
                </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={enrollmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="enrollments" 
                          stroke={COLORS.info} 
                          strokeWidth={2}
                          name="Enrollments"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Student Performance by Class */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance by Class</CardTitle>
                <CardDescription>Enrollment and completion metrics for your assigned students</CardDescription>
              </CardHeader>
              <CardContent>
                {studentPerformanceByClass.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={studentPerformanceByClass}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enrolled" fill={COLORS.info} name="Enrolled" />
                      <Bar dataKey="completed" fill={COLORS.warning} name="Completed" />
                      <Bar dataKey="graduated" fill={COLORS.success} name="Graduated" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No class data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Popularity */}
          <TabsContent value="popularity">
            <Card>
              <CardHeader>
                <CardTitle>Class Popularity Statistics</CardTitle>
                <CardDescription>Most popular classes among your assigned students</CardDescription>
              </CardHeader>
              <CardContent>
                {classPopularity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={classPopularity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="students" fill={COLORS.purple} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No enrollment data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrollment Status Distribution */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status Distribution</CardTitle>
                <CardDescription>Current status of your assigned student enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollmentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={enrollmentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {enrollmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No status data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-muted rounded-full">
                <TrendingUp className="w-12 h-12 text-muted-foreground" />
              </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Data Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any assigned students yet. 
                Analytics will appear once students select you as their teacher during enrollment.
              </p>
            </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


