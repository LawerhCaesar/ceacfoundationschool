-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('enrollment_request', 'class_completed', 'assignment_submitted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollment_requests table
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  church_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_enrollment_requests_church_id ON enrollment_requests(church_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_created_at ON enrollment_requests(created_at);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (handled by service role)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Add RLS policies for enrollment_requests
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Teachers and admins can view enrollment requests for their church
CREATE POLICY "Church staff can view enrollment requests" ON enrollment_requests
  FOR SELECT USING (
    church_id IN (
      SELECT church FROM users WHERE id = auth.uid()
    )
  );

-- Teachers and admins can update enrollment request status
CREATE POLICY "Church staff can update enrollment requests" ON enrollment_requests
  FOR UPDATE USING (
    church_id IN (
      SELECT church FROM users WHERE id = auth.uid()
    )
  );

-- System can insert enrollment requests
CREATE POLICY "System can insert enrollment requests" ON enrollment_requests
  FOR INSERT WITH CHECK (true);






























