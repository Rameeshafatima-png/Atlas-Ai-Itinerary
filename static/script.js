(() => {
  "use strict";

  const form        = document.getElementById("trip-form");
  const submitBtn   = document.getElementById("submit-btn");
  const errorBox    = document.getElementById("form-error");

  const resultEmpty = document.getElementById("result-empty");
  const ticket      = document.getElementById("ticket");
  const ticketBody  = document.getElementById("t-content");

  const copyBtn     = document.getElementById("copy-btn");
  const newBtn      = document.getElementById("new-btn");

  const connDot     = document.getElementById("conn-dot");
  const connText    = document.getElementById("conn-text");

  let lastItineraryText = "";

  /* ---------------- connection check ---------------- */

  async function checkHealth() {
    try {
      const res = await fetch("/health");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      if (data.gemini_configured) {
        connDot.className = "conn-dot ok";
        connText.textContent = `Atlas is ready — drafting with ${data.primary_model}.`;
      } else {
        connDot.className = "conn-dot bad";
        connText.textContent = "Atlas is running, but no Gemini API key is configured yet.";
      }
    } catch (err) {
      connDot.className = "conn-dot bad";
      connText.textContent = "Can't reach the Atlas server right now.";
    }
  }

  checkHealth();

  /* ---------------- helpers ---------------- */

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  // Escape raw text before we selectively re-introduce a few markdown-ish tags.
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Turn light markdown (headings, **bold**, "- " bullets, blank-line
  // paragraphs) from the model's plain-text response into simple HTML,
  // and give "Estimated ... cost" lines their own styled treatment.
  function renderItinerary(rawText) {
    const lines = rawText.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inList = false;

    const closeList = () => {
      if (inList) { html += "</ul>"; inList = false; }
    };

    const inline = (text) => {
      let t = escapeHtml(text.trim());
      t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return t;
    };

    for (let raw of lines) {
      const line = raw.trim();

      if (!line) { closeList(); continue; }

      const headingMatch = line.match(/^(#{1,3}\s*)?(Day\s+\d+.*)$/i);
      const isHeading = /^#{1,3}\s/.test(line) || /^\*{0,2}Day\s+\d+/i.test(line);

      if (isHeading) {
        closeList();
        const text = line.replace(/^#{1,3}\s*/, "").replace(/\*\*/g, "");
        html += `<h3>${escapeHtml(text)}</h3>`;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
        continue;
      }

      if (/estimated.*cost/i.test(line)) {
        closeList();
        html += `<p class="day-cost">${inline(line)}</p>`;
        continue;
      }

      closeList();
      html += `<p>${inline(line)}</p>`;
    }
    closeList();

    return html || `<p>${escapeHtml(rawText)}</p>`;
  }

  /* ---------------- form submit ---------------- */

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const formData = new FormData(form);
    const technique = formData.get("technique");

    if (!technique) {
      showError("Pick a planning method before drafting.");
      return;
    }

    const payload = {
      name: (formData.get("name") || "").trim(),
      destination: (formData.get("destination") || "").trim(),
      days: parseInt(formData.get("days"), 10),
      budget: parseFloat(formData.get("budget")),
      interests: (formData.get("interests") || "").trim(),
      travel_style: formData.get("travel_style") || "",
      technique,
    };

    if (!payload.name || !payload.destination || !payload.interests || !payload.travel_style) {
      showError("A few fields still need filling in.");
      return;
    }
    if (!Number.isFinite(payload.days) || payload.days < 1 || payload.days > 30) {
      showError("Trip length should be between 1 and 30 days.");
      return;
    }
    if (!Number.isFinite(payload.budget) || payload.budget < 0) {
      showError("Budget should be a non-negative number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = (data && data.detail) ? data.detail : `Request failed (${res.status}).`;
        throw new Error(detail);
      }

      lastItineraryText = data.itinerary || "";

      document.getElementById("t-destination").textContent = payload.destination;
      document.getElementById("t-name").textContent = payload.name;
      document.getElementById("t-days").textContent = `${payload.days} day${payload.days === 1 ? "" : "s"}`;
      document.getElementById("t-budget").textContent = formatMoney(payload.budget);
      document.getElementById("t-style").textContent = payload.travel_style;
      document.getElementById("t-model").textContent = data.model || "Atlas";

      ticketBody.innerHTML = renderItinerary(lastItineraryText);

      resultEmpty.hidden = true;
      ticket.hidden = false;
      ticket.classList.remove("ticket");
      void ticket.offsetWidth; // restart the reveal animation
      ticket.classList.add("ticket");
      ticket.scrollIntoView({ behavior: "smooth", block: "nearest" });

    } catch (err) {
      showError(err.message || "Something went wrong while drafting the trip.");
    } finally {
      setLoading(false);
    }
  });

  /* ---------------- ticket actions ---------------- */

  copyBtn.addEventListener("click", async () => {
    if (!lastItineraryText) return;
    try {
      await navigator.clipboard.writeText(lastItineraryText);
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("is-copied");
      setTimeout(() => {
        copyBtn.textContent = "Copy itinerary";
        copyBtn.classList.remove("is-copied");
      }, 1800);
    } catch (err) {
      showError("Couldn't copy — your browser may be blocking clipboard access.");
    }
  });

  newBtn.addEventListener("click", () => {
    ticket.hidden = true;
    resultEmpty.hidden = false;
    form.reset();
    document.getElementById("name").focus();
  });

})();