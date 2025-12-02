<!--
 * @Author: zqfang5 zqfang5@iflytek.com
 * @Date: 2025-12-02 10:42:10
 * @Description: 
 * @FilePath: \detcetion_v2\backend\read.md
 * @LastEditTime: 2025-12-02 10:47:16
 * @LastEditors: zqfang5 zqfang5@iflytek.com
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
# 白蚁监测平台后端服务 (Backend Service)

## 1. 项目简介
本项目是白蚁监测智能化平台的后端服务，基于 Python Flask 框架开发，采用 RESTful API 架构，提供项目管理、用户查询等核心功能。

## 2. 技术栈
- **语言**: Python 3.x
- **Web 框架**: Flask
- **ORM 框架**: Flask-SQLAlchemy
- **数据库驱动**: PyMySQL
- **数据库**: MySQL

## 3. 目录结构
```markdown:backend/read.md
backend/
├── app/
│   ├── __init__.py       # Flask 应用工厂，初始化数据库和注册蓝图
│   ├── models.py         # 数据库模型定义 (User, Project)
│   └── routes/
│       └── project.py    # 核心业务接口 (项目增删改查)
├── config.py             # 配置文件 (数据库连接字符串等)
├── run.py                # 应用启动入口
├── requirements.txt      # 依赖包列表
└── read.md               # 说明文档
```

## 4. 核心模块介绍

### 4.1 应用入口 (`run.py`)
- 创建 Flask 应用实例
- 监听 5000 端口，开启 Debug 模式，支持全网段访问 (`0.0.0.0`)

### 4.2 数据库配置 (`config.py`)
- 默认使用本地 MySQL 数据库: `baiyi_db`
- 连接地址: `mysql+pymysql://root:root@localhost/baiyi_db`
- **注意**: 如果你的数据库密码不是 `root`，请修改此文件中的连接字符串。

### 4.3 数据模型 (`app/models.py`)
- **User 表**: 存储用户信息（管理员、负责人等），字段包括 `username`, `role`, `phone` 等。
- **Project 表**: 核心业务表，存储水库/堤防项目详情。
    - 包含基础信息（名称、地址、经纬度）
    - 包含工程信息（坝型、坝长、坝高）
    - 包含防治信息（危害等级、监测手段、治理措施）
    - 关联 `admin_id` 和 `manager_id` 到 `User` 表。

### 4.4 API 接口 (`app/routes/project.py`)
所有接口前缀为 `/api/projects`。

| 方法 | 路径 | 描述 | 参数 |
| --- | --- | --- | --- |
| GET | `/` | 获取项目列表 | `type` (可选, 默认 'reservoir') |
| GET | `/<id>` | 获取项目详情 | `id` (项目ID) |
| POST | `/` | 创建新项目 | JSON Body (包含 name, region, type 等完整字段) |
| GET | `/users` | 获取用户列表 | `role` (可选, 筛选角色) |
| GET | `/index` | 服务健康检查 | 无 |

## 5. 启动与运行

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **初始化数据库**
   请确保 MySQL 服务已启动，并执行了 `database/init.sql` 脚本。

3. **启动服务**
   ```bash
   python run.py
   ```
   服务启动后访问: `http://127.0.0.1:5000`

## 6. 常见问题
- **数据库连接失败**: 检查 `config.py` 中的用户名密码是否正确，确保 MySQL 服务运行中。
- **中文乱码**: 确保数据库字符集为 `utf8mb4` (参考 `database/init.sql` 中的设置)。
```



#### API 测试 （可用Apifox）
1. 直接使用浏览器地址栏 (仅限 GET 请求)
你的后端服务启动在 http://127.0.0.1:5000，你可以直接点击或复制以下链接在浏览器打开：
服务健康检查:
http://127.0.0.1:5000
(应该显示 "白蚁监测平台后端服务运行中...")
获取所有项目 (默认水库):
http://127.0.0.1:5000/api/projects
(应该返回一个 JSON 数组，包含数据库中的项目信息)
获取特定类型的项目 (例如堤防):
http://127.0.0.1:5000/api/projects?type=embankment
获取用户列表:
http://127.0.0.1:5000/api/projects/users
获取特定角色的用户:
http://127.0.0.1:5000/api/projects/users?role=admin