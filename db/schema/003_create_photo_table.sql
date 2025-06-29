-- 照片表
-- 文件名: 003_create_photo_table.sql
-- 描述: 创建物品图片表，存储物品相关的图片信息

CREATE TABLE `photo` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键，自增ID',
  `item_id` INT NOT NULL COMMENT '关联的物品ID',
  `url` VARCHAR(255) NOT NULL COMMENT '图片地址',
  PRIMARY KEY (`id`),
  KEY `idx_photo_item` (`item_id`),
  CONSTRAINT `fk_photo_item` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品图片表'; 