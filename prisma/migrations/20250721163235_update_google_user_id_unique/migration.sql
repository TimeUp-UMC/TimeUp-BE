/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_google_token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_google_token_user_id_key` ON `user_google_token`(`user_id`);
