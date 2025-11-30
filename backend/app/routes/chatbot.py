from fastapi import APIRouter
from pydantic import BaseModel
# Import the logic from the service layer
from app.services.chatbot_service import get_nexus_response

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/ask")
async def ask_chatbot(request: ChatRequest):
    # Delegate the complex logic to the service
    response_text = get_nexus_response(request.message)
    
    return {"response": response_text}