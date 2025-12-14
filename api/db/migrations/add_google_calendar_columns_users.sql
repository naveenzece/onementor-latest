-- Migration: Add Google Calendar integration columns to users table
-- Run this migration to add calendar integration support for learners/users

ALTER TABLE `users`
ADD COLUMN `google_calendar_refresh_token` TEXT NULL COMMENT 'Google Calendar OAuth refresh token' AFTER `updated_at`,
ADD COLUMN `google_calendar_email` VARCHAR(255) NULL COMMENT 'Google account email used for calendar' AFTER `google_calendar_refresh_token`,
ADD COLUMN `google_calendar_connected_at` DATETIME NULL COMMENT 'When Google Calendar was connected' AFTER `google_calendar_email`;

-- Add index for faster lookups
CREATE INDEX `idx_google_calendar_email_user` ON `users` (`google_calendar_email`);

