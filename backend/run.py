import uvicorn

if __name__ == "__main__":
    print("=========================================================")
    print("   SAGAR DRISHTI — Maritime Intelligence Backend Server  ")
    print("   See. Trace. Attribute.                                ")
    print("=========================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
