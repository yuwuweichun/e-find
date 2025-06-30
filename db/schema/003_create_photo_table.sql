-- 照片表
-- 文件名: 003_create_photo_table.sql
-- 描述: 创建物品图片表，存储物品相关的图片信息,依赖于item表

CREATE TABLE `photo` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key, auto-increment ID',
  `item_id` INT NOT NULL COMMENT 'Related item ID',
  `url` VARCHAR(255) NOT NULL COMMENT 'Image URL',
  PRIMARY KEY (`id`),
  KEY `idx_photo_item` (`item_id`),
  CONSTRAINT `fk_photo_item` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Item photo table'; 