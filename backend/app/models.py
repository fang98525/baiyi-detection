from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), default='') # Added for completeness based on SQL
    role = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20)) # 联系方式
    is_active = db.Column(db.Boolean, default=False) # 是否已激活
    remark_name = db.Column(db.String(50)) # 备注姓名，方便管理员定位

# Association table for Project <-> Operator (Many-to-Many)
project_operators = db.Table('project_operators',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    project_type = db.Column(db.String(20), default='reservoir')
    category = db.Column(db.String(20), default='single')
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    region_province = db.Column(db.String(50))
    region_city = db.Column(db.String(50))
    region_district = db.Column(db.String(50))
    address = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(10, 7))
    longitude = db.Column(db.Numeric(10, 7))
    
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    dam_type = db.Column(db.String(50))
    crest_length = db.Column(db.Float)
    toe_length = db.Column(db.Float)
    slope_length = db.Column(db.Float)
    max_height = db.Column(db.Float)
    
    hazard_level = db.Column(db.String(20))
    check_method = db.Column(db.String(50))
    governance_method = db.Column(db.String(50))
    monitor_devices = db.Column(db.JSON) # Legacy field, keeping for compatibility, but prefer 'devices' relation
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    admin = db.relationship('User', foreign_keys=[admin_id])
    manager = db.relationship('User', foreign_keys=[manager_id])
    
    # Many-to-Many relationship for operators
    operators = db.relationship('User', secondary='project_operators', backref=db.backref('projects', lazy='dynamic'))

    # One-to-Many for Devices
    devices = db.relationship('Device', backref='project', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.project_type,
            'typeLabel': '水库' if self.project_type == 'reservoir' else '堤防',
            'projectName': self.name, 
            'region': f"{self.region_province or ''}{self.region_city or ''}{self.region_district or ''}",
            'address': self.address,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            
            # Extended details
            'category': self.category,
            'reservoirType': self.type, # '小（二）型' etc.
            'damType': self.dam_type,
            'hazardLevel': self.hazard_level,
            'crestLength': self.crest_length,
            'toeLength': self.toe_length,
            'slopeLength': self.slope_length,
            'maxHeight': self.max_height,
            'checkMethod': self.check_method,
            'governanceMethod': self.governance_method,
            'adminId': self.admin_id,
            'managerId': self.manager_id,
            'adminName': self.admin.username if self.admin else None,
            'managerName': self.manager.username if self.manager else None,
            'monitorDevices': self.monitor_devices,
            'deviceCount': self.devices.count()
        }

class Device(db.Model):
    __tablename__ = 'devices'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    sn = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100))
    type = db.Column(db.String(50), default='monitor')
    status = db.Column(db.String(20), default='normal') # normal, alert, offline, maintenance
    battery_level = db.Column(db.Integer)
    signal_strength = db.Column(db.Integer)
    last_active = db.Column(db.DateTime)
    latitude = db.Column(db.Numeric(10, 7))
    longitude = db.Column(db.Numeric(10, 7))
    install_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'projectId': self.project_id,
            'sn': self.sn,
            'name': self.name,
            'type': self.type,
            'status': self.status,
            'batteryLevel': self.battery_level,
            'signalStrength': self.signal_strength,
            'lastActive': self.last_active.isoformat() if self.last_active else None,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'installImage': self.install_image
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    level = db.Column(db.String(10), default='III')
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending') # pending, processing, resolved, ignored
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    handler_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    handle_note = db.Column(db.Text)
    handle_image = db.Column(db.String(255))
    resolved_at = db.Column(db.DateTime)

    device = db.relationship('Device', backref=db.backref('alerts', lazy=True))
    project = db.relationship('Project', backref=db.backref('alerts', lazy=True))
    handler = db.relationship('User', backref='handled_alerts')

    def to_dict(self):
        return {
            'id': self.id,
            'deviceId': self.device_id,
            'projectId': self.project_id,
            'deviceSn': self.device.sn if self.device else None,
            'projectName': self.project.name if self.project else None,
            'level': self.level,
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'handlerName': self.handler.username if self.handler else None,
            'handleNote': self.handle_note
        }
