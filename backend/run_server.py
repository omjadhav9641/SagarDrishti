import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.main import app

if __name__ == "__main__":
    print("Starting SAGAR DRISHTI FastAPI Server on http://127.0.0.1:8005 ...")
    uvicorn.run(app, host="127.0.0.1", port=8005, log_level="info")
