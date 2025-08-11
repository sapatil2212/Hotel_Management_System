/*
  Warnings:

  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `room` DROP FOREIGN KEY `Room_categoryId_fkey`;

-- DropTable
DROP TABLE `room`;

-- CreateTable
CREATE TABLE `room_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `shortDescription` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `amenities` JSON NOT NULL,
    `maxGuests` INTEGER NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `bedType` VARCHAR(191) NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `features` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `totalRooms` INTEGER NOT NULL DEFAULT 1,
    `bathroomCount` INTEGER NOT NULL DEFAULT 1,
    `cancellationFree` BOOLEAN NOT NULL DEFAULT true,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `discountPercent` DOUBLE NULL,
    `floorNumber` INTEGER NULL,
    `highlights` TEXT NULL,
    `instantBooking` BOOLEAN NOT NULL DEFAULT true,
    `isPromoted` BOOLEAN NOT NULL DEFAULT false,
    `keywords` JSON NULL,
    `metaDescription` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `originalPrice` INTEGER NULL,
    `roomNumber` VARCHAR(191) NULL,
    `viewType` VARCHAR(191) NULL,

    UNIQUE INDEX `Room_slug_key`(`slug`),
    INDEX `Room_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_types` ADD CONSTRAINT `Room_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
