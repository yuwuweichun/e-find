-- 物品表
-- 文件名: 002_create_item_table.sql
-- 描述: 创建失物招领物品表，存储物品信息和发布状态

CREATE TABLE `item` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键，自增ID',
  `publisher_id` INT NOT NULL COMMENT '发布者ID，关联用户表',
  `type` ENUM('lost','found') NOT NULL COMMENT '物品类型：lost表示丢失，found表示招领',
  `title` VARCHAR(100) NOT NULL COMMENT '物品标题',
  `description` TEXT COMMENT '物品详细描述',
  `location` VARCHAR(255) COMMENT '拾失地点',
  `lost_date` DATE COMMENT '拾失时间，精确到天',
  `contact_info` VARCHAR(100) COMMENT '联系方式',
  `status` ENUM('审核中','已通过','未通过') NOT NULL DEFAULT '审核中' COMMENT '审核状态',
  `rejection_reason` TEXT COMMENT '未通过原因，仅状态为未通过时有效',
  `posted_date` DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT '发布时间',
  PRIMARY KEY (`id`),
  KEY `idx_item_publisher` (`publisher_id`),
  CONSTRAINT `fk_item_user` FOREIGN KEY (`publisher_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='失物招领物品表'; 