-- AlterTable
ALTER TABLE `bank_account` ADD COLUMN `isMainAccount` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `actualCheckoutTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `isModification` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `modificationReason` TEXT NULL,
    ADD COLUMN `originalAmount` DOUBLE NULL;

-- CreateTable
CREATE TABLE `expense_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,

    UNIQUE INDEX `expense_type_name_key`(`name`),
    INDEX `expense_type_isActive_idx`(`isActive`),
    INDEX `expense_type_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `id` VARCHAR(191) NOT NULL,
    `expenseTypeId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'online_gateway', 'cheque', 'wallet') NULL,
    `userId` VARCHAR(191) NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referenceNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `expense_expenseTypeId_idx`(`expenseTypeId`),
    INDEX `expense_userId_idx`(`userId`),
    INDEX `expense_expenseDate_idx`(`expenseDate`),
    INDEX `expense_isApproved_idx`(`isApproved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `bank_account_userId_idx` ON `bank_account`(`userId`);

-- CreateIndex
CREATE INDEX `bank_account_isMainAccount_idx` ON `bank_account`(`isMainAccount`);

-- CreateIndex
CREATE INDEX `transaction_isModification_idx` ON `transaction`(`isModification`);

-- AddForeignKey
ALTER TABLE `bank_account` ADD CONSTRAINT `bank_account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_expenseTypeId_fkey` FOREIGN KEY (`expenseTypeId`) REFERENCES `expense_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
