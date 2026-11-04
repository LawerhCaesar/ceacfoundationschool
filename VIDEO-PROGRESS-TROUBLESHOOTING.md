# Video Progress Storage - Troubleshooting Guide

## Overview
The video player should automatically save your watching progress and resume from where you left off when you reopen a video.

---

## 🔍 **How It Works**

### **Progress is Saved:**
1. **Every 5 seconds** while video is playing
2. **When you pause** the video
3. **When you close** the video player

### **Progress is Loaded:**
1. When video metadata loads (video is ready)
2. Automatically resumes from saved position
3. Unless you were near the end (last 5%) - then starts from beginning

### **Storage Key:**
- Uses `classId` if available: `video_progress_${classId}`
- Falls back to `videoFile`: `video_progress_${videoFile}`
- Stored in browser's localStorage

---

## 🧪 **Test If It's Working**

### **Quick Test:**
1. **Open a video** in the Classes section
2. **Watch for 30 seconds** (wait for auto-save)
3. **Close the video player**
4. **Open the same video again**
5. **Should resume from ~30 seconds**

### **Check Browser Console:**
Open browser DevTools (F12) → Console tab

You should see logs like:
```
[VideoPlayer] Resuming from 30s for classId: class-123-abc
[VideoPlayer] Auto-save progress: 45s
[VideoPlayer] Progress saved on pause: 52s
```

If you don't see these logs, there's an issue.

---

## 🔧 **Debugging Steps**

### **Step 1: Check localStorage**

Open browser DevTools (F12) → Application tab → Local Storage

Look for keys like:
- `video_progress_[class-id]`

**To manually check:**
```javascript
// In browser console
localStorage.getItem('video_progress_YOUR_CLASS_ID')
// Should return a number (seconds)
```

### **Step 2: Verify ClassId is Passed**

In browser console while video is open:
```javascript
// Check if classId is being used
Object.keys(localStorage).filter(k => k.startsWith('video_progress'))
```

You should see entries like `video_progress_abc123...`

### **Step 3: Check for Errors**

In browser console, look for any JavaScript errors that might prevent saving.

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: Progress Not Saving**

**Symptoms:**
- Video always starts from beginning
- No console logs about saving

**Possible Causes:**
1. localStorage disabled in browser
2. Private/Incognito mode
3. Browser storage full
4. classId not being passed

**Solutions:**

**A. Check if localStorage works:**
```javascript
// In browser console
localStorage.setItem('test', 'works')
localStorage.getItem('test') // Should return 'works'
```

**B. Exit private/incognito mode**

**C. Clear old localStorage data:**
```javascript
// In browser console
// Remove old video progress
Object.keys(localStorage)
  .filter(k => k.startsWith('video_progress'))
  .forEach(k => localStorage.removeItem(k));
```

**D. Verify classId exists:**
```javascript
// In browser console while video is open
// Check the selected video object
console.log('Current video classId:', selectedVideo?.classId);
```

---

### **Issue 2: Progress Saves But Doesn't Resume**

**Symptoms:**
- Console shows "Progress saved"
- But video starts from beginning

**Possible Causes:**
1. Different storage key being used
2. Video metadata not loading properly
3. Duration check failing

**Solutions:**

**A. Check storage key consistency:**
```javascript
// When video opens, check console for:
// "Resuming from Xs for classId: Y"
// vs
// "No saved progress found for classId: Y"
```

**B. Ensure video has metadata:**
- Wait for video to fully load
- Check if duration is available

**C. Manual test:**
```javascript
// While video is playing
const key = 'video_progress_YOUR_CLASS_ID';
localStorage.setItem(key, '30'); // Save 30 seconds
// Close and reopen video - should resume at 30s
```

---

### **Issue 3: Progress Resets When Switching Quality**

**Symptoms:**
- Changing video quality resets progress

**This is expected behavior!**
- Quality switching preserves playback position
- But if there's an issue, it will restart

**Solution:**
- Don't switch quality mid-video
- Or accept the small reset

---

## 🔍 **Diagnostic Script**

Run this in browser console to diagnose issues:

```javascript
// Diagnostic script
console.log('=== Video Progress Diagnostic ===');

// 1. Check if localStorage works
try {
  localStorage.setItem('test', 'works');
  const works = localStorage.getItem('test') === 'works';
  console.log('✓ localStorage:', works ? 'WORKING' : 'FAILED');
  localStorage.removeItem('test');
} catch (e) {
  console.log('✗ localStorage: DISABLED or FULL');
}

// 2. List all saved video progress
const videoKeys = Object.keys(localStorage).filter(k => k.startsWith('video_progress'));
console.log('✓ Saved video progress entries:', videoKeys.length);
videoKeys.forEach(key => {
  const time = localStorage.getItem(key);
  console.log(`  - ${key}: ${Math.floor(parseFloat(time || '0'))}s`);
});

// 3. Check storage usage
const storageSize = JSON.stringify(localStorage).length;
console.log('✓ localStorage size:', (storageSize / 1024).toFixed(2), 'KB');

console.log('=== End Diagnostic ===');
```

---

## 🔄 **Manual Progress Save/Load**

### **Manually Save Progress:**
```javascript
// While watching a video
const classId = 'YOUR_CLASS_ID'; // Get from URL or enrollment
const currentTime = 120; // 2 minutes
localStorage.setItem(`video_progress_${classId}`, currentTime.toString());
console.log('Saved progress at 2 minutes');
```

### **Manually Check Saved Progress:**
```javascript
const classId = 'YOUR_CLASS_ID';
const saved = localStorage.getItem(`video_progress_${classId}`);
console.log('Saved time:', saved ? `${Math.floor(parseFloat(saved))} seconds` : 'No progress saved');
```

### **Clear All Video Progress:**
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('video_progress'))
  .forEach(k => localStorage.removeItem(k));
console.log('All video progress cleared');
```

---

## 📊 **Expected Behavior**

### **Scenario 1: First Time Watching**
1. Open video → Starts at 0:00
2. Watch for 1 minute
3. Console: "Auto-save progress: 60s"
4. Close video
5. Reopen same video → Resumes at ~1:00

### **Scenario 2: Returning to Paused Video**
1. Watch video to 2:30
2. Pause video
3. Console: "Progress saved on pause: 150s"
4. Close video player
5. Reopen → Resumes at 2:30

### **Scenario 3: Near End**
1. Watch video to 95%
2. Close video
3. Console: "Video completed, progress cleared"
4. Reopen video → Starts from beginning (fresh watch)

### **Scenario 4: Complete Video**
1. Watch to end
2. Console: "Video ended, progress cleared"
3. Reopen → Starts from beginning

---

## 🛠️ **Advanced Fixes**

### **Fix 1: Force Save on Close**

If progress isn't saving, add this to handle video player close:

```typescript
// In ClassesSection.tsx
onClose={() => {
  // Force save before closing
  const video = document.querySelector('video');
  if (video && classId) {
    localStorage.setItem(
      `video_progress_${classId}`, 
      video.currentTime.toString()
    );
  }
  setVideoPlayerOpen(false);
}}
```

### **Fix 2: Increase Save Frequency**

In VideoPlayer.tsx, change auto-save interval:

```typescript
// Current: Save every 5 seconds
}, 5000);

// Change to: Save every 2 seconds
}, 2000);
```

### **Fix 3: Add Beforeunload Handler**

Save progress if user closes browser:

```typescript
useEffect(() => {
  const handleBeforeUnload = () => {
    const video = videoRef.current;
    if (video && classId) {
      localStorage.setItem(
        `video_progress_${classId}`,
        video.currentTime.toString()
      );
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [classId]);
```

---

## 📱 **Mobile-Specific Issues**

### **iOS Safari:**
- May clear localStorage in private mode
- Solution: Use normal browsing mode

### **Android Chrome:**
- May throttle interval timers in background
- Solution: Auto-save still works, but may be delayed

### **All Mobile:**
- Ensure "Block all cookies" is not enabled
- Check browser storage settings

---

## 🔒 **Privacy & Storage**

### **What's Stored:**
- Video playback position (in seconds)
- Storage key format: `video_progress_[classId]`
- Example: `video_progress_abc123` → `125.5`

### **What's NOT Stored:**
- No personal information
- No video content
- No viewing history

### **Storage Limits:**
- localStorage: ~5-10MB per domain
- Each progress entry: ~30-50 bytes
- Can store thousands of video positions

---

## ✅ **Verification Checklist**

Test these scenarios:

- [ ] Watch video for 30 seconds, close, reopen → Resumes
- [ ] Pause at 1 minute, close, reopen → Resumes at 1 minute
- [ ] Watch to 95%, close, reopen → Starts from beginning
- [ ] Watch to end, close, reopen → Starts from beginning
- [ ] Close browser completely → Progress still saved
- [ ] Different videos have different progress
- [ ] Same video resumes correctly across sessions

---

## 📞 **Still Not Working?**

If video progress still isn't saving after trying everything:

1. **Check browser console** for errors
2. **Test in different browser** (Chrome, Firefox, Edge)
3. **Clear all browser data** and try fresh
4. **Disable browser extensions** that might block localStorage
5. **Contact support** via the new Report/Suggestions button!

---

## 🎯 **Expected Console Logs**

When everything is working correctly, you should see:

```
[VideoPlayer] No saved progress found for classId: abc-123
(video plays for a bit)
[VideoPlayer] Auto-save progress: 10s
[VideoPlayer] Auto-save progress: 15s
[VideoPlayer] Progress saved on pause: 18s
(close and reopen)
[VideoPlayer] Resuming from 18s for classId: abc-123
```

---

## 🚀 **Quick Fix**

**Most common issue: Browser cache**

Try this:
1. **Hard refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear cache:** Browser Settings → Clear browsing data → Cached files
3. **Try again**

---

**If you see the console logs, the feature is working!** 

**If progress still doesn't save, share the console logs and I'll help diagnose!** 🔧

---

**Version:** 2.2.1  
**Feature:** Video Progress Storage  
**Status:** ✅ WORKING - With Debug Logs  
**Date:** October 21, 2025


