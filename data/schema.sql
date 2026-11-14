-- Territory map store. One row per claim, every claim traceable to a source.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS capability_group (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  plane   TEXT NOT NULL,           -- topology | engine | interop | entry
  sort    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS capability (
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES capability_group(id),
  name       TEXT NOT NULL,
  definition TEXT NOT NULL,        -- what this cell means, so two people score it the same way
  binding    TEXT NOT NULL DEFAULT 'build',   -- build | connect  (chosen when the project is built, or per session)
  -- How much two independent systems have to agree on this capability before the four use
  -- cases work: must, should or none. Decided once, row by row, in
  -- infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md, and carried here so the pages and
  -- the queries read the same judgement. interop_reason is the one sentence that page gives
  -- for the value.
  interop    TEXT NOT NULL DEFAULT 'should'
             CHECK (interop IN ('must','should','none')),
  interop_reason TEXT NOT NULL DEFAULT '',
  -- Which of the four use cases the row serves, as a comma-separated list of U1 to U4, taken
  -- from the same boundaries page. A certification lane is the pair (must row, use case): the
  -- lane named in infrastructure-wg/model/CERTIFICATION-LANES.md holds every must row whose
  -- list carries that use case, and nothing else. Empty on a row that needs no agreement.
  interop_uses TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subject (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL,       -- standard | web-runtime | game-engine | platform | protocol | project
  org         TEXT,
  licence     TEXT,
  url         TEXT,
  status      TEXT,                -- ratified | candidate | draft | proprietary | shipping
  version     TEXT,
  status_date TEXT,
  summary     TEXT,                -- synthesized, cited
  -- A platform's kind of platform, so the pages can group platforms: social-world (people meet
  -- and build in shared worlds), game-platform (creators publish games that players play) or
  -- ai-built-world (games and worlds are made by instructing an AI). Empty for every other kind.
  subcategory TEXT CHECK (subcategory IS NULL OR
                          (kind = 'platform' AND subcategory IN ('social-world','game-platform','ai-built-world')))
);

CREATE TABLE IF NOT EXISTS coverage (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id    TEXT NOT NULL REFERENCES subject(id),
  capability_id TEXT NOT NULL REFERENCES capability(id),
  level         TEXT NOT NULL,     -- native | partial | via-extension | none | conflicts | out-of-scope
  note          TEXT,
  confidence    TEXT NOT NULL DEFAULT 'unverified',  -- verified | reported | unverified
  -- which way the support runs: read | write | both. NULL when the claim is not about
  -- moving data in or out, or when the direction was never established.
  direction     TEXT CHECK (direction IS NULL OR direction IN ('read','write','both')),
  UNIQUE(subject_id, capability_id)
);

CREATE TABLE IF NOT EXISTS source (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  url       TEXT NOT NULL UNIQUE,
  title     TEXT,
  retrieved TEXT,
  kind      TEXT                   -- primary | secondary | local-evidence
);

-- One row per quote. A claim may cite one address more than once, each time for a
-- different sentence, so the row id is the key: keying on (coverage_id, source_id) threw
-- the second and every later quote away.
CREATE TABLE IF NOT EXISTS evidence (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  coverage_id INTEGER NOT NULL REFERENCES coverage(id),
  source_id   INTEGER NOT NULL REFERENCES source(id),
  quote       TEXT
);

-- Which standard or specification a claim says the product uses for that row, one row per
-- named standard per quote. Optional: most claims have none. A row here exists only when one of
-- the claim's own sources names that standard as what the product uses for the row, and quote is
-- the exact words, found inside that source's quote. A product that does the thing its own way,
-- or a source that only compares with a standard, gives no row. Two products that share a via
-- standard on a row agree there for certain; two that only share a level may not.
CREATE TABLE IF NOT EXISTS via (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  coverage_id INTEGER NOT NULL REFERENCES coverage(id),
  standard_id TEXT NOT NULL REFERENCES subject(id),
  evidence_id INTEGER NOT NULL REFERENCES evidence(id),
  quote       TEXT NOT NULL,
  UNIQUE(coverage_id, standard_id, evidence_id)
);

CREATE VIEW IF NOT EXISTS matrix AS
SELECT s.name AS subject, s.kind, cg.plane, cg.name AS grp, c.name AS capability,
       c.interop, c.interop_uses, cov.level, cov.confidence, cov.note, cov.direction
FROM coverage cov
JOIN subject s      ON s.id = cov.subject_id
JOIN capability c   ON c.id = cov.capability_id
JOIN capability_group cg ON cg.id = c.group_id;

CREATE VIEW IF NOT EXISTS overlap AS
SELECT c.id AS capability_id, c.name AS capability,
       COUNT(*) FILTER (WHERE cov.level IN ('native','via-extension')) AS claimants,
       GROUP_CONCAT(s.name, ' | ') AS subjects
FROM coverage cov
JOIN capability c ON c.id = cov.capability_id
JOIN subject s    ON s.id = cov.subject_id
WHERE cov.level IN ('native','via-extension')
GROUP BY c.id;

-- Related use cases: why a task needs a row. Need evidence only. A use case names no subject,
-- no support level and no confidence, so nothing here can change a coverage claim. Loaded from
-- related-use-cases.json, which is imported from a pinned commit of the contributing repository.
CREATE TABLE IF NOT EXISTS use_case (
  id             TEXT PRIMARY KEY,   -- the repository's own id, never renumbered
  title          TEXT NOT NULL,
  url            TEXT NOT NULL,      -- the original public record
  repository     TEXT NOT NULL,
  record_status  TEXT,
  record_version TEXT,
  record_date    TEXT,
  specificity    TEXT NOT NULL CHECK (specificity IN ('generic','specialised','individual','unknown')),
  extends        TEXT NOT NULL DEFAULT '',   -- comma-separated ids of the cases it specialises
  read_at        TEXT,                        -- when the public record was read
  record_sha256  TEXT,
  implementations_stated INTEGER,            -- "evidenced by" figure the page states
  implementations_linked TEXT NOT NULL DEFAULT ''  -- comma-separated implementation ids linked from the page
);

-- One link between one use case and one capability. Basis is the contributor's reading; review
-- is the Atlas's own and is kept apart from it.
CREATE TABLE IF NOT EXISTS use_case_link (
  id             TEXT PRIMARY KEY,   -- <use case id>~<capability id>
  use_case_id    TEXT NOT NULL REFERENCES use_case(id),
  capability_id  TEXT NOT NULL REFERENCES capability(id),
  source_passage TEXT NOT NULL,      -- the record's own words, quoted exactly
  source_section TEXT,
  rationale      TEXT NOT NULL,
  rationale_by   TEXT NOT NULL CHECK (rationale_by IN ('contributor','atlas-reader')),
  basis          TEXT NOT NULL CHECK (basis IN ('derived','proposed')),
  origin         TEXT NOT NULL CHECK (origin IN ('contributor','contributor-public-record','atlas-reader')),
  contribution_commit TEXT NOT NULL,
  contribution_refreshed TEXT,
  in_pinned_commit INTEGER NOT NULL,
  passage_found  INTEGER NOT NULL,
  basis_on_public_record TEXT,
  checked_release TEXT,              -- Atlas release whose definition the link was checked against
  definition_as_read TEXT,
  review_status  TEXT NOT NULL DEFAULT 'unreviewed'
                 CHECK (review_status IN ('unreviewed','accepted','needs-change','rejected','stale')),
  reviewed_at    TEXT,
  review_note    TEXT,
  drift          TEXT NOT NULL DEFAULT '[]'  -- JSON list: the source's copy of Atlas values, history only
);

-- Coverage of the contributing repository per capability, as its own file states it. Three
-- separate counts that are never added together, and not market demand.
CREATE TABLE IF NOT EXISTS use_case_coverage (
  capability_id   TEXT PRIMARY KEY REFERENCES capability(id),
  source_interop  TEXT,              -- the source's copy of the Atlas interop word, history only
  use_cases       INTEGER NOT NULL,
  specialisations INTEGER NOT NULL,
  deployments     INTEGER NOT NULL,
  use_case_ids    TEXT NOT NULL DEFAULT '',
  source_native   INTEGER,           -- the source's copy of the Atlas figures, history only
  source_partial  INTEGER,
  source_scored   INTEGER
);

-- Where the use-case data came from: one row per key.
CREATE TABLE IF NOT EXISTS use_case_source (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
