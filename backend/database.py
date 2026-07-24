import os
import asyncpg
from urllib.parse import urlparse, unquote
from config import DATABASE_URL

pool = None

async def init_db():
    global pool
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is missing")

    dsn = DATABASE_URL
    if dsn.startswith("postgres://"):
        dsn = dsn.replace("postgres://", "postgresql://", 1)

    ssl_mode = "require"
    if "sslmode=disable" in dsn or os.getenv("DB_SSL", "").lower() == "false":
        ssl_mode = False

    clean_dsn = dsn.split("?")[0]

    pool = await asyncpg.create_pool(
        dsn=clean_dsn,
        min_size=2,
        max_size=10,
        ssl=ssl_mode,
        statement_cache_size=0,
    )

async def close_db():
    if pool:
        await pool.close()

async def fetch(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def fetchrow(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def fetchval(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetchval(query, *args)

async def execute(query, *args):
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)