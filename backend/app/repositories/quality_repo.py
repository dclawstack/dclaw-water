import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.quality_reading import QualityReading
from app.repositories.base_repo import BaseRepository


class QualityRepository(BaseRepository[QualityReading]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, QualityReading)

    async def list_by_meter(
        self, meter_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[QualityReading], int]:
        result = await self.db.execute(
            select(QualityReading)
            .where(QualityReading.meter_id == meter_id)
            .order_by(QualityReading.recorded_at.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        count = await self.db.execute(
            select(func.count()).select_from(QualityReading)
            .where(QualityReading.meter_id == meter_id)
        )
        total = count.scalar() or 0
        return items, total

    async def count_non_compliant(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(QualityReading)
            .where(QualityReading.is_compliant == False)  # noqa: E712
        )
        return result.scalar() or 0

    async def avg_parameters(self) -> dict:
        result = await self.db.execute(
            select(
                func.avg(QualityReading.ph).label("avg_ph"),
                func.avg(QualityReading.turbidity_ntu).label("avg_turbidity"),
                func.avg(QualityReading.chlorine_mgl).label("avg_chlorine"),
            )
        )
        row = result.one()
        return {
            "avg_ph": round(float(row.avg_ph), 2) if row.avg_ph else None,
            "avg_turbidity": round(float(row.avg_turbidity), 2) if row.avg_turbidity else None,
            "avg_chlorine": round(float(row.avg_chlorine), 2) if row.avg_chlorine else None,
        }
