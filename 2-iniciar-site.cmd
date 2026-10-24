@echo off
rem Sobe o front Next.js (porta 3000) usando o Node portatil da pasta _tools.
set "PATH=%~dp0..\_tools\node;%PATH%"
rem Encerra qualquer site antigo deste projeto que tenha ficado ligado
rem (o "next dev" tem processo pai e filho, por isso encerramos todos).
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*sqa-social-media*client*' -or $_.CommandLine -like '*next dev*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
cd /d "%~dp0client"
if not exist node_modules call npm install --no-audit --no-fund
rem Limpa o cache do Next para evitar erro 500 por cache corrompido.
if exist .next rmdir /s /q .next
call npm run dev
