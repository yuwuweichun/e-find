-- 留言点赞表
-- 文件名: 005_create_message_like_table.sql
-- 描述: 创建留言点赞表，存储用户对留言的点赞行为

CREATE TABLE IF NOT EXISTS message_likes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键，自增ID',
  message_id INT NOT NULL COMMENT '留言ID，关联messages表',
  user_id INT NOT NULL COMMENT '用户ID，关联user表',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  CONSTRAINT fk_like_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_message_user (message_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言点赞表';
