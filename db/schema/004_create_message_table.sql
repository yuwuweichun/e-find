-- 留言表
-- 文件名: 004_create_message_table.sql
-- 描述: 创建留言表，存储用户留言及回复信息

CREATE TABLE IF NOT EXISTS messages (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键，自增ID',
  user_id INT NOT NULL COMMENT '用户ID，关联user表',
  content TEXT NOT NULL COMMENT '留言内容',
  parent_id INT DEFAULT NULL COMMENT '父留言ID（用于回复，顶级留言为NULL）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  CONSTRAINT fk_message_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_parent FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言表';
