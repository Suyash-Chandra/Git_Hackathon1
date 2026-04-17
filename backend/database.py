import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./music_ideas.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio_files")

async def init_db():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    async with engine.begin() as conn:
        from models import Idea, IdeaVersion  # noqa
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with async_session() as session:
        yield session
