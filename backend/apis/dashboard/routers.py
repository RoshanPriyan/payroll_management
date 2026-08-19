from fastapi import APIRouter
from apis.dashboard.controllers.get_weekly_attendance_summary_api import get_weekly_attendance_summary_api


router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


router.add_api_route("/weekly-summary", get_weekly_attendance_summary_api, methods=["GET"])
