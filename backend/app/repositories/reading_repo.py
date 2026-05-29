import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.meter_reading import MeterReading
from app.repositories.base_repo import BaseRepository


class ReadingRepository(BaseRepository[MeterReading]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, MeterReading)

    async def list_by_meter(
        self, meter_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[MeterReading], int]:
        result = await self.db.execute(
            select(MeterReading)
            .where(MeterReading.meter_id == meter_id)
            .order_by(MeterReading.recorded_at.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        count = await self.db.execute(
            select(func.count()).select_from(MeterReading).where(MeterReading.meter_id == meter_id)
        )
        total = count.scalar() or 0
        return items, total

    async def total_consumption(self) -> float:
        result = await self.db.execute(
            select(func.sum(MeterReading.reading_value_kl))
        )
        return result.scalar() or 0.0

    async def consumption_by_meter(self) -> list[tuple[uuid.UUID, float]]:
        result = await self.db.execute(
            select(MeterReading.meter_id, func.sum(MeterReading.reading_value_kl).label("total"))
            .group_by(MeterReading.meter_id)
            .order_by(func.sum(MeterReading.reading_value_kl).desc())
            .limit(10)
        )
        return [(row.meter_id, row.total) for row in result.all()]
