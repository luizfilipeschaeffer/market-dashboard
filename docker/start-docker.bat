@echo off
echo ========================================
echo   Market Dashboard - Docker Setup
echo ========================================
echo.

echo Iniciando container de producao...
cd /d "%~dp0"
docker-compose up -d

echo.
echo ========================================
echo   Aplicacao rodando em:
echo ========================================
echo   Local:    http://localhost:3050
echo   Externo:  http://192.168.60.16:3050
echo.

echo Para parar: docker-compose down
echo Para logs:  docker-compose logs -f
echo Para dev:   docker-compose --profile dev up
echo.
pause
