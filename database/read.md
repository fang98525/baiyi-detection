<!--
 * @Author: zqfang5 zqfang5@iflytek.com
 * @Date: 2025-12-02 10:14:15
 * @Description: 
 * @FilePath: \detcetion_v2\database\read.md
 * @LastEditTime: 2025-12-03 11:21:29
 * @LastEditors: zqfang5 zqfang5@iflytek.com
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
navicat 安装
https://www.cnblogs.com/wanghaiyuanblogs/p/18502406

mysql安装 ：
账号 root 
密码 root


初始化：
# 进入到包含 sql 文件的目录
cd "d:\project\上半年目标-baiyi智能化\detcetion_v2\database"

# 执行 sql 文件
# 格式: mysql -u 用户名 -p密码 < 文件名
# 注意: -p和密码之间没有空格
# 格式：mysql -u 用户名 -p < SQL文件路径
mysql -u root -p < database/init.sql


# 登录
mysql -u root -p
# 输入密码并回车

随后可在命令行查看
USE baiyi_db;

SHOW TABLES;
DESCRIBE projects;

-- 查看 projects 表的所有数据
SELECT * FROM projects;

-- 如果列太多导致换行看不清，可以在结尾用 \G 代替 ; （竖向显示）
SELECT * FROM projects \G;

-- 查看 users 表的所有数据
SELECT * FROM users;

EXIT;