import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabaseDb } from '@/lib/supabase-db';
import { supabaseAuth } from '@/lib/supabase-auth';
import { exportClassStudents } from '@/lib/exports';
import { Class } from '@/types';
import { Plus, Download, Trash2, Loader2, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ClassManagementProps {
  onUpdate: () => void;
}

export const ClassManagement = ({ onUpdate }: ClassManagementProps) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchClasses();

    // Auto-refresh every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchClasses();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchClasses = async () => {
    try {
      const classesData = await supabaseDb.getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule: '',
    startDate: '',
    endDate: '',
    capacity: '',
    videoFile: '',
    videoTitle: '',
    videoDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const currentUser = await supabaseAuth.getCurrentUser();
      
      const newClass = await supabaseDb.addClass({
        name: formData.name,
        description: formData.description,
        teacherId: currentUser?.id || null,
        schedule: formData.schedule,
        startDate: formData.startDate,
        endDate: formData.endDate,
        capacity: parseInt(formData.capacity),
        videoFile: formData.videoFile || null,
        videoTitle: formData.videoTitle || null,
        videoDescription: formData.videoDescription || null,
      });
      
      if (newClass) {
        await fetchClasses();
        setOpen(false);
        setFormData({ name: '', description: '', schedule: '', startDate: '', endDate: '', capacity: '', videoFile: '', videoTitle: '', videoDescription: '' });
        toast({ title: 'Class created successfully' });
        onUpdate();
      }
    } catch (error) {
      console.error('Class creation error:', error);
      toast({ title: 'Failed to create class', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabaseDb.deleteClass(id);
      await fetchClasses();
      toast({ title: 'Class deleted' });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Failed to delete class', variant: 'destructive' });
    }
  };

  const handleExport = async (classItem: Class, format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const [enrollments, users] = await Promise.all([
        supabaseDb.getEnrollments(),
        supabaseDb.getUsers(),
      ]);
      exportClassStudents(classItem, enrollments, users, format);
      toast({ 
        title: 'Export successful', 
        description: `Class data exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Failed to export data', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>Create and manage classes</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>Add a new class to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g., Mon/Wed/Fri 10:00 AM"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoFile">Video File (optional)</Label>
                  <Input
                    id="videoFile"
                    type="text"
                    placeholder="videos/class-name.mp4"
                    value={formData.videoFile}
                    onChange={(e) => setFormData({ ...formData, videoFile: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Place video files in the public/videos/ folder</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Video Title (optional)</Label>
                  <Input
                    id="videoTitle"
                    placeholder="Course introduction video"
                    value={formData.videoTitle}
                    onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoDescription">Video Description (optional)</Label>
                  <Input
                    id="videoDescription"
                    placeholder="Brief description of the video content"
                    value={formData.videoDescription}
                    onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Create Class</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map(classItem => (
              <TableRow key={classItem.id}>
                <TableCell className="font-medium">{classItem.name}</TableCell>
                <TableCell>{classItem.schedule}</TableCell>
                <TableCell>
                  {new Date(classItem.startDate).toLocaleDateString()} - {new Date(classItem.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{classItem.capacity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport(classItem, 'csv')}>
                          <Download className="w-4 h-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(classItem, 'xlsx')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export as Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(classItem.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
