-- =====================================================
-- Add Test Students with Fellowship Assignments
-- =====================================================
-- This script creates 6 students per church
-- with 2 fellowships per church (3 students each)
-- =====================================================

-- First, let's see what churches we have
-- Run this first to see your existing churches:
-- SELECT DISTINCT church FROM users WHERE church IS NOT NULL;

-- =====================================================
-- OPTION 1: If you want to see existing churches first
-- =====================================================
-- Uncomment the next line to see your churches:
-- SELECT DISTINCT church FROM users WHERE role = 'teacher' OR role = 'admin';

-- =====================================================
-- OPTION 2: Add students to ALL existing churches automatically
-- =====================================================

DO $$
DECLARE
  church_record RECORD;
  student_counter INTEGER;
  fellowship_1 VARCHAR(100);
  fellowship_2 VARCHAR(100);
  student_email VARCHAR(255);
  student_name VARCHAR(255);
BEGIN
  -- Loop through each unique church that has teachers or admins
  FOR church_record IN 
    SELECT DISTINCT church 
    FROM users 
    WHERE church IS NOT NULL 
    AND church != '' 
    AND (role = 'teacher' OR role = 'admin')
  LOOP
    RAISE NOTICE 'Adding students to church: %', church_record.church;
    
    -- Define fellowship names for this church
    fellowship_1 := church_record.church || ' - Youth Fellowship';
    fellowship_2 := church_record.church || ' - Adult Cell Group';
    
    -- Add 6 students (3 per fellowship)
    FOR student_counter IN 1..6 LOOP
      student_email := 'student' || student_counter || '.' || 
                       LOWER(REPLACE(church_record.church, ' ', '')) || 
                       '@test.com';
      student_name := 'Test Student ' || student_counter || ' (' || church_record.church || ')';
      
      -- Insert student
      INSERT INTO users (
        id,
        email,
        name,
        church,
        fellowship,
        role,
        registered_at
      ) VALUES (
        gen_random_uuid(),
        student_email,
        student_name,
        church_record.church,
        -- Assign to fellowship: 1-3 go to fellowship_1, 4-6 go to fellowship_2
        CASE 
          WHEN student_counter <= 3 THEN fellowship_1
          ELSE fellowship_2
        END,
        'student',
        NOW()
      )
      ON CONFLICT (email) DO UPDATE
      SET 
        fellowship = EXCLUDED.fellowship,
        church = EXCLUDED.church;
      
      RAISE NOTICE '  ✓ Added: % (%) - %', 
        student_name, 
        student_email,
        CASE WHEN student_counter <= 3 THEN fellowship_1 ELSE fellowship_2 END;
    END LOOP;
    
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '✅ Test students added successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  • 6 students per church';
  RAISE NOTICE '  • 2 fellowships per church';
  RAISE NOTICE '  • 3 students per fellowship';
END $$;

-- =====================================================
-- Verify the results
-- =====================================================
SELECT 
  church,
  fellowship,
  COUNT(*) as student_count,
  STRING_AGG(name, ', ') as students
FROM users
WHERE role = 'student' AND email LIKE '%@test.com'
GROUP BY church, fellowship
ORDER BY church, fellowship;

-- =====================================================
-- See all test students
-- =====================================================
SELECT 
  name,
  email,
  church,
  fellowship,
  registered_at
FROM users
WHERE role = 'student' AND email LIKE '%@test.com'
ORDER BY church, fellowship, name;

-- =====================================================
-- OPTION 3: Manual insertion for specific churches
-- =====================================================
-- If you prefer to manually specify churches, uncomment and modify below:

/*
-- Example for "Central Church"
INSERT INTO users (id, email, name, church, fellowship, role, registered_at) VALUES
(gen_random_uuid(), 'student1.central@test.com', 'Test Student 1 (Central)', 'Central Church', 'Central Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.central@test.com', 'Test Student 2 (Central)', 'Central Church', 'Central Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.central@test.com', 'Test Student 3 (Central)', 'Central Church', 'Central Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.central@test.com', 'Test Student 4 (Central)', 'Central Church', 'Central Church - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.central@test.com', 'Test Student 5 (Central)', 'Central Church', 'Central Church - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.central@test.com', 'Test Student 6 (Central)', 'Central Church', 'Central Church - Adult Cell Group', 'student', NOW())
ON CONFLICT (email) DO UPDATE
SET fellowship = EXCLUDED.fellowship, church = EXCLUDED.church;

-- Example for "East Side Church"
INSERT INTO users (id, email, name, church, fellowship, role, registered_at) VALUES
(gen_random_uuid(), 'student1.eastside@test.com', 'Test Student 1 (East Side)', 'East Side Church', 'East Side Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.eastside@test.com', 'Test Student 2 (East Side)', 'East Side Church', 'East Side Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.eastside@test.com', 'Test Student 3 (East Side)', 'East Side Church', 'East Side Church - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.eastside@test.com', 'Test Student 4 (East Side)', 'East Side Church', 'East Side Church - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.eastside@test.com', 'Test Student 5 (East Side)', 'East Side Church', 'East Side Church - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.eastside@test.com', 'Test Student 6 (East Side)', 'East Side Church', 'East Side Church - Adult Cell Group', 'student', NOW())
ON CONFLICT (email) DO UPDATE
SET fellowship = EXCLUDED.fellowship, church = EXCLUDED.church;
*/

-- =====================================================
-- Clean up test data (if needed)
-- =====================================================
-- To remove all test students:
-- DELETE FROM users WHERE email LIKE '%@test.com' AND role = 'student';



