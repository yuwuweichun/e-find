-- 物品表
-- 文件名: 002_create_item_table.sql
-- 描述: 创建失物招领物品表，存储物品信息和发布状态

CREATE TABLE `item` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key, auto-increment ID',
  `publisher_id` INT NOT NULL COMMENT 'Publisher ID, references user table',
  `type` ENUM('lost','found') NOT NULL COMMENT 'Item type: lost indicates lost item, found indicates found item',
  `title` VARCHAR(100) NOT NULL COMMENT 'Item title',
  `description` TEXT COMMENT 'Item detailed description',
  `location` VARCHAR(255) COMMENT 'Lost/found location',
  `lost_date` DATE COMMENT 'Lost/found date, precise to day',
  `contact_info` VARCHAR(100) COMMENT 'Contact information',
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT 'Review status: pending, approved, rejected',
  `rejection_reason` TEXT COMMENT 'Rejection reason, only valid when status is rejected',
  `posted_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Publication date',
  PRIMARY KEY (`id`),
  KEY `idx_item_publisher` (`publisher_id`),
  CONSTRAINT `fk_item_user` FOREIGN KEY (`publisher_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lost and found item table'; 