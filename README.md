# 易寻 (E-Find) - 校园失物招领平台

<p align="center">
  <img src="e-find.png" alt="易寻 Logo" width="200">
</p>

<div align="center">

[English](#english) | [中文](#chinese)

</div>

<a id="chinese"></a>

## 📌 项目介绍

易寻（E-Find）是一个现代化的校园失物招领平台，旨在帮助校园内的用户快速发布、查找失物和招领信息。该项目使用 Quasar 框架（基于 Vue.js）构建前端界面，Express.js 作为后端服务，MySQL 作为数据库存储。

### 主要功能

- 🔍 失物/招领物品发布与搜索
- 📱 响应式设计，支持多种设备访问
- 👤 用户认证与个人中心
- 💬 留言与回复系统
- 👍 留言点赞功能
- 📢 公告管理
- 👮 管理员后台控制

## 技术栈

### 前端

- **框架**: [Quasar](https://quasar.dev/) (基于 Vue 3)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: Vue Router
- **HTTP 客户端**: Fetch API

### 后端

- **服务器**: [Express.js](https://expressjs.com/)
- **数据库**: [MySQL](https://www.mysql.com/)
- **安全**: Helmet, JWT 认证
- **文件上传**: 支持物品图片和用户头像上传

## 系统架构

系统采用前后端分离的架构：

- 前端使用 Quasar 框架构建 SPA 应用
- 后端提供 RESTful API 接口
- MySQL 数据库存储用户、物品、图片、留言等数据

## 快速开始

### 安装依赖

```bash
# 安装前端依赖
yarn
# 或
npm install

# 安装后端依赖
cd server
npm install
```

### 数据库配置

1. 创建 MySQL 数据库
2. 配置环境变量（参考 server/env.example）
3. 运行 db/schema 目录下的 SQL 脚本创建表结构

### 开发模式运行

```bash
# 运行前端（热重载）
quasar dev

# 运行后端服务
cd server
npm run dev
```

### 代码检查与格式化

```bash
# 代码检查
yarn lint
# 或
npm run lint

# 代码格式化
yarn format
# 或
npm run format
```

### 构建生产版本

```bash
# 构建前端
quasar build

# 启动生产服务器
cd server
npm start
```

## 项目结构

```
e-find/
├── db/                 # 数据库脚本
│   ├── schema/         # 数据库表结构
│   └── seeds/          # 初始数据
├── public/             # 静态资源
├── server/             # 后端服务器代码
│   ├── config/         # 服务器配置
│   ├── middleware/     # 中间件
│   └── routes/         # API 路由
└── src/                # 前端源代码
    ├── assets/         # 资源文件
    ├── components/     # Vue 组件
    ├── layouts/        # 页面布局
    ├── pages/          # 页面组件
    ├── router/         # 路由配置
    └── services/       # API 服务
```

## 定制配置

有关 Quasar 配置的更多信息，请参阅 [Quasar 配置文档](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js)。

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 作者

SongChun <yuwuweichun522@gmail.com>

## 许可证

MIT

---

<a id="english"></a>

# E-Find - Campus Lost and Found Platform

## 📌 Project Description

E-Find is a modern campus lost and found platform designed to help campus users quickly publish and search for lost and found items. The project uses the Quasar framework (based on Vue.js) to build the front-end interface, Express.js as the back-end service, and MySQL as the database storage.

### Main Features

- 🔍 Lost/Found item publishing and searching
- 📱 Responsive design, supporting various devices
- 👤 User authentication and personal center
- 💬 Message and reply system
- 👍 Message like functionality
- 📢 Announcement management
- 👮 Admin backend control

## Tech Stack

### Frontend

- **Framework**: [Quasar](https://quasar.dev/) (based on Vue 3)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Router**: Vue Router
- **HTTP Client**: Fetch API

### Backend

- **Server**: [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/)
- **Security**: Helmet, JWT Authentication
- **File Upload**: Supports item images and user avatars

## System Architecture

The system adopts a front-end and back-end separated architecture:

- Frontend uses Quasar framework to build SPA application
- Backend provides RESTful API interfaces
- MySQL database stores users, items, photos, messages, and other data

## Quick Start

### Install Dependencies

```bash
# Install frontend dependencies
yarn
# or
npm install

# Install backend dependencies
cd server
npm install
```

### Database Configuration

1. Create MySQL database
2. Configure environment variables (refer to server/env.example)
3. Run SQL scripts in the db/schema directory to create table structures

### Run in Development Mode

```bash
# Run frontend (hot reload)
quasar dev

# Run backend service
cd server
npm run dev
```

### Linting and Formatting

```bash
# Code linting
yarn lint
# or
npm run lint

# Code formatting
yarn format
# or
npm run format
```

### Build for Production

```bash
# Build frontend
quasar build

# Start production server
cd server
npm start
```

## Project Structure

```
e-find/
├── db/                 # Database scripts
│   ├── schema/         # Database table structures
│   └── seeds/          # Initial data
├── public/             # Static resources
├── server/             # Backend server code
│   ├── config/         # Server configuration
│   ├── middleware/     # Middleware
│   └── routes/         # API routes
└── src/                # Frontend source code
    ├── assets/         # Asset files
    ├── components/     # Vue components
    ├── layouts/        # Page layouts
    ├── pages/          # Page components
    ├── router/         # Router configuration
    └── services/       # API services
```

## Custom Configuration

For more information about Quasar configuration, see [Quasar Configuration Documentation](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

SongChun <yuwuweichun522@gmail.com>

## License

MIT
