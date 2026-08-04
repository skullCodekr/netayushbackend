/*
  Warnings:

  - You are about to drop the column `isApproved` on the `doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `doctor` DROP COLUMN `isApproved`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';
