import aiosqlite
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import DATABASE_URL
from app.core.firebase import verify_id_token

security = HTTPBearer()

DATABASE_PATH = DATABASE_URL.replace("sqlite+aiosqlite:///", "")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    try:
        decoded = verify_id_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        ) from e

    uid = decoded.get("uid")
    email = decoded.get("email", "")
    display_name = decoded.get("display_name", "")

    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        await db.execute(
            "INSERT OR IGNORE INTO users (id, email, display_name) VALUES (?, ?, ?)",
            (uid, email, display_name),
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (uid,))
        user = await cursor.fetchone()
    finally:
        await db.close()

    return {
        "uid": uid,
        "email": email,
        "display_name": display_name,
        "user": dict(user) if user else None,
    }
