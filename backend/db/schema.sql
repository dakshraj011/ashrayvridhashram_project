-- =========================================================
-- AASHRAY (आश्रय) OLD AGE HOME DATABASE SCHEMA
-- Compatible with MySQL 5.7+ / 8.0+
-- =========================================================

CREATE DATABASE IF NOT EXISTS `aashray_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aashray_db`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) UNIQUE DEFAULT NULL,
  `mobile` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'manager', 'admin') DEFAULT 'user',
  `address` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_mobile` (`mobile`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. HOME INFORMATION TABLE
CREATE TABLE IF NOT EXISTS `home_information` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `name` VARCHAR(150) NOT NULL DEFAULT 'आश्रय वृद्धाश्रम',
  `tagline` VARCHAR(255) DEFAULT 'वरिष्ठ नागरिकों का अपना स्नेहपूर्ण एवं सुरक्षित धाम',
  `description` TEXT,
  `address` TEXT,
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `facilities` TEXT,
  `hero_image` VARCHAR(255) DEFAULT NULL,
  `about_images` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. NEEDS TABLE (वर्तमान आवश्यकताएँ)
CREATE TABLE IF NOT EXISTS `needs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `required_quantity` INT NOT NULL DEFAULT 1,
  `available_quantity` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(30) DEFAULT 'इकाई',
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'सक्रिय',
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_needs_category` (`category`),
  INDEX `idx_needs_status` (`status`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MEAL REQUESTS TABLE (भोजन प्रायोजन)
CREATE TABLE IF NOT EXISTS `meal_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `preferred_date` DATE NOT NULL,
  `people_count` INT DEFAULT 1,
  `meal_type` VARCHAR(50) NOT NULL,
  `items_distributed` TEXT DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'लंबित',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_meal_user` (`user_id`),
  INDEX `idx_meal_status` (`status`),
  INDEX `idx_meal_date` (`preferred_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. VOLUNTEER REGISTRATIONS TABLE (स्वयंसेवक पंजीकरण)
CREATE TABLE IF NOT EXISTS `volunteer_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `preferred_date` DATE NOT NULL,
  `help_type` VARCHAR(100) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'लंबित',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vol_user` (`user_id`),
  INDEX `idx_vol_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ELDERLY ASSISTANCE REQUESTS TABLE (बुजुर्गों की सहायता के अनुरोध)
CREATE TABLE IF NOT EXISTS `assistance_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `elderly_name` VARCHAR(100) NOT NULL,
  `elderly_age` INT DEFAULT NULL,
  `contact_number` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `assistance_type` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `assigned_manager_id` INT DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'लंबित',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ast_user` (`user_id`),
  INDEX `idx_ast_status` (`status`),
  INDEX `idx_ast_manager` (`assigned_manager_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. EVENTS TABLE (कार्यक्रम एवं उत्सव)
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `event_date` DATE NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_events_date` (`event_date`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'सामान्य',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. CONTACT SUBMISSIONS TABLE (संपर्क संदेश)
CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `subject` VARCHAR(150) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(30) DEFAULT 'अपठित',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. NOTIFICATIONS TABLE (सूचनाएँ)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL, -- NULL means broadcast to all users
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'general',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. REQUEST STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS `request_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_type` VARCHAR(50) NOT NULL, -- 'meal', 'volunteer', 'assistance'
  `request_id` INT NOT NULL,
  `previous_status` VARCHAR(30) DEFAULT NULL,
  `new_status` VARCHAR(30) NOT NULL,
  `changed_by` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
