-- AlterTable
ALTER TABLE `hotelinfo` ADD COLUMN `gstNumber` VARCHAR(191) NULL,
    ADD COLUMN `gstPercentage` FLOAT NULL DEFAULT 18.0,
    ADD COLUMN `serviceTaxPercentage` FLOAT NULL DEFAULT 0.0,
    ADD COLUMN `otherTaxes` JSON NULL,
    ADD COLUMN `taxEnabled` BOOLEAN NOT NULL DEFAULT true;
