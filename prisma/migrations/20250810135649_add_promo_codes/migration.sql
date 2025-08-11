-- AlterTable
ALTER TABLE `booking` ADD COLUMN `discountAmount` DOUBLE NULL,
    ADD COLUMN `originalAmount` DOUBLE NULL,
    ADD COLUMN `promoCodeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `promocode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountType` ENUM('percentage', 'fixed') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minOrderAmount` DOUBLE NULL,
    `maxDiscountAmount` DOUBLE NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `applicableRooms` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promocode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Booking_promoCodeId_fkey` ON `booking`(`promoCodeId`);

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `Booking_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
