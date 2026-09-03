import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="SAGAR DRISHTI API",
    description="AI-Powered Maritime Oil Spill Detection & Vessel Attribution System API",
    version="1.0.0"
)

# Enable full production & development CORS for public demo deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
