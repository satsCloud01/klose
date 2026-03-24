import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    try:
        from .seed import seed_database
        await seed_database()
    except Exception as e:
        print(f"Seed skipped: {e}")
    yield


app = FastAPI(title="Klose CRM API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router_modules = [
    "dashboard", "leads", "properties", "visits", "pipeline",
    "negotiation", "finance", "partners", "team", "settings",
]

for name in router_modules:
    try:
        mod = __import__(f"klose.routers.{name}", fromlist=["router"])
        app.include_router(mod.router)
    except Exception as e:
        print(f"Router '{name}' not loaded: {e}")


# Serve frontend in production (must be after all API routes)
_candidates = [
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "dist"),
    "/app/frontend/dist",
]
frontend_dist = next((p for p in _candidates if os.path.isdir(p)), None)
if frontend_dist:
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static-assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"app": "Klose CRM", "version": "1.0.0"}
