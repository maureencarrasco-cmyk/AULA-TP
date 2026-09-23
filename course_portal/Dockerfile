FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY db /app/db
COPY index.html styles.css lms-module-graphics.css app.js course-content.js ae-content.js integrator-content.js practice-content.js electricity-content.js tp-specialties-catalog.js catalog-portal-profile.js /app/frontend/
COPY assets /app/frontend/assets

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
