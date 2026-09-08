const form = document.getElementById("travelForm");
const techniqueButtons = document.querySelectorAll(".technique");
const generateBtn = document.getElementById("generateBtn");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const result = document.getElementById("result");
const resultTechnique = document.getElementById("resultTechnique");

let selectedTechnique = "zero-shot";

techniqueButtons.forEach((button) => {
    button.addEventListener("click", () => {
        techniqueButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        selectedTechnique = button.dataset.technique;

        resultTechnique.textContent =
            selectedTechnique === "zero-shot"
                ? "Zero-Shot"
                : selectedTechnique === "few-shot"
                ? "Few-Shot"
                : "Structured Reasoning";
    });
});

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function markdownToHtml(text) {
    let html = escapeHtml(text);

    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    const lines = html.split("\n");
    let output = "";
    let inList = false;

    for (const line of lines) {
        if (/^\s*[-*]\s+/.test(line)) {
            if (!inList) {
                output += "<ul>";
                inList = true;
            }
            output += `<li>${line.replace(/^\s*[-*]\s+/, "")}</li>`;
        } else {
            if (inList) {
                output += "</ul>";
                inList = false;
            }

            if (line.trim() === "") {
                continue;
            }

            if (!line.startsWith("<h")) {
                output += `<p>${line}</p>`;
            } else {
                output += line;
            }
        }
    }

    if (inList) output += "</ul>";

    return output;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        name: document.getElementById("name").value.trim(),
        destination: document.getElementById("destination").value.trim(),
        days: Number(document.getElementById("days").value),
        budget: Number(document.getElementById("budget").value),
        interests: document.getElementById("interests").value.trim(),
        travel_style: document.getElementById("travelStyle").value,
        technique: selectedTechnique
    };

    if (!payload.name || !payload.destination || !payload.days ||
        payload.budget < 0 || !payload.interests || !payload.travel_style) {
        alert("Please complete all travel details.");
        return;
    }

    emptyState.classList.add("hidden");
    result.classList.add("hidden");
    loadingState.classList.remove("hidden");
    generateBtn.disabled = true;
    generateBtn.querySelector("span").textContent = "Generating...";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong.");
        }

        resultTechnique.textContent =
            selectedTechnique === "zero-shot"
                ? "Zero-Shot"
                : selectedTechnique === "few-shot"
                ? "Few-Shot"
                : "Structured Reasoning";

        result.innerHTML = markdownToHtml(data.itinerary);

        loadingState.classList.add("hidden");
        result.classList.remove("hidden");
    } catch (error) {
        loadingState.classList.add("hidden");
        result.classList.remove("hidden");
        result.innerHTML = `
            <h3>Unable to generate itinerary</h3>
            <p><strong>Error:</strong> ${escapeHtml(error.message)}</p>
            <p>Please check your Gemini API key and try again.</p>
        `;
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector("span").textContent = "Generate Itinerary";
    }
});
