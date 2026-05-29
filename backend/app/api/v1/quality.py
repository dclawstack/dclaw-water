import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.quality_reading import QualityReading
from app.repositories.quality_repo import QualityRepository
from app.repositories.meter_repo import MeterRepository
from app.schemas.quality import QualityCreate, QualityOut, QualityList

router = APIRouter()


@router.get("/", response_model=QualityList)
async def list_quality(
    meter_id: uuid.UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = QualityRepository(db)
    if meter_id:
        items, total = await repo.list_by_meter(meter_id, limit=limit, offset=offset)
    else:
        items, total = await repo.list_all(limit=limit, offset=offset)
    return QualityList(items=items, total=total)


@router.post("/", response_model=QualityOut, status_code=status.HTTP_201_CREATED)
async def create_quality(body: QualityCreate, db: AsyncSession = Depends(get_db)):
    meter_repo = MeterRepository(db)
    meter = await meter_repo.get_by_id(body.meter_id)
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")

    is_compliant = (
        6.5 <= body.ph <= 8.5
        and body.turbidity_ntu <= 4.0
        and 0.2 <= body.chlorine_mgl <= 4.0
    )
    reading = QualityReading(**body.model_dump(exclude={"is_compliant"}), is_compliant=is_compliant)
    repo = QualityRepository(db)
    return await repo.create(reading)


@router.get("/{reading_id}", response_model=QualityOut)
async def get_quality(reading_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = QualityRepository(db)
    reading = await repo.get_by_id(reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Quality reading not found")
    return reading


@router.delete("/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quality(reading_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = QualityRepository(db)
    reading = await repo.get_by_id(reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Quality reading not found")
    await repo.delete(reading)
