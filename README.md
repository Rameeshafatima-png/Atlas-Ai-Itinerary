# Atlas — AI Trip Planner

Atlas turns a name, a destination, and a budget into a full day-by-day travel itinerary — drafted by Gemini and handed back as a boarding-pass-style ticket instead of a wall of text.

It also doubles as a live comparison tool for prompting strategies: the same trip can be planned **zero-shot**, **few-shot**, or with a **structured** step-by-step prompt, so you can see how the technique changes the output.

## Features

- **Three prompting techniques, one flow** — switch between zero-shot, few-shot, and structured prompting per request and compare results side by side.
- **Automatic fallback** — if the primary Gemini model is temporarily unavailable (`503` / `UNAVAILABLE`), Atlas retries once against a fallback model before failing.
- **A UI that looks like the subject matter** — the itinerary renders as a boarding pass: a stub with the trip's vitals, a perforated divider, and a day-by-day body.
- **No build step** — the frontend is plain HTML, CSS, and JavaScript served directly by FastAPI. Nothing to compile, nothing to `npm install`.
- **Small, readable backend** — one FastAPI app, one Pydantic model, one prompt builder.

## Tech stack

| Layer      | Choice                          |
|------------|----------------------------------|
| Backend    | FastAPI + Pydantic               |
| AI model   | Google Gemini (`google-genai`)   |
| Frontend   | HTML, CSS, vanilla JavaScript    |
| Config     | `python-dotenv`                  |

## Project structure

```
.
├── main.py               # FastAPI app: routes, prompt builder, Gemini calls
├── templates/
│   └── index.html        # Trip form + itinerary ticket
├── static/
│   ├── style.css         # Visual design
│   └── script.js         # Form handling, API calls, rendering
└── .env                  # GEMINI_API_KEY (not committed)
```

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/atlas-trip-planner.git
cd atlas-trip-planner
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-dotenv pydantic google-genai
```

### 2. Configure your API key

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_MODEL` is optional — it defaults to `gemini-3.7-flash`, with `gemini-3.6-flash` used automatically as a fallback.

### 3. Run it

```bash
uvicorn main:app --reload
```

Open **http://127.0.0.1:8000** and plan a trip.

## API reference

| Method | Path        | Description                                      |
|--------|-------------|---------------------------------------------------|
| `GET`  | `/`         | Serves the frontend.                              |
| `GET`  | `/health`   | Reports whether Gemini is configured, and which models are active. |
| `POST` | `/generate` | Builds a prompt from the trip details and returns a drafted itinerary. |

**`POST /generate` request body**

```json
{
  "name": "Maya",
  "destination": "Lisbon, Portugal",
  "days": 5,
  "budget": 1200,
  "interests": "Food markets, old architecture, live music",
  "travel_style": "Solo",
  "technique": "structured"
}
```

**Response**

```json
{
  "technique": "structured",
  "model": "gemini-3.7-flash",
  "itinerary": "Day 1\nMorning: ...\n..."
}
```

## Prompting techniques

| Technique     | What it does                                                            |
|---------------|---------------------------------------------------------------------------|
| `zero-shot`   | Plans the trip directly from the requirements, with no examples.          |
| `few-shot`    | Shows the model three sample itineraries first, so it matches their style and level of personalization. |
| `structured`  | Walks the model through an explicit planning process and enforces a fixed day-by-day output format. |

## Roadmap

- [ ] Export itinerary as PDF
- [ ] Save and revisit past trips
- [ ] Multi-city itineraries

## License

MIT — see `LICENSE`.
