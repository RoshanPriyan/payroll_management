from dotenv import load_dotenv
import os


load_dotenv()


DB_HOST = os.getenv("MYSQL_HOST")
DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
DB_NAME = os.getenv("MYSQL_DATABASE")
DB_PORT = os.getenv("MYSQL_PORT")

JWT_SECRET = os.getenv("SECRET_KEY")
JWT_ALGORITHM = os.getenv("ALGORITHM")

SUPER_ADMIN_ROLE = os.getenv("SUPER_ADMIN_ROLE")
ADMIN_ROLE = os.getenv("ADMIN_ROLE")

FRONTEND_URL = os.getenv("FRONTEND_URL")

SMTP_HOST=os.getenv("SMTP_HOST")
SMTP_PORT=os.getenv("SMTP_PORT")
SMTP_EMAIL=os.getenv("SMTP_EMAIL")
SMTP_PASSWORD=os.getenv("SMTP_PASSWORD")
