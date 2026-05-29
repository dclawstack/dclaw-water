from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.copilot import CopilotMessage
from app.services import copilot_service
from app.schemas.copilot import ChatRequest, ChatResponse, SessionHistory, MessageOut

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    user_msg, assistant_msg = await copilot_service.chat(
        db, session_id=body.session_id, user_message=body.message
    )
    return ChatResponse(
        user_message=MessageOut.model_validate(user_msg),
        assistant_message=MessageOut.model_validate(assistant_msg),
    )


@router.get("/history/{session_id}", response_model=SessionHistory)
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CopilotMessage)
        .where(CopilotMessage.session_id == session_id)
        .order_by(CopilotMessage.created_at.asc())
    )
    messages = list(result.scalars().all())
    return SessionHistory(
        session_id=session_id,
        messages=[MessageOut.model_validate(m) for m in messages],
    )
