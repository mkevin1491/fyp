import pandas as pd
from . import db
from .models import User, Switchgear, PendingSwitchgear, ApprovalLog
import logging

logger = logging.getLogger(__name__)

def add_user(email, password):
    try:
        new_user = User(email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding user: {e}")
        return False

def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

def insert_switchgear_values(dataframe):
    try:
        # Iterate over each row in the DataFrame
        with db.session.begin_nested():
            for index, row in dataframe.iterrows():
                # Create a new Switchgear object with values from the DataFrame row
                switchgear = Switchgear(
                    functional_location=row['Functional Location'],
                    report_date=row['Report Date '],
                    defect_from=row['Defect From'],
                    tev_us_in_db=row['TEV/US In DB'],
                    hotspot_delta_t_in_c=row['Hotspot ∆T In ⁰C'],
                    switchgear_type=row['Switchgear Type'],
                    switchgear_brand=row['Switchgear Brand'],
                    substation_name=row['Substation Name'],
                    defect_description_1=row['Defect Description 1'],
                    defect_description_2=row['Defect Description 2'],
                    defect_owner=row['Defect Owner'],
                    latitude=row['latitude'],  # Ensure latitude is included
                    longitude=row['longitude']  # Ensure longitude is included
                )
                # Add the Switchgear object to the session
                db.session.add(switchgear)

        # Commit the changes to the database
        db.session.commit()
        
        # Return success message
        return {'message': 'Data inserted successfully'}, 200

    except Exception as e:
        # If an error occurs, rollback the changes and return error message
        db.session.rollback()
        return {'error': str(e)}, 500

def add_pending_switchgear_record(row):
    try:
        pending_switchgear = PendingSwitchgear(
            functional_location=row['Functional Location'],
            report_date=row['Report Date '],
            defect_from=row['Defect From'],
            tev_us_in_db=row['TEV/US In DB'],
            hotspot_delta_t_in_c=row['Hotspot ∆T In ⁰C'],
            switchgear_type=row['Switchgear Type'],
            switchgear_brand=row['Switchgear Brand'],
            substation_name=row['Substation Name'],
            defect_description_1=row['Defect Description 1'],
            defect_description_2=row['Defect Description 2'],
            defect_owner=row['Defect Owner'],
            latitude=row['latitude'],  # Ensure latitude is included
            longitude=row['longitude']  # Ensure longitude is included
        )
        db.session.add(pending_switchgear)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding pending switchgear record: {e}")
        return False

def add_switchgear_record(row):
    try:
        switchgear = Switchgear(
            functional_location=row['Functional Location'],
            report_date=row['Report Date '],
            defect_from=row['Defect From'],
            tev_us_in_db=row['TEV/US In DB'],
            hotspot_delta_t_in_c=row['Hotspot ∆T In ⁰C'],
            switchgear_type=row['Switchgear Type'],
            switchgear_brand=row['Switchgear Brand'],
            substation_name=row['Substation Name'],
            defect_description_1=row['Defect Description 1'],
            defect_description_2=row['Defect Description 2'],
            defect_owner=row['Defect Owner'],
            latitude=row['latitude'],  # Ensure latitude is included
            longitude=row['longitude']  # Ensure longitude is included
        )
        db.session.add(switchgear)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding switchgear record: {e}")
        return False

def move_pending_to_approved(pending_id: int, message: str) -> bool:
    try:
        pending_record = PendingSwitchgear.query.get(pending_id)
        if pending_record:
            switchgear = Switchgear(
                functional_location=pending_record.functional_location,
                report_date=pending_record.report_date,
                defect_from=pending_record.defect_from,
                tev_us_in_db=pending_record.tev_us_in_db,
                hotspot_delta_t_in_c=pending_record.hotspot_delta_t_in_c,
                switchgear_type=pending_record.switchgear_type,
                switchgear_brand=pending_record.switchgear_brand,
                substation_name=pending_record.substation_name,
                defect_description_1=pending_record.defect_description_1,
                defect_description_2=pending_record.defect_description_2,
                defect_owner=pending_record.defect_owner,
                latitude=pending_record.latitude,  # Ensure latitude is included
                longitude=pending_record.longitude  # Ensure longitude is included
            )
            db.session.add(switchgear)
            db.session.delete(pending_record)
            db.session.commit()

            log_approval('approved', message, switchgear.functional_location, switchgear.tev_us_in_db, switchgear.hotspot_delta_t_in_c)
            return True
        return False
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error moving pending record to approved: {e}")
        return False

def reject_pending(pending_id: int, message: str) -> bool:
    try:
        pending_record = PendingSwitchgear.query.get(pending_id)
        if pending_record:
            log_approval('rejected', message, pending_record.functional_location, pending_record.tev_us_in_db, pending_record.hotspot_delta_t_in_c)
            db.session.delete(pending_record)
            db.session.commit()
            return True
        return False
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error rejecting pending record: {e}")
        return False

def log_approval(action: str, message: str, functional_location: str, tev_us_in_db: float, hotspot_delta_t_in_c: float) -> None:
    try:
        logger.debug(f"Preparing to log action: {action}, message: {message}, functional_location: {functional_location}, TEV: {tev_us_in_db}, Hotspot: {hotspot_delta_t_in_c}")
        
        approval_log = ApprovalLog(
            action=action,
            message=message,
            functional_location=functional_location,
            tev_us_in_db=tev_us_in_db,
            hotspot_delta_t_in_c=hotspot_delta_t_in_c
        )
        db.session.add(approval_log)
        
        logger.debug("Attempting to commit the approval log entry.")
        db.session.commit()
        
        logger.debug(f"Approval log committed successfully for action: {action}, functional_location: {functional_location}")
    except Exception as e:
        logger.error(f"Error logging action: {e}")
        db.session.rollback()
        logger.debug("Transaction rolled back due to an error.")
    finally:
        logger.debug(f"Current session state: {db.session.identity_map}")
        logger.debug(f"Pending changes: {db.session.new}")

        approval_logs = ApprovalLog.query.all()
        logger.debug(f"Approval logs in DB: {[log.id for log in approval_logs]}")
