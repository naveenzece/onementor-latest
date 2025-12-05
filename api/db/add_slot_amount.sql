-- Migration: Add amount field to mentor_slots table
-- This allows each slot to have its own price instead of always using mentor's hourly_rate

-- STEP 1: Add amount column (SKIP IF ALREADY EXISTS)
-- If you get "Duplicate column name 'amount'" error, skip this step
-- ALTER TABLE `mentor_slots` 
-- ADD COLUMN `amount` decimal(10,2) DEFAULT NULL COMMENT 'Price for this specific slot (if different from mentor hourly rate)' AFTER `end_time`;

-- STEP 2: Create index for amount-based filtering (SKIP IF ALREADY EXISTS)
-- If you get "Duplicate key name 'idx_amount'" error, skip this step
-- ALTER TABLE `mentor_slots` 
-- ADD KEY `idx_amount` (`amount`);

-- Update existing slots: Calculate amount based on mentor's hourly_rate and slot duration
-- Note: This query calculates the amount, but you might want to review/update manually
-- Using ms.id > 0 to satisfy safe update mode requirement
UPDATE mentor_slots ms
INNER JOIN mentor_profiles mp ON ms.mentor_id = mp.user_id
SET ms.amount = (
  CASE 
    WHEN mp.hourly_rate IS NOT NULL THEN
      -- Calculate: hourly_rate * (duration in hours)
      ROUND(
        mp.hourly_rate * 
        (TIME_TO_SEC(TIMEDIFF(ms.end_time, ms.start_time)) / 3600.0),
        2
      )
    ELSE NULL
  END
)
WHERE ms.amount IS NULL AND ms.id > 0;

