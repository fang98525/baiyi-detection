SET NAMES utf8mb4;
DROP DATABASE IF EXISTS baiyi_db;
CREATE DATABASE baiyi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE baiyi_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'operator') NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT FALSE,
    remark_name VARCHAR(50), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_type ENUM('reservoir', 'embankment') DEFAULT 'reservoir',
    category ENUM('single', 'multiple') DEFAULT 'single',
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- e.g. '小（二）型'
    region_province VARCHAR(50),
    region_city VARCHAR(50),
    region_district VARCHAR(50),
    address VARCHAR(255),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    admin_id INT,
    manager_id INT,
    
    dam_type VARCHAR(50),
    crest_length FLOAT,
    toe_length FLOAT,
    slope_length FLOAT,
    max_height FLOAT,
    
    hazard_level VARCHAR(20),
    check_method VARCHAR(50),
    governance_method VARCHAR(50),
    monitor_devices JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Project <-> Operator Association (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_operators (
    project_id INT,
    user_id INT,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    sn VARCHAR(50) NOT NULL UNIQUE COMMENT '设备序列号',
    name VARCHAR(100) COMMENT '设备名称',
    type ENUM('monitor', 'camera', 'sensor') DEFAULT 'monitor',
    status ENUM('normal', 'alert', 'offline', 'maintenance') DEFAULT 'normal',
    battery_level INT COMMENT '电量百分比',
    signal_strength INT COMMENT '信号强度',
    last_active TIMESTAMP COMMENT '最后通信时间',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    install_image VARCHAR(255) COMMENT '安装现场图',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Alerts Table (For handling alarms)
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    project_id INT NOT NULL, -- Redundant but useful for quick queries
    level ENUM('I', 'II', 'III') DEFAULT 'III',
    message TEXT,
    status ENUM('pending', 'processing', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    handler_id INT COMMENT '处理人ID',
    handle_note TEXT COMMENT '处理备注',
    handle_image VARCHAR(255) COMMENT '处理现场图',
    resolved_at TIMESTAMP COMMENT '处理完成时间',
    
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (handler_id) REFERENCES users(id)
);

-- Insert seed users
-- 注意：默认插入的种子用户需要设为 is_active = TRUE 才能登录
INSERT INTO users (username, password_hash, role, phone, is_active, remark_name) VALUES 
('zqfang5', 'hash_placeholder', 'admin', '18271587343', TRUE, '方泽钦'),
('张三', 'hash_placeholder', 'manager', '13900000001', TRUE, '罗田负责人'),
('李四', 'hash_placeholder', 'manager', '13900000002', TRUE, '武汉负责人'),
('王五', 'hash_placeholder', 'operator', '13900000003', TRUE, '罗田巡查员'),
('赵六', 'hash_placeholder', 'operator', '13900000004', TRUE, '武汉巡查员'),
('钱七', 'hash_placeholder', 'operator', '13900000005', TRUE, '通用巡查员'),
('孙八', 'hash_placeholder', 'operator', '13900000006', TRUE, '待分配人员'), -- 无项目，测试空状态
('周九', 'hash_placeholder', 'operator', '13900000007', TRUE, '白庙河协作员'), -- 共管项目，测试多人协作
('郑十', 'hash_placeholder', 'operator', '13900000008', FALSE, '未激活人员') -- 未激活，测试登录限制
ON DUPLICATE KEY UPDATE username=username;

-- Insert seed projects (3 Reservoirs in Luotian, 3 Embankments in Wuhan/Yangtze)
INSERT INTO projects (
    project_type, category, name, type, 
    region_province, region_city, region_district, 
    address, latitude, longitude, 
    admin_id, manager_id, 
    dam_type, crest_length, toe_length, slope_length, max_height, 
    hazard_level, check_method, governance_method, monitor_devices
) VALUES 
-- 1. 水库：白庙河水库 (罗田县)
(
    'reservoir', 'single', '白庙河水库', '小（一）型', 
    '湖北省', '黄冈市', '罗田县', '白庙河镇', 
    30.9542, 115.3865, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='张三' LIMIT 1), 
    '土石坝', 180.0, 150.0, 60.5, 35.0, 
    'II级', '人工巡查', '药物灌浆', '["监测桩"]'
),
-- 2. 水库：天堂寨水库 (罗田县)
(
    'reservoir', 'single', '天堂寨水库', '中型', 
    '湖北省', '黄冈市', '罗田县', '天堂寨风景区', 
    31.1142, 115.7265, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='张三' LIMIT 1), 
    '混凝土拱坝', 220.0, 180.0, 90.0, 58.0, 
    'I级', '智能监测', '综合治理', '["摄像头", "白蚁监测仪"]'
),
-- 3. 水库：义水河水库 (罗田县)
(
    'reservoir', 'single', '义水河水库', '小（二）型', 
    '湖北省', '黄冈市', '罗田县', '凤山镇', 
    30.7821, 115.4012, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='张三' LIMIT 1), 
    '土坝', 120.0, 100.0, 40.0, 25.0, 
    'III级', '人工巡查', '诱杀法', '["监测桩"]'
),
-- 4. 堤防：武金堤 (武汉段)
(
    'embankment', 'single', '武金堤', '一级堤防', 
    '湖北省', '武汉市', '洪山区', '武金堤路', 
    30.5021, 114.2862, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='李四' LIMIT 1), 
    '土堤', 5000.0, 4500.0, 80.0, 12.0, 
    'I级', '智能监测', '物理屏障', '["智能监测仪", "摄像头"]'
),
-- 5. 堤防：汉口江滩堤防 (武汉段)
(
    'embankment', 'single', '汉口江滩防洪堤', '一级堤防', 
    '湖北省', '武汉市', '江岸区', '沿江大道', 
    30.5921, 114.2955, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='李四' LIMIT 1), 
    '混凝土防洪墙', 3500.0, 3500.0, 0.0, 10.5, 
    'II级', '人工巡查', '综合治理', '["监测桩"]'
),
-- 6. 堤防：青山江滩堤防 (武汉段)
(
    'embankment', 'single', '青山江滩堤防', '二级堤防', 
    '湖北省', '武汉市', '青山区', '临江大道', 
    30.6511, 114.3822, 
    (SELECT id FROM users WHERE username='zqfang5' LIMIT 1), 
    (SELECT id FROM users WHERE username='李四' LIMIT 1), 
    '生态土堤', 4200.0, 4000.0, 65.0, 11.0, 
    'III级', '混合监测', '生物防治', '["白蚁监测仪"]'
);

-- Seed Project Operators
-- 王五 -> 白庙河水库, 天堂寨水库 (罗田片区)
INSERT INTO project_operators (project_id, user_id)
SELECT p.id, u.id FROM projects p, users u WHERE p.name IN ('白庙河水库', '天堂寨水库') AND u.username='王五';

-- 赵六 -> 武金堤, 汉口江滩防洪堤 (武汉片区)
INSERT INTO project_operators (project_id, user_id)
SELECT p.id, u.id FROM projects p, users u WHERE p.name IN ('武金堤', '汉口江滩防洪堤') AND u.username='赵六';

-- 钱七 -> 义水河水库, 青山江滩堤防 (跨区支援)
INSERT INTO project_operators (project_id, user_id)
SELECT p.id, u.id FROM projects p, users u WHERE p.name IN ('义水河水库', '青山江滩堤防') AND u.username='钱七';

-- 周九 -> 白庙河水库 (与王五共管)
INSERT INTO project_operators (project_id, user_id)
SELECT p.id, u.id FROM projects p, users u WHERE p.name='白庙河水库' AND u.username='周九';

-- Seed Devices (More detailed)
-- 白庙河水库设备
INSERT INTO devices (project_id, sn, name, type, status, battery_level, signal_strength, latitude, longitude)
SELECT id, 'BMH-001', '大坝左岸01', 'monitor', 'normal', 95, -65, 30.9542, 115.3865 FROM projects WHERE name='白庙河水库' UNION ALL
SELECT id, 'BMH-002', '大坝右岸02', 'monitor', 'alert', 45, -80, 30.9543, 115.3866 FROM projects WHERE name='白庙河水库' UNION ALL
SELECT id, 'BMH-CAM-01', '溢洪道监控', 'camera', 'normal', 100, -60, 30.9544, 115.3867 FROM projects WHERE name='白庙河水库';

-- 天堂寨水库设备
INSERT INTO devices (project_id, sn, name, type, status, battery_level, signal_strength, latitude, longitude)
SELECT id, 'TTZ-001', '主坝01', 'monitor', 'normal', 88, -70, 31.1142, 115.7265 FROM projects WHERE name='天堂寨水库' UNION ALL
SELECT id, 'TTZ-002', '主坝02', 'monitor', 'offline', 0, 0, 31.1143, 115.7266 FROM projects WHERE name='天堂寨水库';

-- 武金堤设备
INSERT INTO devices (project_id, sn, name, type, status, battery_level, signal_strength, latitude, longitude)
SELECT id, 'WJD-001', '堤防001', 'monitor', 'normal', 92, -68, 30.5021, 114.2862 FROM projects WHERE name='武金堤' UNION ALL
SELECT id, 'WJD-002', '堤防002', 'monitor', 'alert', 30, -88, 30.5022, 114.2863 FROM projects WHERE name='武金堤';

-- Seed Alerts (More realistic scenarios)
-- 白庙河水库警报
INSERT INTO alerts (device_id, project_id, level, message, status, created_at, handler_id, handle_note, resolved_at)
SELECT d.id, p.id, 'II', '检测到白蚁活动信号 (白蚁数量>50)', 'pending', NOW(), NULL, NULL, NULL
FROM devices d JOIN projects p ON d.project_id = p.id WHERE d.sn = 'BMH-002';

-- 武金堤警报 (已处理)
INSERT INTO alerts (device_id, project_id, level, message, status, created_at, updated_at, handler_id, handle_note, resolved_at)
SELECT d.id, p.id, 'I', '检测到严重白蚁侵蚀', 'resolved', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 
(SELECT id FROM users WHERE username='赵六'), '已投放诱杀包，情况受控', NOW()
FROM devices d JOIN projects p ON d.project_id = p.id WHERE d.sn = 'WJD-002';
