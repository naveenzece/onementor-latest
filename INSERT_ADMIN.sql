-- Complete SQL script to create admin table and insert default admin
-- Run this in your MySQL database (phpMyAdmin, MySQL Workbench, or command line)

-- First, create the admins table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert the default admin user
-- Email: prwebinfo@gmail.com
-- Password: admin123 (hashed with bcrypt)
INSERT INTO `admins` (`name`, `email`, `password`, `role`) VALUES 
('Admin User', 'prwebinfo@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE 
`name` = VALUES(`name`),
`password` = VALUES(`password`),
`role` = VALUES(`role`);

-- Verify the admin was inserted
SELECT id, name, email, role, created_at FROM admins;