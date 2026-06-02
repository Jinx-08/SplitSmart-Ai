
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api import main

router = APIRouter()


class AnomalyRequest(BaseModel):
    amount_zscore: Optional[float] = None
    day_of_week: Optional[int] = None
    hour: Optional[int] = None
    month: Optional[int] = None
    is_duplicate: int = 0
    created_at: Optional[datetime] = None


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float


@router.post('/', response_model=AnomalyResponse)
def detect_anomaly(req: AnomalyRequest) -> AnomalyResponse:
    model = main.models.get('anomaly')
    if not model:
        raise HTTPException(503, 'Anomaly model not loaded')

    created_at = req.created_at
    day_of_week = req.day_of_week
    hour = req.hour
    month = req.month

    if created_at:
        day_of_week = created_at.weekday() if day_of_week is None else day_of_week
        hour = created_at.hour if hour is None else hour
        month = created_at.month if month is None else month

    features = [
        req.amount_zscore or 0.0,
        float(day_of_week or 0),
        float(hour or 0),
        float(month or 0),
        float(req.is_duplicate or 0),
    ]

    prediction = model.predict([features])[0]
    score = float(model.score_samples([features])[0])

    return {'is_anomaly': prediction == -1, 'anomaly_score': score}
