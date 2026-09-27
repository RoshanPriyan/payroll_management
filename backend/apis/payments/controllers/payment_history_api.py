from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
from math import ceil
import traceback
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.payments.models import PaymentHistoryModel
from apis.workers.models import WorkerModel
from apis.users.utils import get_full_name
from db_service import DBService
from apis.payments.schemas import PaymentHistorySchema


async def payment_history_api(
        payload: PaymentHistorySchema,
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")

        # Filters
        filters = [PaymentHistoryModel.tenant_id == tenant_id]

        if payload.payment_type:
            filters.append(WorkerModel.salary_type == payload.payment_type)
        if payload.payment_mode:
            filters.append(WorkerModel.payment_mode == payload.payment_mode)
        if payload.start_date:
            filters.append(PaymentHistoryModel.payment_date >= payload.start_date)
        if payload.end_date:
            filters.append(PaymentHistoryModel.payment_date <= payload.end_date)

        # Total Records Count
        total_records_stmt = (
            select(func.count())
            .select_from(PaymentHistoryModel)
            .join(WorkerModel, WorkerModel.id == PaymentHistoryModel.worker_id)
            .where(*filters)
        )
        total_records = (session.execute(total_records_stmt).scalars().first())

        # Pagination
        offset = (payload.page - 1) * payload.limit

        # Payment History Query
        payment_history_stmt = (
            select(
                PaymentHistoryModel.id,
                PaymentHistoryModel.payment_status.label("status"),
                PaymentHistoryModel.amount_paid,
                PaymentHistoryModel.payment_date,
                WorkerModel.first_name,
                WorkerModel.last_name,
                WorkerModel.salary_type,
                WorkerModel.payment_mode
            )
            .select_from(PaymentHistoryModel)
            .join(WorkerModel, WorkerModel.id == PaymentHistoryModel.worker_id)
            .where(*filters)
            .order_by(PaymentHistoryModel.payment_date.desc())
            .offset(offset)
            .limit(payload.limit)
        )

        payment_history_res = DBService.mappings_all(session=session, stmt=payment_history_stmt)
        payment_history = []

        for data in payment_history_res:
            data = dict(data)

            first_name = data.pop("first_name")
            last_name = data.pop("last_name")

            payment_date = data.get("payment_date")

            data["payment_date"] = payment_date.strftime("%Y-%m-%d %H:%M:%S") if payment_date else None

            data["user_name"] = get_full_name(first_name, last_name)
            payment_history.append(data)

        # Total Pages
        total_pages = ceil(total_records / payload.limit) if total_records else 0

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payment history retrieved successfully",
            data=payment_history,
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
