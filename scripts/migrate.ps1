<#
.SYNOPSIS
    Migra SISPLANECEME de estructura antigua (servidor/, cliente/) a MVC (backend/, frontend/).

.DESCRIPTION
    Ejecutar desde la raíz del proyecto (sisplaneceme/).
    Requiere PowerShell 5.1+ en Windows.
    Si el proyecto ya fue migrado, el script lo detecta y aborta.
#>
param(
    [switch]$Force  # Forzar migración aunque ya esté migrado
)

$ErrorActionPreference = "Stop"
$base = $PWD.Path

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MIGRACIÓN MVC - SISPLANECEME" -ForegroundColor Cyan
$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "  $dateStr" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan

# ─── DETECCIÓN PRE-MIGRACIÓN ──────────────────────────────────
Write-Host "`n>>> Verificando estado actual..." -ForegroundColor Yellow

$hasOldBackend  = Test-Path -LiteralPath (Join-Path $base "servidor")
$hasOldFrontend = Test-Path -LiteralPath (Join-Path $base "cliente")
$hasNewBackend  = Test-Path -LiteralPath (Join-Path $base "backend")
$hasNewFrontend = Test-Path -LiteralPath (Join-Path $base "frontend")

if ($hasOldBackend -and $hasOldFrontend) {
    Write-Host "  Estructura antigua detectada: servidor/ y cliente/" -ForegroundColor Yellow
} elseif ($hasNewBackend -and $hasNewFrontend) {
    if (-not $Force) {
        Write-Host "  Estructura MVC ya existe: backend/ y frontend/" -ForegroundColor Green
        Write-Host "  La migración ya fue realizada. Use -Force para re-ejecutar." -ForegroundColor Yellow
        Write-Host "  Para validar el estado actual, ejecute: .\scripts\validate.ps1" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "  Forzando re-migración..." -ForegroundColor Yellow
} else {
    Write-Host "  Estado mixto detectado. Se procederá con la migración." -ForegroundColor Yellow
}

# ─── FASE 1: CREAR CARPETAS ───────────────────────────────────
Write-Host "`n>>> FASE 1: Creando estructura de carpetas..." -ForegroundColor Cyan

$newDirs = @(
    "$base\backend\src\controllers",
    "$base\backend\src\models",
    "$base\backend\src\routes",
    "$base\backend\src\services",
    "$base\backend\src\utils",
    "$base\backend\src\infrastructure",
    "$base\backend\src\data",
    "$base\backend\src\middleware",
    "$base\frontend\src\components",
    "$base\frontend\src\contexts",
    "$base\frontend\src\data",
    "$base\frontend\src\hooks",
    "$base\frontend\src\pages\admin",
    "$base\frontend\src\services",
    "$base\frontend\src\assets",
    "$base\frontend\public",
    "$base\scripts",
    "$base\tests\backend",
    "$base\tests\frontend",
    "$base\.vscode",
    "$base\.github\workflows"
)

foreach ($dir in $newDirs) {
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        $safeDir = $dir.Replace($base + "\", "")
      Write-Host "  [CREADO] $safeDir"
    }
}

# ─── FASE 2: MOVER BACKEND ────────────────────────────────────
if (Test-Path -LiteralPath (Join-Path $base "servidor\src")) {
    Write-Host "`n>>> FASE 2: Moviendo backend (servidor/ -> backend/)..." -ForegroundColor Cyan

    $moves = @(
        @{From="servidor\src\index.js";                       To="backend\src\index.js"},
        @{From="servidor\src\controladores";                   To="backend\src\controllers"},
        @{From="servidor\src\modelos";                         To="backend\src\models"},
        @{From="servidor\src\rutas";                           To="backend\src\routes"},
        @{From="servidor\src\servicios";                       To="backend\src\services"},
        @{From="servidor\src\utilidades";                      To="backend\src\utils"},
        @{From="servidor\src\infraestructura";                 To="backend\src\infrastructure"},
        @{From="servidor\src\datos";                           To="backend\src\data"},
        @{From="servidor\src\middleware";                      To="backend\src\middleware"},
        @{From="servidor\package.json";                        To="backend\package.json"},
        @{From="servidor\.env";                                To="backend\.env"},
        @{From="servidor\.env.example";                        To="backend\.env.example"}
    )

    foreach ($move in $moves) {
        $fromPath = Join-Path $base $move.From
        $toPath   = Join-Path $base $move.To

        if (-not (Test-Path -LiteralPath $fromPath)) {
            Write-Host "  [SALTAR] No encontrado: $($move.From)" -ForegroundColor DarkGray
            continue
        }

        # Si es directorio, mover contenido primero
        if (Test-Path -LiteralPath $fromPath -PathType Container) {
            $items = Get-ChildItem -LiteralPath $fromPath -Force -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                $destItem = Join-Path $toPath $item.Name
                if (Test-Path -LiteralPath $destItem) {
                    Remove-Item -LiteralPath $destItem -Recurse -Force -ErrorAction SilentlyContinue
                }
                Move-Item -LiteralPath $item.FullName -Destination $toPath -Force -ErrorAction Stop
            }
        } else {
            if (Test-Path -LiteralPath $toPath) {
                Remove-Item -LiteralPath $toPath -Force -ErrorAction SilentlyContinue
            }
            Move-Item -LiteralPath $fromPath -Destination $toPath -Force -ErrorAction Stop
        }

        Write-Host "  [MOVIDO] $($move.From) -> $($move.To)"
    }
}

# ─── FASE 3: MOVER FRONTEND ───────────────────────────────────
if (Test-Path -LiteralPath (Join-Path $base "cliente\src")) {
    Write-Host "`n>>> FASE 3: Moviendo frontend (cliente/ -> frontend/)..." -ForegroundColor Cyan

    $moves = @(
        @{From="cliente\src\main.jsx";                        To="frontend\src\main.jsx"},
        @{From="cliente\src\App.jsx";                         To="frontend\src\App.jsx"},
        @{From="cliente\src\index.css";                       To="frontend\src\index.css"},
        @{From="cliente\src\assets";                          To="frontend\src\assets"},
        @{From="cliente\src\componentes";                     To="frontend\src\components"},
        @{From="cliente\src\contextos";                       To="frontend\src\contexts"},
        @{From="cliente\src\datos";                           To="frontend\src\data"},
        @{From="cliente\src\hooks";                           To="frontend\src\hooks"},
        @{From="cliente\src\servicios";                       To="frontend\src\services"},
        @{From="cliente\public";                              To="frontend\public"},
        @{From="cliente\package.json";                        To="frontend\package.json"},
        @{From="cliente\.env";                                To="frontend\.env"},
        @{From="cliente\.gitignore";                          To="frontend\.gitignore"},
        @{From="cliente\index.html";                          To="frontend\index.html"},
        @{From="cliente\vite.config.js";                      To="frontend\vite.config.js"},
        @{From="cliente\eslint.config.js";                    To="frontend\eslint.config.js"},
        @{From="cliente\README.md";                           To="frontend\README.md"}
    )

    foreach ($move in $moves) {
        $fromPath = Join-Path $base $move.From
        $toPath   = Join-Path $base $move.To

        if (-not (Test-Path -LiteralPath $fromPath)) {
            Write-Host "  [SALTAR] No encontrado: $($move.From)" -ForegroundColor DarkGray
            continue
        }

        if (Test-Path -LiteralPath $fromPath -PathType Container) {
            $items = Get-ChildItem -LiteralPath $fromPath -Force -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                $destItem = Join-Path $toPath $item.Name
                if (Test-Path -LiteralPath $destItem) {
                    Remove-Item -LiteralPath $destItem -Recurse -Force -ErrorAction SilentlyContinue
                }
                Move-Item -LiteralPath $item.FullName -Destination $toPath -Force -ErrorAction Stop
            }
        } else {
            if (Test-Path -LiteralPath $toPath) {
                Remove-Item -LiteralPath $toPath -Force -ErrorAction SilentlyContinue
            }
            Move-Item -LiteralPath $fromPath -Destination $toPath -Force -ErrorAction Stop
        }

        Write-Host "  [MOVIDO] $($move.From) -> $($move.To)"
    }

    # Mover páginas (manejar subdirectorio admin)
    $pagesFrom = Join-Path $base "cliente\src\paginas"
    $pagesTo   = Join-Path $base "frontend\src\pages"

    if (Test-Path -LiteralPath $pagesFrom) {
        $pageFiles = Get-ChildItem -LiteralPath $pagesFrom -File -ErrorAction SilentlyContinue
        foreach ($f in $pageFiles) {
            Move-Item -LiteralPath $f.FullName -Destination $pagesTo -Force -ErrorAction Stop
            Write-Host "  [MOVIDO] cliente\src\paginas\$($f.Name) -> frontend\src\pages\$($f.Name)"
        }
        $adminFrom = Join-Path $pagesFrom "admin"
        $adminTo   = Join-Path $pagesTo "admin"
        if (Test-Path -LiteralPath $adminFrom) {
            $adminFiles = Get-ChildItem -LiteralPath $adminFrom -File -ErrorAction SilentlyContinue
            foreach ($f in $adminFiles) {
                Move-Item -LiteralPath $f.FullName -Destination $adminTo -Force -ErrorAction Stop
                Write-Host "  [MOVIDO] cliente\src\paginas\admin\$($f.Name) -> frontend\src\pages\admin\$($f.Name)"
            }
        }
    }
}

# ─── FASE 4: ACTUALIZAR IMPORTS ───────────────────────────────
Write-Host "`n>>> FASE 4: Actualizando imports..." -ForegroundColor Cyan

$sq = [char]39

$replacements = @(
    # Backend
    @{Pattern="../modelos/";          Replace="../models/";          Ext="*.js"; Dir="backend\src"},
    @{Pattern="../controladores/";    Replace="../controllers/";     Ext="*.js"; Dir="backend\src"},
    @{Pattern="../servicios/";        Replace="../services/";        Ext="*.js"; Dir="backend\src"},
    @{Pattern="../utilidades/";       Replace="../utils/";           Ext="*.js"; Dir="backend\src"},
    @{Pattern="../infraestructura/";  Replace="../infrastructure/";  Ext="*.js"; Dir="backend\src"},
    @{Pattern="../datos/";            Replace="../data/";            Ext="*.js"; Dir="backend\src"},
    @{Pattern=("from " + $sq + "./rutas/" + $sq);     Replace=("from " + $sq + "./routes/" + $sq);     Ext="*.js"; Dir="backend\src"},
    # Frontend
    @{Pattern="../componentes/";      Replace="../components/";      Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern="../contextos/";        Replace="../contexts/";        Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern="../paginas/";          Replace="../pages/";           Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern="../servicios/";        Replace="../services/";        Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern="../datos/";            Replace="../data/";            Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern=("from " + $sq + "./componentes/" + $sq);   Replace=("from " + $sq + "./components/" + $sq);   Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern=("from " + $sq + "./contextos/" + $sq);     Replace=("from " + $sq + "./contexts/" + $sq);     Ext="*.jsx"; Dir="frontend\src"},
    @{Pattern=("from " + $sq + "./paginas/" + $sq);       Replace=("from " + $sq + "./pages/" + $sq);        Ext="*.jsx"; Dir="frontend\src"}
)

$changedFiles = @()

foreach ($rep in $replacements) {
    $searchDir = Join-Path $base $rep.Dir
    if (-not (Test-Path -LiteralPath $searchDir)) { continue }

    $files = Get-ChildItem -Recurse -LiteralPath $searchDir -Filter $rep.Ext -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        if ($content -notmatch [regex]::Escape($rep.Pattern)) { continue }

        $newContent = $content.Replace($rep.Pattern, $rep.Replace)
        if ($newContent -ne $content) {
            Set-Content -LiteralPath $file.FullName -Value $newContent -NoNewline -Encoding UTF8
            $relPath = $file.FullName.Replace($base + "\", "")
            $changedFiles += $relPath
            Write-Host "  [UPDATE] $relPath"
        }
    }
}

Write-Host "  Total archivos modificados: $($changedFiles.Count)"

# ─── FASE 5: LIMPIEZA ─────────────────────────────────────────
Write-Host "`n>>> FASE 5: Limpiando carpetas antiguas..." -ForegroundColor Cyan

$oldDirs = @(
    (Join-Path $base "servidor"),
    (Join-Path $base "cliente")
)

foreach ($dir in $oldDirs) {
    if (Test-Path -LiteralPath $dir) {
        Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
        $safeDir = $dir.Replace($base + "\", "")
        Write-Host "  [ELIMINADO] $safeDir"
    }
}

# ─── COMPLETADO ────────────────────────────────────────────────
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  MIGRACION COMPLETADA" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Proximos pasos:" -ForegroundColor White
Write-Host "  1. cd backend; npm install" -ForegroundColor White
Write-Host "  2. cd ..\frontend; npm install" -ForegroundColor White
Write-Host "  3. Verificar archivos .env en backend/ y frontend/" -ForegroundColor White
Write-Host "  4. Ejecutar validacion: .\scripts\validate.ps1" -ForegroundColor White
Write-Host ""
