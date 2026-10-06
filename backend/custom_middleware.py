from fastapi import Request, Depends
from sqlalchemy.exc import SQLAlchemyError
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from global_utils import CustomException
import traceback
from apis.audit_logs.utils import save_audit_log
from auth import validate_access_token


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            # APIs that should not be stored in audit logs
            excluded_paths = ["/docs", "/redoc", "/openapi.json", "/health"]
            auth_header = request.headers.get("Authorization")

            user_id = None
            tenant_id = None

            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

                payload = validate_access_token(token)

                if payload:
                    user_id = payload.get("user_id")
                    tenant_id = payload.get("tenant_id")

            response = await call_next(request)
            if request.url.path not in excluded_paths:
                await save_audit_log(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    method=request.method,
                    endpoint=request.url.path,
                    status_code=response.status_code
                    )
            return response

        except CustomException as e:
            print(traceback.format_exc())  # Log full traceback for debugging
            if request.url.path not in excluded_paths:
                await save_audit_log(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    method=request.method,
                    endpoint=request.url.path,
                    status_code=response.status_code
                    )
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": e.success,
                    "status_code": e.status_code,
                    "detail": e.detail
                }
            )

        except SQLAlchemyError as e:  # 🔹 Moved this up to handle SQL errors first!
            if request.url.path not in excluded_paths:
                await save_audit_log(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    method=request.method,
                    endpoint=request.url.path,
                    status_code=response.status_code
                    )
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "status_code": 500,
                    "detail": "SQLAlchemy Internal Server Error",
                    "error": str(e),  # Show the actual error message
                    "trace_back": traceback.format_exc(),
                }
            )

        except Exception as e:
            if request.url.path not in excluded_paths:
                await save_audit_log(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    method=request.method,
                    endpoint=request.url.path,
                    status_code=response.status_code
                    )
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "status_code": 500,
                    "detail": "An unexpected error occurred",
                    "error": str(e),
                    "trace_back": traceback.format_exc(),
                }
            )
