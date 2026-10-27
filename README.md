# SvelteKit Short URLs

A modern URL shortener built with SvelteKit and SQLite
(`node:sqlite`). Features link management, click tracking, and
referrer analytics.

## Features

- Short URL creation and redirection
- Click tracking and analytics
- Referrer tracking
- Web interface for viewing active links
- Position-based link ordering
- Visibility controls for links

## Database Schema

The application uses SQLite (`node:sqlite`) with two main tables.
Tables are created on first use if they don't exist.

### Links Table

- `id`: Unique identifier
- `source`: Short URL path
- `destination`: Target URL
- `position`: Order position
- `description`: Link description
- `clicks`: Click counter
- `visible`: Visibility flag

### Referrers Table

- Tracks traffic sources for each link
- Maintains count of visits per referrer

## Setup

The database file defaults to `./local-dev-replica.db` in dev and
`/app/data/turso-replica.db` in production. Override it with:

```bash
DATABASE_PATH=/path/to/links.db
```

## Database Operations

### Adding a Link

```sql
INSERT INTO links (source, destination, description, visible, position)
VALUES ('key', 'https://destination.com', 'Description', true, 1);
```

### Updating a Link

```sql
UPDATE links
SET destination = 'new-url', description = 'new description'
WHERE source = 'key';
```

### Deleting a Link

```sql
DELETE FROM links WHERE source = 'key';
```

### Viewing Links

```sql
-- All visible links
SELECT * FROM links WHERE visible = true;

-- Most clicked links
SELECT source, destination, clicks
FROM links
ORDER BY clicks DESC
LIMIT 10;

-- Top referrers
SELECT r.referrer, SUM(r.count) as total_referrals
FROM referrers r
GROUP BY r.referrer
ORDER BY total_referrals DESC
LIMIT 10;
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test
```

## Security Features

- Server-side database operations only
- No client-side fetch operations
- Secure redirect handling
- Environment variable protection
