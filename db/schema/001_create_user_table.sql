-- 用户表
-- 文件名: 001_create_user_table.sql
-- 描述: 创建用户信息表，存储用户基本信息和认证信息

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键，自增ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名，用于登录，唯一',
  `password` VARCHAR(255) NOT NULL COMMENT '用户密码，加密存储',
  `role` VARCHAR(20) NOT NULL COMMENT '用户类型：普通用户、普通管理员、超级管理员',
  `phone` VARCHAR(20) COMMENT '用户手机号',
  `student_no` VARCHAR(20) COMMENT '学号或工号',
  `full_name` VARCHAR(50) COMMENT '用户真实姓名',
  `avatar_url` VARCHAR(255) COMMENT '头像图片地址',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表'; 