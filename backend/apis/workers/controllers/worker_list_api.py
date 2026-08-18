from fastapi import Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, or_
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from auth import require_admin


async def worker_list_api(
    search: str | None = Query(None),
    salary_type: str | None = Query(None),
    current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        if not tenant_id:
            raise CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tenant information not found"
            )

        filters = [WorkerModel.tenant_id == tenant_id]

        # Search by first name, last name or phone
        if search:
            search_value = f"%{search.strip()}%"

            filters.append(
                or_(
                    WorkerModel.first_name.ilike(search_value),
                    WorkerModel.last_name.ilike(search_value),
                    WorkerModel.phone.ilike(search_value)
                )
            )

        # Salary type filter
        if salary_type:
            allowed_salary_types = {"DAILY", "WEEKLY", "MONTHLY"}

            salary_type = salary_type.upper()

            if salary_type not in allowed_salary_types:
                raise CustomException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid salary type. Allowed values are DAILY, WEEKLY and MONTHLY"
                )

            filters.append(WorkerModel.salary_type == salary_type)

        worker_stmt = (
            select(WorkerModel)
            .where(*filters)
            .order_by(WorkerModel.id.desc())
        )

        workers = session.execute(worker_stmt).scalars().all()

        worker_list = []

        for worker in workers:
            worker_list.append({
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
            })

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Worker list fetched successfully",
            data=worker_list
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
