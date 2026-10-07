from fastapi import APIRouter
from apis.audit_logs.controllers.audit_log_list_api import audit_logs_list_api

router = APIRouter(prefix="/api/v1/audit", tags=["Audit Logs"])

router.add_api_route("/logs", audit_logs_list_api, methods=["GET"])