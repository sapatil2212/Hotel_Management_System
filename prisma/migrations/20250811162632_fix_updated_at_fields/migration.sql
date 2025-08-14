/*
  Warnings:

  - Added the required column `updatedAt` to the `guest_billing_view` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guest_billing_view` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
