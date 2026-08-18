from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, or_
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from auth import require_admin
from apis.workers.utils import check_existing_worker


async def worker_byid_api(
    worker_id: int,
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        worker = check_existing_worker(worker_id, tenant_id, session)

        if not worker:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )

        worker_data = {
            "id": worker.id,
            "first_name": worker.first_name,
            "last_name": worker.last_name,
            "phone": worker.phone,
            "email": worker.email,
            "gender": worker.gender,
            "joining_date": worker.joining_date,
            "salary_type": worker.salary_type,
            "salary_amount": worker.salary_amount,
            "payment_mode": worker.payment_mode,
            "bank_name": worker.bank_name,
            "account_number": worker.account_number,
            "ifsc_code": worker.ifsc_code,
            "upi_id": worker.upi_id,
            "status": worker.status
        }

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Worker list fetched successfully",
            data=worker_data
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
