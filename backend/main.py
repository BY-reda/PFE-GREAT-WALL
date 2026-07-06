from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
from ml_engine import ml_engine

app = FastAPI(
    title="AI Admissions 2-Stage Pipeline API",
    description="Backend API for One-Class Isolation Envelope & Oral Interview Risk Prediction",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    name: str = Field(default="Candidate", example="Younes")
    moy_generale: float = Field(..., ge=0.0, le=20.0, example=15.5)
    english_score: float = Field(..., ge=0.0, le=100.0, example=82.0)
    desired_major: Optional[str] = Field(default=None, example="Computer Science")

@app.get("/api/stats")
def get_stats():
    return ml_engine.get_dataset_stats()

@app.post("/api/evaluate")
def evaluate_student(req: EvaluationRequest):
    return ml_engine.evaluate_candidate(
        name=req.name,
        moy=req.moy_generale,
        eng=req.english_score,
        desired_major=req.desired_major
    )

@app.post("/api/recommend")
def recommend_universities(req: EvaluationRequest):
    recs = ml_engine.recommend_universities(
        name=req.name,
        moy=req.moy_generale,
        eng=req.english_score,
        desired_major=req.desired_major
    )
    return {"candidate": req.name, "recommendations": recs}

@app.get("/api/alumni")
def get_alumni(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: str = Query(''),
    university: str = Query('')
):
    return ml_engine.get_alumni(page=page, limit=limit, search=search, university=university)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
