import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.water_meter import WaterMeter
from app.repositories.meter_repo import MeterRepository
from app.schemas.meter import MeterCreate, MeterUpdate, MeterOut, MeterList

router = APIRouter()


@router.get("/", response_model=MeterList)
async def list_meters(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = MeterRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return MeterList(items=items, total=total)


@router.post("/", response_model=MeterOut, status_code=status.HTTP_201_CREATED)
async def create_meter(body: MeterCreate, db: AsyncSession = Depends(get_db)):
    repo = MeterRepository(db)
    existing = await repo.get_by_code(body.meter_code)
    if existing:
        raise HTTPException(status_code=409, detail="Meter code already exists")
    meter = WaterMeter(**body.model_dump())
    return await repo.create(meter)


@router.get("/{meter_id}", response_model=MeterOut)
async def get_meter(meter_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = MeterRepository(db)
    meter = await repo.get_by_id(meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return meter


@router.put("/{meter_id}", response_model=MeterOut)
async def update_meter(
    meter_id: uuid.UUID, body: MeterUpdate, db: AsyncSession = Depends(get_db)
):
    repo = MeterRepository(db)
    meter = await repo.get_by_id(meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    return await repo.update(meter, **body.model_dump(exclude_none=True))


@router.delete("/{meter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meter(meter_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = MeterRepository(db)
    meter = await repo.get_by_id(meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    await repo.delete(meter)
