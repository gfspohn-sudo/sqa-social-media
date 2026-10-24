@echo off
rem Abre o relatorio HTML da ultima execucao dos testes.
set "PATH=%~dp0..\_tools\node;%PATH%"
cd /d "%~dp0tests"
call npx playwright show-report
