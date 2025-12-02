from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), default='') # Added for completeness based on SQL
    role = db.Column(db.String(20), nullable=False)

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
    monitor_devices = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    admin = db.relationship('User', foreign_keys=[admin_id])
    manager = db.relationship('User', foreign_keys=[manager_id])
    
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
            'monitorDevices': self.monitor_devices
        }
