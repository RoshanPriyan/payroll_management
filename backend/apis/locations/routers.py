from fastapi import APIRouter
from apis.locations.controllers.country_list_api import get_country_list_api
from apis.locations.controllers.state_list_api import get_state_list_byid_api
from apis.locations.controllers.city_list_api import get_city_list_byid_api


router = APIRouter(prefix="/api/v1/location", tags=["Locations"])


router.add_api_route("/country-list", get_country_list_api, methods=["GET"])
router.add_api_route("/state-list", get_state_list_byid_api, methods=["GET"])
router.add_api_route("/city-list", get_city_list_byid_api, methods=["GET"])
