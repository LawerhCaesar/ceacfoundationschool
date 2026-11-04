import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { NotificationService } from '@/lib/notifications';
import { User, Class, Enrollment } from '@/types';
import { BookOpen, Calendar, Users, CheckCircle, Clock, PlayCircle, Loader2, GraduationCap, UserCheck } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { ClassAssignment } from '@/components/shared/ClassAssignment';

interface ClassesSectionProps {
  user: User;
  onUpdate: () => void;
}

export const ClassesSection = ({ user, onUpdate }: ClassesSectionProps) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [teachers, setTeachers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ file: string; title: string; description: string; classId: string } | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<Class | null>(null);

  useEffect(() => {
    fetchData();
    // Load watched videos from localStorage
    const stored = localStorage.getItem(`watchedVideos_${user.id}`);
    if (stored) {
      try {
        setWatchedVideos(new Set(JSON.parse(stored)));
      } catch (error) {
        console.error('Error loading watched videos:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const fetchData = async () => {
    try {
      const [classesData, enrollmentsData] = await Promise.all([
        supabaseDb.getClasses(),
        supabaseDb.getStudentEnrollments(user.id),
      ]);
      setClasses(classesData);
      setEnrollments(enrollmentsData);

      // Fetch teacher data for all enrolled classes
      const uniqueTeacherIds = [...new Set(enrollmentsData.map(e => e.assignedTeacherId))];
      const teacherPromises = uniqueTeacherIds.map(id => supabaseDb.getUserById(id));
      const teachersData = await Promise.all(teacherPromises);
      
      const teacherMap = new Map<string, User>();
      teachersData.forEach(teacher => {
        if (teacher) {
          teacherMap.set(teacher.id, teacher);
        }
      });
      setTeachers(teacherMap);
    } catch (error) {
      console.error('Error fetching classes data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (classId: string) => {
    return enrollments.some(e => e.classId === classId);
  };

  const getEnrollment = (classId: string) => {
    return enrollments.find(e => e.classId === classId);
  };

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

  const handleEnroll = async (classId: string) => {
    try {
      // Find the class details
      const classItem = classes.find(c => c.id === classId);
      if (!classItem) {
        toast({
          title: 'Error',
          description: 'Class not found',
          variant: 'destructive',
        });
        return;
      }

      // Send enrollment request notification to teachers
      const success = await NotificationService.sendEnrollmentRequest(
        user.id,
        user.name,
        classId,
        classItem.name,
        user.church || '',
        user.church || 'Your Church'
      );

      if (success) {
        toast({
          title: 'Enrollment Request Sent',
          description: `Your request to enroll in ${classItem.name} has been sent to your church teachers. They will review and approve your enrollment.`,
        });
      } else {
        throw new Error('Failed to send enrollment request');
      }
    } catch (error) {
      console.error('Error sending enrollment request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send enrollment request. Please try again or contact your teacher directly.',
        variant: 'destructive',
      });
    }
  };

  // Teacher selection and enrollment handled by admin/teacher only
  // Students cannot self-enroll

  const handleMarkComplete = async (classId: string) => {
    const enrollment = enrollments.find(e => e.classId === classId);
    if (enrollment) {
      try {
        await supabaseDb.updateEnrollment(enrollment.id, {
          completed: true,
          completedAt: new Date().toISOString(),
        });
        
        const updatedEnrollments = enrollments.map(e =>
          e.id === enrollment.id
            ? { ...e, completed: true, completedAt: new Date().toISOString() }
            : e
        );
        setEnrollments(updatedEnrollments);
        
        toast({
          title: 'Class completed!',
          description: 'Congratulations on completing this class',
        });
        
        onUpdate();
      } catch (error) {
        console.error('Error marking class complete:', error);
        toast({
          title: 'Update failed',
          description: 'Failed to mark class as complete. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleVideoComplete = (classId: string) => {
    const newWatchedVideos = new Set(watchedVideos);
    newWatchedVideos.add(classId);
    setWatchedVideos(newWatchedVideos);
    
    // Save to localStorage
    localStorage.setItem(`watchedVideos_${user.id}`, JSON.stringify([...newWatchedVideos]));
    
    toast({
      title: 'Video completed!',
      description: 'You can now mark this class as complete.',
    });
  };

  const handleWatchVideo = (classItem: Class) => {
    if (classItem.videoFile) {
      const url = supabaseDb.getVideoUrl(classItem.videoFile);
      setSelectedVideo({
        file: url,
        title: classItem.videoTitle || getSimplifiedClassName(classItem.name),
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

  const hasWatchedVideo = (classId: string) => {
    return watchedVideos.has(classId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableClasses = classes.filter(c => !isEnrolled(c.id));
  const enrolledClasses = classes.filter(c => isEnrolled(c.id));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Classes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Browse and enroll in classes</p>
      </div>

      {/* Enrolled Classes */}
      {enrolledClasses.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">My Enrolled Classes</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {enrolledClasses.map((classItem) => {
              const enrollment = getEnrollment(classItem.id);
              const isCompleted = enrollment?.completed;
              const isGraduated = enrollment?.graduated;
              
              return (
                <Card key={classItem.id} className="hover-scale">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg">{getSimplifiedClassName(classItem.name)}</CardTitle>
                        <CardDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm line-clamp-2">
                          {classItem.description}
                        </CardDescription>
                      </div>
                      {isGraduated ? (
                        <Badge className="flex-shrink-0 text-xs">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Graduated
                        </Badge>
                      ) : isCompleted ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 flex-shrink-0 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {isGraduated && (
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-400">
                            🎓 You can rewatch this class anytime!
                          </p>
                        </div>
                      )}
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{classItem.schedule}</span>
                        </div>
                        {enrollment && teachers.get(enrollment.assignedTeacherId) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 inline-flex items-center justify-center rounded-full bg-muted">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m5-7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm6 4v6M19 15h2" />
                              </svg>
                            </span>
                            <span className="truncate">
                              Teacher: {teachers.get(enrollment.assignedTeacherId)?.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{classItem.capacity} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            Enrolled: {enrollment && new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {classItem.videoFile && (
                        <div className="pt-2 border-t">
                          <p className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 line-clamp-1">
                            {classItem.videoTitle}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                            {classItem.videoDescription}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs sm:text-sm"
                            onClick={() => handleWatchVideo(classItem)}
                          >
                            <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            {isGraduated ? 'Rewatch Video' : 'Watch Video'}
                          </Button>
                        </div>
                      )}

                      {/* Assignment Button */}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-xs sm:text-sm mt-2"
                        onClick={() => handleViewAssignment(classItem)}
                      >
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Assignment
                      </Button>

                      {!isCompleted && (
                        <Button 
                          onClick={() => handleMarkComplete(classItem.id)}
                          className="w-full text-xs sm:text-sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Classes */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
          {availableClasses.length > 0 ? 'Available Classes' : 'All Enrolled'}
        </h3>
        {availableClasses.length === 0 ? (
          <Card>
            <CardContent className="py-6 sm:py-8 text-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">
                You're enrolled in all classes!
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Check back later for new classes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {availableClasses.map((classItem) => (
              <Card key={classItem.id} className="hover-scale">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">{getSimplifiedClassName(classItem.name)}</CardTitle>
                  <CardDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm line-clamp-2">
                    {classItem.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{classItem.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{classItem.capacity} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(classItem.startDate).toLocaleDateString()} - {new Date(classItem.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {classItem.videoTitle && (
                      <div className="pt-2 border-t">
                        <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                          {classItem.videoTitle}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                          {classItem.videoDescription}
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleEnroll(classItem.id)}
                      className="w-full text-xs sm:text-sm"
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
          onVideoComplete={() => handleVideoComplete(selectedVideo.classId)}
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
              <h3 className="text-lg font-semibold">Assignment - {getSimplifiedClassName(selectedClassForAssignment.name)}</h3>
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

      {/* Teacher selection removed - students cannot self-enroll */}
    </div>
  );
};

