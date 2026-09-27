from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
from math import ceil
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import AttendanceModel, WorkerModel
from apis.workers.schemas import AttendanceHistorySchema
from db_service import DBService
from apis.users.utils import get_full_name


async def attendance_history_api(
    payload: AttendanceHistorySchema,
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        filters = [AttendanceModel.tenant_id == tenant_id]

        if payload.status:
            filters.append(AttendanceModel.attendance_status == payload.status)

        if payload.start_date:
            filters.append(AttendanceModel.attendance_date >= payload.start_date)

        if payload.end_date:
            filters.append(AttendanceModel.attendance_date <= payload.end_date)

        # Total Records Count
        total_records_stmt = select(func.count()).select_from(AttendanceModel).where(*filters)
        total_records = session.execute(total_records_stmt).scalars().first()

        # Pagination
        offset = (payload.page - 1) * payload.limit

        attendance_history_stmt = (
            select(
                AttendanceModel.id,
                AttendanceModel.attendance_date,
                AttendanceModel.attendance_status,
                AttendanceModel.remarks,
                WorkerModel.first_name,
                WorkerModel.last_name
            )
            .select_from(AttendanceModel)
            .join(WorkerModel, WorkerModel.id == AttendanceModel.worker_id)
            .where(*filters)
            .order_by(AttendanceModel.attendance_date.desc())
            .offset(offset)
            .limit(payload.limit)
        )

        attendance_history_res = DBService.mappings_all(session, attendance_history_stmt)

        for index, data in enumerate(attendance_history_res):
            data = dict(data)

            first_name = data.pop("first_name")
            last_name = data.pop("last_name")

            data["username"] = get_full_name(first_name, last_name)
            attendance_history_res[index] = data

        total_pages = ceil(total_records / payload.limit) if total_records else 0

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Attendance history fetched successfully",
            data=attendance_history_res,
            pagination={
                "total_records": total_records,
                "total_pages": total_pages,
                "previous_page": payload.page - 1 if payload.page > 1 else None,
                "current_page": payload.page,
                "next_page": payload.page + 1 if payload.page < total_pages else None
            }
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
