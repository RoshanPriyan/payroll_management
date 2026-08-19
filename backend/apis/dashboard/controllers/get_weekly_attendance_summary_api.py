from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func, case
import traceback
from datetime import date, timedelta
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import AttendanceModel


async def get_weekly_attendance_summary_api(
        session: Session = Depends(get_db),
        token_user=Depends(require_admin)
) -> dict:
    try:
        tenant_id = token_user.get("tenant_id")

        end_date = date.today()
        start_date = end_date - timedelta(days=6)

        stmt = (
            select(
                AttendanceModel.attendance_date.label("date"),

                func.sum(
                    case(
                        (AttendanceModel.attendance_status == "PRESENT", 1),
                        else_=0
                    )
                ).label("present"),

                func.sum(
                    case(
                        (AttendanceModel.attendance_status == "ABSENT", 1),
                        else_=0
                    )
                ).label("absent"),

                func.sum(
                    case(
                        (AttendanceModel.attendance_status == "HALF_DAY", 1),
                        else_=0
                    )
                ).label("half_day")
            )
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date.between(start_date, end_date)
            )
            .group_by(AttendanceModel.attendance_date)
            .order_by(AttendanceModel.attendance_date)
        )

        records = session.execute(stmt).mappings().all()

        attendance_map = {
            row["date"]: {
                "present": row["present"] or 0,
                "absent": row["absent"] or 0,
                "half_day": row["half_day"] or 0
            }
            for row in records
        }

        response_data = []

        current_date = start_date
        while current_date <= end_date:
            day_data = attendance_map.get(
                current_date,
                {
                    "present": 0,
                    "absent": 0,
                    "half_day": 0
                    }
            )

            response_data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day": current_date.strftime("%a"),  # Mon, Tue, Wed, Thu, Fri, Sat, Sun
                **day_data
            })

            current_date += timedelta(days=1)

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Weekly attendance summary fetched successfully",
            data=response_data
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
