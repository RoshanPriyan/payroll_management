from fastapi import FastAPI
from database import get_db
from routers import router
from custom_middleware import ExceptionHandlerMiddleware
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL

app = FastAPI()
app.include_router(router)
app.add_middleware(ExceptionHandlerMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
@app.get('/')
async def health():
    print(get_db())
    return {"message": "Application Health Check"}