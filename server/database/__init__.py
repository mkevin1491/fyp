from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc


db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
