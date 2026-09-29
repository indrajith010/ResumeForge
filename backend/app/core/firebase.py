import os

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import FIREBASE_CREDENTIALS_PATH

_initialized = False


def init_firebase():
    global _initialized
    if _initialized:
        return

    cred_path = os.environ.get(
        "FIREBASE_CREDENTIALS_PATH",
        str(FIREBASE_CREDENTIALS_PATH),
    )

    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

    _initialized = True


def verify_id_token(id_token: str) -> auth.UserRecord:
    init_firebase()
    decoded = auth.verify_id_token(id_token)
    return decoded
