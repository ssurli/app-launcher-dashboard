# App Launcher Dashboard

Dashboard statica che raccoglie in un'unica interfaccia tutte le applicazioni dell'ecosistema `ssurli`. Offre ricerca, filtri per categoria, tema chiaro/scuro e statistiche.

## Applicazioni incluse

| App | Categoria | Tecnologie |
| --- | --- | --- |
| [ESTAR Order](https://github.com/ssurli/estar-order) | Gestionale | Flask, Python, SQLite |
| [DUVRI Generator](https://github.com/ssurli/duvri-generator) | Documenti | Flask, Python |
| [Daily Briefing](https://github.com/ssurli/daily-briefing) | Produttività | Python, Email |
| [Ufficio Tecnico M365](https://github.com/ssurli/gestionale-ufficio-tecnico-microsoft365) | Gestionale | Microsoft 365, Power Platform |
| [Richieste TS](https://github.com/ssurli/gestionale_richieste_TS) | Sanità | Next.js, TypeScript |

## Stack

Sito completamente statico: HTML + CSS + JavaScript vanilla. Nessuna build, nessuna dipendenza.

- `index.html` — markup della dashboard
- `styles.css` — temi chiaro/scuro, grid responsive
- `app.js` — rendering cards, ricerca, filtri, tema
- `apps.json` — catalogo delle applicazioni (modifica qui per aggiungere/rimuovere app)

## Sviluppo locale

```bash
# Qualunque server statico va bene
python3 -m http.server 8000
# oppure
npx serve .
```

Apri `http://localhost:8000`.

## Aggiungere un'applicazione

Modifica `apps.json` aggiungendo un nuovo oggetto nell'array `apps`:

```json
{
  "id": "nome-id",
  "name": "Nome App",
  "description": "Breve descrizione.",
  "icon": "🧩",
  "color": "#2563eb",
  "tags": ["Tecnologia1", "Tecnologia2"],
  "category": "Categoria",
  "url": "https://url-produzione.example.com",
  "repo": "https://github.com/owner/repo",
  "status": "active"
}
```

Se `url` è vuoto, il pulsante "Apri" rimanda al repository.

## Deploy

### Vercel
Il repo include `vercel.json`. Basta collegare il repo a Vercel — nessuna build necessaria.

### GitHub Pages
Abilita Pages dalle impostazioni del repo puntando al branch desiderato, cartella `/`.

### Netlify
Drag & drop della cartella, oppure connetti il repo senza comando di build.

## Shortcut da tastiera

- `/` — focus sulla barra di ricerca
- `Esc` — pulisce la ricerca

## Branch di sviluppo

Il lavoro in corso è sul branch `claude/continue-dashboard-dev-1vUSJ`.
