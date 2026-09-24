from sqlalchemy import select
from apis.workers.models import AttendanceModel, WorkerModel
from apis.payments.models import PaymentHistoryModel


def payment_entry_details(tenant_id: int, session, salary_type, attendance_date=None):
    attendance_stmt = (
        select(
            AttendanceModel.id,
            AttendanceModel.worker_id,
            WorkerModel.salary_type
        )
        .select_from(AttendanceModel)
        .join(WorkerModel, WorkerModel.id == AttendanceModel.worker_id)
        .where(AttendanceModel.tenant_id == tenant_id,
               AttendanceModel.attendance_status.in_(['PRESENT', 'HALF_DAY']),
               AttendanceModel.attendance_date == attendance_date,
               WorkerModel.salary_type == salary_type
               )
    )
    attendance_details = session.execute(attendance_stmt).mappings().all()
    bulk_add = []

    for data in attendance_details:
        bulk_add.append(
            PaymentHistoryModel(
                tenant_id=tenant_id,
                worker_id=data.get("worker_id"),
                attendance_id=data.get("id"),
                payment_status="PENDING"
            )
        )
    session.add_all(bulk_add)
