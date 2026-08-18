from fastapi import APIRouter
from apis.users.routers import router as user_router
from apis.locations.routers import router as location_router
from apis.tenant.routers import router as tenant_router
from apis.business.routers import router as business_router
from apis.platform_users.routers import router as admin_router
from apis.workers.routers import router as worker_router


router = APIRouter()

router.include_router(user_router)
router.include_router(location_router)
router.include_router(tenant_router)
router.include_router(business_router)
router.include_router(admin_router)
router.include_router(worker_router)