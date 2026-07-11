# StudyMate

AI-powered study notes app for students. Create notes, search them, generate AI summaries with a 3-question MCQ quiz, and manage notes from Claude through an MCP server.

## Tech stack

| Layer | Tech |
| --- | --- |
| Landing page | HTML, CSS, vanilla JavaScript |
| Client | React (Vite) |
| Server | Express, MongoDB (Mongoose), Claude / OpenAI |
| MCP | Node.js + `@modelcontextprotocol/sdk` (stdio) |

## Project structure

```text
studymate/
├── landing/          # Part 1 – static marketing page
├── client/           # Part 2 – React frontend
├── server/           # Parts 3 & 4 – Express API + AI
├── mcp-server/       # Part 5 – MCP tools for Claude
└── README.md         # Part 6
```

## Environment variables (`.env.example`)

Secrets live in `server/.env` (never commit this file).

`server/.env.example` documents the required keys:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas or local MongoDB connection string |
| `PORT` | API port (default `5000`) |
| `GEMINI_API_KEY` | Google Gemini API key for summaries + quiz mode (free tier available) |
| `ANTHROPIC_API_KEY` | Optional Claude API key |
| `OPENAI_API_KEY` | Optional OpenAI API key |

Copy the example file, then fill in real values:

```bash
cd server
cp .env.example .env   # Windows: copy .env.example .env
```

## Setup

### 1. Server (Express + MongoDB + AI)

```bash
cd server
npm install
cp .env.example .env   # add MONGO_URI and ANTHROPIC_API_KEY
npm run dev
```

API runs at `http://localhost:5000`.

Main routes:

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id` *(bonus: edit note)*
- `DELETE /api/notes/:id`
- `POST /api/notes/:id/summarize` *(AI summary + 3 MCQs)*

### 2. Client (React)

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

Features: list / add / edit / delete notes, search, AI summarize + quiz mode, dark mode toggle.

### 3. MCP server

Keep the Express API running first, then:

```bash
cd mcp-server
npm install
npm start
```

Tools:

- `list_notes` – fetch all notes via the Express API
- `create_note` – create a note (`title`, `subject`, `content`)

#### Claude Desktop

Add this to `%APPDATA%\Claude\claude_desktop_config.json` (adjust the path):

```json
{
  "mcpServers": {
    "studymate": {
      "command": "node",
      "args": ["D:\\DSJ Academy\\studymate\\mcp-server\\index.js"],
      "env": {
        "STUDYMATE_API_URL": "http://localhost:5000/api/notes"
      }
    }
  }
}
```

Restart Claude Desktop, then try: “What notes do I have?” or “Add a note about React hooks.”

#### MCP Inspector

```bash
cd mcp-server
npm run inspect
```

### 4. Landing page (optional)

Open `landing/index.html` in a browser.

## Screenshots

Replace the placeholder images below with your own captures (save files under `docs/screenshots/`).

### App UI

![StudyMate app UI](docs/screenshots/app-ui.png)

> Placeholder: add a screenshot of the React notes workspace (list + form).

### AI feature result

![AI summary and quiz](docs/screenshots/ai-feature.png)

> Placeholder: add a screenshot of a note after Summarize (3 bullet summary + 3 MCQs).

### MCP tool call working

![MCP tool call](docs/screenshots/mcp-tool-call.png)

> Placeholder: add a screenshot from Claude Desktop or MCP Inspector showing `list_notes` or `create_note`.

## Bonus features

- **Edit / update note** – `PUT /api/notes/:id` + Edit UI on each card
- **AI quiz mode** – Summarize generates 3 multiple-choice questions with options
- **Dark mode** – theme toggle in the React header (persisted in `localStorage`)

## License

Built as a coursework project for DSJ Academy.
