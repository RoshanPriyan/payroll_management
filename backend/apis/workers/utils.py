from sqlalchemy import select
from apis.business.models import BusinessModel
from apis.workers.models import WorkerModel


def get_business_details(tenant_id, session):
    business_details_stmt = select(BusinessModel).where(BusinessModel.tenant_id == tenant_id)
    business_details = session.execute(business_details_stmt).scalars().first()
    return business_details.id

def check_existing_worker(worker_id, tenant_id, session):
    worker_stmt = select(WorkerModel).where(
        WorkerModel.id == worker_id, WorkerModel.tenant_id == tenant_id)
    worker = session.execute(worker_stmt).scalars().first()
    return worker
