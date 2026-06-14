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
    try:
        cat_path = _model_path('expense_categorization_model.joblib')
        ano_path = _model_path('expense_anomaly_model.joblib')
        if os.path.exists(cat_path):
            models['categorizer'] = joblib.load(cat_path)
            print('  ✓ Categorizer model loaded')
        else:
            print('  ⚠ Categorizer model not found (skipping)')
        if os.path.exists(ano_path):
            models['anomaly'] = joblib.load(ano_path)
            print('  ✓ Anomaly model loaded')
        else:
            print('  ⚠ Anomaly model not found (skipping)')
    except Exception as e:
        print(f'  ⚠ Model loading failed: {e}')
    print(f'Startup complete! {len(models)} model(s) loaded. Gemini AI routes are always available.')
    yield


app = FastAPI(title='Splitwise AI Service', version='1.0.0', lifespan=lifespan)

cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=['*'],
    allow_headers=['*'],
)

from api.routes.categorize import router as cat_router
from api.routes.anomaly import router as ano_router
from api.routes.scan_receipt import router as scan_router
from api.routes.ai_chat import router as chat_router

app.include_router(cat_router, prefix='/categorize')
app.include_router(ano_router, prefix='/anomaly')
app.include_router(scan_router, prefix='/api/scan-receipt')
app.include_router(chat_router, prefix='/api/ai-chat')


@app.get('/health')
def health_check():
    return {'status': 'ok', 'models_loaded': len(models) == 2}

