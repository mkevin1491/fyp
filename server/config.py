import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://admin:83be03823fb8a7eea27a81dd0f1fc3cf91b2a2a9bfe89cda@64.227.116.49:3306/fyp'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
