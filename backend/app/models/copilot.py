import uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Enum as SAEnum
from app.models.base import Base
from app.core.utils import utc_now
from datetime import datetime
import enum


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"


class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    role: Mapped[str] = mapped_column(
        SAEnum(MessageRole, name="message_role"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)
