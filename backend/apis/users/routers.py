from fastapi import APIRouter
from apis.users.controllers.user_register_api import user_register_api
from apis.users.controllers.user_login_api import user_login_api
from apis.users.controllers.get_user_details_api import user_detail_api
from apis.users.controllers.update_user_profile_api import update_user_profile_api
from apis.users.controllers.forgot_password_api import update_forgot_password_api


router = APIRouter(prefix="/api/v1/users", tags=["Users"])


router.add_api_route("/register", user_register_api, methods=["POST"])
router.add_api_route("/login", user_login_api, methods=["POST"])
router.add_api_route("/user-detail", user_detail_api, methods=["GET"])
router.add_api_route("/update-user-profile", update_user_profile_api, methods=["PUT"])
router.add_api_route("/forgot-password", update_forgot_password_api, methods=["PUT"])
