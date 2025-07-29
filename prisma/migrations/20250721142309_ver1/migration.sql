-- CreateTable
CREATE TABLE `auto_alarms` (
    `auto_alarm_id` VARCHAR(255) NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `wakeup_time` DATETIME(0) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `is_repeating` BOOLEAN NOT NULL DEFAULT true,
    `repeat_interval` INTEGER NULL,
    `repeat_count` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL,
    `is_sound` BOOLEAN NOT NULL DEFAULT true,
    `is_vibrating` BOOLEAN NOT NULL DEFAULT true,
    `sound_id` INTEGER NOT NULL,
    `vibration_type` ENUM('default', 'short1', 'short2', 'long1', 'long2') NULL,

    PRIMARY KEY (`auto_alarm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diary` (
    `diary_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `diary_date` DATE NOT NULL,
    `content` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`diary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `my_alarms` (
    `alarm_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `my_alarm_name` VARCHAR(50) NOT NULL,
    `my_alarm_time` DATETIME(0) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_repeating` BOOLEAN NOT NULL DEFAULT true,
    `is_vibrating` BOOLEAN NOT NULL DEFAULT true,
    `is_sound` BOOLEAN NOT NULL DEFAULT true,
    `repeat_interval` INTEGER NULL,
    `repeat_count` INTEGER NULL,
    `vibration_type` ENUM('default', 'short1', 'short2', 'long1', 'long2') NULL,
    `sound_id` INTEGER NULL,
    `memo` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`alarm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurrence_rules` (
    `recurrence_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `repeat_type` ENUM('weekly', 'monthly') NOT NULL,
    `repeat_mode` ENUM('forever', 'count', 'until') NOT NULL,
    `repeat_count` INTEGER NULL DEFAULT 1,
    `repeat_until_date` DATE NULL,
    `monthly_repeat_option` ENUM('day_of_month', 'nth_weekday') NULL,
    `day_of_month` INTEGER NULL,
    `nth_week` INTEGER NULL,
    `weekday` INTEGER NULL,

    PRIMARY KEY (`recurrence_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remind_rules` (
    `remind_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `remind_at` INTEGER NOT NULL,

    PRIMARY KEY (`remind_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repeat_weekdays` (
    `repeat_weekday_id` INTEGER NOT NULL,
    `recurrence_id` INTEGER NOT NULL,
    `day_of_week` INTEGER NULL,

    PRIMARY KEY (`repeat_weekday_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `schedule_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `start_date` DATETIME(0) NOT NULL,
    `end_date` DATETIME(0) NOT NULL,
    `color` ENUM('red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink') NOT NULL,
    `place_name` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `memo` VARCHAR(500) NULL,
    `is_reminding` BOOLEAN NOT NULL DEFAULT false,
    `is_recurring` BOOLEAN NOT NULL DEFAULT false,
    `is_important` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_google_token` (
    `token_id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `access_token` TEXT NOT NULL,
    `refresh_token` TEXT NOT NULL,
    `scope` TEXT NOT NULL,
    `expires_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preference_transport` (
    `preference_id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `transport` ENUM('bus', 'subway', 'car', 'walk') NOT NULL,
    `priority` INTEGER NOT NULL,

    PRIMARY KEY (`preference_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `birth` YEAR NULL,
    `job` ENUM('직장인', '공무원/군인', '자영업자', '프리랜서', '학생', '무직', '기타') NULL,
    `avg_ready_time` INTEGER NULL,
    `duration_time` INTEGER NULL,
    `home_address` VARCHAR(255) NULL,
    `work_address` VARCHAR(255) NULL,
    `isNew` BOOLEAN NOT NULL DEFAULT true,
    `alarm_check_time` TIME(0) NOT NULL DEFAULT '22:00:00',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `remind_is_sound` BOOLEAN NOT NULL,
    `remind_is_vibrating` BOOLEAN NOT NULL,
    `remind_sound_id` INTEGER NOT NULL,
    `remind_vibration_type` ENUM('default', 'short1', 'short2', 'long1', 'long2') NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wakeup_alarms` (
    `wakeup_alarm_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `wakeup_time` TIME(0) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_repeating` BOOLEAN NOT NULL DEFAULT true,
    `is_vibrating` BOOLEAN NOT NULL DEFAULT true,
    `is_sound` BOOLEAN NOT NULL DEFAULT true,
    `repeat_interval` INTEGER NULL,
    `repeat_count` INTEGER NULL,
    `sound_id` INTEGER NULL,
    `vibration_type` ENUM('default', 'short1', 'short2', 'long1', 'long2') NULL,
    `memo` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`wakeup_alarm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wakeup_feedbacks` (
    `feedback_id` INTEGER NOT NULL,
    `auto_alarm_id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `time_rating` INTEGER NOT NULL,
    `wakeup_rating` INTEGER NOT NULL,
    `comment` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`feedback_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
