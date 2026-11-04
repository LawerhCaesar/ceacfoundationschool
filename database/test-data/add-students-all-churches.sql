-- =====================================================
-- Add 6 Test Students Per Church with Fellowships
-- =====================================================
-- Total: 30 churches × 6 students = 180 test students
-- 2 fellowships per church (3 students each)
-- =====================================================

BEGIN;

-- Insert test students for all 30 churches
-- Format: student[1-6].[churchname]@test.com

-- PFCC 1
INSERT INTO users (id, email, name, church, fellowship, role, registered_at) VALUES
(gen_random_uuid(), 'student1.pfcc1@test.com', 'Test Student 1 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.pfcc1@test.com', 'Test Student 2 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.pfcc1@test.com', 'Test Student 3 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.pfcc1@test.com', 'Test Student 4 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.pfcc1@test.com', 'Test Student 5 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.pfcc1@test.com', 'Test Student 6 (PFCC 1)', 'PFCC 1', 'PFCC 1 - Adult Cell Group', 'student', NOW()),

-- PFCC 3
(gen_random_uuid(), 'student1.pfcc3@test.com', 'Test Student 1 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.pfcc3@test.com', 'Test Student 2 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.pfcc3@test.com', 'Test Student 3 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.pfcc3@test.com', 'Test Student 4 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.pfcc3@test.com', 'Test Student 5 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.pfcc3@test.com', 'Test Student 6 (PFCC 3)', 'PFCC 3', 'PFCC 3 - Adult Cell Group', 'student', NOW()),

-- PFCC 4
(gen_random_uuid(), 'student1.pfcc4@test.com', 'Test Student 1 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.pfcc4@test.com', 'Test Student 2 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.pfcc4@test.com', 'Test Student 3 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.pfcc4@test.com', 'Test Student 4 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.pfcc4@test.com', 'Test Student 5 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.pfcc4@test.com', 'Test Student 6 (PFCC 4)', 'PFCC 4', 'PFCC 4 - Adult Cell Group', 'student', NOW()),

-- OFCC
(gen_random_uuid(), 'student1.ofcc@test.com', 'Test Student 1 (OFCC)', 'OFCC', 'OFCC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.ofcc@test.com', 'Test Student 2 (OFCC)', 'OFCC', 'OFCC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.ofcc@test.com', 'Test Student 3 (OFCC)', 'OFCC', 'OFCC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.ofcc@test.com', 'Test Student 4 (OFCC)', 'OFCC', 'OFCC - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.ofcc@test.com', 'Test Student 5 (OFCC)', 'OFCC', 'OFCC - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.ofcc@test.com', 'Test Student 6 (OFCC)', 'OFCC', 'OFCC - Adult Cell Group', 'student', NOW()),

-- ARC
(gen_random_uuid(), 'student1.arc@test.com', 'Test Student 1 (ARC)', 'ARC', 'ARC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.arc@test.com', 'Test Student 2 (ARC)', 'ARC', 'ARC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.arc@test.com', 'Test Student 3 (ARC)', 'ARC', 'ARC - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.arc@test.com', 'Test Student 4 (ARC)', 'ARC', 'ARC - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.arc@test.com', 'Test Student 5 (ARC)', 'ARC', 'ARC - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.arc@test.com', 'Test Student 6 (ARC)', 'ARC', 'ARC - Adult Cell Group', 'student', NOW()),

-- MODEL CHURCH
(gen_random_uuid(), 'student1.modelchurch@test.com', 'Test Student 1 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.modelchurch@test.com', 'Test Student 2 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.modelchurch@test.com', 'Test Student 3 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.modelchurch@test.com', 'Test Student 4 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.modelchurch@test.com', 'Test Student 5 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.modelchurch@test.com', 'Test Student 6 (MODEL CHURCH)', 'MODEL CHURCH', 'MODEL CHURCH - Adult Cell Group', 'student', NOW()),

-- LORDS ARMY
(gen_random_uuid(), 'student1.lordsarmy@test.com', 'Test Student 1 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.lordsarmy@test.com', 'Test Student 2 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.lordsarmy@test.com', 'Test Student 3 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.lordsarmy@test.com', 'Test Student 4 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.lordsarmy@test.com', 'Test Student 5 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.lordsarmy@test.com', 'Test Student 6 (LORDS ARMY)', 'LORDS ARMY', 'LORDS ARMY - Adult Cell Group', 'student', NOW()),

-- FIREBRAND
(gen_random_uuid(), 'student1.firebrand@test.com', 'Test Student 1 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.firebrand@test.com', 'Test Student 2 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.firebrand@test.com', 'Test Student 3 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.firebrand@test.com', 'Test Student 4 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.firebrand@test.com', 'Test Student 5 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.firebrand@test.com', 'Test Student 6 (FIREBRAND)', 'FIREBRAND', 'FIREBRAND - Adult Cell Group', 'student', NOW()),

-- FRUITFUL CHURCH
(gen_random_uuid(), 'student1.fruitfulchurch@test.com', 'Test Student 1 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.fruitfulchurch@test.com', 'Test Student 2 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.fruitfulchurch@test.com', 'Test Student 3 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.fruitfulchurch@test.com', 'Test Student 4 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.fruitfulchurch@test.com', 'Test Student 5 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.fruitfulchurch@test.com', 'Test Student 6 (FRUITFUL CHURCH)', 'FRUITFUL CHURCH', 'FRUITFUL CHURCH - Adult Cell Group', 'student', NOW()),

-- TRUIMPHANT CHURCH
(gen_random_uuid(), 'student1.truimphantchurch@test.com', 'Test Student 1 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.truimphantchurch@test.com', 'Test Student 2 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.truimphantchurch@test.com', 'Test Student 3 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.truimphantchurch@test.com', 'Test Student 4 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.truimphantchurch@test.com', 'Test Student 5 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.truimphantchurch@test.com', 'Test Student 6 (TRUIMPHANT CHURCH)', 'TRUIMPHANT CHURCH', 'TRUIMPHANT CHURCH - Adult Cell Group', 'student', NOW()),

-- LUMINOUS CHURCH
(gen_random_uuid(), 'student1.luminouschurch@test.com', 'Test Student 1 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.luminouschurch@test.com', 'Test Student 2 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.luminouschurch@test.com', 'Test Student 3 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.luminouschurch@test.com', 'Test Student 4 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.luminouschurch@test.com', 'Test Student 5 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.luminouschurch@test.com', 'Test Student 6 (LUMINOUS CHURCH)', 'LUMINOUS CHURCH', 'LUMINOUS CHURCH - Adult Cell Group', 'student', NOW()),

-- PERFECT CHURCH
(gen_random_uuid(), 'student1.perfectchurch@test.com', 'Test Student 1 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.perfectchurch@test.com', 'Test Student 2 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.perfectchurch@test.com', 'Test Student 3 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.perfectchurch@test.com', 'Test Student 4 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.perfectchurch@test.com', 'Test Student 5 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.perfectchurch@test.com', 'Test Student 6 (PERFECT CHURCH)', 'PERFECT CHURCH', 'PERFECT CHURCH - Adult Cell Group', 'student', NOW()),

-- WINNING CHURCH
(gen_random_uuid(), 'student1.winningchurch@test.com', 'Test Student 1 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.winningchurch@test.com', 'Test Student 2 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.winningchurch@test.com', 'Test Student 3 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.winningchurch@test.com', 'Test Student 4 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.winningchurch@test.com', 'Test Student 5 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.winningchurch@test.com', 'Test Student 6 (WINNING CHURCH)', 'WINNING CHURCH', 'WINNING CHURCH - Adult Cell Group', 'student', NOW()),

-- ABUNDANT GRACE
(gen_random_uuid(), 'student1.abundantgrace@test.com', 'Test Student 1 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.abundantgrace@test.com', 'Test Student 2 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.abundantgrace@test.com', 'Test Student 3 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.abundantgrace@test.com', 'Test Student 4 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.abundantgrace@test.com', 'Test Student 5 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.abundantgrace@test.com', 'Test Student 6 (ABUNDANT GRACE)', 'ABUNDANT GRACE', 'ABUNDANT GRACE - Adult Cell Group', 'student', NOW()),

-- KASOA CHURCH
(gen_random_uuid(), 'student1.kasoachurch@test.com', 'Test Student 1 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.kasoachurch@test.com', 'Test Student 2 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.kasoachurch@test.com', 'Test Student 3 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.kasoachurch@test.com', 'Test Student 4 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.kasoachurch@test.com', 'Test Student 5 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.kasoachurch@test.com', 'Test Student 6 (KASOA CHURCH)', 'KASOA CHURCH', 'KASOA CHURCH - Adult Cell Group', 'student', NOW()),

-- MEGA CHURCH
(gen_random_uuid(), 'student1.megachurch@test.com', 'Test Student 1 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.megachurch@test.com', 'Test Student 2 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.megachurch@test.com', 'Test Student 3 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.megachurch@test.com', 'Test Student 4 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.megachurch@test.com', 'Test Student 5 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.megachurch@test.com', 'Test Student 6 (MEGA CHURCH)', 'MEGA CHURCH', 'MEGA CHURCH - Adult Cell Group', 'student', NOW()),

-- WONDER CHURCH
(gen_random_uuid(), 'student1.wonderchurch@test.com', 'Test Student 1 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.wonderchurch@test.com', 'Test Student 2 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.wonderchurch@test.com', 'Test Student 3 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.wonderchurch@test.com', 'Test Student 4 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.wonderchurch@test.com', 'Test Student 5 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.wonderchurch@test.com', 'Test Student 6 (WONDER CHURCH)', 'WONDER CHURCH', 'WONDER CHURCH - Adult Cell Group', 'student', NOW()),

-- GLORIOUS CHURCH
(gen_random_uuid(), 'student1.gloriouschurch@test.com', 'Test Student 1 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.gloriouschurch@test.com', 'Test Student 2 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.gloriouschurch@test.com', 'Test Student 3 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.gloriouschurch@test.com', 'Test Student 4 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.gloriouschurch@test.com', 'Test Student 5 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.gloriouschurch@test.com', 'Test Student 6 (GLORIOUS CHURCH)', 'GLORIOUS CHURCH', 'GLORIOUS CHURCH - Adult Cell Group', 'student', NOW()),

-- TRUELIGHT CHURCH
(gen_random_uuid(), 'student1.truelightchurch@test.com', 'Test Student 1 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.truelightchurch@test.com', 'Test Student 2 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.truelightchurch@test.com', 'Test Student 3 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.truelightchurch@test.com', 'Test Student 4 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.truelightchurch@test.com', 'Test Student 5 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.truelightchurch@test.com', 'Test Student 6 (TRUELIGHT CHURCH)', 'TRUELIGHT CHURCH', 'TRUELIGHT CHURCH - Adult Cell Group', 'student', NOW()),

-- KORLE BU CHURCH
(gen_random_uuid(), 'student1.korlebuchurch@test.com', 'Test Student 1 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.korlebuchurch@test.com', 'Test Student 2 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.korlebuchurch@test.com', 'Test Student 3 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.korlebuchurch@test.com', 'Test Student 4 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.korlebuchurch@test.com', 'Test Student 5 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.korlebuchurch@test.com', 'Test Student 6 (KORLE BU CHURCH)', 'KORLE BU CHURCH', 'KORLE BU CHURCH - Adult Cell Group', 'student', NOW()),

-- POWERHOUSE
(gen_random_uuid(), 'student1.powerhouse@test.com', 'Test Student 1 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.powerhouse@test.com', 'Test Student 2 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.powerhouse@test.com', 'Test Student 3 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.powerhouse@test.com', 'Test Student 4 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.powerhouse@test.com', 'Test Student 5 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.powerhouse@test.com', 'Test Student 6 (POWERHOUSE)', 'POWERHOUSE', 'POWERHOUSE - Adult Cell Group', 'student', NOW()),

-- JESUS BRAND
(gen_random_uuid(), 'student1.jesusbrand@test.com', 'Test Student 1 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.jesusbrand@test.com', 'Test Student 2 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.jesusbrand@test.com', 'Test Student 3 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.jesusbrand@test.com', 'Test Student 4 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.jesusbrand@test.com', 'Test Student 5 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.jesusbrand@test.com', 'Test Student 6 (JESUS BRAND)', 'JESUS BRAND', 'JESUS BRAND - Adult Cell Group', 'student', NOW()),

-- TAKORADI CHURCH
(gen_random_uuid(), 'student1.takoradichurch@test.com', 'Test Student 1 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.takoradichurch@test.com', 'Test Student 2 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.takoradichurch@test.com', 'Test Student 3 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.takoradichurch@test.com', 'Test Student 4 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.takoradichurch@test.com', 'Test Student 5 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.takoradichurch@test.com', 'Test Student 6 (TAKORADI CHURCH)', 'TAKORADI CHURCH', 'TAKORADI CHURCH - Adult Cell Group', 'student', NOW()),

-- KOFORIDUA CHURCH
(gen_random_uuid(), 'student1.kofiduachurch@test.com', 'Test Student 1 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.kofiduachurch@test.com', 'Test Student 2 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.kofiduachurch@test.com', 'Test Student 3 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.kofiduachurch@test.com', 'Test Student 4 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.kofiduachurch@test.com', 'Test Student 5 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.kofiduachurch@test.com', 'Test Student 6 (KOFORIDUA CHURCH)', 'KOFORIDUA CHURCH', 'KOFORIDUA CHURCH - Adult Cell Group', 'student', NOW()),

-- HO CHURCH
(gen_random_uuid(), 'student1.hochurch@test.com', 'Test Student 1 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.hochurch@test.com', 'Test Student 2 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.hochurch@test.com', 'Test Student 3 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.hochurch@test.com', 'Test Student 4 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.hochurch@test.com', 'Test Student 5 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.hochurch@test.com', 'Test Student 6 (HO CHURCH)', 'HO CHURCH', 'HO CHURCH - Adult Cell Group', 'student', NOW()),

-- CHILDRENS CHURCH
(gen_random_uuid(), 'student1.childrenschurch@test.com', 'Test Student 1 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.childrenschurch@test.com', 'Test Student 2 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.childrenschurch@test.com', 'Test Student 3 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.childrenschurch@test.com', 'Test Student 4 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.childrenschurch@test.com', 'Test Student 5 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.childrenschurch@test.com', 'Test Student 6 (CHILDRENS CHURCH)', 'CHILDRENS CHURCH', 'CHILDRENS CHURCH - Adult Cell Group', 'student', NOW()),

-- MODEL TEENS CHURCH 1
(gen_random_uuid(), 'student1.modelteenschurch1@test.com', 'Test Student 1 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.modelteenschurch1@test.com', 'Test Student 2 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.modelteenschurch1@test.com', 'Test Student 3 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.modelteenschurch1@test.com', 'Test Student 4 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.modelteenschurch1@test.com', 'Test Student 5 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.modelteenschurch1@test.com', 'Test Student 6 (MODEL TEENS CHURCH 1)', 'MODEL TEENS CHURCH 1', 'MODEL TEENS CHURCH 1 - Adult Cell Group', 'student', NOW()),

-- MODEL TEENS CHURCH 2
(gen_random_uuid(), 'student1.modelteenschurch2@test.com', 'Test Student 1 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.modelteenschurch2@test.com', 'Test Student 2 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.modelteenschurch2@test.com', 'Test Student 3 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.modelteenschurch2@test.com', 'Test Student 4 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.modelteenschurch2@test.com', 'Test Student 5 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.modelteenschurch2@test.com', 'Test Student 6 (MODEL TEENS CHURCH 2)', 'MODEL TEENS CHURCH 2', 'MODEL TEENS CHURCH 2 - Adult Cell Group', 'student', NOW()),

-- MODEL TEENS CHURCH 3
(gen_random_uuid(), 'student1.modelteenschurch3@test.com', 'Test Student 1 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.modelteenschurch3@test.com', 'Test Student 2 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.modelteenschurch3@test.com', 'Test Student 3 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.modelteenschurch3@test.com', 'Test Student 4 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.modelteenschurch3@test.com', 'Test Student 5 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.modelteenschurch3@test.com', 'Test Student 6 (MODEL TEENS CHURCH 3)', 'MODEL TEENS CHURCH 3', 'MODEL TEENS CHURCH 3 - Adult Cell Group', 'student', NOW()),

-- MODEL TEENS CHURCH 4
(gen_random_uuid(), 'student1.modelteenschurch4@test.com', 'Test Student 1 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student2.modelteenschurch4@test.com', 'Test Student 2 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student3.modelteenschurch4@test.com', 'Test Student 3 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Youth Fellowship', 'student', NOW()),
(gen_random_uuid(), 'student4.modelteenschurch4@test.com', 'Test Student 4 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student5.modelteenschurch4@test.com', 'Test Student 5 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Adult Cell Group', 'student', NOW()),
(gen_random_uuid(), 'student6.modelteenschurch4@test.com', 'Test Student 6 (MODEL TEENS CHURCH 4)', 'MODEL TEENS CHURCH 4', 'MODEL TEENS CHURCH 4 - Adult Cell Group', 'student', NOW())

ON CONFLICT (email) DO UPDATE
SET 
  fellowship = EXCLUDED.fellowship,
  church = EXCLUDED.church,
  name = EXCLUDED.name;

COMMIT;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Summary by church and fellowship
SELECT 
  church,
  fellowship,
  COUNT(*) as student_count
FROM users
WHERE email LIKE '%@test.com' AND role = 'student'
GROUP BY church, fellowship
ORDER BY church, fellowship;

-- Total count
SELECT 
  COUNT(*) as total_test_students,
  COUNT(DISTINCT church) as total_churches,
  COUNT(DISTINCT fellowship) as total_fellowships
FROM users
WHERE email LIKE '%@test.com' AND role = 'student';

-- List all test students
SELECT 
  name,
  email,
  church,
  fellowship
FROM users
WHERE email LIKE '%@test.com' AND role = 'student'
ORDER BY church, fellowship, name;

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully added 180 test students!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  • 30 churches';
  RAISE NOTICE '  • 6 students per church';
  RAISE NOTICE '  • 2 fellowships per church (Youth Fellowship & Adult Cell Group)';
  RAISE NOTICE '  • 3 students per fellowship';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to test bulk enrollment!';
END $$;

-- =====================================================
-- Clean Up (if needed)
-- =====================================================
-- To remove all test students:
-- DELETE FROM users WHERE email LIKE '%@test.com' AND role = 'student';


