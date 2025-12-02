from flask import Blueprint, request, jsonify
from app import db
from app.models import Project, User

bp = Blueprint('project', __name__, url_prefix='/api/projects')

@bp.route('', methods=['GET'])
def get_projects():
    p_type = request.args.get('type', 'reservoir')
    projects = Project.query.filter_by(project_type=p_type).order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])

@bp.route('/<int:id>', methods=['GET'])
def get_project_detail(id):
    project = Project.query.get_or_404(id)
    return jsonify(project.to_dict())

@bp.route('/index', methods=['GET'])
def index():
    return "白蚁监测平台后端服务运行中..."


def parse_float(value):
    if value is None or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def parse_int_or_none(value):
    if value is None or value == '':
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

@bp.route('', methods=['POST'])
def create_project():
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': 'Name is required'}), 400

    try:
        region = data.get('region', [])
        province = region[0] if len(region) > 0 else None
        city = region[1] if len(region) > 1 else None
        district = region[2] if len(region) > 2 else None
        
        lat = None
        lng = None
        if data.get('latlng'):
            parts = data['latlng'].split('/')
            if len(parts) == 2:
                try:
                    lng = float(parts[0].strip())
                    lat = float(parts[1].strip())
                except ValueError:
                    pass

        new_project = Project(
            project_type='reservoir', # Default to reservoir for now
            category=data.get('category'),
            name=data.get('name'),
            type=data.get('type'),
            region_province=province,
            region_city=city,
            region_district=district,
            address=data.get('address'),
            latitude=lat,
            longitude=lng,
            admin_id=parse_int_or_none(data.get('adminId')),
            manager_id=parse_int_or_none(data.get('managerId')),
            dam_type=data.get('damType'),
            crest_length=parse_float(data.get('crestLength')),
            toe_length=parse_float(data.get('toeLength')),
            slope_length=parse_float(data.get('slopeLength')),
            max_height=parse_float(data.get('maxHeight')),
            hazard_level=data.get('hazardLevel'),
            check_method=data.get('checkMethod'),
            governance_method=data.get('governanceMethod'),
            monitor_devices=data.get('monitorDevices')
        )
        
        db.session.add(new_project)
        db.session.commit()
        
        return jsonify({'message': 'Project created successfully', 'id': new_project.id}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_project(id):
    project = Project.query.get_or_404(id)
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': 'Name is required'}), 400

    try:
        region = data.get('region', [])
        province = region[0] if len(region) > 0 else None
        city = region[1] if len(region) > 1 else None
        district = region[2] if len(region) > 2 else None
        
        lat = None
        lng = None
        if data.get('latlng'):
            parts = data['latlng'].split('/')
            if len(parts) == 2:
                try:
                    lng = float(parts[0].strip())
                    lat = float(parts[1].strip())
                except ValueError:
                    pass
        
        # Update fields
        project.category = data.get('category', project.category)
        project.name = data.get('name', project.name)
        project.type = data.get('type', project.type)
        project.region_province = province
        project.region_city = city
        project.region_district = district
        project.address = data.get('address', project.address)
        if lat is not None: project.latitude = lat
        if lng is not None: project.longitude = lng
        
        project.admin_id = parse_int_or_none(data.get('adminId'))
        project.manager_id = parse_int_or_none(data.get('managerId'))
        
        project.dam_type = data.get('damType', project.dam_type)
        
        # Use helper to safely parse floats, default to existing value only if key missing from data
        # But here we update from form data, so if data has key "", we want None, not existing value
        # So logic: if key exists in data, use parsed value.
        
        if 'crestLength' in data: project.crest_length = parse_float(data['crestLength'])
        if 'toeLength' in data: project.toe_length = parse_float(data['toeLength'])
        if 'slopeLength' in data: project.slope_length = parse_float(data['slopeLength'])
        if 'maxHeight' in data: project.max_height = parse_float(data['maxHeight'])
        
        project.hazard_level = data.get('hazardLevel', project.hazard_level)
        project.check_method = data.get('checkMethod', project.check_method)
        project.governance_method = data.get('governanceMethod', project.governance_method)
        project.monitor_devices = data.get('monitorDevices', project.monitor_devices)
        
        db.session.commit()
        
        return jsonify({'message': 'Project updated successfully', 'id': project.id}), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500

@bp.route('/users', methods=['GET'])
def get_users():
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.all()
    return jsonify([{'id': u.id, 'name': u.username} for u in users])
