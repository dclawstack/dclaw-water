import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.leak_alert import LeakAlert, AlertStatus, AlertSeverity
from app.repositories.base_repo import BaseRepository


class LeakRepository(BaseRepository[LeakAlert]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, LeakAlert)

    async def list_open(self, limit: int = 50, offset: int = 0) -> tuple[list[LeakAlert], int]:
        result = await self.db.execute(
            select(LeakAlert)
            .where(LeakAlert.status != AlertStatus.resolved)
            .order_by(LeakAlert.detected_at.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        count = await self.db.execute(
            select(func.count()).select_from(LeakAlert)
            .where(LeakAlert.status != AlertStatus.resolved)
        )
        total = count.scalar() or 0
        return items, total

    async def count_by_status(self, status: AlertStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(LeakAlert).where(LeakAlert.status == status)
        )
        return result.scalar() or 0

    async def count_critical(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(LeakAlert)
            .where(
                LeakAlert.severity == AlertSeverity.critical,
                LeakAlert.status != AlertStatus.resolved,
            )
        )
        return result.scalar() or 0

    async def update(self, alert: LeakAlert, **kwargs) -> LeakAlert:
        for key, value in kwargs.items():
            if value is not None:
                setattr(alert, key, value)
        await self.db.commit()
        await self.db.refresh(alert)
        return alert

    async def recent(self, limit: int = 5) -> list[LeakAlert]:
        result = await self.db.execute(
            select(LeakAlert).order_by(LeakAlert.detected_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
