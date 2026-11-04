import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { supabaseAuth } from '@/lib/supabase-auth';
import { User } from '@/types';
import { Save, Mail, User as UserIcon, Church, Users, Home, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { ProfilePictureUpload } from '@/components/shared/ProfilePictureUpload';

const CHURCH_OPTIONS = [
  'PFCC 1', 'TACC', 'PFCC 3', 'PFCC 4', 'OFCC', 'ARC',
  'MODEL CHURCH', 'LORDS ARMY', 'FIREBRAND',
  'FRUITFUL CHURCH', 'TRUIMPHANT CHURCH', 'LUMINOUS CHURCH',
  'PERFECT CHURCH', 'WINNING CHURCH', 'ABUNDANT GRACE',
  'KASOA CHURCH', 'MEGA CHURCH', 'WONDER CHURCH',
  'GLORIOUS CHURCH', 'TRUELIGHT CHURCH', 'KORLE BU CHURCH',
  'POWERHOUSE', 'JESUS BRAND', 'TAKORADI CHURCH',
  'KOFORIDUA CHURCH', 'HO CHURCH', 'CHILDREN\'S CHURCH',
  'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 2',
  'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 4',
  'NATIONAL MISSIONS',
];

interface ProfileSectionProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const ProfileSection = ({ user, onUpdate }: ProfileSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [church, setChurch] = useState(user.church || '');
  const [fellowship, setFellowship] = useState(user.fellowship || '');
  const [cell, setCell] = useState(user.cell || '');
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await supabaseDb.updateUser(user.id, {
        name,
        email,
        church,
        fellowship,
        cell,
        id: user.id,
        role: user.role,
        registeredAt: user.registeredAt,
      });
      
      if (updatedUser) {
        onUpdate(updatedUser);
        setIsEditing(false);
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirm password must match',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await supabaseAuth.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast({
          title: 'Password changed',
          description: 'Your password has been changed successfully',
        });
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        toast({
          title: 'Password change failed',
          description: result.error || 'Failed to change password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Profile Picture Upload */}
      <ProfilePictureUpload 
        user={user} 
        onUpdate={async () => {
          // Fetch fresh user data from database after picture upload
          const freshUser = await supabaseDb.getUserById(user.id);
          if (freshUser) {
            console.log('Fresh user data:', freshUser.profilePictureUrl);
            onUpdate(freshUser);
          } else {
            console.error('Failed to fetch fresh user data');
          }
        }} 
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details and contact information</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="church" className="flex items-center gap-2">
                <Church className="w-4 h-4" />
                Church
              </Label>
              {isEditing ? (
                <Select value={church} onValueChange={setChurch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your church" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHURCH_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={church} disabled />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fellowship" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Fellowship
              </Label>
              <Input
                id="fellowship"
                value={fellowship}
                onChange={(e) => setFellowship(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your fellowship"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cell" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Cell
              </Label>
              <Input
                id="cell"
                value={cell}
                onChange={(e) => setCell(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your cell"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Member Since
              </Label>
              <Input
                value={new Date(user.registeredAt).toLocaleDateString()}
                disabled
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                  setEmail(user.email);
                  setChurch(user.church || '');
                  setFellowship(user.fellowship || '');
                  setCell(user.cell || '');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Change Password</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your account password</CardDescription>
            </div>
            {!isChangingPassword && (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Change Password</span>
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-2 text-xs sm:text-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2 text-xs sm:text-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Min 8 chars with uppercase, lowercase & number
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-xs sm:text-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
              <Button onClick={handlePasswordChange} disabled={isSaving} className="text-xs sm:text-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

