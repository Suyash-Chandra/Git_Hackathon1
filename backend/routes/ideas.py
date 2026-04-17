import os
import mimetypes
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from database import get_db, AUDIO_DIR
from models import Idea, IdeaVersion

router = APIRouter(prefix="/api", tags=["ideas"])


@router.get("/ideas")
async def list_ideas(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all ideas with their latest version metadata."""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.versions))
        .order_by(Idea.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    ideas = result.scalars().all()

    count_result = await db.execute(select(func.count(Idea.id)))
    total = count_result.scalar()

    items = []
    for idea in ideas:
        latest = idea.versions[0] if idea.versions else None
        items.append({
            "id": idea.id,
            "title": idea.title,
            "created_at": idea.created_at.isoformat(),
            "updated_at": idea.updated_at.isoformat(),
            "version_count": len(idea.versions),
            "latest_version": {
                "id": latest.id,
                "bpm": latest.bpm,
                "key_signature": latest.key_signature,
                "mood": latest.mood,
                "genre": latest.genre,
                "energy_level": latest.energy_level,
                "instruments": latest.instruments,
                "tags": latest.tags,
                "duration": latest.duration,
                "file_path": latest.file_path,
            } if latest else None,
        })

    return {"items": items, "total": total}


@router.get("/ideas/{idea_id}")
async def get_idea(idea_id: int, db: AsyncSession = Depends(get_db)):
    """Get idea detail with all versions."""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.versions))
        .where(Idea.id == idea_id)
    )
    idea = result.scalar_one_or_none()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    versions = []
    sorted_versions = sorted(idea.versions, key=lambda v: v.created_at)
    for index, v in enumerate(sorted_versions):
        display_version = f"v{idea_id}" if index == 0 else f"v{idea_id}.{index}"
        versions.append({
            "id": v.id,
            "display_version": display_version,
            "parent_version_id": v.parent_version_id,
            "file_path": v.file_path,
            "duration": v.duration,
            "bpm": v.bpm,
            "key_signature": v.key_signature,
            "mood": v.mood,
            "genre": v.genre,
            "energy_level": v.energy_level,
            "instruments": v.instruments,
            "tags": v.tags,
            "notes": v.notes,
            "created_at": v.created_at.isoformat(),
        })

    return {
        "id": idea.id,
        "title": idea.title,
        "created_at": idea.created_at.isoformat(),
        "updated_at": idea.updated_at.isoformat(),
        "versions": versions,
    }


@router.delete("/ideas/{idea_id}")
async def delete_idea(idea_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an idea and all its versions."""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.versions))
        .where(Idea.id == idea_id)
    )
    idea = result.scalar_one_or_none()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    # Delete audio files
    for v in idea.versions:
        fpath = os.path.join(AUDIO_DIR, v.file_path)
        if os.path.exists(fpath):
            os.remove(fpath)

    await db.delete(idea)
    await db.commit()
    return {"status": "deleted", "id": idea_id}


@router.get("/ideas/{idea_id}/graph")
async def get_idea_graph(idea_id: int, db: AsyncSession = Depends(get_db)):
    """Return nodes/edges for evolution graph visualization."""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.versions))
        .where(Idea.id == idea_id)
    )
    idea = result.scalar_one_or_none()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    nodes = []
    edges = []
    sorted_versions = sorted(idea.versions, key=lambda v: v.created_at)
    for index, v in enumerate(sorted_versions):
        display_version = f"v{idea_id}" if index == 0 else f"v{idea_id}.{index}"
        nodes.append({
            "id": str(v.id),
            "type": "ideaNode",
            "position": {"x": 0, "y": 0},  # Will be laid out on frontend
            "data": {
                "versionId": v.id,
                "displayVersion": display_version,
                "mood": v.mood,
                "genre": v.genre,
                "bpm": v.bpm,
                "key_signature": v.key_signature,
                "tags": v.tags or [],
                "created_at": v.created_at.isoformat(),
                "duration": v.duration,
                "file_path": v.file_path,
                "is_root": v.parent_version_id is None,
            },
        })
        if v.parent_version_id:
            edges.append({
                "id": f"e{v.parent_version_id}-{v.id}",
                "source": str(v.parent_version_id),
                "target": str(v.id),
                "animated": True,
            })

    return {"idea_title": idea.title, "nodes": nodes, "edges": edges}


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """Serve audio files."""
    file_path = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    media_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(file_path, media_type=media_type or "application/octet-stream")


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics."""
    idea_count = await db.execute(select(func.count(Idea.id)))
    total_ideas = idea_count.scalar()

    version_count = await db.execute(select(func.count(IdeaVersion.id)))
    total_versions = version_count.scalar()

    # Get mood distribution
    mood_result = await db.execute(
        select(IdeaVersion.mood, func.count(IdeaVersion.id))
        .group_by(IdeaVersion.mood)
        .order_by(func.count(IdeaVersion.id).desc())
        .limit(5)
    )
    moods = {row[0]: row[1] for row in mood_result.all() if row[0]}

    # Get genre distribution
    genre_result = await db.execute(
        select(IdeaVersion.genre, func.count(IdeaVersion.id))
        .group_by(IdeaVersion.genre)
        .order_by(func.count(IdeaVersion.id).desc())
        .limit(5)
    )
    genres = {row[0]: row[1] for row in genre_result.all() if row[0]}

    return {
        "total_ideas": total_ideas,
        "total_versions": total_versions,
        "moods": moods,
        "genres": genres,
    }


@router.get("/activity")
async def get_activity(days: int = 180, db: AsyncSession = Depends(get_db)):
    """Return daily capture activity for dashboard heatmap."""
    bounded_days = max(30, min(days, 366))

    result = await db.execute(
        select(
            func.date(IdeaVersion.created_at).label("day"),
            func.count(IdeaVersion.id).label("count"),
        )
        .group_by(func.date(IdeaVersion.created_at))
        .order_by(func.date(IdeaVersion.created_at).asc())
    )

    return {
        "days": bounded_days,
        "items": [{"date": row.day, "count": int(row.count)} for row in result.all() if row.day],
    }
