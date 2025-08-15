/*
  Warnings:

  - The values [forever] on the enum `recurrence_rules_repeat_mode` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[schedule_id]` on the table `recurrence_rules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schedule_id]` on the table `remind_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `recurrence_rules` MODIFY `repeat_mode` ENUM('count', 'until') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `recurrence_rules_schedule_id_key` ON `recurrence_rules`(`schedule_id`);

-- CreateIndex
CREATE UNIQUE INDEX `remind_rules_schedule_id_key` ON `remind_rules`(`schedule_id`);
