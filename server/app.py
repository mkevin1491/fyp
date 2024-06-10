from flask_socketio import SocketIO, emit
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from config import Config
from database import init_db, db
from database.models import Switchgear, PendingSwitchgear, ApprovalLog, User
from database.modelhandler import (
    add_pending_switchgear_record,
    add_switchgear_record,
    move_pending_to_approved,
    reject_pending,
    insert_switchgear_values,
)
from utils.preprocessing import preprocess_data
from auth.utils import jwt
import tempfile
import os
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS
CORS(app)

# Initialize Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

jwt.init_app(app)
init_db(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Register the authentication blueprint
from auth.routes import auth_bp
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route("/api/upload", methods=['POST'])
def upload_file():
    logger.debug("Received request to /api/upload")
    try:
        file = request.files.get('file')
        logger.debug(f"File received: {file.filename if file else 'No file'}")
        if file:
            temp_dir = tempfile.mkdtemp()
            logger.debug(f"Created temporary directory at {temp_dir}")
            try:
                file_path = os.path.join(temp_dir, file.filename)
                file.save(file_path)
                logger.debug(f"File saved to {file_path}")

                data = preprocess_data(file_path)
                logger.debug("Data preprocessed successfully")
                data = data.replace({np.nan: None})
                
                # Preliminary check to ensure the entire data exists in either the PendingSwitchgear or Switchgear table
                all_exists = True
                for index, row in data.iterrows():
                    pending_record = PendingSwitchgear.query.filter_by(
                        functional_location=row['Functional Location']
                    ).first()
                    switchgear_record = Switchgear.query.filter_by(
                        functional_location=row['Functional Location']
                    ).first()
                    
                    if not pending_record and not switchgear_record:
                        all_exists = False
                        break

                if all_exists:
                    logger.debug("All records already exist in either PendingSwitchgear or Switchgear tables")
                    return jsonify({'message': 'All records already exist in either PendingSwitchgear or Switchgear tables.'})

                # Variable to track if any new record is added to PendingSwitchgear
                new_pending_added = False

                # Continue with existing logic
                for index, row in data.iterrows():
                    logger.debug(f"Processing row {index}: {row.to_dict()}")
                    existing_record = Switchgear.query.filter_by(
                        functional_location=row['Functional Location']
                    ).first()

                    if existing_record:
                        logger.debug(f"Found existing record for {row['Functional Location']}")
                        if (existing_record.tev_us_in_db != row['TEV/US In DB']) or (existing_record.hotspot_delta_t_in_c != row['Hotspot ∆T In ⁰C']):
                            add_switchgear_record(row.to_dict())
                            logger.debug(f"Added new record for updated values for {row['Functional Location']}")
                        elif existing_record.report_date != row['Report Date ']:
                            add_switchgear_record(row.to_dict())
                            logger.debug(f"Added new record for different report date for {row['Functional Location']}")
                        else:
                            logger.debug(f"No update needed for {row['Functional Location']}")
                    else:
                        add_pending_switchgear_record(row.to_dict())
                        logger.debug(f"Pending approval for new record {row['Functional Location']}")
                        new_pending_added = True

                if not new_pending_added:
                    return jsonify({'message': 'No new records were added to pending switchgear. All records are already in the approval page.'})

                # Emit the updated count to all connected clients
                count = db.session.query(PendingSwitchgear).count()
                socketio.emit('update_pending_approvals_count', {'count': count})

                return jsonify({'message': 'File uploaded. Records processed accordingly.'})
            except Exception as e:
                logger.error(f"Error processing file: {e}")
                return jsonify({'error': str(e)}), 500
            finally:
                os.remove(file_path)
                os.rmdir(temp_dir)
                logger.debug(f"Cleaned up temporary directory {temp_dir}")
        else:
            logger.warning("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400
    except Exception as e:
        logger.error(f"Error during file upload: {e}")
        return jsonify({'error': str(e)}), 500


@app.route("/api/pending-approvals", methods=['GET'])
def get_pending_approvals():
    logger.debug("Received request to /api/pending-approvals")
    try:
        pending_approvals = PendingSwitchgear.query.all()
        logger.debug(f"Pending approvals fetched: {pending_approvals}")
        approvals = [
            {
                'id': approval.id,
                'functional_location': approval.functional_location,
                'report_date': approval.report_date,
                'defect_from': approval.defect_from,
                'tev_us_in_db': approval.tev_us_in_db,
                'hotspot_delta_t_in_c': approval.hotspot_delta_t_in_c,
                'switchgear_type': approval.switchgear_type,
                'switchgear_brand': approval.switchgear_brand,
                'substation_name': approval.substation_name,
                'defect_description_1': approval.defect_description_1,
                'defect_description_2': approval.defect_description_2,
                'defect_owner': approval.defect_owner,
            } for approval in pending_approvals
        ]
        logger.debug(f"Pending approvals processed: {approvals}")
        return jsonify({'pending_approvals': approvals})
    except Exception as e:
        logger.error(f"Error fetching pending approvals: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pending-approvals/count', methods=['GET'])
def get_pending_approvals_count():
    try:
        count = db.session.query(PendingSwitchgear).count()
        logger.debug(f"Pending approvals count: {count}")
        return jsonify(count=count)
    except Exception as e:
        logger.error(f"Error fetching pending approvals count: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/approve/<int:id>", methods=['POST'])
@jwt_required()
def approve_pending(id):
    logger.debug(f"Received request to approve record {id}")
    try:
        message = request.json.get('message', '')
        user_id = get_jwt_identity()['id']
        pending_record = PendingSwitchgear.query.get(id)
        if pending_record and move_pending_to_approved(id, message):
            approval_log = ApprovalLog(
                action='Approved',
                message=message,
                functional_location=pending_record.functional_location,
                user_id=user_id
            )
            db.session.add(approval_log)
            db.session.commit()

            # Emit the updated count to all connected clients
            count = db.session.query(PendingSwitchgear).count()
            socketio.emit('update_pending_approvals_count', {'count': count})

            logger.debug(f"Record {id} approved and updated in the database")
            return jsonify({'message': 'Record approved and updated in the database'})
        else:
            logger.warning(f"Record not found or not pending: ID {id}")
            return jsonify({'error': 'Record not found or not pending'}), 404
    except Exception as e:
        logger.error(f"Error during approval: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/reject/<int:id>", methods=['POST'])
@jwt_required()
def reject_pending_record(id):
    logger.debug(f"Received request to reject record {id}")
    try:
        message = request.json.get('message', '')
        user_id = get_jwt_identity()['id']
        pending_record = PendingSwitchgear.query.get(id)
        if pending_record and reject_pending(id, message):
            approval_log = ApprovalLog(
                action='Rejected',
                message=message,
                functional_location=pending_record.functional_location,
                user_id=user_id
            )
            db.session.add(approval_log)
            db.session.commit()

            # Emit the updated count to all connected clients
            count = db.session.query(PendingSwitchgear).count()
            socketio.emit('update_pending_approvals_count', {'count': count})

            logger.debug(f"Record {id} rejected and removed from pending approvals")
            return jsonify({'message': 'Record rejected and removed from pending approvals'})
        else:
            logger.warning(f"Record not found or not pending: ID {id}")
            return jsonify({'error': 'Record not found or not pending'}), 404
    except Exception as e:
        logger.error(f"Error during rejection: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/approval-logs", methods=['GET'])
@jwt_required()
def get_approval_logs():
    filter_action = request.args.get('filter', 'all')
    
    if filter_action == 'all':
        logs = ApprovalLog.query.all()
    else:
        logs = ApprovalLog.query.filter_by(action=filter_action).all()
    
    approval_logs = []
    for log in logs:
        approval_logs.append({
            'functional_location': log.functional_location,
            'action': log.action,
            'message': log.message,
            'approver': log.user.name,  # Get the user's name from the relationship
            'timestamp': log.timestamp.isoformat()  # Return timestamp as ISO format string
        })
    return jsonify(approval_logs)

@app.route("/api/switchgear-data", methods=['GET'])
def get_switchgear_data():
    try:
        switchgear_data = db.session.query(Switchgear).all()
        response_data = {}
        for record in switchgear_data:
            # Use created_at or updated_at for grouping
            month = record.created_at.strftime('%B') if record.created_at else record.updated_at.strftime('%B')
            if month not in response_data:
                response_data[month] = set()
            response_data[month].add(record.functional_location)
        
        formatted_data = [
            {'month': month, 'functional_locations': len(locations)}
            for month, locations in response_data.items()
        ]

        return jsonify({'data': formatted_data})
    except Exception as e:
        logger.error(f"Error fetching switchgear data: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route("/api/switchgear-info", methods=['GET'])
def get_switchgear_info():
    try:
        switchgear_data = Switchgear.query.with_entities(
            Switchgear.id,  # Assuming 'id' is part of your model
            Switchgear.functional_location,
            Switchgear.substation_name,
            Switchgear.latitude,
            Switchgear.longitude
        ).all()

        response_data = [
            {
                'id': record.functional_location,  # Assuming 'id' exists in your model
                'name': record.substation_name,
                'coordinates': [record.latitude, record.longitude]
            } for record in switchgear_data
            if -90 <= record.latitude <= 90 and -180 <= record.longitude <= 180
        ]

        return jsonify({'data': response_data})
    except Exception as e:
        logger.error(f"Error fetching switchgear info: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)