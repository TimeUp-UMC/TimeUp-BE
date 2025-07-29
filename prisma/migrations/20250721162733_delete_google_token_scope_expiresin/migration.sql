/*
  Warnings:

  - You are about to drop the column `expires_at` on the `user_google_token` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `user_google_token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user_google_token` DROP COLUMN `expires_at`,
    DROP COLUMN `scope`;
