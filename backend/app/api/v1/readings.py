import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.meter_reading import MeterReading
from app.repositories.reading_repo import ReadingRepository
from app.repositories.meter_repo import MeterRepository
from app.schemas.reading import ReadingCreate, ReadingOut, ReadingList

router = APIRouter()


@router.get("/", response_model=ReadingList)
async def list_readings(
    meter_id: uuid.UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = ReadingRepository(db)
    if meter_id:
        items, total = await repo.list_by_meter(meter_id, limit=limit, offset=offset)
    else:
        items, total = await repo.list_all(limit=limit, offset=offset)
    return ReadingList(items=items, total=total)


@router.post("/", response_model=ReadingOut, status_code=status.HTTP_201_CREATED)
async def create_reading(body: ReadingCreate, db: AsyncSession = Depends(get_db)):
    meter_repo = MeterRepository(db)
    meter = await meter_repo.get_by_id(body.meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    reading = MeterReading(**body.model_dump())
    repo = ReadingRepository(db)
    return await repo.create(reading)


@router.get("/{reading_id}", response_model=ReadingOut)
async def get_reading(reading_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ReadingRepository(db)
    reading = await repo.get_by_id(reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading


@router.delete("/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reading(reading_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ReadingRepository(db)
    reading = await repo.get_by_id(reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    await repo.delete(reading)
