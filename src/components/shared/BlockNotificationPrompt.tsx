import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellOff, X, AlertTriangle } from 'lucide-react';

interface BlockNotificationPromptProps {
  onConfirm: () => void;
  onDismiss: () => void;
}

export const BlockNotificationPrompt = ({ onConfirm, onDismiss }: BlockNotificationPromptProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full border-red-200 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Disable Notifications?
          </CardTitle>
          <CardDescription className="text-sm">
            You won't receive alerts for enrollment requests
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Warning */}
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">
                  What you'll miss:
                </h4>
                <ul className="text-xs text-red-700 dark:text-red-300 mt-1 space-y-1">
                  <li>• Instant alerts when students request enrollment</li>
                  <li>• Real-time notifications on your device</li>
                  <li>• Quick access to enrollment management</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="flex-1"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disable Notifications
            </Button>
            <Button 
              variant="outline" 
              onClick={onDismiss}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Keep Enabled
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 You can re-enable notifications anytime
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};






























