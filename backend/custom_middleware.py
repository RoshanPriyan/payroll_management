from fastapi import Request
from sqlalchemy.exc import SQLAlchemyError
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from global_utils import CustomException
import traceback


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response

        except CustomException as e:
            print(traceback.format_exc())  # Log full traceback for debugging
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": e.success,
                    "status_code": e.status_code,
                    "detail": e.detail
                }
            )

        except SQLAlchemyError as e:  # 🔹 Moved this up to handle SQL errors first!
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
