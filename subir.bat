@echo off
REM ============================================================
REM  AirFryer - Publicar en GitHub Pages (doble clic en Windows)
REM  Llama a deploy.sh con el Bash que viene incluido en Git.
REM ============================================================
setlocal

set "BASH=%ProgramFiles%\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=%ProgramFiles(x86)%\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=%LocalAppData%\Programs\Git\bin\bash.exe"

if not exist "%BASH%" (
  echo No encuentro Git Bash. Instala Git para Windows desde https://git-scm.com
  pause
  exit /b 1
)

set "MENSAJE=%~1"
if "%MENSAJE%"=="" set "MENSAJE=Actualizacion de la app"

"%BASH%" -c "cd \"$(cygpath -u '%~dp0')\" && ./deploy.sh \"%MENSAJE%\""

echo.
pause
