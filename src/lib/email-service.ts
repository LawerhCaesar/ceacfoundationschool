/**
 * Email Notification Service
 * 
 * Handles sending email notifications for various events in the Foundation Portal.
 * Uses Web3Forms API for email delivery.
 * 
 * @module email-service
 * @version 1.0.0
 */

// Web3Forms access key - can be moved to environment variables for security
const WEB3FORMS_ACCESS_KEY = 'bbc2dbd8-b0b6-4908-808c-b443d5efea83';
const WEB3FORMS_API_URL = 'https://api.web3forms.com/submit';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  message: string;
  fromName?: string;
  fromEmail?: string;
}

export interface EnrollmentEmailData {
  studentName: string;
  studentEmail?: string;
  className: string;
  churchName: string;
  enrollmentRequestId?: string;
  portalUrl: string;
}

export class EmailService {
  /**
   * Send email via Web3Forms
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      const response = await fetch(WEB3FORMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: options.subject,
          from_name: options.fromName || 'CEAC Foundation Portal',
          from_email: options.fromEmail || 'noreply@foundation-portal.com',
          to_email: recipients,
          message: options.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Email sent successfully:', recipients);
        return true;
      } else {
        console.error('Email sending failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send enrollment request notification to teachers
   */
  static async sendEnrollmentRequestEmail(
    teacherEmails: string[],
    data: EnrollmentEmailData
  ): Promise<boolean> {
    if (teacherEmails.length === 0) {
      console.log('No teacher emails to send enrollment request to');
      return true; // Not an error, just no recipients
    }

    const portalLink = `${data.portalUrl}/teacher?section=enrollment-requests`;
    
    const message = `
Hello Teacher,

You have a new enrollment request from a student in ${data.churchName}.

Student: ${data.studentName}
${data.studentEmail ? `Student Email: ${data.studentEmail}` : ''}
Class: ${data.className}
Church: ${data.churchName}

Please log in to the Foundation Portal to review and approve this enrollment request.

View Enrollment Requests: ${portalLink}

---
CEAC Foundation School Portal
This is an automated notification. Please do not reply to this email.
    `.trim();

    const emailSent = await this.sendEmail({
      to: teacherEmails,
      subject: `New Enrollment Request: ${data.studentName} wants to enroll in ${data.className}`,
      message: message,
      fromName: 'CEAC Foundation Portal',
    });

    return emailSent;
  }

  /**
   * Send enrollment approved notification to student
   */
  static async sendEnrollmentApprovedEmail(
    studentEmail: string,
    data: {
      studentName: string;
      className: string;
      portalUrl: string;
    }
  ): Promise<boolean> {
    const portalLink = `${data.portalUrl}/dashboard?section=classes`;

    const message = `
Hello ${data.studentName},

Great news! Your enrollment request has been approved.

You have been enrolled in: ${data.className}

You can now access the class materials and content through your dashboard.

View Your Classes: ${portalLink}

---
CEAC Foundation School Portal
This is an automated notification. Please do not reply to this email.
    `.trim();

    return await this.sendEmail({
      to: studentEmail,
      subject: `Enrollment Approved: ${data.className}`,
      message: message,
      fromName: 'CEAC Foundation Portal',
    });
  }

  /**
   * Send enrollment rejected notification to student
   */
  static async sendEnrollmentRejectedEmail(
    studentEmail: string,
    data: {
      studentName: string;
      className: string;
      reason?: string;
      portalUrl: string;
    }
  ): Promise<boolean> {
    const portalLink = `${data.portalUrl}/dashboard?section=classes`;

    const message = `
Hello ${data.studentName},

Your enrollment request has been reviewed.

Class: ${data.className}
Status: Not Approved
${data.reason ? `Reason: ${data.reason}` : ''}

If you have any questions, please contact your teacher or church administrator.

View Available Classes: ${portalLink}

---
CEAC Foundation School Portal
This is an automated notification. Please do not reply to this email.
    `.trim();

    return await this.sendEmail({
      to: studentEmail,
      subject: `Enrollment Update: ${data.className}`,
      message: message,
      fromName: 'CEAC Foundation Portal',
    });
  }

  /**
   * Check if email notifications are enabled for a user
   */
  static isEmailNotificationEnabled(userId: string): boolean {
    const preference = localStorage.getItem(`email-notification-preference-${userId}`);
    return preference !== 'disabled';
  }

  /**
   * Set email notification preference for a user
   */
  static setEmailNotificationPreference(userId: string, enabled: boolean): void {
    localStorage.setItem(`email-notification-preference-${userId}`, enabled ? 'enabled' : 'disabled');
  }
}



















