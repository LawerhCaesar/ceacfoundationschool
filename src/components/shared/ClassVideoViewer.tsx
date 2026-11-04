import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Class } from '@/types';
import { PlayCircle, Search, Calendar, Users, BookOpen } from 'lucide-react';
import { VideoPlayer } from '@/components/student/VideoPlayer';
import { ClassAssignment } from '@/components/shared/ClassAssignment';
import { supabaseDb } from '@/lib/supabase-db';

interface ClassVideoViewerProps {
  classes: Class[];
  userRole: string;
}

export const ClassVideoViewer = ({ classes, userRole }: ClassVideoViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    file: string;
    title: string;
    description: string;
    classId: string;
  } | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<Class | null>(null);

  // Filter classes with videos
  const classesWithVideos = classes.filter(c => c.videoFile);

  // Filter by search
  const filteredClasses = classesWithVideos.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classItem.videoTitle && classItem.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleWatchVideo = (classItem: Class) => {
    if (classItem.videoFile) {
      const url = supabaseDb.getVideoUrl(classItem.videoFile);
      setSelectedVideo({
        file: url,
        title: classItem.videoTitle || classItem.name,
        description: classItem.videoDescription || classItem.description,
        classId: classItem.id,
      });
      setVideoPlayerOpen(true);
    }
  };

  const handleViewAssignment = (classItem: Class) => {
    setSelectedClassForAssignment(classItem);
    setShowAssignment(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Class Videos</h2>
        <p className="text-muted-foreground">
          Access all class videos for preview and review
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search classes by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <strong>ℹ️ {userRole} Access:</strong> You can watch all class videos without enrollment restrictions.
            This allows you to preview content, review material, and stay informed about class offerings.
          </p>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Videos Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No class videos are available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg line-clamp-2">
                  {classItem.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {classItem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{classItem.capacity} students</span>
                  </div>
                </div>

                {classItem.videoTitle && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-foreground mb-1 line-clamp-1">
                      {classItem.videoTitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {classItem.videoDescription}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleWatchVideo(classItem)}
                  className="w-full"
                  size="sm"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Watch Video
                </Button>

                <Button
                  onClick={() => handleViewAssignment(classItem)}
                  variant="secondary"
                  className="w-full mt-2"
                  size="sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Assignment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player */}
      {selectedVideo && (
        <VideoPlayer
          isOpen={videoPlayerOpen}
          onClose={() => {
            setVideoPlayerOpen(false);
            setSelectedVideo(null);
          }}
          videoFile={selectedVideo.file}
          videoTitle={selectedVideo.title}
          videoDescription={selectedVideo.description}
          classId={selectedVideo.classId}
        />
      )}

      {/* Assignment Section - Show after video is closed */}
      {selectedVideo && !videoPlayerOpen && (
        <div className="mt-6">
          <ClassAssignment 
            classId={selectedVideo.classId} 
            className={selectedVideo.title}
          />
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignment && selectedClassForAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Assignment - {selectedClassForAssignment.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowAssignment(false);
                  setSelectedClassForAssignment(null);
                }}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <ClassAssignment 
                classId={selectedClassForAssignment.id} 
                className={selectedClassForAssignment.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


