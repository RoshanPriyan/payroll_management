from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from typing import Optional
import traceback
from database import get_db
from apis.locations.models import CityModel
from global_utils import success_response, CustomException

async def get_city_list_byid_api(
        state_id: Optional[int] = None,
        session: Session = Depends(get_db)
) -> dict:
    try:
        filters = []

        if state_id:
            filters.append(CityModel.state_id == state_id)

        state_stmt = select(CityModel.id, CityModel.name).where(*filters)
        state_data = session.execute(state_stmt).mappings().all()

        state_list = [
            dict(state)
            for state in state_data
        ]
        return success_response(
            status_code=status.HTTP_200_OK,
            details="city list retrieved successfully",
            data=state_list
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
