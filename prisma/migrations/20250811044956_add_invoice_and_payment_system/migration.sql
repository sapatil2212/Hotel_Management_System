-- AlterTable
ALTER TABLE `booking` ADD COLUMN `baseAmount` DOUBLE NULL,
    ADD COLUMN `gstAmount` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `otherTaxAmount` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL DEFAULT 'pay_at_hotel',
    ADD COLUMN `paymentStatus` VARCHAR(191) NULL DEFAULT 'pending',
    ADD COLUMN `serviceTaxAmount` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `totalTaxAmount` DOUBLE NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `hotelinfo` ADD COLUMN `gstNumber` VARCHAR(191) NULL,
    ADD COLUMN `gstPercentage` DOUBLE NULL DEFAULT 18.0,
    ADD COLUMN `otherTaxes` JSON NULL,
    ADD COLUMN `serviceTaxPercentage` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `taxEnabled` BOOLEAN NOT NULL DEFAULT true;

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

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
