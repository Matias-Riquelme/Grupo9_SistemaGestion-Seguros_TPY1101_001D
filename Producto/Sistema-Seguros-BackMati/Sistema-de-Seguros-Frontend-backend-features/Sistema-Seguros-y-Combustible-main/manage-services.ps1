# ====================================================================
# SCRIPT DE GESTIÓN DE MICROSERVICIOS - SISTEMA SEGUROS Y COMBUSTIBLE
# ====================================================================
# Uso:
#   ./manage-services.ps1 start    - Iniciar todos los microservicios
#   ./manage-services.ps1 stop     - Detener todos los microservicios
#   ./manage-services.ps1 restart  - Reiniciar todos
#   ./manage-services.ps1 status   - Ver estado
# ====================================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action
)

# ====================================================================
# CARGAR VARIABLES DE ENTORNO DESDE .env
# ====================================================================
function Load-EnvFile {
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        Write-Host "Cargando variables de entorno desde .env..." -ForegroundColor Cyan
        $loaded = 0
        Get-Content $envFile | ForEach-Object {
            # Ignorar líneas vacías y comentarios
            if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Quitar comillas si las tiene
                $value = $value -replace '^["'']|["'']$', ''
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                $loaded++
            }
        }
        Write-Host "$loaded variables cargadas correctamente" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ADVERTENCIA: No se encontró archivo .env" -ForegroundColor Yellow
        Write-Host "Copia .env.example a .env y configura tus credenciales" -ForegroundColor Yellow
        return $false
    }
}

# Rutas relativas a la raíz del proyecto
$services = @(
    @{ Name = "API-GATEWAY";      Path = "ApiGateway/ApiGateway";                        Port = 8080 },
    @{ Name = "GESTIONUSUARIO";   Path = "BackendTad/tadGestionUsuario";                 Port = 8081 },
    @{ Name = "INCIDENTES";       Path = "MicroservicioIncidenteSiniestros/MicroservicioIncidenteSiniestros"; Port = 8082 },
    @{ Name = "VEHICULOS";        Path = "tad/tad";                                      Port = 8083 },
    @{ Name = "DOCUMENTACION";    Path = "MicroservicioDocumentacion";                   Port = 8084 }
)

function Start-Services {
    # Cargar .env antes de iniciar
    $envLoaded = Load-EnvFile
    if (-not $envLoaded) {
        $response = Read-Host "¿Continuar sin .env? (s/n)"
        if ($response -ne "s") {
            Write-Host "Abortado. Crea el archivo .env primero." -ForegroundColor Red
            return
        }
    }
    
    Write-Host "`nIniciando todos los microservicios..." -ForegroundColor Cyan
    foreach ($svc in $services) {
        $svcPath = Join-Path $PSScriptRoot $svc.Path
        if (Test-Path "$svcPath/mvnw.cmd") {
            Write-Host "Iniciando $($svc.Name) (puerto $($svc.Port))..." -ForegroundColor Cyan
            Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$svcPath`" && mvnw.cmd spring-boot:run" -WindowStyle Minimized
            Start-Sleep -Seconds 2
        } else {
            Write-Host "No se encontró mvnw.cmd para $($svc.Name)" -ForegroundColor Yellow
        }
    }
    Write-Host "`nEspera 30-60 segundos a que todos arranquen completamente" -ForegroundColor Yellow
    Write-Host 'Verifica el estado con: ./manage-services.ps1 status'
}

function Stop-Services {
    Write-Host 'Deteniendo todos los microservicios...' -ForegroundColor Cyan
    foreach ($svc in $services) {
        # Buscar proceso escuchando en el puerto del servicio
        $netstat = netstat -ano | Select-String ":$($svc.Port).*LISTENING"
        if ($netstat) {
            $processIds = $netstat | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
            foreach ($procId in $processIds) {
                if ($procId -match '^\d+$') {
                    Write-Host "Deteniendo $($svc.Name) (PID: $procId)..."
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        } else {
            Write-Host "$($svc.Name) ya estaba detenido" -ForegroundColor Yellow
        }
    }
    Write-Host 'Todos los microservicios han sido detenidos'
}

function Status-Services {
    Write-Host 'ESTADO DE MICROSERVICIOS'
    Write-Host '=========================================='
    $running = 0
    $stopped = 0
    foreach ($svc in $services) {
        # Buscar proceso escuchando en el puerto del servicio
        $netstat = netstat -ano | Select-String ":$($svc.Port).*LISTENING"
        if ($netstat) {
            $procId = ($netstat[0] -split '\s+')[-1]
            Write-Host "Puerto $($svc.Port) - $($svc.Name) (PID: $procId) - CORRIENDO" -ForegroundColor Green
            $running++
        } else {
            Write-Host "Puerto $($svc.Port) - $($svc.Name) - DETENIDO" -ForegroundColor Red
            $stopped++
        }
    }
    Write-Host ''
    Write-Host '=========================================='
    Write-Host "Total: $running corriendo, $stopped detenidos"
}

function Restart-Services {
    Stop-Services
    Write-Host 'Esperando 3 segundos antes de reiniciar...'
    Start-Sleep -Seconds 3
    Start-Services
}

switch ($Action) {
    'start'   { Start-Services }
    'stop'    { Stop-Services }
    'restart' { Restart-Services }
    'status'  { Status-Services }
    default {
        Write-Host 'Accion no reconocida. Usa: start, stop, restart, status' -ForegroundColor Red
        exit 1
    }
}