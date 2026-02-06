from fastapi import FastAPI
from pydantic import BaseModel
from main import analyze

app = FastAPI()

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

@app.post("/analyze")
def analyze_resume(request: AnalyzeRequest):
    return analyze(request.resume_text, request.jd_text)