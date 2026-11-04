# Troubleshooting: Making Class 6 Visible

## Issue
Class 6 has been added to the system but may not be showing up in the Classes section.

## Quick Fixes

### 1. Refresh the Page
**Fastest Solution**: Simply refresh the page (F5 or Ctrl+R)
- The component auto-refreshes every 5 seconds
- A manual refresh forces immediate data fetch

### 2. Check Database
Verify Class 6 exists in the database:

```sql
-- In Supabase SQL Editor:
SELECT * FROM classes WHERE name ILIKE '%class 6%' OR name ILIKE '%class%6%';
```

Expected result should show Class 6 with all its details.

### 3. Verify Video File Path
If Class 6 has a video, ensure the `video_file` field is correct:

```sql
-- Check video file path:
SELECT name, video_file, video_title FROM classes WHERE name ILIKE '%class 6%';
```

Expected video path: `videos/Class 6.mp4` or `/videos/Class 6.mp4`

### 4. Clear Browser Cache
If still not showing:
1. Press `Ctrl+Shift+R` (hard refresh)
2. Or clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data

### 5. Check Enrollment Status
Class 6 may be enrolled but showing in the wrong section:
- **"My Enrolled Classes"** section = Already enrolled
- **"Available Classes"** section = Not yet enrolled

## Verification Checklist

✅ **Class 6.mp4** exists in `/public/videos/` folder (CONFIRMED ✓)
✅ **Database entry** exists for Class 6
✅ **Video file path** is correct in database
✅ **Page has been refreshed**
✅ **Looking in correct section** (enrolled vs available)

## Common Issues

### Class Shows for Some Users But Not Others
**Reason**: Enrollment status differs per user
**Solution**: 
- Admins see all classes in Class Management
- Students see based on their enrollments
- Check from correct user perspective

### Class Shows in Admin But Not Student View
**Reason**: Student may already be enrolled
**Solution**: Check "My Enrolled Classes" section at the top

### Video Not Playing
**Reason**: File path mismatch
**Solution**: Ensure database `video_file` field matches actual file:
- File: `/public/videos/Class 6.mp4`
- Database: `videos/Class 6.mp4` (without leading /)

## Manual Database Fix

If Class 6 doesn't exist, create it:

```sql
INSERT INTO classes (
  name, 
  description, 
  schedule, 
  start_date, 
  end_date, 
  capacity,
  video_file,
  video_title,
  video_description
) VALUES (
  'Class 6',
  'Foundation School Class 6 - The Local Assembly & Loveworld Inc.',
  'Self-paced',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  100,
  'videos/Class 6.mp4',
  'Class 6 - The Local Assembly & Loveworld Inc.',
  'Complete Class 6 video lessons on church structure, leadership, and the vision of Loveworld Inc. worldwide'
);
```

## Update Existing Class 6

If Class 6 exists but video isn't linked:

```sql
UPDATE classes 
SET 
  video_file = 'videos/Class 6.mp4',
  video_title = 'Class 6 - The Local Assembly & Loveworld Inc.',
  video_description = 'Complete Class 6 video lessons on church structure, leadership, and the vision of Loveworld Inc. worldwide'
WHERE name = 'Class 6' OR name ILIKE '%class 6%';
```

## Testing

After any fix:
1. Log in as a student
2. Go to Dashboard → Classes
3. Look in **"Available Classes"** section (if not enrolled)
4. Or in **"My Enrolled Classes"** section (if enrolled)
5. Class 6 should appear with video option

## Contact Support

If Class 6 still doesn't show after trying all steps:
1. Use Contact Form in dashboard
2. Include:
   - User role (student/teacher/admin)
   - Which section you're checking (enrolled/available)
   - Screenshot if possible
   - Any error messages in browser console (F12)

---

**Quick Solution**: Just refresh the page! The auto-refresh will pick up Class 6 within 5 seconds.


