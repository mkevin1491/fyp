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


month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

state_map = {
    'A': 'Perak', 'B': 'Selangor', 'C': 'Pahang', 'D': 'Kelantan', 'F': 'Putrajaya',
    'J': 'Johor', 'K': 'Kedah', 'M': 'Malacca', 'N': 'Negeri Sembilan', 'P': 'Penang',
    'Q': 'Sarawak', 'R': 'Perlis', 'S': 'Sabah', 'T': 'Terengganu', 'W': 'Kuala Lumpur'
}

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
                new_switchgear_added = False
                duplicates_found = False

                for index, row in data.iterrows():
                    logger.debug(f"Processing row {index}: {row.to_dict()}")
                    functional_location = row['Functional Location']
                    report_date = row['Report Date ']
                    defect_description_1 = row['Defect Description 1']

                    existing_switchgear_records = Switchgear.query.filter_by(
                        functional_location=functional_location
                    ).all()

                    existing_pending_records = PendingSwitchgear.query.filter_by(
                        functional_location=functional_location
                    ).all()

                    def is_exact_match(record, row):
                        return (
                            record.report_date == report_date and
                            record.defect_description_1 == defect_description_1 and
                            record.tev_us_in_db == row['TEV/US In DB'] and
                            record.hotspot_delta_t_in_c == row['Hotspot ∆T In ⁰C'] and
                            record.defect_from == row['Defect From'] and
                            record.switchgear_type == row['Switchgear Type'] and
                            record.switchgear_brand == row['Switchgear Brand'] and
                            record.substation_name == row['Substation Name'] and
                            record.defect_description_2 == row['Defect Description 2'] and
                            record.defect_owner == row['Defect Owner']
                        )

                    match_found_in_switchgear = any(is_exact_match(rec, row) for rec in existing_switchgear_records)
                    match_found_in_pending = any(is_exact_match(rec, row) for rec in existing_pending_records)

                    if match_found_in_switchgear or match_found_in_pending:
                        logger.debug(f"Ignored duplicate data: {row.to_dict()}")
                        duplicates_found = True
                        continue

                    match_found = False
                    for existing_record in existing_switchgear_records:
                        if existing_record.report_date == report_date and existing_record.defect_description_1 == defect_description_1:
                            add_pending_switchgear_record(row.to_dict())
                            logger.debug(f"Pending approval for updated values: {row.to_dict()}")
                            new_pending_added = True
                            match_found = True
                            break

                    if not match_found:
                        add_switchgear_record(row.to_dict())
                        logger.debug(f"Added new record for different report date for {functional_location}")
                        new_switchgear_added = True

                if new_switchgear_added and not new_pending_added:
                    message = 'Data successfully added to the switchgear table.'
                elif new_switchgear_added and new_pending_added:
                    message = 'Data added to the switchgear table and pending switchgear table for approval.'
                elif new_pending_added and not new_switchgear_added:
                    message = 'Data added to the pending switchgear table for approval.'
                elif duplicates_found:
                    message = 'All records are duplicates and already exist.'

                count = db.session.query(PendingSwitchgear).count()
                socketio.emit('update_pending_approvals_count', {'count': count})

                return jsonify({'message': message})
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

        # Order the results by timestamp in descending order
        query = query.order_by(ApprovalLog.timestamp.desc())

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
        # Retrieve filter parameters
        year = request.args.get('year', default=None, type=int)
        selected_states = request.args.getlist('states[]')

        # Build the query
        query = db.session.query(Switchgear)

        if year:
            query = query.filter(func.year(Switchgear.report_date) == year)

        if selected_states:
            state_initials = [k for k, v in state_map.items() if v in selected_states]
            state_filters = [Switchgear.functional_location.like(f'{initial}%') for initial in state_initials]
            query = query.filter(or_(*state_filters))

        switchgear_data = query.all()
        response_data = {}

        for record in switchgear_data:
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

    
    
@app.route("/api/pie-chart", methods=['GET'])
def get_pie_chart_data():
    try:
        criticality = request.args.get('criticality', '').lower()

        query = db.session.query(
            Switchgear.switchgear_brand,
            func.count(func.distinct(Switchgear.functional_location)).label('functional_locations')
        )

        if criticality:
            query = query.filter(Switchgear.status.ilike(f"%{criticality}%"))

        query = query.group_by(Switchgear.switchgear_brand).all()

        response_data = [
            {
                'switchgear_brand': switchgear_brand,
                'functional_locations': count
            } for switchgear_brand, count in query
        ]

        return jsonify({'data': response_data})
    except Exception as e:
        logger.error(f"Error fetching pie chart data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/switchgear', methods=['POST'])
# @jwt_required()
def create_switchgear():
    try:
        data = request.json
        new_record = Switchgear(
            functional_location=data.get('functional_location'),
            report_date=data.get('report_date'),
            defect_from=data.get('defect_from'),
            tev_us_in_db=data.get('tev_us_in_db'),
            hotspot_delta_t_in_c=data.get('hotspot_delta_t_in_c'),
            switchgear_type=data.get('switchgear_type'),
            switchgear_brand=data.get('switchgear_brand'),
            substation_name=data.get('substation_name'),
            defect_description_1=data.get('defect_description_1'),
            defect_description_2=data.get('defect_description_2'),
            defect_owner=data.get('defect_owner'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status=data.get('status')
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify({'message': 'New switchgear record created', 'id': new_record.id}), 201
    except Exception as e:
        logger.error(f"Error creating switchgear record: {e}")
        return jsonify({'error': str(e)}), 500
@app.route("/api/functional-locations", methods=['GET'])
def get_functional_locations():
    try:
        # Query to get distinct functional locations with their statuses
        query = db.session.query(
            Switchgear.functional_location,
            Switchgear.status
        ).distinct().all()

        # Process the query results
        locations_data = []
        for location, status in query:
            location_info = next((item for item in locations_data if item['functional_location'] == location), None)
            if location_info:
                location_info['statuses'].append(status)
            else:
                locations_data.append({
                    'functional_location': location,
                    'statuses': [status]
                })

        return jsonify(locations_data)
    except Exception as e:
        logger.error(f"Error fetching functional locations: {e}")
        return jsonify({'error': str(e)}), 500

    
@app.route("/api/switchgear-info", methods=['GET'])
def get_switchgear_info():
    try:
        search_query = request.args.get('search', '').lower()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 25, type=int)

        query = Switchgear.query.with_entities(
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
            Switchgear.status
        )

        if search_query:
            query = query.filter(
                or_(
                    Switchgear.functional_location.ilike(f"%{search_query}%"),
                    Switchgear.report_date.ilike(f"%{search_query}%"),
                    Switchgear.defect_from.ilike(f"%{search_query}%"),
                    Switchgear.tev_us_in_db.ilike(f"%{search_query}%"),
                    Switchgear.hotspot_delta_t_in_c.ilike(f"%{search_query}%"),
                    Switchgear.switchgear_type.ilike(f"%{search_query}%"),
                    Switchgear.switchgear_brand.ilike(f"%{search_query}%"),
                    Switchgear.substation_name.ilike(f"%{search_query}%"),
                    Switchgear.defect_description_1.ilike(f"%{search_query}%"),
                    Switchgear.defect_description_2.ilike(f"%{search_query}%"),
                    Switchgear.defect_owner.ilike(f"%{search_query}%"),
                    Switchgear.status.ilike(f"%{search_query}%")
                )
            )


        paginated_data = query.paginate(page=page, per_page=per_page, error_out=False)

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
                'status': record.status
            } for record in paginated_data.items
        ]

        return jsonify({
            'data': response_data,
            'total_pages': paginated_data.pages,
            'current_page': paginated_data.page,
            'total_items': paginated_data.total
        })
    except Exception as e:
        logger.error(f"Error fetching switchgear info: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/switchgear/<int:id>', methods=['PUT'])
@jwt_required()
def update_switchgear(id):
    try:
        data = request.json
        record = Switchgear.query.get(id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404

        record.functional_location = data.get('functional_location', record.functional_location)
        record.report_date = data.get('report_date', record.report_date)
        record.defect_from = data.get('defect_from', record.defect_from)
        record.tev_us_in_db = data.get('tev_us_in_db', record.tev_us_in_db)
        record.hotspot_delta_t_in_c = data.get('hotspot_delta_t_in_c', record.hotspot_delta_t_in_c)
        record.switchgear_type = data.get('switchgear_type', record.switchgear_type)
        record.switchgear_brand = data.get('switchgear_brand', record.switchgear_brand)
        record.substation_name = data.get('substation_name', record.substation_name)
        record.defect_description_1 = data.get('defect_description_1', record.defect_description_1)
        record.defect_description_2 = data.get('defect_description_2', record.defect_description_2)
        record.defect_owner = data.get('defect_owner', record.defect_owner)
        record.latitude = data.get('latitude', record.latitude)
        record.longitude = data.get('longitude', record.longitude)
        record.status = data.get('status', record.status)

        db.session.commit()
        return jsonify({'message': 'Switchgear record updated'}), 200
    except Exception as e:
        logger.error(f"Error updating switchgear record: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/switchgear/<int:id>', methods=['POST', 'GET'])
# @jwt_required()
def delete_switchgear(id):
    try:
        record = Switchgear.query.get(id)
        if not record:
            return jsonify({'error': 'Record not found'}), 404

        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Switchgear record deleted'}), 200
    except Exception as e:
        logger.error(f"Error deleting switchgear record: {e}")
        return jsonify({'error': str(e)}), 500
    

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
        query = query.filter(Switchgear.defect_description_1.ilike(defect_description))

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