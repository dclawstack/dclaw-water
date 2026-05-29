import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.services.auth_service import hash_password

log = logging.getLogger(__name__)

DEFAULT_ADMIN_EMAIL = "oc@dclaw.dev"
DEFAULT_ADMIN_PASSWORD = "oc123"
DEFAULT_ADMIN_NAME = "OC Admin"


async def seed_default_admin(db: AsyncSession) -> None:
    repo = UserRepository(db)
    existing = await repo.get_by_email(DEFAULT_ADMIN_EMAIL)
    if existing:
        return
    admin = User(
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
        full_name=DEFAULT_ADMIN_NAME,
        is_active=True,
        is_admin=True,
    )
    await repo.create(admin)
    log.info(f"Seeded default admin: {DEFAULT_ADMIN_EMAIL}")
