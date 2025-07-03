-- 公告表
-- 文件名: 006_create_announcement_table.sql
-- 描述: 创建公告信息表，存储系统公告内容、优先级、作者和发布时间

CREATE TABLE IF NOT EXISTS announcements (
  id INT NOT NULL AUTO_INCREMENT COMMENT '主键，自增ID',
  title VARCHAR(255) NOT NULL COMMENT '公告标题',
  content TEXT NOT NULL COMMENT '公告内容',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT '公告优先级（如 high/medium/normal）',
  author VARCHAR(50) NOT NULL COMMENT '发布人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告信息表'; 