from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, and_
from datetime import date
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel, AttendanceModel
from apis.payments.models import PaymentHistoryModel


async def get_payroll_widgets_api(
        session: Session = Depends(get_db),
        token_user=Depends(require_admin)
) -> dict:
    try:
        tenant_id = token_user.get("tenant_id")
        today = date.today()

        stmt = (
            select(
                AttendanceModel.attendance_status,
                WorkerModel.salary_amount,
                PaymentHistoryModel.amount_paid,
                PaymentHistoryModel.payment_status
            )
            .select_from(AttendanceModel)
            .join(WorkerModel, WorkerModel.id == AttendanceModel.worker_id)
            .join(
                PaymentHistoryModel,
                and_(
                    PaymentHistoryModel.worker_id == AttendanceModel.worker_id,
                    PaymentHistoryModel.attendance_id == AttendanceModel.id
                )
            )
            .where(
                AttendanceModel.tenant_id == tenant_id,
                AttendanceModel.attendance_date == today,
                AttendanceModel.attendance_status.in_(["PRESENT", "HALF_DAY"]),
                WorkerModel.salary_type == "DAILY"
            )
        )
        results = session.execute(stmt).mappings().all()
        worker_count = 0
        total_payable = 0.0
        paid_amount = 0.0

        for row in results:
            worker_count += 1

            salary_amount = float(row["salary_amount"] or 0)

            if row["attendance_status"] == "HALF_DAY":
                total_payable += salary_amount / 2
            else:
                total_payable += salary_amount

            if row["payment_status"] == "PAID":
                paid_amount += float(row["amount_paid"] or 0)

        remaining_amount = total_payable - paid_amount

        paid_percentage = round((paid_amount / total_payable) * 100, 2) if total_payable > 0 else 0

        response_data = {
            "daily": {
                "payment_date": today,
                "worker_count": worker_count,
                "total_payable": round(total_payable, 2),
                "paid_amount": round(paid_amount, 2),
                "remaining_amount": round(remaining_amount, 2),
                "paid_percentage": paid_percentage
            }
        }

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payroll widget summary retrieved successfully",
            data=response_data
        )

    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )