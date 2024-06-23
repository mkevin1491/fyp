from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import jsonify
from datetime import timedelta
from database.modelhandler import get_user_by_email  # Import the function

# Initialize JWTManager
jwt = JWTManager()

def create_token(identity):
    return create_access_token(identity=identity, expires_delta=timedelta(hours=12))

@jwt.user_identity_loader
def user_identity_lookup(user):
    return user  # Return the entire user dictionary

@jwt.user_lookup_loader
def user_lookup_callback(jwt_header, jwt_data):
    identity = jwt_data["sub"]
    if isinstance(identity, str):
        # Assuming identity is the email if it's a string
        return get_user_by_email(identity)
    return get_user_by_email(identity["email"])

@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
