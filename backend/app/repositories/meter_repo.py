import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.water_meter import WaterMeter, MeterStatus
from app.repositories.base_repo import BaseRepository


class MeterRepository(BaseRepository[WaterMeter]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, WaterMeter)

    async def get_by_code(self, meter_code: str) -> WaterMeter | None:
        result = await self.db.execute(
            select(WaterMeter).where(WaterMeter.meter_code == meter_code)
        )
        return result.scalar_one_or_none()

    async def list_by_status(self, status: MeterStatus) -> list[WaterMeter]:
        result = await self.db.execute(
            select(WaterMeter).where(WaterMeter.status == status)
        )
        return list(result.scalars().all())

    async def update(self, meter: WaterMeter, **kwargs) -> WaterMeter:
        for key, value in kwargs.items():
            if value is not None:
                setattr(meter, key, value)
        await self.db.commit()
        await self.db.refresh(meter)
        return meter
