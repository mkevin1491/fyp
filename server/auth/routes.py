from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database.models import User
from database import db
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if User.query.filter_by(email=email).first():
        response = jsonify({"msg": "Email already registered"})
        return response, 400

    new_user = User(email=email, name=name)
    logger.debug(f"Password before hashing: {password}")
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    logger.debug(f"Registered user {email} with hashed password {new_user.password_hash}")
    response = jsonify({"msg": "User registered successfully"})
    return response, 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    logger.debug(f"Login attempt for email: {email}")
    logger.debug(f"Received password: {password}")

    user = User.query.filter_by(email=email).first()

    if not user:
        logger.debug("User not found")
        response = jsonify({"msg": "Bad email or password"})
        return response, 401

    logger.debug(f"Stored hashed password for {email}: {user.password_hash}")
    logger.debug("User found, verifying password")

    is_password_correct = user.check_password(password)
    logger.debug(f"Password correct: {is_password_correct}")

    if not is_password_correct:
        logger.debug(f"Incorrect password for user {email}")
        response = jsonify({"msg": "Bad email or password"})
        return response, 401

    logger.debug("Password verified, generating token")
    access_token = create_access_token(identity={"id": user.id, "name": user.name, "email": user.email})
    response = jsonify(access_token=access_token)
    return response, 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    response = jsonify(logged_in_as=current_user)
    return response, 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"msg": "Logout successful"})
    return response, 200
