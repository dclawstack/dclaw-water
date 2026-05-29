from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import meters, readings, leaks, quality, dashboard, copilot


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="DClaw Water",
    version="1.0.0",
    description="AI-powered water management platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(meters.router, prefix="/api/v1/meters", tags=["meters"])
app.include_router(readings.router, prefix="/api/v1/readings", tags=["readings"])
app.include_router(leaks.router, prefix="/api/v1/leaks", tags=["leaks"])
app.include_router(quality.router, prefix="/api/v1/quality", tags=["quality"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["copilot"])
