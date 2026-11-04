import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '@/lib/supabase-auth';
import { supabaseDb } from '@/lib/supabase-db';
import { User, Class, Enrollment } from '@/types';
import { Loader2 } from 'lucide-react';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { TeacherOverview } from '@/components/teacher/TeacherOverview';
import { TeacherAnalytics } from '@/components/teacher/TeacherAnalytics';
import { TeacherClasses } from '@/components/teacher/TeacherClasses';
import { TeacherStudentManagement } from '@/components/teacher/TeacherStudentManagement';
import { ClassCompletion } from '@/components/admin/ClassCompletion';
import { ClassVideoViewer } from '@/components/shared/ClassVideoViewer';
import { ProfileSection } from '@/components/student/ProfileSection';
import { EnrollmentRequests } from '@/components/teacher/EnrollmentRequests';
import { NotificationSettings } from '@/components/teacher/NotificationSettings';
import { ExamGrading } from '@/components/teacher/ExamGrading';

const Teacher = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]); // All classes for video viewing
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
    if (currentUser.role === 'admin') {
      navigate('/admin');
      return;
    }
    // Teachers use teacher dashboard
    if (currentUser.role !== 'teacher') {
      navigate('/login');
      return;
    }
    
    setUser(currentUser as User);
    await loadData(currentUser as User);
    setLoading(false);
  };

  const loadData = async (currentUser?: User) => {
    const teacherUser = currentUser || user;
    if (!teacherUser) return;

    try {
      const [allUsers, allClasses, allEnrollments] = await Promise.all([
        supabaseDb.getUsers(),
        supabaseDb.getClasses(),
        supabaseDb.getEnrollments(),
      ]);

      let relevantEnrollments: Enrollment[];
      let relevantClasses: Class[];
      let relevantStudents: User[];

      // Regular teacher: only their assigned data
      // Students from teacher's church (for bulk enrollment)
      relevantStudents = allUsers.filter(u => 
        u.role === 'student' && u.church === teacherUser.church
      );

      // Only teacher's assigned enrollments
      relevantEnrollments = allEnrollments.filter(e => e.assignedTeacherId === teacherUser.id);
      
      // Get classes that have students assigned to this teacher
      const classIds = new Set(relevantEnrollments.map(e => e.classId));
      relevantClasses = allClasses.filter(c => classIds.has(c.id));

      // Store data
      setUsers(relevantStudents); // Church students
      setClasses(relevantClasses.length > 0 ? relevantClasses : allClasses);
      setAllClasses(allClasses); // Store ALL classes for video viewing
      setEnrollments(relevantEnrollments); // Teacher's enrollments
    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.logout();
    navigate('/');
  };

  const handleProfileUpdate = async () => {
    // Fetch fresh user data from database after profile update
    const currentUser = await supabaseAuth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser as User);
      await loadData(currentUser as User);
    }
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
      <TeacherSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        userName={user.name}
        userEmail={user.email}
        userChurch={user.church}
        userProfilePicture={user.profilePictureUrl}
        userRole="teacher"
        userId={user.id}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {activeSection === 'overview' && (
            <TeacherOverview 
              classes={classes}
              enrollments={enrollments}
              students={users}
              userRole="teacher"
              user={user}
            />
          )}
          {activeSection === 'analytics' && user.church && (
            <TeacherAnalytics 
              teacherId={user.id}
              teacherChurch={user.church}
              users={users}
              classes={classes}
              enrollments={enrollments}
            />
          )}
          {activeSection === 'classes' && (
            <TeacherClasses 
              classes={classes}
              enrollments={enrollments}
              students={users}
            />
          )}
          {activeSection === 'videos' && (
            <ClassVideoViewer 
              classes={allClasses}
              userRole="Teacher"
            />
          )}
          {activeSection === 'students' && (
            <TeacherStudentManagement 
              teacherId={user.id}
              teacherChurch={user.church}
              onUpdate={loadData}
              userRole="teacher"
            />
          )}
          {activeSection === 'exam-grading' && (
            <ExamGrading teacherId={user.id} />
          )}
          {activeSection === 'progress' && (
            <ClassCompletion teacherId={user.id} />
          )}
          {activeSection === 'enrollment-requests' && (
            <EnrollmentRequests user={user} />
          )}
          {activeSection === 'notifications' && (
            <NotificationSettings userRole={user.role} />
          )}
          {activeSection === 'profile' && (
            <ProfileSection 
              user={user} 
              onUpdate={async (updatedUser) => {
                if (updatedUser) {
                  setUser(updatedUser);
                }
                await handleProfileUpdate();
              }} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Teacher;


