@echo off
setlocal
cd /d "%~dp0"
set "PORT=8100"
set "AULATP_URL=http://127.0.0.1:8100/portal/cursos/"

curl.exe --silent --fail "http://127.0.0.1:8100/" >nul 2>&1
if errorlevel 1 (
  start "Aula TP Chile" /min cmd /c "set PORT=8100&& cd /d "%~dp0"&& ".\.venv\Scripts\python.exe" app.py"
  powershell.exe -NoProfile -Command "$u='http://127.0.0.1:8100/'; for($i=0;$i -lt 40;$i++){try{Invoke-WebRequest -UseBasicParsing $u -TimeoutSec 1|Out-Null; exit 0}catch{Start-Sleep -Milliseconds 500}}; exit 1"
)

start "" "%AULATP_URL%"
endlocal
