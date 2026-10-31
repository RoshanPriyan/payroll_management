from email.message import EmailMessage
from email.utils import formataddr
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from datetime import datetime
import random
import smtplib
from config import SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_USERNAME, SMTP_PASSWORD, FRONTEND_URL


def success_response(status_code: int, details: str, data=None, pagination=None) -> dict:
    response = {
        "status_code": status_code,
        "success": True,
        "message": details,
        "timestamp": datetime.now().strftime("%m-%d-%Y %H:%M:%S")
    }
    if data:
        response['data'] = data

    if pagination:
        response["pagination"] = {
            "total_pages": pagination.get("total_pages", 0),
            "previous_page": pagination.get("previous_page"),
            "current_page": pagination.get("current_page", 1),
            "next_page": pagination.get("next_page")
        }

    return response


class CustomException(Exception):
    def __init__(self, status_code, detail, error=None, trace_back=None, success=False):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.error = error
        self.trace_back = trace_back
        self.success = success


def generate_tenant_code(company_name: str) -> str:
    """
    Generate a unique tenant code using company name,
    current timestamp, and a random 3-digit number.
    """
    return (
            company_name.strip().upper().replace(" ", "_")+ "_"+ datetime.now().strftime("%Y%m%d%H%M%S")
            + str(random.randint(100, 999))
            )


def get_ip_address(request):
    forwarded_for = request.headers.get("X-Forwarded-For")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else None


def get_device_type(request):
    user_agent = request.headers.get("user-agent", "").lower()

    if any(device in user_agent for device in ["ipad", "tablet"]):
        return "TABLET"

    if any(device in user_agent for device in ["iphone", "android", "mobile"]):
        return "MOBILE"

    return "BROWSER"


def format_datetime(date_time):
    return date_time.strftime("%Y-%m-%d %H:%M:%S")


# Adjust this path if your email_utils.py is in another directory
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "templates"

template_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"])
)


SMTP_LOGIN_EMAIL = SMTP_USERNAME
SENDER_EMAIL = "no-reply@payrollpro.com"
SENDER_NAME = "PayrollPro"


def send_activation_email(tenant_id, user_name, email, activation_token, subscription_plan):
    template = template_env.get_template("activate_email.html")

    frontend_url = (FRONTEND_URL or "").rstrip("/")
    if not frontend_url:
        raise ValueError("FRONTEND_URL must be configured to send activation emails")
    
    activation_link = f"{frontend_url}/activate?token={activation_token}"

    expire_duration = "5 Minutes"
    current_year = datetime.now().year

    html_content = template.render(
        user_name=user_name,
        activation_link=activation_link,
        expiry_duration=expire_duration,
        support_email=SMTP_EMAIL,
        current_year=current_year,
        subscription_plan=subscription_plan
    )

    message = EmailMessage()
    message["Subject"] = "Activate your PayrollPro account"
    message["From"] = formataddr((SENDER_NAME, SENDER_EMAIL))
    message["To"] = email

    message.set_content(
        f"Hello {user_name},\n\n"
        f"Activate your PayrollPro account:\n{activation_link}\n\n"
        f"This link expires in {expire_duration}."
    )
    message.add_alternative(html_content, subtype="html")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        server.starttls()
        server.login(SMTP_LOGIN_EMAIL, SMTP_PASSWORD)
        server.send_message(message)
