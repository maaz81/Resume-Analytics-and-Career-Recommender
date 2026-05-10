from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from main import analyze

app = FastAPI(title="Career AI - ML Service")

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    context: Optional[str] = ""
    message: str
    history: Optional[List[ChatMessage]] = []

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "career-ai-ml"}

@app.post("/analyze")
def analyze_resume(request: AnalyzeRequest):
    return analyze(request.resume_text, request.jd_text)

@app.post("/chat")
def chat(request: ChatRequest):
    # Basic response — expand later if needed
    return {
        "reply": "I'm here to help with your career questions. Please ask about skills, roles, or resume tips.",
        "message": request.message
    }