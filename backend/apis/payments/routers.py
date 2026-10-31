from fastapi import APIRouter
from apis.payments.controllers.payment_history_api import payment_history_api
from apis.payments.controllers.create_order_api import create_order_api
from apis.payments.controllers.verify_payment_api import verify_payment_api


router = APIRouter(prefix="/api/v1/payment", tags=["Payment"])


router.add_api_route("/history", payment_history_api, methods=["POST"])
router.add_api_route("/create-order", create_order_api, methods=["POST"])
router.add_api_route("/verify", verify_payment_api, methods=["POST"])
