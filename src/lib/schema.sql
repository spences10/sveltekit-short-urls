CREATE TABLE
  links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,
    destination TEXT,
    position INTEGER,
    description TEXT,
    clicks INTEGER,
    visible BOOLEAN
  );

CREATE TABLE
  referrers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER,
    referrer TEXT,
    count INTEGER DEFAULT 1,
    FOREIGN KEY (link_id) REFERENCES links (id),
    UNIQUE (link_id, referrer)
  );

-- 1. Most clicked links
SELECT
  source,
  destination,
  clicks
FROM
  links
ORDER BY
  clicks DESC
LIMIT
  10;

-- 2. Total clicks across all links
SELECT
  SUM(clicks) as total_clicks
FROM
  links;

-- 3. Top referrers across all links
SELECT
  r.referrer,
  SUM(r.count) as total_referrals
FROM
  referrers r
GROUP BY
  r.referrer
ORDER BY
  total_referrals DESC
LIMIT
  10;

-- 4. Links with their top referrer
SELECT
  l.source,
  l.destination,
  r.referrer,
  r.count
FROM
  links l
  JOIN referrers r ON l.id = r.link_id
WHERE
  r.count = (
    SELECT
      MAX(count)
    FROM
      referrers
    WHERE
      link_id = l.id
  )
ORDER BY
  r.count DESC;

-- 5. Conversion rate (assuming visible links are "active")
SELECT
  COUNT(
    CASE
      WHEN clicks > 0 THEN 1
    END
  ) * 100.0 / COUNT(*) as conversion_rate
FROM
  links
WHERE
  visible = TRUE;

-- 6. Links without any clicks
SELECT
  source,
  destination
FROM
  links
WHERE
  clicks = 0;

-- 7. Average clicks per link
SELECT
  AVG(clicks) as avg_clicks
FROM
  links;

-- 8. Links with their referrer count
SELECT
  l.source,
  l.destination,
  COUNT(r.id) as referrer_count
FROM
  links l
  LEFT JOIN referrers r ON l.id = r.link_id
GROUP BY
  l.id
ORDER BY
  referrer_count DESC;

-- 9. Monthly click trends (assuming you add a created_at timestamp to the links table)
-- SELECT 
--     strftime('%Y-%m', created_at) as month,
--     SUM(clicks) as total_clicks
-- FROM links
-- GROUP BY month
-- ORDER BY month;
-- 10. Links ordered by position (if used for ordering)
SELECT
  source,
  destination,
  position
FROM
  links
WHERE
  visible = TRUE
ORDER BY
  position;