import json
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.genai import Client, types

router = APIRouter()


class AIChatRequest(BaseModel):
    query: str


class AIChatResponse(BaseModel):
    response: str


_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise HTTPException(500, "GEMINI_API_KEY environment variable is required.")
        _client = Client(api_key=key)
    return _client


SYSTEM_PROMPT = """You are the SplitSmart AI Co-Pilot — an expert financial splitting assistant.

Your job is to help users divide shared expenses fairly using advanced strategies.

When the user describes a splitting scenario, you MUST:
1. Identify all participants and amounts
2. Show step-by-step calculations with clear math
3. Produce a final allocation breakdown per person
4. Show the optimal settlement transfers (who pays whom)
5. Add a proactive fairness tip at the end

Formatting rules:
- Use markdown headers (###), bold (**text**), and bullet points
- Show all currency amounts with the symbol the user uses (₹, $, €, £)
- Include percentage shares where relevant
- Start your response with "### 🔮" followed by a descriptive title
- End with a "🔮 SplitSmart Proactive Check:" fairness tip

You handle these scenarios expertly:
- Weighted stays (different nights at a hotel/Airbnb)
- Driver/vehicle depreciation bonuses
- Alcohol/premium item segregation from shared food
- Tax and tip allocation strategies
- Unequal consumption splits
- Group trip multi-category expenses

If the query is vague, still provide a useful split calculation with assumptions stated clearly.
"""


@router.post("/", response_model=AIChatResponse)
async def ai_chat(req: AIChatRequest) -> AIChatResponse:
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty.")

    try:
        client = _get_client()

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_text(text=f"{SYSTEM_PROMPT}\n\nUser query:\n{req.query}"),
            ],
        )

        return AIChatResponse(response=response.text or "No response generated.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"AI query failed: {str(e)}")
