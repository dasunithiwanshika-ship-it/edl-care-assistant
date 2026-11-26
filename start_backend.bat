@echo off
title EDL Care Assistant - Backend Server (Port 8000)
cd /d "d:\EDL\edl-care-assistant"
echo ============================================================
echo Starting EDL Care Assistant Backend on http://0.0.0.0:8000
echo Mobile API URL: http://10.84.172.104:8000/api
echo ============================================================
echo Keep this window open while using the mobile app or web portal!
echo.
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
