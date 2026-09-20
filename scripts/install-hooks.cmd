@echo off
REM Aula TP — activa hooks versionados (.githooks)
cd /d "%~dp0.."
git config core.hooksPath .githooks
echo Hooks activos: core.hooksPath=.githooks
git config --get core.hooksPath
