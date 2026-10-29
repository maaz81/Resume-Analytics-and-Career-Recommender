import logging
import traceback
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from main import analyze

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("career-ai-ml")

app = FastAPI(title="Career AI - ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the resume")
    jd_text: str = Field(..., description="Job description or target role text")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    context: Optional[str] = ""
    message: str
    history: Optional[List[ChatMessage]] = []

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors_list = exc.errors()
    logger.error(f"[VALIDATION ERROR 422] Path: {request.url.path} Errors: {errors_list}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": errors_list,
            "message": "Invalid request payload. Ensure 'resume_text' and 'jd_text' are non-null strings.",
        },
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "career-ai-ml"}

@app.post("/analyze")
def analyze_resume(request: AnalyzeRequest):
    try:
        resume_text = request.resume_text.strip() if request.resume_text else ""
        jd_text = request.jd_text.strip() if request.jd_text else ""
        if not resume_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_text cannot be empty or whitespace only",
            )
        if not jd_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="jd_text cannot be empty or whitespace only",
            )
        return analyze(resume_text, jd_text)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ANALYZE ERROR] {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis processing error: {str(e)}",
        )

@app.post("/chat")
def chat(request: ChatRequest):
    return {
        "reply": "I'm here to help with your career questions. Please ask about skills, roles, or resume tips.",
        "message": request.message
    }
