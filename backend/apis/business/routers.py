from fastapi import APIRouter
from apis.business.controllers.get_business_details_api import get_business_details_api
from apis.business.controllers.update_business_details_api import update_business_details_api


router = APIRouter(prefix="/api/v1/business", tags=["Business"])


router.add_api_route("/byid", get_business_details_api, methods=["GET"])
router.add_api_route("/update-byid", update_business_details_api, methods=["PUT"])

