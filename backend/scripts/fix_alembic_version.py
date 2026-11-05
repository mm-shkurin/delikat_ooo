import asyncio
import os
import re
import sys

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) > 1 else "0001_account_auth"
    if not re.fullmatch(r"[0-9A-Za-z_]+", target):
        raise SystemExit("revision id must be letters, digits, or underscore")
    engine = create_async_engine(os.environ["DATABASE_URL"])
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE alembic_version SET version_num = :target"), {"target": target})
    await engine.dispose()
    print(f"alembic_version -> {target}")


asyncio.run(main())
