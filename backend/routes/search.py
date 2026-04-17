from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import IdeaVersion, Idea
from services.ollama_client import extract_search_tags

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search")
async def search_ideas(query: dict, db: AsyncSession = Depends(get_db)):
    """
    Semantic search for musical ideas.
    Uses Ollama to convert query to tags, then matches against stored tags.
    """
    search_query = query.get("query", "").strip()
    if not search_query:
        return {"results": [], "tags_used": []}

    # Extract search tags from natural language query
    search_tags = await extract_search_tags(search_query)

    # Fetch all idea versions with their tags
    result = await db.execute(
        select(IdeaVersion, Idea.title)
        .join(Idea, IdeaVersion.idea_id == Idea.id)
        .order_by(IdeaVersion.created_at.desc())
    )
    rows = result.all()

    # Score each version based on tag matching
    scored_results = []
    search_tags_lower = [t.lower() for t in search_tags]

    for version, idea_title in rows:
        score = 0
        version_tags = [t.lower() for t in (version.tags or [])]
        version_mood = (version.mood or "").lower()
        version_genre = (version.genre or "").lower()
        version_instruments = [i.lower() for i in (version.instruments or [])]
        version_key = (version.key_signature or "").lower()

        all_version_terms = version_tags + [version_mood, version_genre] + version_instruments + [version_key]

        for st in search_tags_lower:
            for vt in all_version_terms:
                if st in vt or vt in st:
                    score += 1
                # Partial match
                elif len(st) > 3 and len(vt) > 3:
                    common = len(set(st) & set(vt))
                    if common / max(len(set(st)), len(set(vt))) > 0.6:
                        score += 0.5

        if score > 0:
            scored_results.append({
                "idea_id": version.idea_id,
                "version_id": version.id,
                "title": idea_title,
                "bpm": version.bpm,
                "key_signature": version.key_signature,
                "mood": version.mood,
                "genre": version.genre,
                "energy_level": version.energy_level,
                "instruments": version.instruments,
                "tags": version.tags,
                "duration": version.duration,
                "file_path": version.file_path,
                "created_at": version.created_at.isoformat(),
                "score": score,
            })

    scored_results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "results": scored_results[:20],
        "tags_used": search_tags,
    }
