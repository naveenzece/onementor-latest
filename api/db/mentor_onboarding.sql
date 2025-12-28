-- Migration script for mentor onboarding flow

-- 1. Add 'registered' flag to mentor_profiles table
ALTER TABLE `mentor_profiles` 
ADD COLUMN `registered` TINYINT(1) DEFAULT 0 COMMENT 'Flag for registration fee payment status (0: not paid, 1: paid)';

-- 2. Create registration_payments table to capture fee payments
CREATE TABLE IF NOT EXISTS `registration_payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mentor_id` INT NOT NULL COMMENT 'References users.id of the mentor',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Registration fee amount',
  `currency` VARCHAR(3) DEFAULT 'INR',
  `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT 'Payment status',
  `order_id` VARCHAR(255) DEFAULT NULL COMMENT 'Payment gateway order ID',
  `transaction_id` VARCHAR(255) DEFAULT NULL COMMENT 'Payment gateway transaction ID',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `mentor_id` (`mentor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `registration_payments_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
