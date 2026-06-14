import base64
import json
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.genai import Client, types

router = APIRouter()


class ScanReceiptRequest(BaseModel):
    imageBase64: str
    mimeType: str = "image/jpeg"


class ScanReceiptResponse(BaseModel):
    title: str
    rawText: str
    taxPercent: int
    tipPercent: int
    currency: str


_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise HTTPException(500, "GEMINI_API_KEY environment variable is required to scan receipts.")
        _client = Client(api_key=key)
    return _client


PROMPT = """
Analyze this receipt image and extract the list of items, prices, tax estimation, and service charges/tips.

Output rules:
1. Extract store/merchant name as title (e.g. "Bella Pasta").
2. Format each line item correctly under "rawText". Each item MUST be on its own line in the exact SplitSmart grammar format:
   [ItemName] [Price]
   e.g.,
   Margherita Pizza 450
   Garlic Bread 120
   Diet Coke 60

   Prices should match the actual receipt items, and should not contain any currency symbols (like $, ₹, €) adjacent to them.
   Add a comment line at the end with a summary, e.g. '// Scanned from receipt: [Merchant]' or similar.
3. Calculate estimated tax percentage as a plain number (e.g. 18 for GST, 12, or 8).
4. Calculate estimated tip percentage as a plain number (e.g. 10, 5, or 0) based on service charges or tips.
5. Identify the currency symbol (e.g., "₹", "$", "€", "£"). Defaults to "₹" if it looks Indian (Rupee) or "$" if US.

Return a JSON object with keys: title, rawText, taxPercent, tipPercent, currency.
"""


@router.post("/", response_model=ScanReceiptResponse)
async def scan_receipt(req: ScanReceiptRequest) -> ScanReceiptResponse:
    if not req.imageBase64:
        raise HTTPException(400, "No image payload found in request.")

    # Strip data URI prefix if present
    clean_base64 = re.sub(r"^data:image/\w+;base64,", "", req.imageBase64)
    clean_mime = req.mimeType or "image/jpeg"

    try:
        client = _get_client()

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(
                    data=base64.b64decode(clean_base64),
                    mime_type=clean_mime,
                ),
                types.Part.from_text(text=PROMPT),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "required": ["title", "rawText", "taxPercent", "tipPercent", "currency"],
                    "properties": {
                        "title": {"type": "STRING", "description": "Store or restaurant name from receipt header."},
                        "rawText": {"type": "STRING", "description": "SplitSmart-compatible text with each item on its own line."},
                        "taxPercent": {"type": "INTEGER", "description": "Estimated total tax percentage (integer)."},
                        "tipPercent": {"type": "INTEGER", "description": "Estimated tip/service charge percentage (integer)."},
                        "currency": {"type": "STRING", "description": "Currency symbol: $, ₹, €, or £."},
                    },
                },
            ),
        )

        parsed = json.loads(response.text or "{}")

        return ScanReceiptResponse(
            title=parsed.get("title", "Receipt"),
            rawText=parsed.get("rawText", ""),
            taxPercent=parsed.get("taxPercent", 0),
            tipPercent=parsed.get("tipPercent", 0),
            currency=parsed.get("currency", "₹"),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Receipt scan failed: {str(e)}")
