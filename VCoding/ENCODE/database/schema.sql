-- ENCODE LMS - MySQL schema (run on Aiven MySQL)
-- Tables: users, courses, sections, lessons, enrollments, lesson_progress

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- users
-- ----------------------------
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- courses
-- ----------------------------
CREATE TABLE `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `short_description` VARCHAR(500) DEFAULT NULL,
  `thumbnail` VARCHAR(500) DEFAULT NULL,
  `instructor` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `category_slug` VARCHAR(100) DEFAULT NULL,
  `difficulty` ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  `total_duration_hrs` DECIMAL(5,2) DEFAULT 0,
  `rating` DECIMAL(2,1) DEFAULT NULL,
  `student_count` INT UNSIGNED DEFAULT 0,
  `what_you_learn` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_category_slug` (`category_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- sections (modules within a course)
-- ----------------------------
CREATE TABLE `sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `order_no` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sections_course_id` (`course_id`),
  CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- lessons (videos/content within a section)
-- ----------------------------
CREATE TABLE `lessons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `order_number` INT UNSIGNED NOT NULL DEFAULT 1,
  `youtube_url` VARCHAR(500) DEFAULT NULL,
  `duration_minutes` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_section_id` (`section_id`),
  CONSTRAINT `fk_lessons_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- enrollments (user enrolled in course)
-- ----------------------------
CREATE TABLE `enrollments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments_user_course` (`user_id`,`course_id`),
  KEY `idx_enrollments_user_id` (`user_id`),
  KEY `idx_enrollments_course_id` (`course_id`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- lesson_progress (per user per lesson: completed, watch time, etc.)
-- ----------------------------
CREATE TABLE `lesson_progress` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `lesson_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `status` ENUM('not_started','in_progress','completed') DEFAULT 'not_started',
  `progress_percent` TINYINT UNSIGNED DEFAULT 0,
  `last_watched_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_progress_user_lesson` (`user_id`,`lesson_id`),
  KEY `idx_lesson_progress_user_id` (`user_id`),
  KEY `idx_lesson_progress_course_id` (`course_id`),
  CONSTRAINT `fk_lesson_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_progress_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
