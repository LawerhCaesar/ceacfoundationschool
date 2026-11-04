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

interface AnalyticsDashboardProps {
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

export const AnalyticsDashboard = ({ users, classes, enrollments }: AnalyticsDashboardProps) => {
  // Calculate completion rate trends over time
  const completionTrends = useMemo(() => {
    const monthlyData: Record<string, { completed: number; total: number }> = {};
    
    enrollments.forEach(enrollment => {
      if (enrollment.completedAt) {
        const date = new Date(enrollment.completedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { completed: 0, total: 0 };
        }
        monthlyData[monthKey].completed++;
      }
    });

    enrollments.forEach(enrollment => {
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
  }, [enrollments]);

  // Student performance metrics by class
  const studentPerformanceByClass = useMemo(() => {
    return classes.map(cls => {
      const classEnrollments = enrollments.filter(e => e.classId === cls.id);
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
    }).sort((a, b) => b.enrolled - a.enrolled);
  }, [classes, enrollments]);

  // Class popularity statistics
  const classPopularity = useMemo(() => {
    return classes
      .map(cls => ({
        name: cls.name.length > 15 ? cls.name.substring(0, 15) + '...' : cls.name,
        fullName: cls.name,
        students: enrollments.filter(e => e.classId === cls.id).length,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);
  }, [classes, enrollments]);

  // Enrollment status distribution
  const enrollmentStatusData = useMemo(() => {
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const graduated = enrollments.filter(e => e.graduated).length;
    
    return [
      { name: 'In Progress', value: inProgress, color: COLORS.warning },
      { name: 'Completed', value: completed, color: COLORS.info },
      { name: 'Graduated', value: graduated, color: COLORS.success },
    ];
  }, [enrollments]);

  // Student enrollment trends
  const enrollmentTrends = useMemo(() => {
    const monthlyEnrollments: Record<string, number> = {};
    
    enrollments.forEach(enrollment => {
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
  }, [enrollments]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalClasses = classes.length;
    const totalEnrollments = enrollments.length;
    const totalGraduated = enrollments.filter(e => e.graduated).length;
    const totalCompleted = enrollments.filter(e => e.status === 'completed').length;
    const avgCompletionRate = totalEnrollments > 0 
      ? Math.round((totalCompleted / totalEnrollments) * 100)
      : 0;

    return {
      totalStudents,
      totalClasses,
      totalEnrollments,
      totalGraduated,
      avgCompletionRate,
    };
  }, [users, classes, enrollments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive insights into student performance and engagement</p>
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
                <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
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
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalClasses}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Classes</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Trends</CardTitle>
                <CardDescription>Monthly completion rate over the last 6 months</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Monthly enrollments over the last 12 months</CardDescription>
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
          </div>
        </TabsContent>

        {/* Student Performance by Class */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance by Class</CardTitle>
              <CardDescription>Enrollment and completion metrics for each class</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Popularity */}
        <TabsContent value="popularity">
          <Card>
            <CardHeader>
              <CardTitle>Class Popularity Statistics</CardTitle>
              <CardDescription>Top 10 classes by enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={classPopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="students" fill={COLORS.purple} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Status Distribution */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Status Distribution</CardTitle>
              <CardDescription>Current status of all enrollments</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};



