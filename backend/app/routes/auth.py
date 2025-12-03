from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if user:
        # 检查是否激活
        if not user.is_active:
            return jsonify({'message': '账户待审核，请联系管理员'}), 403

        # Password verification logic
        password_valid = False
        if user.password_hash == 'hash_placeholder':
            if password == '123456':
                password_valid = True
        elif check_password_hash(user.password_hash, password):
            password_valid = True

        if password_valid:
            return jsonify({
                'token': f'mock_token_{user.id}',
                'userInfo': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role
                }
            })
        else:
            return jsonify({'message': '密码错误'}), 400
    
    return jsonify({'message': '账号不存在'}), 404

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'operator') # Default to operator
    remark_name = data.get('remarkName') # 备注姓名
    phone = data.get('phone') # 手机号

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': '用户名已存在'}), 409

    # Hash password
    hashed_password = generate_password_hash(password)
    
    # 默认为未激活
    new_user = User(
        username=username,
        password_hash=hashed_password,
        role=role,
        is_active=False,
        remark_name=remark_name,
        phone=phone
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    # In a real app, we would get the user ID from the token.
    # Here we'll accept username for simplicity, or assume the frontend sends the ID.
    # Better yet, let's rely on the user ID if possible, or username.
    # Since we don't have full JWT middleware here, we'll expect username in the body for now
    # or we can look it up if we had a way to decode the token.
    # Given the login returns 'userInfo' with 'username', let's expect 'username' in the payload.
    
    username = data.get('username')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not username or not old_password or not new_password:
        return jsonify({'message': 'Missing required fields'}), 400

    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Verify old password
    # Handle the placeholder logic from login
    password_valid = False
    if user.password_hash == 'hash_placeholder':
        if old_password == '123456':
            password_valid = True
    elif check_password_hash(user.password_hash, old_password):
        password_valid = True
        
    if not password_valid:
        return jsonify({'message': '旧密码错误'}), 400

    # Update password
    user.password_hash = generate_password_hash(new_password)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

