import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoFile: string;
  videoTitle: string;
  videoDescription?: string;
  onVideoComplete?: () => void;
  classId?: string; // Add classId to track progress per class
  videoQualities?: { quality: VideoQuality; url: string }[]; // Optional multiple quality sources
}

export const VideoPlayer = ({ 
  isOpen, 
  onClose, 
  videoFile, 
  videoTitle,
  videoDescription,
  onVideoComplete,
  classId,
  videoQualities
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const saveIntervalRef = useRef<number | null>(null);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(() => {
    // Load saved quality preference or default to 'auto'
    const saved = localStorage.getItem('video_quality_preference');
    return (saved as VideoQuality) || 'auto';
  });
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoFile);

  // Get storage key for this video
  const getStorageKey = () => {
    return classId ? `video_progress_${classId}` : `video_progress_${videoFile}`;
  };

  // Handle quality selection
  const handleQualityChange = (quality: VideoQuality) => {
    const video = videoRef.current;
    if (!video) return;

    // Save current playback position
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;

    // Save quality preference
    localStorage.setItem('video_quality_preference', quality);
    setSelectedQuality(quality);

    // Find the URL for the selected quality
    let newUrl = videoFile; // Default to original file

    if (videoQualities && videoQualities.length > 0) {
      if (quality === 'auto') {
        // Auto quality: choose based on connection speed or highest available
        newUrl = videoQualities[videoQualities.length - 1].url;
      } else {
        const qualityOption = videoQualities.find(q => q.quality === quality);
        if (qualityOption) {
          newUrl = qualityOption.url;
        }
      }
    }

    setCurrentVideoUrl(newUrl);

    // Restore playback position after video loads
    setTimeout(() => {
      if (video && video.readyState >= 2) {
        video.currentTime = currentTime;
        if (wasPlaying) {
          video.play();
        }
      }
    }, 100);
  };

  // Update video URL when videoFile changes
  useEffect(() => {
    if (videoQualities && videoQualities.length > 0) {
      // Find the URL for the current selected quality
      let newUrl = videoFile;
      if (selectedQuality === 'auto') {
        newUrl = videoQualities[videoQualities.length - 1].url;
      } else {
        const qualityOption = videoQualities.find(q => q.quality === selectedQuality);
        if (qualityOption) {
          newUrl = qualityOption.url;
        }
      }
      setCurrentVideoUrl(newUrl);
    } else {
      setCurrentVideoUrl(videoFile);
    }
  }, [videoFile, videoQualities, selectedQuality]);

  // Load saved progress when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const storageKey = classId ? `video_progress_${classId}` : `video_progress_${videoFile}`;

    const handleLoadedMetadata = () => {
      const savedTime = localStorage.getItem(storageKey);
      if (savedTime) {
        const time = parseFloat(savedTime);
        // Only resume if not near the end (within last 5%)
        if (time < video.duration * 0.95) {
          video.currentTime = time;
          console.log(`[VideoPlayer] Resuming from ${Math.floor(time)}s for classId: ${classId || videoFile}`);
        } else {
          console.log(`[VideoPlayer] Near end, starting from beginning`);
        }
      } else {
        console.log(`[VideoPlayer] No saved progress found for classId: ${classId || videoFile}`);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoFile, classId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const storageKey = classId ? `video_progress_${classId}` : `video_progress_${videoFile}`;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setWatchProgress(progress);

      // Consider video watched if user reaches 95% (accounts for timing issues)
      if (progress >= 95 && !hasReachedEnd) {
        setHasReachedEnd(true);
        setIsComplete(true);
        onVideoComplete?.();
        // Clear saved progress when completed
        localStorage.removeItem(storageKey);
        console.log(`[VideoPlayer] Video completed, progress cleared`);
      }
    };

    const handlePause = () => {
      // Save progress when paused
      if (video.currentTime > 0 && video.currentTime < video.duration * 0.95) {
        localStorage.setItem(storageKey, video.currentTime.toString());
        console.log(`[VideoPlayer] Progress saved on pause: ${Math.floor(video.currentTime)}s`);
      }
    };

    const handleEnded = () => {
      setIsComplete(true);
      setHasReachedEnd(true);
      onVideoComplete?.();
      // Clear saved progress when ended
      localStorage.removeItem(storageKey);
      console.log(`[VideoPlayer] Video ended, progress cleared`);
    };

    // Save progress periodically (every 5 seconds)
    saveIntervalRef.current = window.setInterval(() => {
      if (!video.paused && video.currentTime > 0 && video.currentTime < video.duration * 0.95) {
        localStorage.setItem(storageKey, video.currentTime.toString());
        console.log(`[VideoPlayer] Auto-save progress: ${Math.floor(video.currentTime)}s`);
      }
    }, 5000);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [hasReachedEnd, onVideoComplete, classId, videoFile]);

  // Reset state when video changes
  useEffect(() => {
    setWatchProgress(0);
    setIsComplete(false);
    setHasReachedEnd(false);
  }, [videoFile]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-xl">{videoTitle}</DialogTitle>
              {videoDescription && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{videoDescription}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            src={currentVideoUrl}
            controls
            autoPlay
            className="w-full h-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Quality Settings Overlay */}
          {videoQualities && videoQualities.length > 0 && (
            <div className="absolute top-2 right-2 z-10">
              {showQualitySettings ? (
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 space-y-2 min-w-[150px]">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-xs font-medium">Video Quality</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQualitySettings(false)}
                      className="h-6 w-6 text-white hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <Select value={selectedQuality} onValueChange={(value) => handleQualityChange(value as VideoQuality)}>
                    <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      {videoQualities.map(({ quality }) => (
                        <SelectItem key={quality} value={quality}>
                          {quality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/70 mt-2">
                    Current: {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
                  </p>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQualitySettings(true)}
                  className="bg-black/50 hover:bg-black/70 text-white h-9 w-9"
                  title="Video quality settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-6 pt-3 sm:pt-4 bg-muted/50 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Watch Progress</span>
            {isComplete ? (
              <span className="flex items-center gap-1 sm:gap-2 text-green-600 font-medium">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Complete</span>
              </span>
            ) : (
              <span className="text-foreground font-medium">{Math.round(watchProgress)}%</span>
            )}
          </div>
          <Progress value={watchProgress} className="h-1.5 sm:h-2" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isComplete 
              ? "You've completed this video."
              : "Video progress is automatically saved."
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

