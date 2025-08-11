-- CreateTable
CREATE TABLE `booking` (
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
    `promoCodeId` VARCHAR(191) NULL,
    `originalAmount` DOUBLE NULL,
    `discountAmount` DOUBLE NULL,
    `baseAmount` DOUBLE NULL,
    `gstAmount` DOUBLE NULL DEFAULT 0.0,
    `serviceTaxAmount` DOUBLE NULL DEFAULT 0.0,
    `otherTaxAmount` DOUBLE NULL DEFAULT 0.0,
    `totalTaxAmount` DOUBLE NULL DEFAULT 0.0,
    `paymentMethod` VARCHAR(191) NULL DEFAULT 'pay_at_hotel',
    `paymentStatus` VARCHAR(191) NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Booking_roomId_fkey`(`roomId`),
    INDEX `Booking_promoCodeId_fkey`(`promoCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(191) NOT NULL,
    `guestEmail` VARCHAR(191) NOT NULL,
    `guestPhone` VARCHAR(191) NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NOT NULL,
    `nights` INTEGER NOT NULL,
    `adults` INTEGER NOT NULL,
    `children` INTEGER NOT NULL,
    `roomTypeName` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NOT NULL,
    `baseAmount` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NOT NULL,
    `gstAmount` DOUBLE NOT NULL,
    `serviceTaxAmount` DOUBLE NOT NULL,
    `otherTaxAmount` DOUBLE NOT NULL,
    `totalTaxAmount` DOUBLE NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `dueDate` DATETIME(3) NOT NULL,
    `issuedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `terms` VARCHAR(191) NULL DEFAULT 'Payment due upon receipt',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `invoice_bookingId_idx`(`bookingId`),
    INDEX `invoice_invoiceNumber_idx`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentReference` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receivedBy` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payment_bookingId_idx`(`bookingId`),
    INDEX `payment_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aboutMore` TEXT NULL,
    `aboutShort` VARCHAR(191) NULL,
    `aboutTitle` VARCHAR(191) NULL,
    `contactAddress` TEXT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `faqs` JSON NULL,
    `mapDirectionsUrl` VARCHAR(191) NULL,
    `mapEmbedUrl` TEXT NULL,
    `partners` JSON NULL,
    `propertyFeatures` JSON NULL,
    `reviews` JSON NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emailotp` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL DEFAULT 'register',
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailOTP_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotelinfo` (
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
    `gstNumber` VARCHAR(191) NULL,
    `gstPercentage` DOUBLE NULL DEFAULT 18.0,
    `serviceTaxPercentage` DOUBLE NULL DEFAULT 0.0,
    `otherTaxes` JSON NULL,
    `taxEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guestPolicies` TEXT NULL,
    `faqs` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'RECEPTION') NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `Booking_promoCodeId_fkey` FOREIGN KEY (`promoCodeId`) REFERENCES `promocode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_types` ADD CONSTRAINT `Room_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `Rooms_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
