from fastapi import APIRouter
from apis.workers.controllers.create_worker_api import create_worker_api
from apis.workers.controllers.worker_list_api import worker_list_api
from apis.workers.controllers.update_worker_api import update_worker_api
from apis.workers.controllers.get_worker_api import worker_byid_api
from apis.workers.controllers.delete_worker_api import delete_worker_api
from apis.workers.controllers.create_attendance_api import create_attendance_api
from apis.workers.controllers.attendance_summary_api import attendance_summary_api


router = APIRouter(prefix="/api/v1/worker", tags=["Workers"])


router.add_api_route("/register", create_worker_api, methods=["POST"])
router.add_api_route("/list", worker_list_api, methods=["GET"])
router.add_api_route("/update-worker", update_worker_api, methods=["PUT"])
router.add_api_route("/byid", worker_byid_api, methods=["GET"])
router.add_api_route("/delete-worker", delete_worker_api, methods=["DELETE"])
router.add_api_route("/mark-attendance", create_attendance_api, methods=["POST"])
router.add_api_route("/attendance-summary", attendance_summary_api, methods=["GET"])
