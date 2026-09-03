import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8005"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting SAGAR DRISHTI FastAPI Server on http://{host}:{port} ...")
    uvicorn.run(app, host=host, port=port)
