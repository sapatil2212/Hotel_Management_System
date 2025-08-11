-- AlterTable
ALTER TABLE `category` MODIFY `aboutMore` TEXT NULL,
    MODIFY `contactAddress` TEXT NULL,
    MODIFY `mapEmbedUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `room` ADD COLUMN `bathroomCount` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `cancellationFree` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    ADD COLUMN `discountPercent` DOUBLE NULL,
    ADD COLUMN `floorNumber` INTEGER NULL,
    ADD COLUMN `highlights` TEXT NULL,
    ADD COLUMN `instantBooking` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isPromoted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `keywords` JSON NULL,
    ADD COLUMN `metaDescription` VARCHAR(191) NULL,
    ADD COLUMN `metaTitle` VARCHAR(191) NULL,
    ADD COLUMN `originalPrice` INTEGER NULL,
    ADD COLUMN `roomNumber` VARCHAR(191) NULL,
    ADD COLUMN `viewType` VARCHAR(191) NULL,
    MODIFY `description` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `HotelInfo` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `starRating` INTEGER NOT NULL DEFAULT 5,
    `overallRating` DOUBLE NOT NULL DEFAULT 4.5,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `primaryPhone` VARCHAR(191) NULL,
    `whatsappPhone` VARCHAR(191) NULL,
    `primaryEmail` VARCHAR(191) NULL,
    `reservationEmail` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `googleMapsEmbedCode` TEXT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `directionsUrl` VARCHAR(191) NULL,
    `nearbyAttractions` JSON NULL,
    `distanceFromKeyPlaces` JSON NULL,
    `checkInTime` VARCHAR(191) NULL DEFAULT '3:00 PM',
    `checkOutTime` VARCHAR(191) NULL DEFAULT '11:00 AM',
    `cancellationPolicy` TEXT NULL,
    `petPolicy` TEXT NULL,
    `smokingPolicy` TEXT NULL,
    `bookingPartners` JSON NULL,
    `partnerLogos` JSON NULL,
    `propertyAmenities` JSON NULL,
    `businessFacilities` JSON NULL,
    `safetyFeatures` JSON NULL,
    `services` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(191) NOT NULL,
    `guestEmail` VARCHAR(191) NOT NULL,
    `guestPhone` VARCHAR(191) NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NOT NULL,
    `nights` INTEGER NOT NULL,
    `adults` INTEGER NOT NULL DEFAULT 1,
    `children` INTEGER NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `source` VARCHAR(191) NOT NULL DEFAULT 'Website',
    `specialRequests` TEXT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
