from fastapi import Depends, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
import razorpay
from datetime import date, timedelta
from database import get_db
from global_utils import CustomException, success_response
from apis.payments.models import PaymentTransactionModel
from apis.payments.schemas import VerifyPaymentSchema
from apis.tenant.models import TenantModel
from apis.users.models import UserModel
from config import SUBSCRIPTION_DAY_COUNT, SUBSCRIPTION_PLAN
from config import PAYMENT_API_KEY, PAYMENT_SECRET_KEY


async def verify_payment_api(
        payload: VerifyPaymentSchema,
        session: Session = Depends(get_db),
) -> dict:
    try:
        transaction = (
            session.query(PaymentTransactionModel)
            .filter(
                PaymentTransactionModel.razorpay_order_id
                == payload.razorpay_order_id
            )
            .with_for_update()
            .first()
        )
        if not transaction:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment transaction not found"
            )

        tenant_data = session.query(TenantModel).filter(TenantModel.id == transaction.tenant_id).with_for_update().first()
        user_data = session.query(UserModel).filter(UserModel.tenant_id == transaction.tenant_id).with_for_update().first()
        if not tenant_data or not user_data:
            raise CustomException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment account was not found")

        if transaction.subscription_id != 2 or SUBSCRIPTION_PLAN.get(transaction.subscription_id) != "STANDARD" or tenant_data.subscription_plan != "STANDARD":
            raise CustomException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction is not for this STANDARD subscription")

        # Safe to retry after a successful verification without extending dates.
        if transaction.payment_status == "SUCCESS":
            if transaction.razorpay_payment_id != payload.razorpay_payment_id:
                raise CustomException(status_code=status.HTTP_409_CONFLICT, detail="This order was already verified with a different payment.")
            return success_response(status_code=status.HTTP_200_OK, details="Payment already verified", data={
                "plan": "STANDARD", "status": "ACTIVE", "duration_days": SUBSCRIPTION_DAY_COUNT[2],
                "start_date": tenant_data.subscription_start.isoformat() if tenant_data.subscription_start else None,
                "end_date": tenant_data.subscription_end.isoformat() if tenant_data.subscription_end else None,
                "payment_status": "SUCCESS",
            })
        if tenant_data.status == "ACTIVE" or user_data.status == "ACTIVE":
            raise CustomException(status_code=status.HTTP_409_CONFLICT, detail="This Standard account has already been activated.")

        # Verify that the signature is authentic.
        razorpay_client = razorpay.Client(auth=(PAYMENT_API_KEY, PAYMENT_SECRET_KEY))
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": transaction.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })

        # Fetch payment status directly from Razorpay.
        payment = razorpay_client.payment.fetch(payload.razorpay_payment_id)

        # Verify that this payment belongs to this order.
        if payment.get("order_id") != transaction.razorpay_order_id:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment does not match the order"
            )

        # Verify amount and currency against our database.
        if (
            payment.get("amount") != transaction.amount
            or payment.get("currency") != "INR"
        ):
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment amount or currency mismatch"
            )

        # Grant paid access only after capture.
        if payment.get("status") != "captured":
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment has not been captured yet"
            )

        transaction.razorpay_payment_id = (payload.razorpay_payment_id)
        transaction.payment_status = "SUCCESS"

        start_date = date.today()
        tenant_data.status = "ACTIVE"
        tenant_data.subscription_start = start_date
        tenant_data.subscription_end = start_date + timedelta(days=SUBSCRIPTION_DAY_COUNT[2])
        user_data.status = "ACTIVE"

        session.commit()

        data = {
            "plan": "STANDARD",
            "status": "ACTIVE",
            "duration_days": 30,
            "start_date": tenant_data.subscription_start.isoformat(),
            "end_date": tenant_data.subscription_end.isoformat(),
            "payment_status": "SUCCESS"
            }
        
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payment verified and STANDARD subscription activated",
            data=data
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to verify payment: {e}"
            )
    except CustomException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise CustomException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed.", error=str(e))
