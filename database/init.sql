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

-- Insert seed users
INSERT INTO users (username, password_hash, role, phone) VALUES 
('zqfang5', 'hash_placeholder', 'admin', '18271587343'),
('张三', 'hash_placeholder', 'manager', '13900000001'),
('李四', 'hash_placeholder', 'manager', '13900000002')
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
    (SELECT id FROM users WHERE username='李四' LIMIT 1), 
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
    (SELECT id FROM users WHERE username='张三' LIMIT 1), 
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

