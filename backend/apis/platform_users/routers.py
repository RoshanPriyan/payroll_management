from fastapi import APIRouter
from apis.platform_users.controllers.login_api import admin_login_api
from apis.platform_users.controllers.create_platform_user_api import admin_register_api
from apis.platform_users.controllers.user_list_api import admin_user_list_api
from apis.platform_users.controllers.active_and_disable_api import update_status_api
from apis.platform_users.controllers.tenant_list_api import tenant_list_api


router = APIRouter(prefix="/api/v1/admin", tags=["Platform Users"])


router.add_api_route("/login", admin_login_api, methods=["POST"])
router.add_api_route("/register", admin_register_api, methods=["POST"])
router.add_api_route("/user-list", admin_user_list_api, methods=["GET"])
router.add_api_route("/status-update", update_status_api, methods=["PUT"])
router.add_api_route("/tenant-list", tenant_list_api, methods=["GET"])
