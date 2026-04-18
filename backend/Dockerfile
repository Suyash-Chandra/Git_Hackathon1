# ── Git Music API ─ Production Dockerfile ─────────────────────────────────
FROM python:3.12-slim AS base

# System dependencies required by librosa / soundfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libsndfile1 \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create audio_files directory
RUN mkdir -p audio_files

# Expose port (Render sets $PORT automatically)
EXPOSE 8000

# Start uvicorn — $PORT is injected by Render at runtime
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
