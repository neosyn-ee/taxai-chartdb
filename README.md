<h1 align="center">
  <a href="https://chartdb.io#gh-light-mode-only">
    <img src="https://github.com/chartdb/chartdb/blob/main/src/assets/logo-light.png" width="400" height="70" alt="ChartDB">
  </a>
  <a href="https://chartdb.io##gh-dark-mode-only">
    <img src="https://github.com/chartdb/chartdb/blob/main/src/assets/logo-dark.png" width="400" height="70" alt="ChartDB">
  </a>
  <br>
</h1>

<p align="center">
  <b>Open-source database diagrams editor</b> <br />
  <b>No installations • No Database password required.</b> <br />
</p>

<h3 align="center">
  <a href="https://discord.gg/QeFwyWSKwC">Community</a>  &bull;
  <a href="https://www.chartdb.io?ref=github_readme">Website</a>  &bull;
  <a href="https://chartdb.io/templates?ref=github_readme">Examples</a>  &bull;
  <a href="https://app.chartdb.io?ref=github_readme">Demo</a>
</h3>

<h4 align="center">
  <a href="https://github.com/chartdb/chartdb?tab=AGPL-3.0-1-ov-file#readme">
    <img src="https://img.shields.io/github/license/chartdb/chartdb?color=blue" alt="ChartDB is released under the AGPL license." />
  </a>
  <a href="https://github.com/chartdb/chartdb/blob/main/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/QeFwyWSKwC">
    <img src="https://img.shields.io/discord/1277047413705670678?color=5865F2&label=Discord&logo=discord&logoColor=white" alt="Discord community channel" />
  </a>
  <a href="https://x.com/intent/follow?screen_name=jonathanfishner">
    <img src="https://img.shields.io/twitter/follow/jonathanfishner?style=social"/>
  </a>

</h4>

---

<p align="center">
  <img width='700px' src="./public/chartdb.png">
</p>

### 🎉 ChartDB

ChartDB is a powerful, web-based database diagramming editor.
Instantly visualize your database schema with a single **"Smart Query."** Customize diagrams, export SQL scripts, and access all features—no account required. Experience seamless database design here.

**What it does**:

- **Instant Schema Import**
  Run a single query to instantly retrieve your database schema as JSON. This makes it incredibly fast to visualize your database schema, whether for documentation, team discussions, or simply understanding your data better.

- **AI-Powered Export for Easy Migration**
  Our AI-driven export feature allows you to generate the DDL script in the dialect of your choice. Whether you're migrating from MySQL to PostgreSQL or from SQLite to MariaDB, ChartDB simplifies the process by providing the necessary scripts tailored to your target database.
- **Interactive Editing**
  Fine-tune your database schema using our intuitive editor. Easily make adjustments or annotations to better visualize complex structures.

### Status

ChartDB is currently in Public Beta. Star and watch this repository to get notified of updates.

### Supported Databases

- ✅ PostgreSQL (<img src="./src/assets/postgresql_logo_2.png" width="15"/> + <img src="./src/assets/supabase.png" alt="Supabase" width="15"/> + <img src="./src/assets/timescale.png" alt="Timescale" width="15"/> )
- ✅ MySQL
- ✅ SQL Server
- ✅ MariaDB
- ✅ SQLite (<img src="./src/assets/sqlite_logo_2.png" width="15"/> + <img src="./src/assets/cloudflare_d1.png" alt="Cloudflare D1" width="15"/> Cloudflare D1)
- ✅ CockroachDB
- ✅ ClickHouse

## Getting Started

Use the [cloud version](https://app.chartdb.io?ref=github_readme_2) or deploy locally:

### How To Use

```bash
npm install
npm run dev
```

### Build

```bash
npm install
npm run build
```

Or like this if you want to have AI capabilities:

```bash
npm install
VITE_OPENAI_API_KEY=<YOUR_OPEN_AI_KEY> npm run build
```

### Run the Docker Container

```bash
docker run -e OPENAI_API_KEY=<YOUR_OPEN_AI_KEY> -p 8080:80 ghcr.io/chartdb/chartdb:latest
```

#### Build and Run locally

```bash
docker build -t chartdb .
docker run -e OPENAI_API_KEY=<YOUR_OPEN_AI_KEY> -p 8080:80 chartdb
```

#### Using Custom Inference Server

```bash
# Build
docker build \
  --build-arg VITE_OPENAI_API_ENDPOINT=<YOUR_ENDPOINT> \
  --build-arg VITE_LLM_MODEL_NAME=<YOUR_MODEL_NAME> \
  -t chartdb .

# Run
docker run \
  -e OPENAI_API_ENDPOINT=<YOUR_ENDPOINT> \
  -e LLM_MODEL_NAME=<YOUR_MODEL_NAME> \
  -p 8080:80 chartdb
```

> **Privacy Note:** ChartDB includes privacy-focused analytics via Fathom Analytics. You can disable this by adding `-e DISABLE_ANALYTICS=true` to the run command or `--build-arg VITE_DISABLE_ANALYTICS=true` when building.

> **Note:** You must configure either Option 1 (OpenAI API key) OR Option 2 (Custom endpoint and model name) for AI capabilities to work. Do not mix the two options.

Open your browser and navigate to `http://localhost:8080`.

Example configuration for a local vLLM server:

```bash
VITE_OPENAI_API_ENDPOINT=http://localhost:8000/v1
VITE_LLM_MODEL_NAME=Qwen/Qwen2.5-32B-Instruct-AWQ
```

## Try it on our website

1. Go to [ChartDB.io](https://chartdb.io?ref=github_readme_2)
2. Click "Go to app"
3. Choose the database that you are using.
4. Take the magic query and run it in your database.
5. Copy and paste the resulting JSON set into ChartDB.
6. Enjoy Viewing & Editing!

## Neosyn fork — Versioning & repository sync

This fork extends upstream ChartDB with two features aimed at teams that
want their UML diagrams to live inside a git repository, without adding a
backend service. Both features are 100% client-side.

### 1. Automatic UML versioning (IndexedDB)

Every time you edit a diagram, a JSON snapshot is taken **5 seconds after
your last change** and stored locally (IndexedDB, `diagram_versions`
table). Only the **last 3 snapshots per diagram** are kept — older ones
are pruned automatically.

Access the history from **Backup → Versions** in the top menu. From the
dialog you can see timestamp, table count and relationship count of each
snapshot, and restore any of them. Restoring replaces the current
diagram content but **does not delete the other snapshots**, so you can
roll forward again if needed.

### 2. Save mode toggle + repository folder sync

The top-right corner exposes a new **Save** control:

- A **Save** button that takes a snapshot on demand.
- A dropdown with two sections:
  - **Save mode** — radio toggle between:
    - `Auto-save` (default): snapshots happen automatically after each
      edit, debounced 5s.
    - `Manual save`: no automatic snapshots. Only the **Save** button
      triggers a snapshot.
  - **Repository folder** — link a local folder (e.g. the folder where
    your project's git repo lives). Once linked, every snapshot (auto
    or manual) also writes the diagram JSON to that folder as
    `<diagramId>.chartdb.json`. You can then commit the file with git
    as part of your normal workflow.

The chosen folder is remembered across sessions. On the first write of
each browser session, the browser may show a one-time permission
prompt (standard OS security behaviour) — click **Allow** and the
linked folder works silently for the rest of the session.

### How to use it (step by step)

1. Open or create a diagram in ChartDB.
2. In the top-right **Save** dropdown, choose your preferred mode:
   - **Auto-save** if you want transparent snapshots while you edit.
   - **Manual save** if you prefer explicit control (useful for clean
     git diffs).
3. (Optional) Click **Link folder…** and pick the folder where you
   want the UML files to live. Typically this is a folder inside your
   project repository, e.g. `docs/uml/` or `db/schema/`.
4. Edit freely. In auto mode, a snapshot (IndexedDB + file if folder
   linked) is written 5 seconds after your last edit. In manual mode,
   snapshots happen only when you click **Save**.
5. Commit `<diagramId>.chartdb.json` as you would with any other
   source file.
6. To roll back to a previous state, open **Backup → Versions** and
   restore the snapshot you want.

### Browser support

The repository folder feature uses the **File System Access API**,
which is currently supported only on Chromium-based browsers
(Chrome, Edge, Brave, Arc, Opera). On Firefox and Safari the folder
controls appear disabled with an informative tooltip; auto/manual
save and IndexedDB versioning still work normally.

### Where is data stored?

- **IndexedDB database** `ChartDB` (schema v15+):
  - `diagrams`, `db_tables`, `db_relationships`, `db_dependencies`,
    `areas`, `db_custom_types`, `notes` — the diagram entities
    (unchanged from upstream).
  - `diagram_versions` — snapshot history (last 3 per diagram).
  - `config` — app config, now also stores `saveMode` and the linked
    `folderHandle` (so the chosen folder is remembered across reloads).
- **Linked folder** (if configured): one JSON file per diagram,
  `<diagramId>.chartdb.json`, overwritten on every save.

Deleting a diagram from the app removes its entities **and** its
version history from IndexedDB. Files previously written to the
linked folder are left untouched — delete them manually if needed.

### File naming rationale

Files are named after the internal diagram id (not the display name)
so that renaming a diagram does not create orphaned files in the
folder. If you want a human-readable file name, rename the file
manually in git after the first write; subsequent saves will write
back to the original `<diagramId>.chartdb.json`, so do not use
renames as an identity mechanism.

## 💚 Community & Support

- [Discord](https://discord.gg/QeFwyWSKwC) (For live discussion with the community and the ChartDB team)
- [GitHub Issues](https://github.com/chartdb/chartdb/issues) (For any bugs and errors you encounter using ChartDB)
- [Twitter](https://x.com/intent/follow?screen_name=jonathanfishner) (Get news fast)

## Contributing

We welcome community contributions, big or small, and are here to guide you along
the way. Message us in the [ChartDB Community Discord](https://discord.gg/QeFwyWSKwC).

For more information on how to contribute, please see our
[Contributing Guide](/CONTRIBUTING.md).

This project is released with a [Contributor Code of Conduct](/CODE_OF_CONDUCT.md).
By participating in this project, you agree to follow its terms.

Thank you for helping us make ChartDB better for everyone :heart:.

## License

ChartDB is licensed under the [GNU Affero General Public License v3.0](LICENSE)
