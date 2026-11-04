import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, BookOpen, GraduationCap, UserCheck, ClipboardList, LogOut, Menu, TrendingUp, PlayCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { ContactFormModal } from '@/components/ContactFormModal';
import { NotificationToggle } from '@/components/shared/NotificationToggle';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
  userEmail?: string;
  userChurch?: string;
  userProfilePicture?: string | null;
  dashboardType?: 'admin' | 'pastor'; // Optional: defaults to 'admin'
}

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'classes', label: 'Classes', icon: BookOpen },
  { id: 'videos', label: 'Class Videos', icon: PlayCircle },
  { id: 'enrollment', label: 'Enrollment', icon: ClipboardList },
  { id: 'users', label: 'User Roles', icon: UserCheck },
  { id: 'teachers', label: 'Teachers', icon: UserCheck },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'tracking', label: 'Progress Tracking', icon: GraduationCap },
  { id: 'exam-management', label: 'Exam Management', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
];

const SidebarContent = ({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  userName,
  userEmail,
  userChurch,
  userProfilePicture,
  dashboardType = 'admin',
  onClose 
}: AdminSidebarProps & { onClose?: () => void }) => {
  return (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <img src="logo.png" alt="Foundation School Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm object-cover flex-shrink-0" />
          <h2 className="text-[10px] sm:text-sm lg:text-base font-bold text-foreground leading-tight">CEAC Foundation School Portal</h2>
        </div>
        <div className="flex items-center gap-3">
          {userProfilePicture ? (
            <img 
              src={userProfilePicture} 
              alt={userName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&size=48&background=random';
              }}
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
              <span className="text-sm sm:text-base font-semibold text-muted-foreground">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">
              {dashboardType === 'pastor' ? 'Pastor Dashboard' : 'Admin Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => {
                onSectionChange(section.id);
                onClose?.();
              }}
              className={cn(
                'w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base',
                'hover:bg-accent/50 relative group',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !isActive && 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 sm:p-3 lg:p-4 border-t border-border space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <NotificationToggle userRole={dashboardType} variant="sidebar" />
        <ContactFormModal 
          userName={userName}
          userEmail={userEmail}
          userChurch={userChurch}
        />
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm" 
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export const AdminSidebar = ({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  userName,
  userEmail,
  userChurch,
  userProfilePicture,
  dashboardType = 'admin'
}: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="bg-card shadow-lg border-border"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              onLogout={onLogout}
              userName={userName}
              userEmail={userEmail}
              userChurch={userChurch}
              userProfilePicture={userProfilePicture}
              dashboardType={dashboardType}
              onClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r border-border h-screen flex-shrink-0">
        <SidebarContent 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onLogout={onLogout}
          userName={userName}
          userEmail={userEmail}
          userChurch={userChurch}
          userProfilePicture={userProfilePicture}
          dashboardType={dashboardType}
        />
      </div>
    </>
  );
};



