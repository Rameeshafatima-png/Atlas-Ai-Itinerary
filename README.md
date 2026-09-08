# AI Travel Planner Using Gemini Prompting Techniques

A FastAPI-based AI Travel Planner that demonstrates and compares three Gemini prompting techniques:

1. Zero-Shot Prompting
2. Few-Shot Prompting
3. Structured Reasoning Prompting

The application accepts a traveler's preferences and generates a personalized itinerary using the selected prompting technique.

## Features

- Personalized travel planning
- Destination, budget, days, interests, and travel-style inputs
- Zero-Shot prompt
- Few-Shot prompt with three example travelers
- Structured planning prompt with concise recommendation justifications
- Modern responsive web interface
- FastAPI backend
- Gemini API integration using the current `google-genai` Python SDK
- Error handling and API health endpoint

## Project Structure

```text
AI_Travel_Planner/
├── main.py
├── .env
├── .env.example
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## 1. Create a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run the commands below from an activated environment or use Command Prompt:

```cmd
.venv\Scripts\activate
```

## 2. Install dependencies

```powershell
pip install -r requirements.txt
```

## 3. Configure Gemini API

Copy `.env.example` to `.env`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

with your actual Gemini API key.

Do not upload `.env` or your API key to GitHub.

## 4. Run the application

```powershell
python -m uvicorn main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

## 5. Test the application

Example:

```text
Name: Alex
Destination: Dubai
Days: 4
Budget: 800
Interests: Food, Beaches, Shopping
Travel Style: Family
```

Then test all three techniques separately.

### Zero-Shot

Gemini receives the task and traveler profile without examples.

### Few-Shot

Gemini receives three example travelers and sample planning approaches before receiving the new traveler's information.

### Structured Reasoning

Gemini receives explicit planning criteria and is asked for short recommendation justifications without revealing internal reasoning.

## Assignment Mapping

| Requirement | Implementation |
|---|---|
| Name | Travel profile form |
| Destination | Travel profile form |
| Budget | Travel profile form |
| Number of days | Travel profile form |
| Interests | Travel profile form |
| Travel style | Travel profile form |
| Zero-Shot | `build_prompt()` |
| Few-Shot | `build_prompt()` |
| Structured Reasoning | `build_prompt()` |
| Gemini API | `google-genai` |
| Web application | FastAPI + HTML/CSS/JS |

## API Endpoints

### GET /

Returns the travel planner interface.

### GET /health

Returns application and Gemini configuration status.

### POST /generate

Generates a travel itinerary.

Example request:

```json
{
  "name": "Alex",
  "destination": "Dubai",
  "days": 4,
  "budget": 800,
  "interests": "Food, Beaches, Shopping",
  "travel_style": "Family",
  "technique": "few-shot"
}
```

## Important Note

The generated prices and schedules are estimates. The application does not claim live availability or exact current prices.

## Technologies

- Python
- FastAPI
- Google Gemini API
- Google GenAI Python SDK
- HTML5
- CSS3
- JavaScript
- Pydantic
- python-dotenv

## Educational Purpose

This project demonstrates how prompt design can affect the structure, personalization, and usefulness of an AI-generated response.

For the assignment, generate the same or similar traveler profile using all three techniques and compare:

- Organization
- Personalization
- Budget awareness
- Recommendation quality
- Explanation quality
- Level of detail

## License

Educational project.
