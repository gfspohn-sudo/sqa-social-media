@echo off
rem Sobe a API (porta 8080) usando o Java portatil da pasta _tools
rem e o banco H2 em memoria (nao precisa de MySQL).
rem DB_CLOSE_DELAY=-1 mantem o banco vivo enquanto a API estiver ligada
rem (sem isso o H2 apaga as tabelas quando o pool renova as conexoes).
set "JAVA_HOME=%~dp0..\_tools\jdk17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
rem O Java falha ao abrir sockets internos quando a pasta TEMP usa nome curto
rem (ex.: C:\Users\GABRIE~1). Usamos uma pasta temporaria propria.
if not exist "%~dp0..\_tools\tmp" mkdir "%~dp0..\_tools\tmp"
set "TMP=%~dp0..\_tools\tmp"
set "TEMP=%~dp0..\_tools\tmp"
rem Se uma API antiga ficou ligada (ex.: Ctrl+C nao fechou o Java), encerra antes.
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='java.exe'\" | Where-Object { $_.CommandLine -like '*demoapp*' -or $_.CommandLine -like '*sqa-social-media*api*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
cd /d "%~dp0api"
call "%~dp0api\mvnw.cmd" spring-boot:run "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=--spring.datasource.url=jdbc:h2:mem:sqa;DB_CLOSE_DELAY=-1 --spring.datasource.username=sa --spring.datasource.password= --spring.jpa.hibernate.ddl-auto=create-drop --spring.jpa.show-sql=false"
