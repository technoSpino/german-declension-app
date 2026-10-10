"""SQLite storage. One file at ~/kaskade-data/kaskade.db, single user."""
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS vocab_tests (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  answers TEXT NOT NULL,
  result TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL,            -- upload | youtube
  title TEXT NOT NULL,
  source_url TEXT,
  media_file TEXT,               -- filename inside MEDIA_DIR
  cues TEXT NOT NULL             -- JSON [{start, end, text}]
);
CREATE TABLE IF NOT EXISTS satzcheck_runs (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  media_id INTEGER,
  content_type TEXT NOT NULL,    -- simple | adult
  window_start REAL NOT NULL,
  window_end REAL NOT NULL,
  ratings TEXT NOT NULL,         -- JSON [{cue, text, rating}]
  result TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS placements (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL,          -- in_progress | done
  state TEXT NOT NULL,
  result TEXT
);
CREATE TABLE IF NOT EXISTS recordings (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  context TEXT NOT NULL,         -- e.g. placement:3:q1
  filename TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS writings (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  context TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  text TEXT NOT NULL,
  grade TEXT
);
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,           -- e.g. core:0001
  status TEXT NOT NULL,          -- new | learning | known | suspended
  fsrs TEXT,                     -- serialised fsrs.Card
  due TEXT,
  introduced_on TEXT,            -- local date the card was first shown
  lapses INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cards_due ON cards(status, due);
CREATE TABLE IF NOT EXISTS review_log (
  id INTEGER PRIMARY KEY,
  card_id TEXT NOT NULL,
  rating INTEGER NOT NULL,       -- 1..4, 0 = kenne ich schon
  reviewed_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  prev TEXT                      -- card row before this review (for undo)
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY,
  local_date TEXT NOT NULL,
  block TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  seconds INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS mined (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  sentence TEXT NOT NULL,
  target TEXT NOT NULL,
  lemma TEXT NOT NULL,
  display TEXT NOT NULL,
  gloss TEXT NOT NULL,
  en TEXT,
  note TEXT,
  kasus TEXT,                    -- N | A | D | G | NULL
  source TEXT
);
CREATE TABLE IF NOT EXISTS media_progress (
  media_id INTEGER PRIMARY KEY,  -- resume position per clip (Schauen & minen)
  position REAL NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS practice_attempts (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  module TEXT NOT NULL,          -- lesen | hoeren | schreiben
  item_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  total INTEGER NOT NULL,
  timed INTEGER NOT NULL DEFAULT 0,
  seconds INTEGER,
  detail TEXT
);
CREATE TABLE IF NOT EXISTS immersion_log (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  kind TEXT NOT NULL,            -- aktiv | passiv
  title TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS text_reads (
  id INTEGER PRIMARY KEY,
  text_id TEXT NOT NULL,
  read_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS plan_done (
  local_date TEXT NOT NULL,
  block TEXT NOT NULL,
  PRIMARY KEY (local_date, block)
);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


MIGRATIONS = [
    "ALTER TABLE review_log ADD COLUMN prev TEXT",
    # mined from a clip (Schauen & minen): where the line is, and its audio snippet
    "ALTER TABLE mined ADD COLUMN media_id INTEGER",
    "ALTER TABLE mined ADD COLUMN clip_start REAL",
    "ALTER TABLE mined ADD COLUMN clip_end REAL",
    "ALTER TABLE mined ADD COLUMN audio TEXT",
]


def init() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        for sql in MIGRATIONS:
            try:
                conn.execute(sql)
            except sqlite3.OperationalError:
                pass  # already applied


@contextmanager
def tx():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def get_setting(key: str, default=None):
    with tx() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return json.loads(row["value"]) if row else default


def set_setting(key: str, value) -> None:
    with tx() as conn:
        conn.execute(
            "INSERT INTO settings(key, value) VALUES (?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, json.dumps(value)),
        )
