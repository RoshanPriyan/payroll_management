from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
from datetime import date
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import AttendanceModel
from apis.workers.models import WorkerModel


async def attendance_summary_api(
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        today = date.today()

        total_workers = session.scalar(
            select(func.count())
            .select_from(WorkerModel)
            .where(
                WorkerModel.tenant_id == tenant_id,
                WorkerModel.status == "ACTIVE"
            )
        )

        present_count = session.scalar(
            select(func.count())
            .select_from(AttendanceModel)
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date == today,
                AttendanceModel.attendance_status == "PRESENT"
            )
        )

        absent_count = session.scalar(
            select(func.count())
            .select_from(AttendanceModel)
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date == today,
                AttendanceModel.attendance_status == "ABSENT"
            )
        )

        half_day_count = session.scalar(
            select(func.count())
            .select_from(AttendanceModel)
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date == today,
                AttendanceModel.attendance_status == "HALF_DAY"
            )
        )

        leave_count = session.scalar(
            select(func.count())
            .select_from(AttendanceModel)
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date == today,
                AttendanceModel.attendance_status == "LEAVE"
            )
        )

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Attendance summary fetched successfully",
            data={
                "total_workers": total_workers,
                "present_count": present_count,
                "absent_count": absent_count,
                "half_day_count": half_day_count,
                "leave_count": leave_count
            }
        )

    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
