import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="SAGAR DRISHTI API",
    description="AI-Powered Maritime Oil Spill Detection & Vessel Attribution System API",
    version="1.0.0"
)

# Enable production & development CORS
frontend_url = os.getenv("FRONTEND_URL", "*")
allowed_origins = ["*"] if frontend_url == "*" else [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "SAGAR DRISHTI",
        "tagline": "See. Trace. Attribute.",
        "status": "ONLINE",
        "docs_url": "/docs",
        "api_health": "/api/health"
    }
