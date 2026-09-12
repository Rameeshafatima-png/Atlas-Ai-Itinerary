# Atlas AI Itinerary

### AI-Powered Travel Planning with Intelligent Itinerary Generation

Atlas AI Itinerary is an AI-powered travel planning application that transforms a few travel preferences into a personalized, structured, and practical itinerary.

Built with FastAPI and Google Gemini, the application combines modern web development with generative AI to create travel plans based on destination, duration, budget, interests, and travel style.

The project also demonstrates how different prompting strategies can influence AI-generated travel recommendations, including Zero-Shot, Few-Shot, and Structured Reasoning approaches.

---

## Overview

Planning a trip often requires researching destinations, activities, budgets, schedules, and travel preferences across multiple sources.

Atlas AI Itinerary simplifies this process by allowing users to provide their travel requirements through a clean and modern interface. The application sends those preferences to a Gemini-powered backend and generates a personalized itinerary.

The system is designed to demonstrate the practical implementation of Generative AI in a real-world travel planning scenario.

---

## Key Features

### Personalized Travel Planning

Generate customized itineraries using:

* Traveler name
* Destination
* Number of days
* Budget
* Interests
* Travel style
* AI prompting technique

### Multiple Prompting Techniques

The application supports three prompting strategies:

**Zero-Shot Prompting**

Generates an itinerary directly from the user's requirements without providing examples.

**Few-Shot Prompting**

Provides examples to guide Gemini toward a desired itinerary structure and style.

**Structured Reasoning**

Uses a carefully organized prompt structure to produce more systematic and detailed travel recommendations.

### Modern Web Interface

The frontend provides a responsive travel-planning experience with:

* Clean dashboard-style design
* Destination-focused interface
* Interactive input fields
* AI-generated itinerary presentation
* Responsive layout
* Modern visual components
* Clear result organization

### AI-Powered Recommendations

Generated plans can include:

* Daily activities
* Suggested places to visit
* Food recommendations
* Travel suggestions
* Budget-aware planning
* Activity sequencing
* Personalized recommendations

---

## Technology Stack

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| Python        | Core programming language |
| FastAPI       | Backend API framework     |
| Google Gemini | Generative AI             |
| Pydantic      | Request validation        |
| Jinja2        | HTML templating           |
| HTML5         | Frontend structure        |
| CSS3          | UI styling                |
| JavaScript    | Frontend interactions     |
| python-dotenv | Environment configuration |
| Uvicorn       | ASGI server               |

---

## Application Architecture

```text
User
  |
  v
Web Interface
  |
  v
FastAPI Backend
  |
  v
Travel Request Validation
  |
  v
Prompt Engineering
  |
  +----------------------+
  |          |           |
  v          v           v
Zero-Shot  Few-Shot  Structured
  |          |           |
  +----------+-----------+
             |
             v
       Google Gemini API
             |
             v
      Generated Itinerary
             |
             v
        Web Interface
```

---

## Project Structure

```text
Atlas-Ai-Itinerary/
│
├── main.py
├── requirements.txt
├── .env
├── .env.example
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js
```

The exact structure may vary depending on the current frontend implementation.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rameeshafatima-png/Atlas-Ai-Itinerary.git
cd Atlas-Ai-Itinerary
```

### 2. Create a Virtual Environment

Windows:

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the Gemini API

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your real API key to GitHub.

The `.env` file should be included in `.gitignore`.

---

## Running the Application

Start the FastAPI development server:

```bash
python -m uvicorn main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

---

## Example Input

```text
Name: Alex
Destination: Istanbul
Days: 5
Budget: Medium
Interests: History, Food, Architecture
Travel Style: Cultural
Technique: Structured Reasoning
```

The application processes these preferences and generates a personalized multi-day itinerary using Google Gemini.

---

## Prompt Engineering

One of the main objectives of Atlas AI Itinerary is to demonstrate how prompt design can affect generative AI output.

### Zero-Shot

The model receives the task and user requirements directly.

```text
Create a personalized travel itinerary based on the following requirements...
```

### Few-Shot

The model receives examples that demonstrate the expected format and quality before generating the final itinerary.

```text
Example itinerary:
...

Now create a similar itinerary for:
...
```

### Structured Reasoning

The prompt or
