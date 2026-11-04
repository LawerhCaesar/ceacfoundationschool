import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormModalProps {
  userName?: string;
  userEmail?: string;
  userChurch?: string;
}

export const ContactFormModal = ({ userName, userEmail, userChurch }: ContactFormModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    church: userChurch || '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email via Web3Forms (free service, no backend needed)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'bbc2dbd8-b0b6-4908-808c-b443d5efea83', // You'll need to get this from web3forms.com
          subject: `Foundation Portal Feedback from ${formData.name}`,
          from_name: formData.name,
          email: formData.email,
          to_email: 'lawerhcaesar@gmail.com',
          message: `
Name: ${formData.name}
Email: ${formData.email}
Church: ${formData.church}

Message:
${formData.message}

---
Sent from CEAC Foundation School Portal
          `.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Thank you! Your message has been sent successfully.');
        setFormData({
          name: userName || '',
          email: userEmail || '',
          church: userChurch || '',
          message: '',
        });
        setOpen(false);
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-sm"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Report / Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback or Report an Issue</DialogTitle>
          <DialogDescription>
            We value your feedback! Share your suggestions, report issues, or ask questions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="church">Church</Label>
            <Input
              id="church"
              value={formData.church}
              onChange={(e) => setFormData({ ...formData, church: e.target.value })}
              placeholder="Your church name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Share your feedback, suggestions, or report an issue..."
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your message will be sent to the system administrator.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


