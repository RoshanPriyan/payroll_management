from fastapi import status
from sqlalchemy import select
from apis.tenant.models import TenantModel
from global_utils import CustomException 


def get_tenant_detail(session, tenant_name=None, tenant_id=None):

    filters = []

    if tenant_id:
        filters.append(TenantModel.id == tenant_id)

    if tenant_name:
        filters.append(TenantModel.tenant_name == tenant_name)

    tenant_stmt = select(TenantModel).where(*filters)
    tenant_detail = session.execute(tenant_stmt).scalars().first()

    if not tenant_detail:
        raise CustomException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    return tenant_detail
