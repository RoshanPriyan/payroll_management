from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from auth import require_admin
from apis.business.models import BusinessModel
from apis.locations.models import CountryModel, StateModel, CityModel
from global_utils import success_response, CustomException


async def get_business_details_api(
        session: Session = Depends(get_db),
        token_user = Depends(require_admin)
) -> dict:
    try:
        tenant_id = token_user.get("tenant_id")
        business_stmt = (
            select(
                BusinessModel.id,
                BusinessModel.business_name,
                BusinessModel.business_type,
                BusinessModel.status,
                BusinessModel.zip_code,
                CountryModel.name.label("country"),
                StateModel.name.label("state"),
                CityModel.name.label("city"),
            )
            .select_from(BusinessModel)
            .outerjoin(CountryModel, CountryModel.id == BusinessModel.country_id)
            .outerjoin(StateModel, StateModel.id == BusinessModel.state_id)
            .outerjoin(CityModel, CityModel.id == BusinessModel.city_id)
            .where(BusinessModel.tenant_id == tenant_id)
        )
        bus_data = session.execute(business_stmt).mappings().first()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Worker list fetched successfully",
            data=dict(bus_data)
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
