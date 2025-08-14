/*
  Warnings:

  - You are about to alter the column `source` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `paymentMethod` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - Made the column `paymentStatus` on table `booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `source` ENUM('website', 'phone', 'walk_in', 'ota', 'corporate', 'agent', 'referral') NOT NULL DEFAULT 'website',
    MODIFY `paymentStatus` ENUM('pending', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `downloadCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `emailSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `qrCode` TEXT NULL,
    ADD COLUMN `whatsappSent` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `status` ENUM('pending', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `gatewayResponse` TEXT NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NULL,
    MODIFY `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet') NOT NULL;

-- CreateTable
CREATE TABLE `service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('accommodation', 'food_beverage', 'spa', 'transport', 'laundry', 'minibar', 'conference', 'other') NOT NULL,
    `price` DOUBLE NOT NULL,
    `taxable` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_category_idx`(`category`),
    INDEX `service_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill_item` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `finalAmount` DOUBLE NOT NULL,
    `addedBy` VARCHAR(191) NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bill_item_bookingId_idx`(`bookingId`),
    INDEX `bill_item_serviceId_idx`(`serviceId`),
    INDEX `bill_item_addedAt_idx`(`addedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_item` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `taxRate` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `finalAmount` DOUBLE NOT NULL,

    INDEX `invoice_item_invoiceId_idx`(`invoiceId`),
    INDEX `invoice_item_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `split_payment` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet') NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `split_payment_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue_report` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `period_type` VARCHAR(191) NOT NULL,
    `accommodation_revenue` DOUBLE NOT NULL DEFAULT 0,
    `food_beverage_revenue` DOUBLE NOT NULL DEFAULT 0,
    `spa_revenue` DOUBLE NOT NULL DEFAULT 0,
    `transport_revenue` DOUBLE NOT NULL DEFAULT 0,
    `laundry_revenue` DOUBLE NOT NULL DEFAULT 0,
    `minibar_revenue` DOUBLE NOT NULL DEFAULT 0,
    `other_revenue` DOUBLE NOT NULL DEFAULT 0,
    `total_revenue` DOUBLE NOT NULL DEFAULT 0,
    `cash_payments` DOUBLE NOT NULL DEFAULT 0,
    `card_payments` DOUBLE NOT NULL DEFAULT 0,
    `upi_payments` DOUBLE NOT NULL DEFAULT 0,
    `online_payments` DOUBLE NOT NULL DEFAULT 0,
    `bank_transfer_payments` DOUBLE NOT NULL DEFAULT 0,
    `website_bookings` INTEGER NOT NULL DEFAULT 0,
    `ota_bookings` INTEGER NOT NULL DEFAULT 0,
    `phone_bookings` INTEGER NOT NULL DEFAULT 0,
    `walk_in_bookings` INTEGER NOT NULL DEFAULT 0,
    `corporate_bookings` INTEGER NOT NULL DEFAULT 0,
    `total_bookings` INTEGER NOT NULL DEFAULT 0,
    `tax_collected` DOUBLE NOT NULL DEFAULT 0,
    `outstanding_amount` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `revenue_report_date_idx`(`date`),
    INDEX `revenue_report_period_type_idx`(`period_type`),
    UNIQUE INDEX `revenue_report_date_period_type_key`(`date`, `period_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_billing_view` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `lastViewed` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `guest_billing_view_bookingId_key`(`bookingId`),
    UNIQUE INDEX `guest_billing_view_accessToken_key`(`accessToken`),
    INDEX `guest_billing_view_accessToken_idx`(`accessToken`),
    INDEX `guest_billing_view_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `booking_paymentStatus_idx` ON `booking`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `booking_source_idx` ON `booking`(`source`);

-- CreateIndex
CREATE INDEX `booking_checkIn_idx` ON `booking`(`checkIn`);

-- CreateIndex
CREATE INDEX `booking_checkOut_idx` ON `booking`(`checkOut`);

-- CreateIndex
CREATE INDEX `invoice_status_idx` ON `invoice`(`status`);

-- CreateIndex
CREATE INDEX `invoice_issuedDate_idx` ON `invoice`(`issuedDate`);

-- CreateIndex
CREATE INDEX `payment_paymentMethod_idx` ON `payment`(`paymentMethod`);

-- CreateIndex
CREATE INDEX `payment_paymentDate_idx` ON `payment`(`paymentDate`);

-- AddForeignKey
ALTER TABLE `bill_item` ADD CONSTRAINT `bill_item_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_item` ADD CONSTRAINT `bill_item_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_item` ADD CONSTRAINT `invoice_item_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_item` ADD CONSTRAINT `invoice_item_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `split_payment` ADD CONSTRAINT `split_payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_billing_view` ADD CONSTRAINT `guest_billing_view_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
