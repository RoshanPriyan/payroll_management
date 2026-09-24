from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
import traceback
from datetime import date
from database import get_db
from auth import require_admin
from global_utils import success_response, CustomException
from apis.payments.models import PaymentHistoryModel
from db_service import DBService
from background.tasks import create_payment_history
from apis.payments.utils import payment_entry_details


async def payment_history_api(
    # current_user: dict = Depends(require_admin),
    session: Session = Depends(get_db)
) -> dict:
    try:
        payment_entry_details(15, session)
        create_payment_history.delay(15)

        return success_response(
            status_code=status.HTTP_200_OK,
            details="celery task execution"
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )

