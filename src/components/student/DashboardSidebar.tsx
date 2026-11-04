import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, User, BookOpen, FileQuestion, ClipboardCheck, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { ContactFormModal } from '@/components/ContactFormModal';

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
  userEmail?: string;
  userChurch?: string;
  userProfilePicture?: string | null;
}

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'classes', label: 'Classes', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: FileQuestion, locked: true },
  { id: 'exams', label: 'Exams', icon: ClipboardCheck },
];

const SidebarContent = ({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  userName,
  userEmail,
  userChurch,
  userProfilePicture,
  onClose 
}: DashboardSidebarProps & { onClose?: () => void }) => {
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
              key={userProfilePicture} // Force reload when URL changes
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
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">Student</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isLocked = section.locked;

          return (
            <button
              key={section.id}
              onClick={() => {
                if (!isLocked) {
                  onSectionChange(section.id);
                  onClose?.();
                }
              }}
              disabled={isLocked}
              className={cn(
                'w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base',
                'hover:bg-accent/50 relative group',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !isActive && 'text-muted-foreground hover:text-foreground',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">{section.label}</span>
              {isLocked && (
                <span className="ml-auto text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
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

export const DashboardSidebar = ({ 
  activeSection, 
  onSectionChange, 
  onLogout,
  userName,
  userEmail,
  userChurch,
  userProfilePicture
}: DashboardSidebarProps) => {
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
        />
      </div>
    </>
  );
};

