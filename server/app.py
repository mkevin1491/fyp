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
from sqlalchemy import extract, func, or_

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

                new_pending_added = False

                for index, row in data.iterrows():
                    logger.debug(f"Processing row {index}: {row.to_dict()}")
                    functional_location = row['Functional Location']
                    report_date = row['Report Date ']
                    defect_description_1 = row['Defect Description 1']

                    # Check if the functional location exists in the Switchgear table
                    existing_records = Switchgear.query.filter_by(
                        functional_location=functional_location
                    ).all()

                    if not existing_records:
                        # If no existing records for the functional location, add to Switchgear
                        add_switchgear_record(row.to_dict())
                        logger.debug(f"New record added to Switchgear table: {row.to_dict()}")
                    else:
                        match_found = False
                        for existing_record in existing_records:
                            if existing_record.report_date == report_date and existing_record.defect_description_1 == defect_description_1:
                                if (existing_record.tev_us_in_db == row['TEV/US In DB'] and
                                    existing_record.hotspot_delta_t_in_c == row['Hotspot ∆T In ⁰C'] and
                                    existing_record.defect_from == row['Defect From'] and
                                    existing_record.switchgear_type == row['Switchgear Type'] and
                                    existing_record.switchgear_brand == row['Switchgear Brand'] and
                                    existing_record.substation_name == row['Substation Name'] and
                                    existing_record.defect_description_2 == row['Defect Description 2'] and
                                    existing_record.defect_owner == row['Defect Owner']):
                                    # Record is exactly the same, ignore it
                                    logger.debug(f"Ignored duplicate data: {row.to_dict()}")
                                    match_found = True
                                    break
                                else:
                                    # Record exists with the same report date and defect description, but data is different
                                    add_pending_switchgear_record(row.to_dict())
                                    logger.debug(f"Pending approval for updated values: {row.to_dict()}")
                                    new_pending_added = True
                                    match_found = True
                                    break
                        if not match_found:
                            # If no matching report date and defect description, add to Switchgear
                            add_switchgear_record(row.to_dict())
                            logger.debug(f"Added new record for different report date for {functional_location}")

                if not new_pending_added:
                    return jsonify({'message': 'No new records were added to pending switchgear. All records are already in the approval page or added to switchgear.'})

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
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pending_approvals = PendingSwitchgear.query.paginate(page=page, per_page=per_page, error_out=False)

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
                'status': approval.status  # Include status in the response
            } for approval in pending_approvals.items
        ]
        
        return jsonify({
            'pending_approvals': approvals,
            'total_pages': pending_approvals.pages,
            'current_page': pending_approvals.page,
            'total_items': pending_approvals.total
        })
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
    try:
        filter_action = request.args.get('filter', 'all')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = ApprovalLog.query

        if filter_action != 'all':
            query = query.filter_by(action=filter_action)

        logs = query.paginate(page=page, per_page=per_page, error_out=False)

        approval_logs = []
        for log in logs.items:
            approval_logs.append({
                'functional_location': log.functional_location,
                'action': log.action,
                'message': log.message,
                'approver': log.user.name,  # Get the user's name from the relationship
                'timestamp': log.timestamp.isoformat()  # Return timestamp as ISO format string
            })

        return jsonify({
            'approval_logs': approval_logs,
            'total_pages': logs.pages,
            'current_page': logs.page,
            'total_items': logs.total
        })
    except Exception as e:
        logger.error(f"Error fetching approval logs: {e}")
        return jsonify({'error': str(e)}), 500

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
        search_query = request.args.get('search', '').lower()

        switchgear_data = Switchgear.query.with_entities(
            Switchgear.id,
            Switchgear.functional_location,
            Switchgear.report_date,
            Switchgear.defect_from,
            Switchgear.tev_us_in_db,
            Switchgear.hotspot_delta_t_in_c,
            Switchgear.switchgear_type,
            Switchgear.switchgear_brand,
            Switchgear.substation_name,
            Switchgear.defect_description_1,
            Switchgear.defect_description_2,
            Switchgear.defect_owner,
            Switchgear.latitude,
            Switchgear.longitude,
            Switchgear.status  # Include status in the query
        ).all()

        response_data = [
            {
                'id': record.id,
                'functional_location': record.functional_location,
                'report_date': record.report_date,
                'defect_from': record.defect_from,
                'tev_us_in_db': record.tev_us_in_db,
                'hotspot_delta_t_in_c': record.hotspot_delta_t_in_c,
                'switchgear_type': record.switchgear_type,
                'switchgear_brand': record.switchgear_brand,
                'substation_name': record.substation_name,
                'defect_description_1': record.defect_description_1,
                'defect_description_2': record.defect_description_2,
                'defect_owner': record.defect_owner,
                'coordinates': [record.latitude, record.longitude],
                'status': record.status  # Include status in the response
            } for record in switchgear_data
            if search_query in record.functional_location.lower() or
               search_query in record.report_date.lower() or
               search_query in record.defect_from.lower() or
               search_query in record.tev_us_in_db.lower() or
               search_query in record.hotspot_delta_t_in_c.lower() or
               search_query in record.switchgear_type.lower() or
               search_query in record.switchgear_brand.lower() or
               search_query in record.substation_name.lower() or
               search_query in record.defect_description_1.lower() or
               search_query in record.defect_description_2.lower() or
               search_query in record.defect_owner.lower() or
               search_query in record.status.lower()
        ]

        return jsonify({'data': response_data})
    except Exception as e:
        logger.error(f"Error fetching switchgear info: {e}")
        return jsonify({'error': str(e)}), 500


month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

state_map = {
    'A': 'Perak', 'B': 'Selangor', 'C': 'Pahang', 'D': 'Kelantan', 'F': 'Putrajaya',
    'J': 'Johor', 'K': 'Kedah', 'M': 'Malacca', 'N': 'Negeri Sembilan', 'P': 'Penang',
    'Q': 'Sarawak', 'R': 'Perlis', 'S': 'Sabah', 'T': 'Terengganu', 'W': 'Kuala Lumpur'
}

def match_defect_description(desc):
    # Function to determine the correct matching criteria based on input
    if ' ' in desc:
        return desc
    else:
        return f'{desc} %'

@app.route('/api/defect-analytics', methods=['GET'])
def get_defect_analytics():
    defect_description = request.args.get('defect_description_1', default=None, type=str)
    year = request.args.get('year', default=None, type=int)
    selected_states = request.args.getlist('states[]')

    query = db.session.query(
        func.month(Switchgear.report_date).label('month'),
        func.substr(Switchgear.functional_location, 1, 1).label('state_initial'),
        func.count(func.distinct(Switchgear.functional_location)).label('unique_functional_locations')
    )

    if defect_description:
        # Determine the matching criteria based on input defect_description_1
        match_criteria = match_defect_description(defect_description)
        query = query.filter(Switchgear.defect_description_1.ilike(match_criteria))

    if year:
        query = query.filter(func.year(Switchgear.report_date) == year)

    if selected_states:
        state_initials = [k for k, v in state_map.items() if v in selected_states]
        state_filters = [Switchgear.functional_location.like(f'{initial}%') for initial in state_initials]
        query = query.filter(or_(*state_filters))

    query = query.group_by(
        func.month(Switchgear.report_date),
        func.substr(Switchgear.functional_location, 1, 1)
    ).all()

    result = [
        {
            'month': month_names[month - 1],
            'state': state_map[state_initial],
            'unique_functional_locations': count
        } for month, state_initial, count in query
    ]

    return jsonify({'data': result})

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)