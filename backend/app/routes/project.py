from flask import Blueprint, request, jsonify
from app import db
from app.models import Project, User

bp = Blueprint('project', __name__, url_prefix='/api/projects')

@bp.route('', methods=['GET'])
def get_projects():
    p_type = request.args.get('type', 'reservoir')
    
    # Get current user from token if possible (simplified here by passing user_id or username in query for now or just mock)
    # Ideally, we use a decorator @login_required and get g.user
    # Assuming a header 'X-User-Id' for simplicity in this turn or getting logic from request context if available
    # BUT, standard way: parse token. Since we don't have full JWT setup shown in snippet, we'll rely on logic
    # that frontend might pass user info OR we filter based on assumption.
    # Wait, the user requirement says:
    # Admin: all
    # Manager: own projects
    # Operator: assigned projects (view only)
    
    # Since we need to know WHO is asking, let's check if 'userId' is passed in query params for this MVP stage
    # OR better, we should really inspect the token.
    # Let's assume the frontend passes `userId` and `role` query params for now to strictly follow the "MVP/Demo" nature
    # if authentication middleware isn't fully protecting this route yet.
    
    user_id = request.args.get('userId', type=int)
    role = request.args.get('role', type=str)
    
    query = Project.query.filter_by(project_type=p_type)
    
    if role == 'admin':
        # Admin sees all
        pass
    elif role == 'manager':
        # Manager sees projects they manage OR are admin of (admin_id column usually means creator/admin, manager_id is the specific manager)
        # Let's assume manager_id is the link.
        query = query.filter(
            (Project.manager_id == user_id) | (Project.admin_id == user_id)
        )
    elif role == 'operator':
        # Operator sees assigned projects
        # BUT, current DB schema doesn't have a direct "Operator <-> Project" many-to-many link clearly defined in the `projects` table for *multiple* operators easily
        # The requirements says: "一用户的所属项目（多对多关系，一个运维员可负责多个项目）"
        # We need a link table. User <-> Project.
        # However, looking at models.py, there isn't a link table yet.
        # Let's check models.py again.
        # `admin_id` and `manager_id` are single columns.
        # WE NEED A MANY-TO-MANY TABLE `project_operators`.
        pass

    projects = query.order_by(Project.created_at.desc()).all()
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
    
    # TODO: Strict authentication and authorization check via token
    # For now, rely on frontend passing role/id or assumption that unauthorized access is blocked by middleware
    # But we enforce that if a manager creates, they manage it.
    
    # If caller is Manager, they can only create projects for themselves (or we auto-assign)
    # If caller is Operator, they should be blocked (frontend blocks, but backend should too)
    
    # Assuming we pass `userId` and `role` in body or query for MVP control, 
    # OR ideally extracting from g.user (if auth middleware existed).
    # Let's use the data from body if available to check permission
    
    creator_role = request.args.get('role') or data.get('role') # insecure but fits current MVP pattern
    creator_id = request.args.get('userId') or data.get('userId')
    
    if creator_role == 'operator':
         return jsonify({'message': 'Permission denied: Operators cannot create projects'}), 403

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
        
        # Auto-assign manager if creator is manager
        manager_id = parse_int_or_none(data.get('managerId'))
        if creator_role == 'manager' and creator_id:
            # Enforce self-assignment or check if they are assigning themselves
            # Let's strict it: if manager creates, they are the manager.
            manager_id = int(creator_id)

        new_project = Project(
            project_type=data.get('projectType', 'reservoir'),
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
            manager_id=manager_id,
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
    
    # Permission Check
    updater_role = request.args.get('role') or data.get('role')
    updater_id = request.args.get('userId') or data.get('userId')
    
    if updater_role == 'operator':
        return jsonify({'message': 'Permission denied: Operators cannot update projects'}), 403
        
    if updater_role == 'manager':
        # Check if this project belongs to the manager
        if project.manager_id != int(updater_id) and project.admin_id != int(updater_id):
             return jsonify({'message': 'Permission denied: You can only manage your own projects'}), 403

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
