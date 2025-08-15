/*
  Warnings:

  - You are about to alter the column `schedule_id` on the `auto_alarms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Int`.

*/
-- AlterTable
ALTER TABLE `auto_alarms` ADD COLUMN `user_id` INTEGER NOT NULL DEFAULT 1,
    MODIFY `schedule_id` INTEGER NOT NULL;
