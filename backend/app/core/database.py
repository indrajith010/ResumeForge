import aiosqlite

from app.core.config import DATABASE_URL

DATABASE_PATH = DATABASE_URL.replace("sqlite+aiosqlite:///", "")

_RESUME_COLUMNS = [
    ("full_name", "TEXT DEFAULT ''"),
    ("job_title", "TEXT DEFAULT ''"),
    ("email", "TEXT DEFAULT ''"),
    ("phone", "TEXT DEFAULT ''"),
    ("location", "TEXT DEFAULT ''"),
    ("website", "TEXT DEFAULT ''"),
    ("linkedin", "TEXT DEFAULT ''"),
    ("summary", "TEXT DEFAULT ''"),
    ("skills", "TEXT DEFAULT '[]'"),
    ("education", "TEXT DEFAULT '[]'"),
    ("experience", "TEXT DEFAULT '[]'"),
    ("projects", "TEXT DEFAULT '[]'"),
    ("certifications", "TEXT DEFAULT '[]'"),
    ("languages", "TEXT DEFAULT '[]'"),
]


async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                display_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        cursor = await db.execute("PRAGMA table_info(resumes)")
        existing = {row[1] for row in await cursor.fetchall()}

        for col_name, col_type in _RESUME_COLUMNS:
            if col_name not in existing:
                await db.execute(f"ALTER TABLE resumes ADD COLUMN {col_name} {col_type}")

        await db.commit()
