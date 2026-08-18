from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from apis.workers.models import AttendanceModel
from apis.workers.schemas import CreateAttendanceSchema
from db_service import DBService


async def create_attendance_api(
    data: CreateAttendanceSchema,
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        data = data.model_dump()

        tenant_id = current_user.get("tenant_id")
        attendance_date = data.get("attendance_date")
        workers = data.get("workers", [])

        attendance_records = []

        for item in workers:

            worker_id = item.get("worker_id")
            attendance_status = item.get("attendance_status")

            worker = DBService.scalars_first(
                session=session,
                model=WorkerModel,
                id=worker_id,
                tenant_id=tenant_id,
                status="ACTIVE"
            )

            if not worker:
                raise CustomException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Worker not found: {worker_id}"
                )

            existing_attendance = DBService.scalars_first(
                session=session,
                model=AttendanceModel,
                worker_id=worker_id,
                attendance_date=attendance_date
            )

            if existing_attendance:
                raise CustomException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Attendance already marked for worker {worker_id}"
                )

            attendance_records.append(
                AttendanceModel(
                    tenant_id=tenant_id,
                    business_id=worker.business_id,
                    worker_id=worker_id,
                    attendance_date=attendance_date,
                    attendance_status=attendance_status
                )
            )

        session.add_all(attendance_records)
        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Attendance marked successfully"
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
