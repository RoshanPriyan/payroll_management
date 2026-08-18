from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import traceback
from database import get_db
from global_utils import success_response, CustomException
from auth import require_admin
from apis.workers.utils import check_existing_worker


async def delete_worker_api(
        worker_id: int,
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
)-> dict:
    try:
        tenant_id = current_user.get("tenant_id")
        worker = check_existing_worker(worker_id, tenant_id, session)

        if not worker:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )
        session.delete(worker)
        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Worker deleted successfully"
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
