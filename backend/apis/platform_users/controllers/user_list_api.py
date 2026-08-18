from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.platform_users.models import PlatformUserModel
from apis.platform_users.utils import require_super_admin


async def admin_user_list_api(
        session: Session = Depends(get_db),
        _ = Depends(require_super_admin)
) -> dict:
    try:
        get_user_list_stmt = select(
            PlatformUserModel.id,
            PlatformUserModel.first_name,
            PlatformUserModel.last_name,
            PlatformUserModel.email,
            PlatformUserModel.is_active.label('status'),
            PlatformUserModel.created_at,
            PlatformUserModel.updated_at
        )
        get_user_list = session.execute(get_user_list_stmt).mappings().all()

        admin_user_list = []
        for data in get_user_list:
            data = dict(data)
            data['created_at'] = data.get('created_at').strftime('%Y-%m-%d %H:%M:%S')
            data['updated_at'] = data.get('updated_at').strftime('%Y-%m-%d %H:%M:%S')
            data['status'] = 'Active' if data.get('status') else 'Inactive'
            admin_user_list.append(data)

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Admin user list retrieved successfully",
            data=admin_user_list
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
