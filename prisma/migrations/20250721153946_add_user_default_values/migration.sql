-- AlterTable
ALTER TABLE `users` MODIFY `remind_is_sound` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `remind_is_vibrating` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `remind_sound_id` INTEGER NOT NULL DEFAULT 0,
    MODIFY `remind_vibration_type` ENUM('default', 'short1', 'short2', 'long1', 'long2') NOT NULL DEFAULT 'default';
