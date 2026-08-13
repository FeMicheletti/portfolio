-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSession` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminSession_tokenHash_key`(`tokenHash`),
    INDEX `AdminSession_userId_idx`(`userId`),
    INDEX `AdminSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `repositoryUrl` VARCHAR(1000) NULL,
    `demoUrl` VARCHAR(1000) NULL,
    `startedAt` DATE NULL,
    `finishedAt` DATE NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    INDEX `Project_status_sortOrder_idx`(`status`, `sortOrder`),
    INDEX `Project_featured_status_idx`(`featured`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `locale` ENUM('PT_BR', 'EN_US') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `problem` TEXT NULL,
    `solution` TEXT NULL,
    `responsibilities` TEXT NULL,
    `technicalChoices` TEXT NULL,
    `results` TEXT NULL,

    INDEX `ProjectTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `ProjectTranslation_projectId_locale_key`(`projectId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechnologyCategory` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `namePt` VARCHAR(100) NOT NULL,
    `nameEn` VARCHAR(100) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TechnologyCategory_slug_key`(`slug`),
    INDEX `TechnologyCategory_visible_sortOrder_idx`(`visible`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Technology` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `iconKey` VARCHAR(100) NULL,
    `color` VARCHAR(20) NULL,
    `descriptionPt` VARCHAR(500) NULL,
    `descriptionEn` VARCHAR(500) NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Technology_slug_key`(`slug`),
    INDEX `Technology_categoryId_visible_sortOrder_idx`(`categoryId`, `visible`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `companyUrl` VARCHAR(1000) NULL,
    `startedAt` DATE NOT NULL,
    `finishedAt` DATE NULL,
    `current` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Experience_visible_sortOrder_startedAt_idx`(`visible`, `sortOrder`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExperienceTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `experienceId` VARCHAR(191) NOT NULL,
    `locale` ENUM('PT_BR', 'EN_US') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,

    INDEX `ExperienceTranslation_locale_idx`(`locale`),
    UNIQUE INDEX `ExperienceTranslation_experienceId_locale_key`(`experienceId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTechnology` (
    `projectId` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProjectTechnology_technologyId_idx`(`technologyId`),
    PRIMARY KEY (`projectId`, `technologyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `driveItemId` VARCHAR(191) NOT NULL,
    `drivePath` VARCHAR(1000) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `kind` ENUM('IMAGE', 'PDF') NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `checksum` VARCHAR(128) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaAsset_driveItemId_key`(`driveItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectMedia` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `role` ENUM('COVER', 'GALLERY') NOT NULL DEFAULT 'GALLERY',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `altPt` VARCHAR(255) NULL,
    `altEn` VARCHAR(255) NULL,

    INDEX `ProjectMedia_projectId_role_sortOrder_idx`(`projectId`, `role`, `sortOrder`),
    INDEX `ProjectMedia_mediaId_idx`(`mediaId`),
    UNIQUE INDEX `ProjectMedia_projectId_mediaId_key`(`projectId`, `mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resume` (
    `id` VARCHAR(191) NOT NULL,
    `locale` ENUM('PT_BR', 'EN_US') NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Resume_locale_key`(`locale`),
    INDEX `Resume_mediaId_idx`(`mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(32) NOT NULL DEFAULT 'main',
    `contactEmail` VARCHAR(191) NOT NULL,
    `githubUrl` VARCHAR(1000) NOT NULL,
    `linkedinUrl` VARCHAR(1000) NOT NULL,
    `whatsappUrl` VARCHAR(1000) NULL,
    `location` VARCHAR(120) NOT NULL DEFAULT 'Rio de Janeiro, Brazil',
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
    `availableForWork` BOOLEAN NOT NULL DEFAULT true,
    `availabilityPt` VARCHAR(255) NULL,
    `availabilityEn` VARCHAR(255) NULL,
    `heroTitlePt` VARCHAR(255) NULL,
    `heroTitleEn` VARCHAR(255) NULL,
    `heroSubtitlePt` VARCHAR(500) NULL,
    `heroSubtitleEn` VARCHAR(500) NULL,
    `heroMediaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SiteSettings_heroMediaId_idx`(`heroMediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` ENUM('PAGE_VIEW', 'RESUME_DOWNLOAD', 'PROJECT_VIEW', 'PROJECT_DEMO_CLICK', 'PROJECT_GITHUB_CLICK', 'GITHUB_CLICK', 'LINKEDIN_CLICK', 'EMAIL_CLICK', 'LANGUAGE_CHANGE', 'WHATSAPP_CLICK') NOT NULL,
    `visitorId` VARCHAR(64) NOT NULL,
    `sessionId` VARCHAR(64) NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `locale` ENUM('PT_BR', 'EN_US') NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `targetUrl` VARCHAR(1000) NULL,
    `referrerHost` VARCHAR(255) NULL,
    `utmSource` VARCHAR(191) NULL,
    `utmMedium` VARCHAR(191) NULL,
    `utmCampaign` VARCHAR(191) NULL,
    `countryCode` CHAR(2) NULL,
    `city` VARCHAR(120) NULL,
    `deviceType` ENUM('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnalyticsEvent_eventType_createdAt_idx`(`eventType`, `createdAt`),
    INDEX `AnalyticsEvent_visitorId_createdAt_idx`(`visitorId`, `createdAt`),
    INDEX `AnalyticsEvent_sessionId_createdAt_idx`(`sessionId`, `createdAt`),
    INDEX `AnalyticsEvent_projectId_createdAt_idx`(`projectId`, `createdAt`),
    INDEX `AnalyticsEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminSession` ADD CONSTRAINT `AdminSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTranslation` ADD CONSTRAINT `ProjectTranslation_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Technology` ADD CONSTRAINT `Technology_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `TechnologyCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExperienceTranslation` ADD CONSTRAINT `ExperienceTranslation_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTechnology` ADD CONSTRAINT `ProjectTechnology_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTechnology` ADD CONSTRAINT `ProjectTechnology_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `Technology`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMedia` ADD CONSTRAINT `ProjectMedia_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMedia` ADD CONSTRAINT `ProjectMedia_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resume` ADD CONSTRAINT `Resume_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteSettings` ADD CONSTRAINT `SiteSettings_heroMediaId_fkey` FOREIGN KEY (`heroMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
