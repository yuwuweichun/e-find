-- 用户表
-- 文件名: 001_create_user_table.sql
-- 描述: 创建用户信息表，存储用户基本信息和认证信息

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key, auto-increment ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username for login, unique',
  `password` VARCHAR(255) NOT NULL COMMENT 'User password, encrypted storage',
  `role` VARCHAR(20) NOT NULL COMMENT 'User type: regular user, regular admin, super admin',
  `phone` VARCHAR(20) COMMENT 'User phone number',
  `student_no` VARCHAR(20) COMMENT 'Student ID or employee ID',
  `full_name` VARCHAR(50) COMMENT 'User real name',
  `avatar_url` VARCHAR(255) COMMENT 'Avatar image URL',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User information table'; 