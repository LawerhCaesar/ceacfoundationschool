import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '@/lib/supabase-auth';
import { supabaseDb } from '@/lib/supabase-db';
import { exportStudents, exportGraduates } from '@/lib/exports';
import { User, Class, Enrollment } from '@/types';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ClassManagement } from '@/components/admin/ClassManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { ClassCompletion } from '@/components/admin/ClassCompletion';
import { AdminTeachers } from '@/components/admin/AdminTeachers';
import { AdminStudents } from '@/components/admin/AdminStudents';
import { UserManagement } from '@/components/admin/UserManagement';
import { ClassVideoViewer } from '@/components/shared/ClassVideoViewer';
import { ProfileSection } from '@/components/student/ProfileSection';
import { AdminExamManagement } from '@/components/admin/AdminExamManagement';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Auto-refresh data every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      if (user) {
        loadData();
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [user]);

  const checkAuth = async () => {
    const currentUser = await supabaseAuth.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role === 'student') {
      navigate('/dashboard');
      return;
    }
    if (currentUser.role === 'teacher') {
      navigate('/teacher');
      return;
    }
    
    setUser(currentUser as User);
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    try {
      const [usersData, classesData, enrollmentsData] = await Promise.all([
        supabaseDb.getUsers(),
        supabaseDb.getClasses(),
        supabaseDb.getEnrollments(),
      ]);
      console.log('Admin data loaded:', {
        users: usersData.length,
        classes: classesData.length,
        enrollments: enrollmentsData.length,
        userRoles: usersData.map(u => u.role),
        currentUser: user
      });
      setUsers(usersData);
      setClasses(classesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.logout();
    navigate('/');
  };

  const handleExportAllStudents = (format: 'csv' | 'xlsx' = 'csv') => {
    exportStudents(users, format);
  };

  const handleExportGraduates = (format: 'csv' | 'xlsx' = 'csv') => {
    exportGraduates(enrollments, users, format);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        userName={user.name}
        userEmail={user.email}
        userChurch={user.church}
        userProfilePicture={user.profilePictureUrl}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {activeSection === 'overview' && (
            <AdminOverview 
              users={users}
              classes={classes}
              enrollments={enrollments}
              onExportStudents={handleExportAllStudents}
              onExportGraduates={handleExportGraduates}
              onResetBatch={loadData}
              userRole="admin"
            />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsDashboard 
              users={users}
              classes={classes}
              enrollments={enrollments}
            />
          )}
          {activeSection === 'classes' && (
            <ClassManagement onUpdate={loadData} />
          )}
          {activeSection === 'videos' && (
            <ClassVideoViewer 
              classes={classes}
              userRole="Admin"
            />
          )}
          {activeSection === 'enrollment' && (
            <StudentManagement onUpdate={loadData} />
          )}
          {activeSection === 'users' && (
            <UserManagement />
          )}
          {activeSection === 'teachers' && (
            <AdminTeachers />
          )}
          {activeSection === 'students' && (
            <AdminStudents />
          )}
          {activeSection === 'tracking' && (
            <ClassCompletion />
          )}
          {activeSection === 'exam-management' && (
            <AdminExamManagement />
          )}
          {activeSection === 'profile' && (
            <ProfileSection user={user} onUpdate={handleProfileUpdate} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
