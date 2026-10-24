@echo off
rem Roda os testes do Playwright. Qualquer opcao extra e repassada, exemplos:
rem   3-rodar-testes.cmd                          (todos)
rem   3-rodar-testes.cmd --project=api            (so API)
rem   3-rodar-testes.cmd --project=e2e --headed   (E2E com o navegador aparecendo)
rem   3-rodar-testes.cmd --ui                     (modo interativo)
set "PATH=%~dp0..\_tools\node;%PATH%"
cd /d "%~dp0tests"
if not exist node_modules call npm install --no-audit --no-fund
rem Garante o Chromium do Playwright (se ja estiver instalado, nao baixa de novo)
call npx playwright install chromium
call npx playwright test %*
