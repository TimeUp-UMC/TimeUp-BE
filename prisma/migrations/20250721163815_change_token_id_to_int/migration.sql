/*
  Warnings:

  - The primary key for the `user_google_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `token_id` on the `user_google_token` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.

*/
-- AlterTable
ALTER TABLE `user_google_token` DROP PRIMARY KEY,
    MODIFY `token_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`token_id`);
