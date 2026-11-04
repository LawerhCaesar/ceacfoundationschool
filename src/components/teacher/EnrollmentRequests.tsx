import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { navigateToUserProfile } from '@/lib/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { EmailService } from '@/lib/email-service';
import { User } from '@/types';
import { UserCheck, UserX, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface EnrollmentRequest {
  id: string;
  student_id: string;
  class_id: string;
  church_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  student: { id: string; name: string; email?: string; role?: string };
  class: { id: string; name: string };
}

interface EnrollmentRequestsProps {
  user: User;
}

export const EnrollmentRequests = ({ user }: EnrollmentRequestsProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollmentRequests();
  }, [user.churchId]);

  const loadEnrollmentRequests = async () => {
    try {
      const enrollmentRequests = await supabaseDb.getEnrollmentRequests(user.churchId);
      setRequests(enrollmentRequests);
    } catch (error) {
      console.error('Error loading enrollment requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enrollment requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, studentId: string, classId: string) => {
    setProcessing(requestId);
    try {
      // Get request details for email
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update enrollment request status
      const success = await supabaseDb.updateEnrollmentRequestStatus(requestId, 'approved');
      
      if (success) {
        // Create enrollment
        await supabaseDb.enrollStudent(studentId, classId);
        
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'approved' as const }
              : req
          )
        );

        // Send email notification to student
        if (request.student.email && EmailService.isEmailNotificationEnabled(studentId)) {
          const portalUrl = 'https://ceacfoundationschool.com';
          EmailService.sendEnrollmentApprovedEmail(request.student.email, {
            studentName: request.student.name,
            className: request.class.name,
            portalUrl,
          }).catch(error => {
            console.error('Failed to send approval email:', error);
            // Don't fail the operation if email fails
          });
        }

        toast({
          title: 'Request Approved',
          description: 'Student has been enrolled in the class',
        });
      } else {
        throw new Error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve enrollment request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessing(requestId);
    try {
      // Get request details for email
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      const success = await supabaseDb.updateEnrollmentRequestStatus(requestId, 'rejected');
      
      if (success) {
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejected' as const }
              : req
          )
        );

        // Send email notification to student
        if (request.student.email && EmailService.isEmailNotificationEnabled(request.student_id)) {
          const portalUrl = 'https://ceacfoundationschool.com';
          EmailService.sendEnrollmentRejectedEmail(request.student.email, {
            studentName: request.student.name,
            className: request.class.name,
            reason: undefined, // Could be made configurable later
            portalUrl,
          }).catch(error => {
            console.error('Failed to send rejection email:', error);
            // Don't fail the operation if email fails
          });
        }

        toast({
          title: 'Request Rejected',
          description: 'Enrollment request has been rejected',
        });
      } else {
        throw new Error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject enrollment request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Requests</CardTitle>
          <CardDescription>Loading requests...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Enrollment Requests
          </CardTitle>
          <CardDescription>
            No pending enrollment requests at this time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>All enrollment requests have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          Enrollment Requests
          <Badge variant="secondary" className="ml-2">
            {requests.filter(r => r.status === 'pending').length} pending
          </Badge>
        </CardTitle>
        <CardDescription>
          Review and approve student enrollment requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <UserAvatar 
                    user={request.student} 
                    size="md" 
                    clickable={true}
                    onClick={() => navigateToUserProfile(request.student.id, request.student.role)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{request.student.name}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Wants to enroll in: <span className="font-medium">{request.class.name}</span>
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id, request.student_id, request.class_id)}
                          disabled={processing === request.id}
                          className="text-xs h-7"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          {processing === request.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processing === request.id}
                          className="text-xs h-7"
                        >
                          <UserX className="w-3 h-3 mr-1" />
                          {processing === request.id ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
