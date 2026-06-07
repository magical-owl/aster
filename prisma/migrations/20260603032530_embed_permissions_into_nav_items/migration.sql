/*
  Warnings:

  - You are about to drop the `feature_access_template_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feature_access_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_access` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `feature_access_template_items` DROP FOREIGN KEY `feature_access_template_items_feature_id_fkey`;

-- DropForeignKey
ALTER TABLE `feature_access_template_items` DROP FOREIGN KEY `feature_access_template_items_template_id_fkey`;

-- DropForeignKey
ALTER TABLE `feature_access_templates` DROP FOREIGN KEY `feature_access_templates_archived_by_fkey`;

-- DropForeignKey
ALTER TABLE `role_access` DROP FOREIGN KEY `role_access_template_id_fkey`;

-- AlterTable
ALTER TABLE `feature_navigation_items` ADD COLUMN `permissions` JSON NULL;

-- Set default permissions for existing rows
UPDATE `feature_navigation_items`
SET `permissions` = JSON_OBJECT(
  'view', true,
  'create', false,
  'edit', false,
  'delete', false,
  'approve', false
)
WHERE `permissions` IS NULL;

-- DropTable
DROP TABLE `feature_access_template_items`;

-- DropTable
DROP TABLE `feature_access_templates`;

-- DropTable
DROP TABLE `role_access`;
