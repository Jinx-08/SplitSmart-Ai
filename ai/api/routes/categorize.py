from typing import Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api import main

router = APIRouter()


class CategorizeRequest(BaseModel):
    description: str


class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    all_probabilities: Dict[str, float]


@router.post('/', response_model=CategorizeResponse)
def categorize_expense(req: CategorizeRequest) -> CategorizeResponse:
    model = main.models.get('categorizer')
    if not model:
        raise HTTPException(503, 'Categorizer model not loaded')

    proba = model.predict_proba([req.description])[0]
    classes = model.classes_
    confidence = float(proba.max())
    all_probs = {cls: float(prob) for cls, prob in zip(classes, proba)}
    category = model.predict([req.description])[0]

    if confidence < 0.60:
        category = 'Other'

    return {'category': category, 'confidence': confidence, 'all_probabilities': all_probs}


@router.post('/batch', response_model=List[CategorizeResponse])
def categorize_batch(requests: List[CategorizeRequest]) -> List[CategorizeResponse]:
    model = main.models.get('categorizer')
    if not model:
        raise HTTPException(503, 'Categorizer model not loaded')

    descriptions = [r.description for r in requests]
    categories = model.predict(descriptions)
    probas = model.predict_proba(descriptions)

    return [
        {'category': cat, 'confidence': float(proba.max()), 'all_probabilities': {}}
        for cat, proba in zip(categories, probas)
    ]