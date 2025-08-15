-- AlterTable
ALTER TABLE `hotelinfo` ADD COLUMN `brandText` TEXT NULL,
    ADD COLUMN `brandTextStyle` VARCHAR(191) NULL DEFAULT 'default',
    ADD COLUMN `logoDisplayType` VARCHAR(191) NULL DEFAULT 'image';
