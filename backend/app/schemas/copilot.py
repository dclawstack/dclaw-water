import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.copilot import MessageRole


class ChatRequest(BaseModel):
    session_id: str
    message: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: str
    role: MessageRole
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    user_message: MessageOut
    assistant_message: MessageOut


class SessionHistory(BaseModel):
    session_id: str
    messages: list[MessageOut]
