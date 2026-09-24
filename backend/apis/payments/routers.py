from fastapi import APIRouter
from apis.payments.controllers.payment_history_api import payment_history_api


router = APIRouter(prefix="/api/v1/payment", tags=["Payment"])


router.add_api_route("/payroll", payment_history_api, methods=["GET"])