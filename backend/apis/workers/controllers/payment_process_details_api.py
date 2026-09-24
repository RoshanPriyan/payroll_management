from fastapi import Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
from datetime import date, timedelta
import calendar
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel, AttendanceModel
from apis.payments.models import PaymentHistoryModel
from db_service import DBService
from config import PAYMENT_TYPES


async def payment_process_details_api(
        payment_type: str = Query(...),
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        payment_type = payment_type.upper()

        if payment_type not in PAYMENT_TYPES:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"payment_type must be {', '.join(PAYMENT_TYPES)}"
            )

        today = date.today()

        # =========================================================
        # DAILY
        # =========================================================
        if payment_type == "DAILY":

            start_date = today
            end_date = today

            worker_stmt = (
                select(
                    WorkerModel.id,
                    WorkerModel.first_name,
                    WorkerModel.last_name,
                    WorkerModel.salary_type,
                    WorkerModel.salary_amount,
                    WorkerModel.payment_mode,
                    PaymentHistoryModel.payment_status,
                    PaymentHistoryModel.amount_paid
                )
                .select_from(WorkerModel)
                .join(AttendanceModel, AttendanceModel.worker_id == WorkerModel.id)
                .join(PaymentHistoryModel, PaymentHistoryModel.attendance_id == AttendanceModel.id)
                .where(
                    WorkerModel.tenant_id == tenant_id,
                    WorkerModel.salary_type == "DAILY",
                    AttendanceModel.attendance_date == today
                )
            )
            workers_res = DBService.mappings_all(session=session, stmt=worker_stmt)

        # =========================================================
        # WEEKLY
        # =========================================================
        elif payment_type == "WEEKLY":

            # Monday -> Sunday
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)

            # -----------------------------------------------------
            # Get workers only
            # DISTINCT is important because one worker can have
            # multiple attendance records in the same week.
            # -----------------------------------------------------

            worker_stmt = (
                select(
                    WorkerModel.id,
                    WorkerModel.first_name,
                    WorkerModel.last_name,
                    WorkerModel.salary_type,
                    WorkerModel.salary_amount,
                    WorkerModel.payment_mode
                )
                .select_from(WorkerModel)
                .join(AttendanceModel, AttendanceModel.worker_id == WorkerModel.id)
                .where(
                    WorkerModel.tenant_id == tenant_id,
                    WorkerModel.salary_type == "WEEKLY",
                    AttendanceModel.attendance_date >= start_date,
                    AttendanceModel.attendance_date <= end_date
                )
                .distinct()
            )

            workers_res = DBService.mappings_all(session=session, stmt=worker_stmt)

        # =========================================================
        # MONTHLY
        # =========================================================
        else:

            start_date = today.replace(day=1)

            last_day = calendar.monthrange(today.year, today.month)[1]

            end_date = today.replace(day=last_day)

            worker_stmt = (
                select(
                    WorkerModel.id,
                    WorkerModel.first_name,
                    WorkerModel.last_name,
                    WorkerModel.salary_type,
                    WorkerModel.salary_amount,
                    WorkerModel.payment_mode
                )
                .select_from(WorkerModel)
                .join(AttendanceModel, AttendanceModel.worker_id == WorkerModel.id)
                .where(
                    WorkerModel.tenant_id == tenant_id,
                    WorkerModel.salary_type == "MONTHLY",
                    AttendanceModel.attendance_date >= start_date,
                    AttendanceModel.attendance_date <= end_date
                )
                .distinct()
            )

            workers_res = DBService.mappings_all(session=session, stmt=worker_stmt)

        # =========================================================
        # COMMON PROCESSING
        # =========================================================

        total_payable = 0
        completed_payment_today = 0
        pending_payment_today = 0

        payment_details = []

        total_days = (end_date - start_date).days + 1

        for worker in workers_res:
            worker = dict(worker)
            worker_id = worker.get("id")
            first_name = worker.get("first_name")
            last_name = worker.get("last_name")
            name = f"{first_name} {last_name}" if last_name else first_name
            salary_type = worker.get("salary_type")
            salary_amount = float(worker.get("salary_amount") or 0)

            # =====================================================
            # GET PRESENT DAYS
            # =====================================================

            attendance_stmt = (
                select(func.count(AttendanceModel.id))
                .where(
                    AttendanceModel.worker_id == worker_id,
                    AttendanceModel.attendance_date >= start_date,
                    AttendanceModel.attendance_date <= end_date,
                    AttendanceModel.attendance_status == "PRESENT"
                )
            )

            present_days = session.execute(attendance_stmt).scalar() or 0

            # =====================================================
            # CALCULATE PAYMENT
            # =====================================================

            payment_amount = 0

            if salary_type == "DAILY":
                payment_amount = (salary_amount * present_days)
            elif salary_type == "WEEKLY":
                daily_rate = salary_amount / 7
                payment_amount = daily_rate * present_days
            elif salary_type == "MONTHLY":
                days_in_month = calendar.monthrange(today.year, today.month)[1]
                daily_rate = salary_amount / days_in_month
                payment_amount = daily_rate * present_days

            payment_amount = round(payment_amount, 2)

            # =====================================================
            # PAYMENT HISTORY
            # =====================================================

            paid_amount = 0
            payment_status = "PENDING"

            if payment_type == "DAILY":
                # Daily already has attendance_id
                # and payment history entry.

                paid_amount = float(worker.get("amount_paid") or 0)
                payment_status = (worker.get("payment_status") or "PENDING")
            else:
                # -------------------------------------------------
                # WEEKLY / MONTHLY
                #
                # PaymentHistory is created only once.
                # Therefore don't join it with attendance above.
                # -------------------------------------------------

                payment_history_stmt = (
                    select(
                        PaymentHistoryModel.amount_paid,
                        PaymentHistoryModel.payment_status
                    )
                    .join(
                        AttendanceModel,
                        PaymentHistoryModel.attendance_id
                        == AttendanceModel.id
                    )
                    .where(
                        AttendanceModel.worker_id == worker_id,
                        PaymentHistoryModel.payment_date >= start_date,
                        PaymentHistoryModel.payment_date <= end_date
                    )
                    .limit(1)
                )

                payment_history = (DBService.mappings_first(session=session, stmt=payment_history_stmt))

                if payment_history:
                    payment_history = dict(payment_history)

                    paid_amount = float(payment_history.get("amount_paid") or 0)
                    payment_status = (payment_history.get("payment_status") or "PENDING")

            # =====================================================
            # SUMMARY
            # =====================================================

            total_payable += payment_amount

            if payment_status == "PAID":
                completed_payment_today += paid_amount

            # =====================================================
            # WORKER RESPONSE
            # =====================================================

            payment_details.append(
                {
                    "id": worker_id,
                    "name": name,
                    "salary_type": salary_type,
                    "salary_amount": salary_amount,
                    "payment_mode": worker["payment_mode"],
                    "present_days": present_days,
                    "total_days": total_days,
                    "payment_amount": round(payment_amount, 2),
                    "paid_amount": round(paid_amount, 2),
                    "payment_status": payment_status
                }
            )

        # =========================================================
        # FINAL SUMMARY
        # =========================================================

        pending_payment_today = (total_payable - completed_payment_today)

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payment process details fetched successfully",
            data={
                "payment_type": payment_type,
                "start_date": start_date,
                "end_date": end_date,
                "summary": {
                    "total_payable": round(total_payable, 2),
                    "pending_payment_today": round(pending_payment_today, 2),
                    "completed_payment_today": round(completed_payment_today, 2)
                },
                "workers": payment_details
            }
        )

    except SQLAlchemyError as e:

        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
