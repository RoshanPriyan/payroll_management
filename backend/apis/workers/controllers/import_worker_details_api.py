from fastapi import Depends, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from datetime import datetime
from io import StringIO
import traceback
import csv
from database import get_db
from global_utils import success_response, CustomException
from apis.workers.models import WorkerModel
from auth import require_admin
from apis.workers.utils import get_business_details


async def import_worker_api(
        file: UploadFile = File(...),
        current_user: dict = Depends(require_admin),
        session: Session = Depends(get_db)
) -> dict:
    try:
        content = await file.read()
        csv_data = StringIO(content.decode("utf-8"))
        reader = csv.DictReader(csv_data)

        tenant_id = current_user.get("tenant_id")
        business_id = get_business_details(tenant_id, session)

        required_fields = ["first_name", "phone", "joining_date", "salary_type", "salary_amount", "payment_mode"]
        allowed_payment_modes = ["CASH", "BANK", "UPI"]

        success_count = 0
        failed_count = 0
        errors = []

        uploaded_phones = set()

        for row_number, row in enumerate(reader, start=2):

            # Skip empty rows
            if not any(value.strip() for value in row.values() if value):
                continue

            try:
                # Validate required fields
                missing_fields = [
                    field for field in required_fields
                    if not row.get(field) or not row.get(field).strip()
                ]

                if missing_fields:
                    failed_count += 1
                    errors.append({
                        "row": row_number,
                        "message": f"Missing fields: {', '.join(missing_fields)}"
                    })
                    continue

                phone = row.get("phone").strip()
                payment_mode = row.get("payment_mode").strip().upper()

                # Check duplicate phone in uploaded CSV
                if phone in uploaded_phones:
                    failed_count += 1
                    errors.append({
                        "row": row_number,
                        "message": f"Duplicate phone number {phone} found in uploaded file"
                    })
                    continue

                uploaded_phones.add(phone)

                # Check duplicate phone in database
                existing_worker_stmt = select(WorkerModel).where(
                    WorkerModel.tenant_id == tenant_id,
                    WorkerModel.phone == phone
                )
                existing_worker = session.execute(existing_worker_stmt).scalar_one_or_none()

                if existing_worker:
                    failed_count += 1
                    errors.append({"row": row_number, "message": f"Worker already exists with phone {phone}"})
                    continue

                # Validate payment mode
                if payment_mode not in allowed_payment_modes:
                    failed_count += 1
                    errors.append({
                        "row": row_number,
                        "message": f"Invalid payment mode: {payment_mode}"
                    })
                    continue

                bank_name = (row.get("bank_name") or "").strip()
                account_number = (row.get("account_number") or "").strip()
                ifsc_code = (row.get("ifsc_code") or "").strip()
                upi_id = (row.get("upi_id") or "").strip()

                # Validate BANK payment details
                if payment_mode == "BANK":
                    if not all([bank_name, account_number, ifsc_code]):
                        failed_count += 1
                        errors.append({
                            "row": row_number,
                            "message": "Bank name, account number and IFSC code are required"
                        })
                        continue

                # Validate UPI payment details
                if payment_mode == "UPI" and not upi_id:
                    failed_count += 1
                    errors.append({"row": row_number, "message": "UPI ID is required"})
                    continue

                worker = WorkerModel(
                    tenant_id=tenant_id,
                    business_id=business_id,
                    first_name=row.get("first_name").strip(),
                    last_name=(row.get("last_name") or "").strip(),
                    phone=phone,
                    email=(row.get("email") or "").strip(),
                    gender=(row.get("gender") or "").strip(),
                    joining_date=datetime.strptime(row.get("joining_date").strip(),"%d/%m/%Y"),
                    salary_type=row.get("salary_type").strip().upper(),
                    salary_amount=row.get("salary_amount"),
                    payment_mode=payment_mode,
                    bank_name=bank_name,
                    account_number=account_number,
                    ifsc_code=ifsc_code,
                    upi_id=upi_id,
                )
                session.add(worker)
                success_count += 1

            except Exception as e:
                failed_count += 1
                errors.append({"row": row_number, "message": str(e)})

        session.commit()

        return success_response(
            status_code=status.HTTP_201_CREATED,
            details="Worker import successfully",
            data={
                "total_records": success_count + failed_count,
                "success_count": success_count,
                "failed_count": failed_count,
                "errors": errors
            }
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
    except Exception as e:
        raise CustomException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            trace_back=traceback.format_exc()
        )
