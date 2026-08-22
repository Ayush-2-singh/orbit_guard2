#!/usr/bin/env python3
"""
OrbitGuard Backend Server Runner

Start the FastAPI backend server.
"""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🛰️  OrbitGuard API starting on port {port}...")
    print(f"📡 API docs: http://localhost:{port}/docs")
    print(f"🔍 Health: http://localhost:{port}/api/health")
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
