import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, FileQuestion, Clock, Trophy } from 'lucide-react';

export const QuizSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Quiz</h2>
        <p className="text-muted-foreground">Test your knowledge and track your progress</p>
      </div>

      {/* Locked State */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex p-6 bg-background rounded-full shadow-lg">
              <Lock className="w-16 h-16 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Locked</h3>
              <p className="text-muted-foreground max-w-md">
                Complete all required classes to unlock the quiz section. 
                Once unlocked, you'll be able to test your knowledge and earn certificates.
              </p>
            </div>
            <Badge variant="outline" className="mt-4">
              Coming Soon
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle>Foundation School Quiz</CardTitle>
          <CardDescription>Test your understanding of the course material</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileQuestion className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-xs text-muted-foreground">Available Quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">30m</p>
                    <p className="text-xs text-muted-foreground">Time per Quiz</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">85%</p>
                    <p className="text-xs text-muted-foreground">Pass Mark</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-foreground">What to Expect:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Multiple choice questions covering all course materials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Timed assessments to test your knowledge under pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Instant feedback and detailed explanations for each answer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Certificates awarded upon successful completion</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card>
        <CardHeader>
          <CardTitle>Unlock Requirements</CardTitle>
          <CardDescription>Complete these requirements to access quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Complete All Foundation Classes</p>
                <p className="text-sm text-muted-foreground">Finish all 3 foundation classes</p>
              </div>
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Administrator Approval</p>
                <p className="text-sm text-muted-foreground">Get approval from your teacher</p>
              </div>
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Quiz Activation</p>
                <p className="text-sm text-muted-foreground">Wait for quiz feature activation</p>
              </div>
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

