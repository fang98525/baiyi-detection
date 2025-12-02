import os

class Config:
    # Using pymysql driver
    # Assuming default credentials for dev environment, typically root with no password or root/root
    # User should set DATABASE_URL if different
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:root@localhost/baiyi_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

