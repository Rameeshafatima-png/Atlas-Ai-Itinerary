
import os
import time
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from google import genai

# Load environment variables
load_dotenv()

# Gemini configuration
API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
FALLBACK_MODEL = "gemini-3.6-flash"

# Create FastAPI application FIRST
app = FastAPI(
    title="AI Travel Planner",
    version="1.0.0"
)

# Static files
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

# Gemini client
client = genai.Client(api_key=API_KEY) if API_KEY else None


# =========================
# Request Model
# =========================

class TravelRequest(BaseModel):
    name: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    days: int = Field(..., ge=1, le=30)
    budget: float = Field(..., ge=0)
    interests: str = Field(..., min_length=1)
    travel_style: str = Field(..., min_length=1)
    technique: Literal[
        "zero-shot",
        "few-shot",
        "structured"
    ]


# =========================
# Traveler Details
# =========================

def traveler_details(data: TravelRequest) -> str:
    return f"""
Traveler name: {data.name}
Destination: {data.destination}
Number of days: {data.days}
Budget: ${data.budget:,.2f}
Interests: {data.interests}
Travel style: {data.travel_style}
"""


# =========================
# Prompt Builder
# =========================

def build_prompt(data: TravelRequest) -> str:
    details = traveler_details(data)

    # ZERO-SHOT
    if data.technique == "zero-shot":
        return f"""
You are an expert travel planner.

Create a personalized travel itinerary for the traveler below.

{details}

Requirements:
- Analyze the traveler's preferences.
- Suggest suitable places to visit.
- Create a clear day-by-day itinerary.
- Recommend activities that fit the stated budget.
- Include estimated daily spending.
- Include a total estimated trip cost.
- Consider travel style and interests.
- Give short practical explanations.
- Do not invent exact current prices or availability.
- Clearly label all prices as estimates.
- Keep the response organized and easy to read.

This is a ZERO-SHOT prompting task.
Do not use examples from other travelers.
"""

    # FEW-SHOT
    if data.technique == "few-shot":
        return f"""
You are an expert travel planner.

Learn the style and level of personalization from the examples below,
then create a new itinerary.

EXAMPLE 1

Traveler: Maya
Destination: Istanbul
Days: 3
Budget: $500
Interests: History, Food
Travel Style: Solo

Sample approach:
Day 1: Historic landmarks and a local food experience.
Day 2: Cultural attractions, neighborhood exploration, and affordable meals.
Day 3: Market visit, scenic location, and a relaxed final evening.

The plan balances interests, time, and budget.


EXAMPLE 2

Traveler: Daniel
Destination: Kuala Lumpur
Days: 4
Budget: $650
Interests: Nature, Food, Shopping
Travel Style: Friends

Sample approach:
Day 1: City highlights and local food.
Day 2: Nature-focused attraction and casual evening.
Day 3: Shopping district and food exploration.
Day 4: Flexible sightseeing and final shopping.

The plan keeps activities practical and groups nearby attractions.


EXAMPLE 3

Traveler: Sara
Destination: Rome
Days: 3
Budget: $700
Interests: History, Art, Food
Travel Style: Family

Sample approach:
Day 1: Major historic attraction and family-friendly food stop.
Day 2: Art and cultural sites with breaks.
Day 3: Historic neighborhood, shopping, and relaxed dinner.

The itinerary avoids overloading each day.


NEW TRAVELER

{details}

Generate a new personalized itinerary following the useful patterns
demonstrated by the examples.

Do not copy the example destinations or itineraries.

Include:
- A short traveler summary
- Day-by-day plan
- Estimated daily budget
- Estimated total trip cost
- Short reasons for major recommendations
- Practical notes
"""


    # STRUCTURED
    return f"""
You are an expert travel planner.

Create a personalized travel itinerary using the following
structured planning process.

Do NOT reveal private chain-of-thought or internal reasoning.
Provide only conclusions and short justifications.

TRAVELER INFORMATION

{details}

PLANNING REQUIREMENTS

1. Analyze the user's preferences.
2. Consider the available budget.
3. Consider the number of travel days.
4. Select suitable attractions and activities.
5. Create a day-by-day itinerary.
6. Briefly explain why each major recommendation was selected.

OUTPUT FORMAT

Start with a concise trip overview.

Then provide:

Day 1
Morning:
Afternoon:
Evening:
Estimated daily cost:

Day 2
Morning:
Afternoon:
Evening:
Estimated daily cost:

Continue until Day {data.days}.

Also include:
- Estimated total trip cost
- Short recommendation justifications
- Practical travel notes

Keep the plan realistic for the stated budget.

Clearly label all prices as estimates.

Do not claim live availability or exact current prices.
"""


# =========================
# Home Route
# =========================

@app.get("/")
def home():
    return FileResponse("templates/index.html")


# =========================
# Health Check
# =========================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(API_KEY),
        "primary_model": PRIMARY_MODEL,
        "fallback_model": FALLBACK_MODEL
    }


# =========================
# Generate Itinerary
# =========================

@app.post("/generate")
def generate_itinerary(data: TravelRequest):

    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing. Add it to the .env file."
        )

    prompt = build_prompt(data)

    # ---------------------------------
    # Try primary model
    # ---------------------------------

    try:

        response = client.models.generate_content(
            model=PRIMARY_MODEL,
            contents=prompt
        )

        text = response.text if response and response.text else ""

        if text:

            return {
                "technique": data.technique,
                "model": PRIMARY_MODEL,
                "itinerary": text
            }

    except Exception as primary_error:

        error_message = str(primary_error)

        # ---------------------------------
        # Fallback for temporary 503 errors
        # ---------------------------------

        if "503" in error_message or "UNAVAILABLE" in error_message:

            try:

                time.sleep(2)

                response = client.models.generate_content(
                    model=FALLBACK_MODEL,
                    contents=prompt
                )

                text = (
                    response.text
                    if response and response.text
                    else ""
                )

                if text:

                    return {
                        "technique": data.technique,
                        "model": FALLBACK_MODEL,
                        "itinerary": text
                    }

            except Exception as fallback_error:

                raise HTTPException(
                    status_code=503,
                    detail=(
                        "Gemini is temporarily unavailable. "
                        f"Primary model error: {primary_error}. "
                        f"Fallback model error: {fallback_error}"
                    )
                )

        raise HTTPException(
            status_code=500,
            detail=f"Gemini request failed: {primary_error}"
        )

    # Empty response
    raise HTTPException(
        status_code=502,
        detail="Gemini returned an empty response."
    )
