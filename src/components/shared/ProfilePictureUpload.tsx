import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Camera, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProfilePictureUploadProps {
  user: User;
  onUpdate: () => void;
}

export const ProfilePictureUpload = ({ user, onUpdate }: ProfilePictureUploadProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState(user.profilePictureUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid image URL',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      await supabaseDb.updateUser(user.id, {
        profilePictureUrl: url.trim(),
      });

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an image to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: 'no-cache, must-revalidate',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Add cache-busting parameter to force browser to reload image
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update user profile with new URL
      const updateResult = await supabaseDb.updateUser(user.id, {
        profilePictureUrl: cacheBustedUrl,
      });
      
      if (!updateResult) {
        throw new Error('Failed to update user profile with new picture URL');
      }

      // Clear form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Profile picture uploaded',
        description: 'Your profile picture has been updated successfully',
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setIsUploading(true);

    try {
      // Delete from storage if URL is from Supabase Storage
      if (user.profilePictureUrl?.includes('supabase')) {
        const filePath = user.profilePictureUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([filePath]);
      }

      await supabaseDb.updateUser(user.id, {
        profilePictureUrl: null,
      });

      setUrl('');

      toast({
        title: 'Profile picture removed',
        description: 'Your profile picture has been removed',
      });

      onUpdate();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast({
        title: 'Remove failed',
        description: 'Failed to remove profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Camera className="w-5 h-5" />
          Profile Picture
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Upload an image or use an image URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            {user.profilePictureUrl ? (
              <img
                key={user.profilePictureUrl} // Force re-render when URL changes
                src={user.profilePictureUrl}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-border"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&size=128&background=random';
                }}
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-2">
              {user.profilePictureUrl 
                ? 'Your current profile picture' 
                : 'No profile picture set'}
            </p>
            {user.profilePictureUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePicture}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Picture
              </Button>
            )}
          </div>
        </div>

        {/* Upload Methods Tabs */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url">
              <ImageIcon className="w-4 h-4 mr-2" />
              Use URL
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm">Choose Image File</Label>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, WebP (max 5MB)
              </p>
            </div>

            {/* Preview Selected File */}
            {previewUrl && (
              <div className="space-y-2">
                <Label className="text-sm">Preview</Label>
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleFileUpload}
              disabled={isUploading || !selectedFile}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Picture
                </>
              )}
            </Button>
          </TabsContent>

          {/* URL Input Tab */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="picture-url" className="text-sm">Image URL</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="picture-url"
                  type="url"
                  placeholder="https://example.com/my-picture.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={isUploading || !url.trim()}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Update Picture
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Upload your image to a service like{' '}
                <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Imgur
                </a>
                {' '}or use a direct link to an image.
              </p>
            </div>

            {/* Preview URL */}
            {url && url !== user.profilePictureUrl && (
              <div className="pt-4 border-t">
                <Label className="text-sm mb-2 block">Preview</Label>
                <img
                  src={url}
                  alt="Preview"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-border mx-auto sm:mx-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&size=96&background=random';
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


