from datetime import datetime, timezone
import random


def success_response(status_code: int, details: str, data=None) -> dict:
    response = {
        "status_code": status_code,
        "success": True,
        "message": details,
        "timestamp": datetime.now().strftime("%m-%d-%Y %H:%M:%S")
    }
    if data:
        response['data'] = data
        
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
