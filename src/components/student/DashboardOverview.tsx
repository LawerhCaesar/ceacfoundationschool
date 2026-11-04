import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabaseDb } from '@/lib/supabase-db';
import { User, Class, Enrollment } from '@/types';
import { BookOpen, CheckCircle, Clock, Trophy, Calendar, Loader2 } from 'lucide-react';

interface DashboardOverviewProps {
  user: User;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsData, classesData] = await Promise.all([
          supabaseDb.getStudentEnrollments(user.id),
          supabaseDb.getClasses(),
        ]);
        setEnrollments(enrollmentsData);
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const enrolledClasses = classes.filter(c => 
    enrollments.some(e => e.classId === c.id)
  );
  
  const completedEnrollments = enrollments.filter(e => e.completed);
  const inProgressEnrollments = enrollments.filter(e => !e.completed);
  const graduatedEnrollments = enrollments.filter(e => e.graduated);
  
  const completionRate = enrollments.length > 0 
    ? Math.round((completedEnrollments.length / enrollments.length) * 100)
    : 0;

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
      'Foundation Class 6': 'Class 6'
    };
    
    return classMapping[className] || className;
  };

  const stats = [
    {
      title: 'Enrolled Classes',
      value: enrollments.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed',
      value: completedEnrollments.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'In Progress',
      value: inProgressEnrollments.length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Graduated',
      value: graduatedEnrollments.length,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Overall Progress</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Completion Rate</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2 sm:h-3" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {completedEnrollments.length} of {enrollments.length} classes completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Classes */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">My Classes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your enrolled classes</CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledClasses.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">You are not enrolled in any classes yet.</p>
              <p className="text-xs sm:text-sm mt-2">Go to Classes to enroll.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {enrolledClasses.map((classItem) => {
                const enrollment = enrollments.find(e => e.classId === classItem.id);
                return (
                  <div
                    key={classItem.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-foreground">
                            {getSimplifiedClassName(classItem.name)}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                            {classItem.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{classItem.schedule}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(enrollment!.enrolledAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:ml-2 flex-shrink-0">
                      {enrollment?.completed ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : enrollment?.graduated ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          Graduated
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
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {completedEnrollments.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No recent activity</p>
              <p className="text-xs sm:text-sm mt-2">Complete a class to see activity.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {completedEnrollments.slice(0, 5).map((enrollment) => {
                const classItem = classes.find(c => c.id === enrollment.classId);
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg"
                  >
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-full flex-shrink-0">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        Completed {getSimplifiedClassName(classItem?.name || '')}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {enrollment.completedAt && new Date(enrollment.completedAt).toLocaleDateString()}
                      </p>
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

