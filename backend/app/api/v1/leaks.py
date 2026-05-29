import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.leak_alert import LeakAlert
from app.repositories.leak_repo import LeakRepository
from app.repositories.meter_repo import MeterRepository
from app.schemas.leak import LeakCreate, LeakUpdate, LeakOut, LeakList

router = APIRouter()


@router.get("/", response_model=LeakList)
async def list_leaks(
    open_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = LeakRepository(db)
    if open_only:
        items, total = await repo.list_open(limit=limit, offset=offset)
    else:
        items, total = await repo.list_all(limit=limit, offset=offset)
    return LeakList(items=items, total=total)


@router.post("/", response_model=LeakOut, status_code=status.HTTP_201_CREATED)
async def create_leak(body: LeakCreate, db: AsyncSession = Depends(get_db)):
    meter_repo = MeterRepository(db)
    meter = await meter_repo.get_by_id(body.meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    alert = LeakAlert(**body.model_dump())
    repo = LeakRepository(db)
    return await repo.create(alert)


@router.get("/{alert_id}", response_model=LeakOut)
async def get_leak(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = LeakRepository(db)
    alert = await repo.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Leak alert not found")
    return alert


@router.put("/{alert_id}", response_model=LeakOut)
async def update_leak(
    alert_id: uuid.UUID, body: LeakUpdate, db: AsyncSession = Depends(get_db)
):
    repo = LeakRepository(db)
    alert = await repo.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Leak alert not found")
    return await repo.update(alert, **body.model_dump(exclude_none=True))


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_leak(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = LeakRepository(db)
    alert = await repo.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Leak alert not found")
    await repo.delete(alert)
