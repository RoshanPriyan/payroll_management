from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.users.schemas import UpdateUserProfileSchema
from apis.users.models import UserProfileModel
from apis.locations.models import CountryModel, StateModel, CityModel
from auth import require_admin


async def update_user_profile_api(
    data: UpdateUserProfileSchema,
    session: Session = Depends(get_db),
    token_user=Depends(require_admin)
) -> dict:
    try:
        user_id = token_user.get("user_id")

        update_data = data.model_dump(exclude_unset=True)
        update_data = {k: v for k, v in update_data.items() if v is not None}

        existing_user_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user_id)
        existing_user = session.execute(existing_user_stmt).scalars().first()

        if not existing_user:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        # Validate country
        if update_data.get("country_id"):
            country = session.get(CountryModel, update_data["country_id"])
            if not country:
                raise CustomException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Country not found"
                )

        # Validate state
        if update_data.get("state_id"):
            state = session.get(StateModel, update_data["state_id"])
            if not state:
                raise CustomException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="State not found"
                )

        # Validate city
        if update_data.get("city_id"):
            city = session.get(CityModel, update_data["city_id"])
            if not city:
                raise CustomException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="City not found"
                )

        # Update fields dynamically
        for field, value in update_data.items():
            setattr(existing_user, field, value)

        session.commit()
        session.refresh(existing_user)

        return success_response(
            status_code=status.HTTP_200_OK,
            details="User profile updated successfully"
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )