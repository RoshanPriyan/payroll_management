from datetime import datetime, timezone
import random


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
