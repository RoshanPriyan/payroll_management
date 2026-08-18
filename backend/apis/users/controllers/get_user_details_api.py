from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.users.models import UserModel, UserProfileModel
from apis.locations.models import CountryModel, StateModel, CityModel
from auth import require_admin


async def user_detail_api(
        session: Session = Depends(get_db),
        token_user = Depends(require_admin)
) -> dict:
    try:
        user_id = token_user.get("user_id")
        existing_user_stmt = (
            select(
                UserModel.id,
                UserModel.first_name,
                UserModel.last_name,
                UserModel.phone,
                UserProfileModel.address,
                UserProfileModel.zip_code,
                CityModel.name.label('city'),
                StateModel.name.label('state'),
                CountryModel.name.label('country')
            )
            .select_from(UserModel)
            .join(UserProfileModel)
            .join(CountryModel, CountryModel.id == UserProfileModel.country_id)
            .join(StateModel, StateModel.id == UserProfileModel.state_id)
            .join(CityModel, CityModel.id == UserProfileModel.city_id)
            .where(UserModel.id == user_id)
        )
        existing_user = session.execute(existing_user_stmt).mappings().first()

        if not existing_user:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return success_response(
            status_code=status.HTTP_200_OK,
            details="User detail retrieved successfully",
            data=dict(existing_user)
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
