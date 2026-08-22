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
from db_service import DBService


async def payment_process_details_api(
    payment_type: str = Query(...),
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:

    try:
        tenant_id = current_user.get("tenant_id")

        # ---------------------------------------------------------
        # Validate payment type
        # ---------------------------------------------------------
        payment_type = payment_type.upper()

        allowed_payment_types = {"DAILY", "WEEKLY", "MONTHLY"}

        if payment_type not in allowed_payment_types:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="payment_type must be daily, weekly or monthly"
            )

        # ---------------------------------------------------------
        # Current date
        # ---------------------------------------------------------
        today = date.today()

        # ---------------------------------------------------------
        # Calculate date range
        # ---------------------------------------------------------
        if payment_type == "DAILY":

            start_date = today
            end_date = today

        elif payment_type == "WEEKLY":

            # Monday -> Sunday
            start_date = today - timedelta(
                days=today.weekday()
            )

            end_date = start_date + timedelta(days=6)

        else:

            # First day of current month
            start_date = today.replace(day=1)

            # Last day of current month
            last_day = calendar.monthrange(
                today.year,
                today.month
            )[1]

            end_date = today.replace(
                day=last_day
            )

        # ---------------------------------------------------------
        # Get ONLY workers matching selected payment type
        # ---------------------------------------------------------
        worker_stmt = (
            select(
                WorkerModel.id,
                WorkerModel.first_name,
                WorkerModel.last_name,
                WorkerModel.salary_type,
                WorkerModel.salary_amount,
                WorkerModel.payment_mode,
            )
            .where(
                WorkerModel.tenant_id == tenant_id,
                WorkerModel.salary_type == payment_type
            )
        )

        workers = DBService.mappings_all(
            session=session,
            stmt=worker_stmt
        )

        payment_details = []

        total_payable = 0
        completed_payment_today = 0
        pending_payment_today = 0

        # ---------------------------------------------------------
        # Process workers
        # ---------------------------------------------------------
        for worker in workers:

            worker = dict(worker)

            worker_id = worker["id"]

            first_name = worker.pop("first_name")
            last_name = worker.pop("last_name")

            name = (
                f"{first_name} {last_name}"
                if last_name
                else first_name
            )

            salary_type = worker["salary_type"]

            salary_amount = float(
                worker["salary_amount"] or 0
            )

            # -----------------------------------------------------
            # Attendance count
            # -----------------------------------------------------
            attendance_stmt = (
                select(
                    func.count(AttendanceModel.id)
                )
                .where(
                    AttendanceModel.worker_id == worker_id,
                    AttendanceModel.attendance_date >= start_date,
                    AttendanceModel.attendance_date <= end_date,
                    AttendanceModel.attendance_status == "PRESENT"
                )
            )

            present_days = (
                session.execute(
                    attendance_stmt
                ).scalar() or 0
            )

            # -----------------------------------------------------
            # Total days in selected period
            # -----------------------------------------------------
            total_days = (
                end_date - start_date
            ).days + 1

            # -----------------------------------------------------
            # Calculate payable amount
            # -----------------------------------------------------
            payment_amount = 0

            if salary_type.upper() == "DAILY":

                payment_amount = (
                    salary_amount * present_days
                )

            elif salary_type.upper() == "WEEKLY":

                daily_rate = salary_amount / 7

                payment_amount = (
                    daily_rate * present_days
                )

            elif salary_type.upper() == "MONTHLY":

                days_in_month = calendar.monthrange(
                    today.year,
                    today.month
                )[1]

                daily_rate = (
                    salary_amount / days_in_month
                )

                payment_amount = (
                    daily_rate * present_days
                )

            payment_amount = round(
                payment_amount,
                2
            )

            # -----------------------------------------------------
            # Add to total payable
            # -----------------------------------------------------
            total_payable += payment_amount

            # -----------------------------------------------------
            # Payment status
            #
            # NOTE:
            # Your current code does not have a PaymentModel.
            # Therefore we cannot check actual completed payments.
            #
            # For now:
            # If worker has payable amount -> PENDING
            # -----------------------------------------------------
            payment_status = "PENDING"

            if payment_amount > 0:
                pending_payment_today += payment_amount

            # -----------------------------------------------------
            # Worker response
            # -----------------------------------------------------
            payment_details.append(
                {
                    "id": worker_id,
                    "name": name,
                    "salary_type": salary_type,
                    "salary_amount": salary_amount,
                    "payment_mode": worker["payment_mode"],
                    "present_days": present_days,
                    "total_days": total_days,
                    "payment_amount": payment_amount,
                    "payment_status": payment_status
                }
            )

        # ---------------------------------------------------------
        # Response
        # ---------------------------------------------------------
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payment process details fetched successfully",
            data={
                "payment_type": payment_type,
                "start_date": start_date,
                "end_date": end_date,

                "summary": {
                    "total_payable": round(
                        total_payable,
                        2
                    ),
                    "pending_payment_today": round(
                        pending_payment_today,
                        2
                    ),
                    "completed_payment_today": round(
                        completed_payment_today,
                        2
                    )
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
