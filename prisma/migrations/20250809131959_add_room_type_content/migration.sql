-- AlterTable
ALTER TABLE `category` ADD COLUMN `aboutMore` VARCHAR(191) NULL,
    ADD COLUMN `aboutShort` VARCHAR(191) NULL,
    ADD COLUMN `aboutTitle` VARCHAR(191) NULL,
    ADD COLUMN `contactAddress` VARCHAR(191) NULL,
    ADD COLUMN `contactEmail` VARCHAR(191) NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `faqs` JSON NULL,
    ADD COLUMN `mapDirectionsUrl` VARCHAR(191) NULL,
    ADD COLUMN `mapEmbedUrl` VARCHAR(191) NULL,
    ADD COLUMN `partners` JSON NULL,
    ADD COLUMN `propertyFeatures` JSON NULL,
    ADD COLUMN `reviews` JSON NULL;
