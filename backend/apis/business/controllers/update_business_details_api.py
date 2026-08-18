from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from auth import require_admin
from apis.business.models import BusinessModel
from apis.business.schemas import UpdateBusinessSchema
from global_utils import success_response, CustomException


async def update_business_details_api(
        data: UpdateBusinessSchema,
        session: Session = Depends(get_db),
        token_user = Depends(require_admin)
) -> dict:
    try:
        data = data.model_dump(exclude_unset=True)
        tenant_id = token_user.get("tenant_id")
        _id = data.get("id")
        business_stmt = select(BusinessModel).where(BusinessModel.id == _id, BusinessModel.tenant_id == tenant_id)
        business = session.execute(business_stmt).scalars().first()

        if not business:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business id not found"
            )
        for key, value in data.items():
            if key != "_id":
                setattr(business, key, value)

        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="busines data updated successfully",
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
