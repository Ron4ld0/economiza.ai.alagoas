import os
from celery import Celery

# Celery configuration for asynchronous SEFAZ-AL ingestion
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "economiza_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Maceio",
    enable_utc=True,
    task_routes={
        "app.workers.*": {"queue": "sefaz_ingestion"}
    },
)

@celery_app.task
def dummy_task():
    return "Celery is configured!"
