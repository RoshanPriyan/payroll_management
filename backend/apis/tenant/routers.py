from fastapi import APIRouter
from apis.tenant.controllers.get_tenant_config_api import get_tenant_config_api


router = APIRouter(prefix="/api/v1/tenant", tags=["Tenants"])
router.add_api_route("/tenant-config", get_tenant_config_api, methods=["GET"])
