-- ============================================================
-- Beyond Fitness PWA — Seed Data
-- Pre-loaded exercise database (user_id IS NULL = shared)
-- Run AFTER schema.sql
-- ============================================================

insert into exercises (name, muscle_group, equipment, is_custom) values

-- ============================================================
-- CHEST
-- ============================================================
('Barbell Bench Press',         'chest', 'barbell',    false),
('Incline Barbell Bench Press', 'chest', 'barbell',    false),
('Decline Barbell Bench Press', 'chest', 'barbell',    false),
('Dumbbell Bench Press',        'chest', 'dumbbell',   false),
('Incline Dumbbell Press',      'chest', 'dumbbell',   false),
('Decline Dumbbell Press',      'chest', 'dumbbell',   false),
('Cable Crossover',             'chest', 'cable',      false),
('Pec Dec / Fly Machine',       'chest', 'machine',    false),
('Dumbbell Fly',                'chest', 'dumbbell',   false),
('Incline Dumbbell Fly',        'chest', 'dumbbell',   false),
('Push-Up',                     'chest', 'bodyweight', false),
('Chest Dip',                   'chest', 'bodyweight', false),
('Smith Machine Bench Press',   'chest', 'smith_machine', false),

-- ============================================================
-- BACK
-- ============================================================
('Barbell Deadlift',            'back', 'barbell',    false),
('Barbell Row',                 'back', 'barbell',    false),
('T-Bar Row',                   'back', 'barbell',    false),
('Seated Cable Row',            'back', 'cable',      false),
('Wide-Grip Lat Pulldown',      'back', 'cable',      false),
('Close-Grip Lat Pulldown',     'back', 'cable',      false),
('Single-Arm Dumbbell Row',     'back', 'dumbbell',   false),
('Pull-Up',                     'back', 'bodyweight', false),
('Chin-Up',                     'back', 'bodyweight', false),
('Chest-Supported Row',         'back', 'dumbbell',   false),
('Straight-Arm Pulldown',       'back', 'cable',      false),
('Face Pull',                   'back', 'cable',      false),
('Rack Pull',                   'back', 'barbell',    false),
('Romanian Deadlift',           'back', 'barbell',    false),

-- ============================================================
-- SHOULDERS
-- ============================================================
('Barbell Overhead Press',      'shoulders', 'barbell',  false),
('Dumbbell Shoulder Press',     'shoulders', 'dumbbell', false),
('Arnold Press',                'shoulders', 'dumbbell', false),
('Lateral Raise',               'shoulders', 'dumbbell', false),
('Cable Lateral Raise',         'shoulders', 'cable',    false),
('Front Raise',                 'shoulders', 'dumbbell', false),
('Reverse Pec Dec',             'shoulders', 'machine',  false),
('Upright Row',                 'shoulders', 'barbell',  false),
('Machine Shoulder Press',      'shoulders', 'machine',  false),
('Pike Push-Up',                'shoulders', 'bodyweight', false),

-- ============================================================
-- BICEPS
-- ============================================================
('Barbell Curl',                'biceps', 'barbell',  false),
('Dumbbell Curl',               'biceps', 'dumbbell', false),
('Hammer Curl',                 'biceps', 'dumbbell', false),
('Incline Dumbbell Curl',       'biceps', 'dumbbell', false),
('Cable Curl',                  'biceps', 'cable',    false),
('Preacher Curl',               'biceps', 'barbell',  false),
('Concentration Curl',          'biceps', 'dumbbell', false),
('EZ-Bar Curl',                 'biceps', 'barbell',  false),
('Machine Curl',                'biceps', 'machine',  false),

-- ============================================================
-- TRICEPS
-- ============================================================
('Close-Grip Bench Press',      'triceps', 'barbell',  false),
('Skull Crusher',               'triceps', 'barbell',  false),
('Tricep Pushdown (Cable)',      'triceps', 'cable',    false),
('Overhead Tricep Extension',   'triceps', 'dumbbell', false),
('Tricep Dip',                  'triceps', 'bodyweight', false),
('Diamond Push-Up',             'triceps', 'bodyweight', false),
('Kickback',                    'triceps', 'dumbbell', false),
('JM Press',                    'triceps', 'barbell',  false),

-- ============================================================
-- LEGS
-- ============================================================
('Barbell Squat',               'legs', 'barbell',    false),
('Front Squat',                 'legs', 'barbell',    false),
('Hack Squat',                  'legs', 'machine',    false),
('Leg Press',                   'legs', 'machine',    false),
('Leg Extension',               'legs', 'machine',    false),
('Leg Curl (Lying)',             'legs', 'machine',    false),
('Leg Curl (Seated)',            'legs', 'machine',    false),
('Bulgarian Split Squat',       'legs', 'dumbbell',   false),
('Lunge',                       'legs', 'dumbbell',   false),
('Step-Up',                     'legs', 'dumbbell',   false),
('Goblet Squat',                'legs', 'kettlebell', false),
('Calf Raise (Standing)',        'legs', 'machine',    false),
('Calf Raise (Seated)',          'legs', 'machine',    false),
('Nordic Hamstring Curl',        'legs', 'bodyweight', false),
('Sumo Deadlift',               'legs', 'barbell',    false),

-- ============================================================
-- GLUTES
-- ============================================================
('Hip Thrust (Barbell)',         'glutes', 'barbell',    false),
('Hip Thrust (Machine)',         'glutes', 'machine',    false),
('Cable Kickback',               'glutes', 'cable',      false),
('Glute Bridge',                 'glutes', 'bodyweight', false),
('Donkey Kick',                  'glutes', 'bodyweight', false),
('Sumo Squat',                   'glutes', 'dumbbell',   false),
('Romanian Deadlift (Dumbbell)', 'glutes', 'dumbbell',   false),

-- ============================================================
-- CORE
-- ============================================================
('Plank',                       'core', 'bodyweight', false),
('Side Plank',                  'core', 'bodyweight', false),
('Crunch',                      'core', 'bodyweight', false),
('Cable Crunch',                'core', 'cable',      false),
('Hanging Leg Raise',           'core', 'bodyweight', false),
('Ab Wheel Rollout',            'core', 'other',      false),
('Russian Twist',               'core', 'bodyweight', false),
('Dead Bug',                    'core', 'bodyweight', false),
('Woodchop',                    'core', 'cable',      false),
('V-Up',                        'core', 'bodyweight', false),

-- ============================================================
-- CARDIO
-- ============================================================
('Treadmill Run',               'cardio', 'machine',    false),
('Elliptical',                  'cardio', 'machine',    false),
('Stationary Bike',             'cardio', 'machine',    false),
('Rowing Machine',              'cardio', 'machine',    false),
('Jump Rope',                   'cardio', 'other',      false),
('Box Jump',                    'cardio', 'bodyweight', false),
('Burpee',                      'cardio', 'bodyweight', false),
('Battle Ropes',                'cardio', 'other',      false),

-- ============================================================
-- FULL BODY / COMPOUND
-- ============================================================
('Power Clean',                 'full_body', 'barbell',    false),
('Clean and Jerk',              'full_body', 'barbell',    false),
('Snatch',                      'full_body', 'barbell',    false),
('Kettlebell Swing',            'full_body', 'kettlebell', false),
('Thruster',                    'full_body', 'barbell',    false),
('Turkish Get-Up',              'full_body', 'kettlebell', false),
('Bear Crawl',                  'full_body', 'bodyweight', false),
('Man Maker',                   'full_body', 'dumbbell',   false)

on conflict do nothing;
