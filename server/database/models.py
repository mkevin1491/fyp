from datetime import datetime
import pytz
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

logger = logging.getLogger(__name__)

def malaysia_time():
    malaysia = pytz.timezone('Asia/Kuala_Lumpur')
    return datetime.now(malaysia)

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        logger.debug(f"Setting password for user {self.email}")
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        logger.debug(f"Generated password hash for {self.email}: {self.password_hash}")

    def check_password(self, password):
        logger.debug(f"Checking password for user {self.email}")
        result = check_password_hash(self.password_hash, password)
        logger.debug(f"Password check result for {self.email}: {result}")
        return result

class Switchgear(db.Model):
    __tablename__ = 'switchgear'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    functional_location = db.Column(db.String(255))
    report_date = db.Column(db.DateTime, index=True)
    defect_from = db.Column(db.String(255), index=True)
    tev_us_in_db = db.Column(db.Float)
    hotspot_delta_t_in_c = db.Column(db.Float)
    switchgear_type = db.Column(db.String(255))
    switchgear_brand = db.Column(db.String(255))
    substation_name = db.Column(db.String(255))
    defect_description_1 = db.Column(db.String(500))
    defect_description_2 = db.Column(db.String(500))
    defect_owner = db.Column(db.String(255), index=True)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=malaysia_time)
    updated_at = db.Column(db.DateTime, default=malaysia_time, onupdate=malaysia_time)
    
    
    def to_dict(self):
            return {
                'id': self.id,
                'functional_location': self.functional_location,
                'report_date': self.report_date.isoformat() if self.report_date else None,
                'defect_from': self.defect_from,
                'tev_us_in_db': self.tev_us_in_db,
                'hotspot_delta_t_in_c': self.hotspot_delta_t_in_c,
                'switchgear_type': self.switchgear_type,
                'switchgear_brand': self.switchgear_brand,
                'substation_name': self.substation_name,
                'defect_description_1': self.defect_description_1,
                'defect_description_2': self.defect_description_2,
                'defect_owner': self.defect_owner,
                'latitude': self.latitude,
                'longitude': self.longitude,
                'status': self.status
            }

class PendingSwitchgear(db.Model):
    __tablename__ = 'pending_switchgear'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    functional_location = db.Column(db.String(255))
    report_date = db.Column(db.DateTime, index=True)
    defect_from = db.Column(db.String(255), index=True)
    tev_us_in_db = db.Column(db.Float)
    hotspot_delta_t_in_c = db.Column(db.Float)
    switchgear_type = db.Column(db.String(255))
    switchgear_brand = db.Column(db.String(255))
    substation_name = db.Column(db.String(255))
    defect_description_1 = db.Column(db.String(500))
    defect_description_2 = db.Column(db.String(500))
    defect_owner = db.Column(db.String(255), index=True)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=malaysia_time)
    updated_at = db.Column(db.DateTime, default=malaysia_time, onupdate=malaysia_time)

class ApprovalLog(db.Model):
    __tablename__ = 'approval_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action = db.Column(db.String(50))
    message = db.Column(db.String(500))
    functional_location = db.Column(db.String(255))
    tev_us_in_db = db.Column(db.Float)
    hotspot_delta_t_in_c = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=malaysia_time)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('approval_logs', lazy=True))

class ActionLog(db.Model):
    __tablename__ = 'action_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action = db.Column(db.String(50))
    message = db.Column(db.String(500))
    data = db.Column(db.JSON)  # Store the whole row as JSON
    timestamp = db.Column(db.DateTime, default=malaysia_time)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('action_logs', lazy=True))
