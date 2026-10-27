# SvelteKit Short URLs

A URL shortener built with SvelteKit and SQLite (`node:sqlite`).
`/<source>` redirects to the link's destination and records the click.

## Data

One SQLite file, at `DATABASE_PATH` (default `./data/short-urls.db`).
The schema is `src/lib/server/schema.sql`, applied on start.

- `links`: source, destination, description, position, visible.
- `click_events`: one row per redirect with time, referrer source,
  country, browser, OS, device and a bot flag. No IP address; the
  visitor hash rotates daily.
- `legacy_clicks`, `legacy_referrers`: totals from the old database up
  to 2026-10-27, bots included and undated. Never written after
  import.

`/links` shows legacy clicks plus human clicks since.

## Environment

| Variable            | Use                                                   |
| ------------------- | ----------------------------------------------------- |
| `DATABASE_PATH`     | SQLite file path                                      |
| `INGEST_TOKEN`      | Bearer token for `/api/ingest`, 32+ characters        |
| `ANALYTICS_SALT`    | Salt for visitor hashes; unset uses a per-process one |
| `PUBLIC_FATHOM_ID`  | Fathom site ID, at build time                         |
| `PUBLIC_FATHOM_URL` | Fathom script URL, at build time                      |

## Managing links

```bash
curl -X POST https://<host>/api/ingest \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $INGEST_TOKEN" \
	-d '{"task": "add_link", "data": {"source": "yt", "destination": "https://youtube.com/@scottspence", "description": "YouTube"}}'
```

| Task          | `data`                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| `list_links`  | none                                                                   |
| `add_link`    | `source`, `destination`, optional `description`, `position`, `visible` |
| `update_link` | `source`, `changes` (any `add_link` field)                             |
| `delete_link` | `source`; also deletes its click history                               |

`api`, `health` and `links` cannot be sources: those routes would
shadow them.

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
```
