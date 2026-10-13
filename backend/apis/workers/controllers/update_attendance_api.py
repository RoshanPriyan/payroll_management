from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import AttendanceModel
from apis.workers.schemas import AttendanceUpdateSchema
from db_service import DBService


async def update_attendance_api(
        data: AttendanceUpdateSchema,
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
) -> dict:
    try:
        data = data.model_dump()

        tenant_id = current_user.get("tenant_id")
        attendance_status = data.get("status")
        remarks = data.get("remarks")
        attendance_id = data.get("id")

        existing_attendance = DBService.scalars_first(
            session=session,
            model=AttendanceModel,
            id=attendance_id,
            tenant_id=tenant_id
        )
        print(attendance_status)
        if not existing_attendance:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )
        
        existing_attendance.attendance_status = attendance_status
        existing_attendance.remarks = remarks
        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Attendance updated successfully"
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
