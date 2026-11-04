import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '@/lib/supabase-auth';
import { User } from '@/types';
import { DashboardSidebar } from '@/components/student/DashboardSidebar';
import { DashboardOverview } from '@/components/student/DashboardOverview';
import { ProfileSection } from '@/components/student/ProfileSection';
import { ClassesSection } from '@/components/student/ClassesSection';
import { QuizSection } from '@/components/student/QuizSection';
import { ExamSection } from '@/components/student/ExamSection';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await supabaseAuth.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      if (currentUser.role === 'admin') {
        navigate('/admin');
        return;
      }
      if (currentUser.role === 'pastor') {
        navigate('/pastor');
        return;
      }
      if (currentUser.role === 'teacher') {
        navigate('/teacher');
        return;
      }
      
      setUser(currentUser as User);
    };

    checkUser();
  }, [navigate, refreshKey]);

  const handleLogout = async () => {
    await supabaseAuth.logout();
    navigate('/');
  };

  const handleUpdate = (updatedUser?: User) => {
    console.log('handleUpdate called with:', updatedUser?.profilePictureUrl);
    if (updatedUser) {
      setUser(updatedUser);
      console.log('User state updated with new profile picture');
    }
    setRefreshKey(prev => {
      const newKey = prev + 1;
      console.log('Refresh key updated to:', newKey);
      return newKey;
    });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        key={refreshKey} // Force re-render when user data changes
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
          {activeSection === 'dashboard' && (
            <DashboardOverview user={user} key={refreshKey} />
          )}
          {activeSection === 'profile' && (
            <ProfileSection user={user} onUpdate={handleUpdate} />
          )}
          {activeSection === 'classes' && (
            <ClassesSection user={user} onUpdate={() => handleUpdate()} />
          )}
          {activeSection === 'quiz' && (
            <QuizSection />
          )}
          {activeSection === 'exams' && (
            <ExamSection user={user} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
