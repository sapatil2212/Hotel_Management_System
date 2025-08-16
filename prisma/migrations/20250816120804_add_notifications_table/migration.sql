/*
  Warnings:

  - A unique constraint covering the columns `[bookingId,amount,paymentMethod,paymentDate]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error', 'booking', 'payment', 'revenue', 'expense', 'system') NOT NULL DEFAULT 'info',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `referenceType` ENUM('booking', 'invoice', 'payment', 'expense', 'transfer', 'adjustment', 'refund') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notification_userId_idx`(`userId`),
    INDEX `notification_isRead_idx`(`isRead`),
    INDEX `notification_type_idx`(`type`),
    INDEX `notification_createdAt_idx`(`createdAt`),
    INDEX `notification_referenceId_idx`(`referenceId`),
    INDEX `notification_referenceType_idx`(`referenceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `unique_booking_payment` ON `payment`(`bookingId`, `amount`, `paymentMethod`, `paymentDate`);

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
