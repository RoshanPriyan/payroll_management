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

SMTP_HOST=os.getenv("SMTP_HOST")
SMTP_PORT=os.getenv("SMTP_PORT")
SMTP_EMAIL=os.getenv("SMTP_EMAIL")
SMTP_PASSWORD=os.getenv("SMTP_PASSWORD")
SMTP_USERNAME=os.getenv("SMTP_USERNAME")
SMTP_FROM_NAME=os.getenv("SMTP_FROM_NAME")

PAYMENT_TYPES = ["DAILY", "WEEKLY", "MONTHLY"]

BACKEND_URL = os.getenv("BACKEND_URL")

FRONTEND_URL = os.getenv("FRONTEND_URL")

PAYMENT_API_KEY=os.getenv("PAYMENT_API_KEY")
PAYMENT_SECRET_KEY=os.getenv("PAYMENT_SECRET_KEY")
PAYMENT_MODE=os.getenv("PAYMENT_MODE")

SUBSCRIPTION_PLAN = {
    1: "FREE",
    2: "STANDARD",
}

SUBSCRIPTION_DAY_COUNT = {
    1: 15,
    2: 30,
}

SUBSCRIPTION_AMOUNT = {
    1: 0,
    2: 10 if PAYMENT_MODE == "TEST" else 49900
}

ENVIRONMENT_MODE = os.getenv("MODE")
