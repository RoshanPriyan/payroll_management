from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from apis.workers.schemas import UpdateWorkerSchema
from auth import require_admin


async def update_worker_api(
        data: UpdateWorkerSchema,
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
)-> dict:
    try:
        data = data.model_dump(exclude_unset=True)
        tenant_id = current_user.get("tenant_id")
        worker_id = data.get("worker_id")

        worker_stmt = select(WorkerModel).where(
            WorkerModel.id == worker_id, WorkerModel.tenant_id == tenant_id)
        worker = session.execute(worker_stmt).scalars().first()

        if not worker:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )

        for key, value in data.items():
            if key != "worker_id":
                setattr(worker, key, value)

        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Worker updated successfully"
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
