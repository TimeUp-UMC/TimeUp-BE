/*
  Warnings:

  - The primary key for the `auto_alarms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `auto_alarm_id` on the `auto_alarms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.
  - The primary key for the `user_preference_transport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `preference_id` on the `user_preference_transport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.

*/
-- AlterTable
ALTER TABLE `auto_alarms` DROP PRIMARY KEY,
    MODIFY `auto_alarm_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`auto_alarm_id`);

-- AlterTable
ALTER TABLE `diary` MODIFY `diary_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `my_alarms` MODIFY `alarm_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `recurrence_rules` MODIFY `recurrence_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `remind_rules` MODIFY `remind_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `repeat_weekdays` MODIFY `repeat_weekday_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `schedules` MODIFY `schedule_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `user_preference_transport` DROP PRIMARY KEY,
    MODIFY `preference_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`preference_id`);

-- AlterTable
ALTER TABLE `wakeup_alarms` MODIFY `wakeup_alarm_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `wakeup_feedbacks` MODIFY `feedback_id` INTEGER NOT NULL AUTO_INCREMENT;
