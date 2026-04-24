(() => {
  "use strict";

  const state = {
    apps: [],
    filter: "all",
    query: "",
  };

  const els = {
    grid: document.getElementById("app-grid"),
    search: document.getElementById("search"),
    filters: document.getElementById("filters"),
    empty: document.getElementById("empty-state"),
    stats: document.getElementById("stats"),
    clock: document.getElementById("clock"),
    year: document.getElementById("year"),
    themeToggle: document.getElementById("theme-toggle"),
    template: document.getElementById("card-template"),
  };

  // --- Theme -----------------------------------------------------------
  const THEME_KEY = "dashboard-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {}
  }

  function initTheme() {
    let theme;
    try {
      theme = localStorage.getItem(THEME_KEY);
    } catch (_) {}
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    applyTheme(theme);
    els.themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // --- Clock -----------------------------------------------------------
  function initClock() {
    const update = () => {
      const now = new Date();
      const date = now.toLocaleDateString("it-IT", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
      const time = now.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      els.clock.textContent = `${date} · ${time}`;
    };
    update();
    setInterval(update, 30_000);
    els.year.textContent = new Date().getFullYear();
  }

  // --- Data ------------------------------------------------------------
  async function loadApps() {
    try {
      const res = await fetch("apps.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.apps = data.apps || [];
    } catch (err) {
      console.error("Errore caricamento apps:", err);
      state.apps = [];
      els.grid.innerHTML = `<p class="empty-state">Impossibile caricare il catalogo applicazioni.</p>`;
    }
  }

  // --- Render ----------------------------------------------------------
  function renderStats() {
    const total = state.apps.length;
    const active = state.apps.filter((a) => a.status === "active").length;
    const categories = new Set(state.apps.map((a) => a.category).filter(Boolean))
      .size;

    els.stats.innerHTML = `
      <div class="stat">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Applicazioni totali</div>
      </div>
      <div class="stat">
        <div class="stat-value">${active}</div>
        <div class="stat-label">Attive</div>
      </div>
      <div class="stat">
        <div class="stat-value">${categories}</div>
        <div class="stat-label">Categorie</div>
      </div>
    `;
  }

  function renderFilters() {
    const categories = Array.from(
      new Set(state.apps.map((a) => a.category).filter(Boolean))
    ).sort();
    const chips = ["all", ...categories];
    els.filters.innerHTML = chips
      .map(
        (c) => `<button class="filter-chip ${
          c === state.filter ? "active" : ""
        }" data-filter="${escapeHtml(c)}" type="button" role="tab">${
          c === "all" ? "Tutte" : escapeHtml(c)
        }</button>`
      )
      .join("");
    els.filters.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.filter = chip.dataset.filter;
        renderFilters();
        renderGrid();
      });
    });
  }

  function getFiltered() {
    const q = state.query.trim().toLowerCase();
    return state.apps.filter((app) => {
      if (state.filter !== "all" && app.category !== state.filter) return false;
      if (!q) return true;
      const haystack = [
        app.name,
        app.description,
        app.category,
        ...(app.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderGrid() {
    const items = getFiltered();
    els.grid.innerHTML = "";
    if (items.length === 0) {
      els.empty.hidden = false;
      return;
    }
    els.empty.hidden = true;

    const frag = document.createDocumentFragment();
    items.forEach((app) => frag.appendChild(buildCard(app)));
    els.grid.appendChild(frag);
  }

  function buildCard(app) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const accent = app.color || "#2563eb";
    node.style.setProperty("--card-accent", accent);

    node.querySelector(".card-icon").textContent = app.icon || "🧩";
    node.querySelector(".card-title").textContent = app.name;
    node.querySelector(".card-description").textContent = app.description || "";

    const statusEl = node.querySelector(".card-status");
    if (app.status === "active") {
      statusEl.textContent = "Attivo";
    } else {
      statusEl.textContent = app.status || "Inattivo";
      statusEl.classList.add("inactive");
    }

    const tagsEl = node.querySelector(".card-tags");
    (app.tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsEl.appendChild(span);
    });

    const openLink = node.querySelector(".card-open");
    if (app.url) {
      openLink.href = app.url;
    } else {
      openLink.href = app.repo || "#";
      openLink.textContent = "Vedi repo";
      openLink.setAttribute("title", "URL non configurata — apre il repository");
    }

    const repoLink = node.querySelector(".card-repo");
    if (app.repo) {
      repoLink.href = app.repo;
    } else {
      repoLink.hidden = true;
    }

    return node;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  // --- Search ---------------------------------------------------------
  function initSearch() {
    els.search.addEventListener("input", (e) => {
      state.query = e.target.value;
      renderGrid();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== els.search) {
        e.preventDefault();
        els.search.focus();
      }
      if (e.key === "Escape" && document.activeElement === els.search) {
        els.search.value = "";
        state.query = "";
        renderGrid();
        els.search.blur();
      }
    });
  }

  // --- Boot -----------------------------------------------------------
  async function boot() {
    initTheme();
    initClock();
    initSearch();
    await loadApps();
    renderStats();
    renderFilters();
    renderGrid();
  }

  boot();
})();
