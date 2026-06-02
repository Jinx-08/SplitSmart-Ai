import os
from contextlib import asynccontextmanager

import joblib
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

models: dict = {}


def _model_path(filename: str) -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', filename))


@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Loading ML models...')
    models['categorizer'] = joblib.load(_model_path('expense_categorization_model.joblib'))
    models['anomaly'] = joblib.load(_model_path('expense_anomaly_model.joblib'))
    print('Models loaded successfully!')
    yield


app = FastAPI(title='Splitwise AI Service', version='1.0.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)

from api.routes.categorize import router as cat_router
from api.routes.anomaly import router as ano_router

app.include_router(cat_router, prefix='/categorize')
app.include_router(ano_router, prefix='/anomaly')


@app.get('/health')
def health_check():
    return {'status': 'ok', 'models_loaded': len(models) == 2}

