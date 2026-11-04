import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  showName = false,
  clickable = false,
  onClick 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarElement = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={`${sizeClasses[size]} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
        <AvatarImage 
          src={user.profilePictureUrl || undefined} 
          alt={`${user.name}'s profile picture`}
        />
        <AvatarFallback className="bg-primary/10 text-primary">
          <UserIcon className="h-1/2 w-1/2" />
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={`font-medium ${textSizeClasses[size]} ${clickable ? 'cursor-pointer hover:underline' : ''}`}>
          {user.name}
        </span>
      )}
    </div>
  );

  if (clickable && onClick) {
    return (
      <button 
        onClick={onClick}
        className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
      >
        {avatarElement}
      </button>
    );
  }

  return avatarElement;
};






























