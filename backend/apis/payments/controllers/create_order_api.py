from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import uuid4
import razorpay
from database import get_db
from global_utils import CustomException, success_response
from apis.payments.models import PaymentTransactionModel
from apis.users.models import UserModel 
from apis.payments.schemas import CreateOrderSchema
from config import SUBSCRIPTION_PLAN, PAYMENT_API_KEY, PAYMENT_SECRET_KEY, SUBSCRIPTION_AMOUNT
from auth import decode_payment_flow_token
from apis.tenant.models import TenantModel


async def create_order_api(
        payload: CreateOrderSchema,
        session: Session = Depends(get_db)
) -> dict:
    try:
        if payload.subscription_id != 2 or SUBSCRIPTION_PLAN.get(payload.subscription_id) != "STANDARD":
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is available only for the STANDARD plan"
            )

        flow = decode_payment_flow_token(payload.payment_token)
        if not flow:
            raise CustomException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email verification is required before payment.")

        tenant_id = int(flow["tenant_id"])
        tenant = session.query(TenantModel).filter(TenantModel.id == tenant_id).with_for_update().first()
        user = session.query(UserModel).filter(UserModel.tenant_id == tenant_id).first()
        if not tenant or not user or tenant.subscription_plan != "STANDARD":
            raise CustomException(status_code=status.HTTP_404_NOT_FOUND, detail="Verified STANDARD registration not found.")
        if tenant.status != "INACTIVE" or user.status != "INACTIVE":
            raise CustomException(status_code=status.HTTP_409_CONFLICT, detail="This account is not awaiting Standard payment.")

        existing_transaction = (
            session.query(PaymentTransactionModel)
            .filter(PaymentTransactionModel.tenant_id == tenant_id,
                    PaymentTransactionModel.subscription_id == 2,
                    PaymentTransactionModel.payment_status == "PENDING")
            .order_by(PaymentTransactionModel.id.desc())
            .first()
        )
        if existing_transaction:
            return success_response(status_code=status.HTTP_200_OK, details="Payment order already created", data={
                "key_id": PAYMENT_API_KEY,
                "order_id": existing_transaction.razorpay_order_id,
                "amount": existing_transaction.amount,
                "currency": "INR",
                "subscription_id": 2,
            })

        amount = SUBSCRIPTION_AMOUNT.get(payload.subscription_id)
        receipt = f"pp_{uuid4().hex[:24]}"

        razorpay_client = razorpay.Client(auth=(PAYMENT_API_KEY, PAYMENT_SECRET_KEY))

        order = razorpay_client.order.create(
            data={
                "amount": amount,
                "receipt": receipt,
                "currency": "INR",
                "notes": {
                    "subscription_id": "2",
                    "tenant_id": str(tenant_id),
                    "plan": "STANDARD",
                },
            }
        )

        transaction = PaymentTransactionModel(
            tenant_id=tenant_id,
            subscription_id=2,
            razorpay_order_id=order["id"],
            amount=amount,
            payment_status="PENDING",
        )

        session.add(transaction)
        session.commit()

        data = {
            "key_id": PAYMENT_API_KEY,
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "subscription_id": 2
            }
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Payment order created successfully",
            data=data
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to create payment order: {e}"
            )
    except CustomException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise CustomException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to create a payment order right now.", error=str(e))
