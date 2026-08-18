from fastapi import Depends, status
from sqlalchemy.orm import Session 
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from apis.locations.models import CountryModel
from global_utils import success_response, CustomException

async def get_country_list_api(
        session: Session = Depends(get_db)
) -> dict:
    try:
        country_stmt = select(CountryModel.id, CountryModel.name)
        country_data = session.execute(country_stmt).mappings().all()

        country_list = [
            dict(location)
            for location in country_data
        ]
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Country list retrieved successfully",
            data=country_list
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
