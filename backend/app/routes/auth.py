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

    # In a real app, we should use password hashing. 
    # For now, we'll do simple comparison or check if hash matches
    # Assuming the initial seed data has 'hash_placeholder' which won't match anything unless we update logic
    
    # Updating login logic to support both plain text (for dev) and hashed
    if user:
        # Simple password check for dev/demo purposes if hash is a placeholder
        if user.password_hash == 'hash_placeholder':
            # Allow login if password matches username (just for demo convenience if needed)
            # OR we strictly require password. Let's say default password is '123456' for seeded users
            if password == '123456': 
                 pass
            else:
                 return jsonify({'message': 'Invalid credentials'}), 401
        elif not check_password_hash(user.password_hash, password):
             return jsonify({'message': 'Invalid credentials'}), 401
             
        return jsonify({
            'token': f'mock_token_{user.id}', # JWT implementation skipped for brevity
            'userInfo': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
    
    return jsonify({'message': 'User not found'}), 404

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'operator') # Default to operator

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    # Hash password
    hashed_password = generate_password_hash(password)
    
    new_user = User(
        username=username,
        password_hash=hashed_password,
        role=role
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

