-- CreateTable
CREATE TABLE `bank_account` (
    `id` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountType` ENUM('main', 'petty_cash', 'online_payments', 'savings', 'current') NOT NULL DEFAULT 'main',
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `bank_account_accountType_idx`(`accountType`),
    INDEX `bank_account_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `type` ENUM('credit', 'debit') NOT NULL,
    `category` ENUM('accommodation_revenue', 'food_beverage_revenue', 'spa_revenue', 'transport_revenue', 'laundry_revenue', 'minibar_revenue', 'other_services_revenue', 'room_maintenance', 'staff_salary', 'utilities', 'marketing', 'supplies', 'equipment', 'taxes_paid', 'bank_charges', 'refunds', 'discounts', 'other_expense', 'transfer_in', 'transfer_out') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `referenceType` ENUM('booking', 'invoice', 'payment', 'expense', 'transfer', 'adjustment', 'refund') NULL,
    `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet') NULL,
    `processedBy` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `transaction_accountId_idx`(`accountId`),
    INDEX `transaction_type_idx`(`type`),
    INDEX `transaction_category_idx`(`category`),
    INDEX `transaction_transactionDate_idx`(`transactionDate`),
    INDEX `transaction_referenceId_idx`(`referenceId`),
    INDEX `transaction_referenceType_idx`(`referenceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `bank_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
