from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from apis.workers.schemas import CreateWorkerSchema
from auth import require_admin
from apis.workers.utils import get_business_details


async def create_worker_api(
        data: CreateWorkerSchema,
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
) -> dict:
    try:
        data_dict = data.model_dump()

        tenant_id = current_user.get("tenant_id")
        business_id = get_business_details(tenant_id, session)

        first_name = data_dict.get("first_name")
        last_name = data_dict.get("last_name")
        phone = data_dict.get("phone")
        email = data_dict.get("email")
        gender = data_dict.get("gender")
        joining_date = data_dict.get("joining_date")
        salary_type = data_dict.get("salary_type")
        salary_amount = data_dict.get("salary_amount")
        payment_mode = data_dict.get("payment_mode")
        bank_name = data_dict.get("bank_name")
        account_number = data_dict.get("account_number")
        ifsc_code = data_dict.get("ifsc_code")
        upi_id = data_dict.get("upi_id")

        existing_worker_stmt = select(WorkerModel).where(
            WorkerModel.tenant_id == tenant_id,
            WorkerModel.phone == phone)
        existing_worker = session.execute(existing_worker_stmt).scalar_one_or_none()

        if existing_worker:
            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Worker already exists with this phone number"
            )

        if payment_mode == "BANK":
            if not all([bank_name, account_number, ifsc_code]):
                raise CustomException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bank name, account number and IFSC code are required"
                )

        if payment_mode == "UPI" and not upi_id:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UPI ID is required"
            )

        worker_data = WorkerModel(
            tenant_id=tenant_id,
            business_id=business_id,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email=email,
            gender=gender,
            joining_date=joining_date,
            salary_type=salary_type,
            salary_amount=salary_amount,
            payment_mode=payment_mode,
            bank_name=bank_name,
            account_number=account_number,
            ifsc_code=ifsc_code,
            upi_id=upi_id,
            status="ACTIVE"
        )

        session.add(worker_data)
        session.commit()

        return success_response(
            status_code=status.HTTP_201_CREATED,
            details="Worker created successfully"
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
