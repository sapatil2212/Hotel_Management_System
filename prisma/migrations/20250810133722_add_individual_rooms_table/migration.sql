-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_roomId_fkey`;

-- CreateTable
CREATE TABLE `rooms` (
    `id` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NOT NULL,
    `roomTypeId` VARCHAR(191) NOT NULL,
    `status` ENUM('available', 'occupied', 'maintenance', 'reserved', 'cleaning') NOT NULL DEFAULT 'available',
    `floorNumber` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rooms_roomNumber_key`(`roomNumber`),
    INDEX `Rooms_roomTypeId_fkey`(`roomTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `Rooms_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
