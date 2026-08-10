<#
.SYNOPSIS
    Valida la estructura MVC de SISPLANECEME.
#>
param(
    [switch]$Quiet
)

$ErrorActionPreference = "Continue"
$base = $PWD.Path
$errors = 0
$warnings = 0

$q = [char]39  # single quote char
$dq = [char]34 # double quote char

function Write-Step($Text, $Color = "Cyan") {
    if (-not $Quiet) { Write-Host "`n$Text" -ForegroundColor $Color }
}
function Write-Pass { if (-not $Quiet) { Write-Host "  [OK]" -ForegroundColor Green } }
function Write-Fail($Msg) {
    Write-Host "  [FAIL] $Msg" -ForegroundColor Red
    $script:errors++
}
function Write-Warn($Msg) {
    Write-Host "  [WARN] $Msg" -ForegroundColor Yellow
    $script:warnings++
}

$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SISPLANECEME - VALIDACION DE ESTRUCTURA MVC" -ForegroundColor Cyan
Write-Host "  Fecha: $dateStr" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor Cyan

# === 1. ESTRUCTURA DE CARPETAS ===
Write-Step "1. Verificando estructura de carpetas raiz"

$requiredDirs = @(
    "backend\src\controllers",
    "backend\src\models",
    "backend\src\routes",
    "backend\src\middleware",
    "backend\src\services",
    "backend\src\utils",
    "backend\src\infrastructure",
    "backend\src\data",
    "frontend\src\components",
    "frontend\src\contexts",
    "frontend\src\pages\admin",
    "frontend\src\hooks",
    "frontend\src\services",
    "frontend\src\data",
    "frontend\src\assets",
    "frontend\public",
    "docs",
    "scripts"
)

foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $base $dir
    if (Test-Path -LiteralPath $fullPath) {
        Write-Pass
    } else {
        Write-Fail "Carpeta faltante: $dir"
    }
}

Write-Step "1b. Verificando ausencia de carpetas antiguas"
$oldDirs = @("servidor", "cliente")
foreach ($dir in $oldDirs) {
    $fullPath = Join-Path $base $dir
    if (Test-Path -LiteralPath $fullPath) {
        Write-Warn "Carpeta antigua detectada: $dir (debe migrarse o eliminarse)"
    } else {
        Write-Pass
    }
}

# === 2. ARCHIVOS DE ENTRADA ===
Write-Step "2. Verificando archivos de entrada"
$entryFiles = @(
    "backend\src\index.js",
    "frontend\src\main.jsx",
    "frontend\src\App.jsx",
    "frontend\index.html",
    "frontend\vite.config.js"
)
foreach ($file in $entryFiles) {
    $fullPath = Join-Path $base $file
    if (Test-Path -LiteralPath $fullPath) {
        Write-Pass
    } else {
        Write-Fail "Archivo faltante: $file"
    }
}

# === 3. IMPORTS ROTOS ===
Write-Step "3. Buscando imports con rutas antiguas"

$oldNames = @("modelos","controladores","rutas","servicios","utilidades","infraestructura","datos","componentes","contextos","paginas")
$sourceDirs = @(
    (Join-Path $base "backend\src"),
    (Join-Path $base "frontend\src")
)
$foundOldImports = $false

# Build import detection regex
$importRegex = "from\s+" + $dq + "|from\s+" + $q

foreach ($srcDir in $sourceDirs) {
    if (-not (Test-Path -LiteralPath $srcDir)) { continue }
    $jsFiles = Get-ChildItem -Recurse -LiteralPath $srcDir -Include "*.js","*.jsx" -ErrorAction SilentlyContinue
    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        foreach ($name in $oldNames) {
            $pattern = $name + "/"
            if ($content -match $pattern) {
                $lines = $content -split "`n"
                foreach ($line in $lines) {
                    if (($line -match $pattern) -and ($line -match $importRegex)) {
                        $relPath = $file.FullName.Replace($base + "\", "")
                        Write-Fail "Import antiguo en $relPath : $($line.Trim())"
                        $foundOldImports = $true
                    }
                }
            }
        }
    }
}

if (-not $foundOldImports) {
    Write-Pass
}

# === 4. VARIABLES DE ENTORNO ===
Write-Step "4. Verificando archivos .env"
$envFiles = @(
    @{Path="backend\.env"; Vars=@("SUPABASE_URL","SUPABASE_ANON_KEY")},
    @{Path="frontend\.env"; Vars=@("VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY","VITE_API_URL")}
)
foreach ($env in $envFiles) {
    $envPath = Join-Path $base $env.Path
    $shortName = $env.Path
    if (Test-Path -LiteralPath $envPath) {
        $envContent = Get-Content $envPath -Raw
        $missing = @()
        foreach ($var in $env.Vars) {
            if ($envContent -notmatch "$var=") { $missing += $var }
        }
        if ($missing.Count -eq 0) {
            Write-Pass
        } else {
            $missVars = $missing -join ", "
            Write-Warn "$shortName : faltan variables: $missVars"
        }
    } else {
        Write-Warn "$shortName no encontrado. Use .env.example como plantilla."
    }
}

# === 5. PACKAGE.JSON ===
Write-Step "5. Verificando package.json"
$pkgPaths = @(
    (Join-Path $base "backend\package.json"),
    (Join-Path $base "frontend\package.json")
)
foreach ($pkg in $pkgPaths) {
    $shortName = $pkg.Replace($base + "\", "")
    if (Test-Path -LiteralPath $pkg) {
        $json = Get-Content $pkg -Raw | ConvertFrom-Json
        if ($json.scripts.dev) {
            Write-Pass
        } else {
            Write-Fail "$shortName : falta script dev"
        }
    } else {
        Write-Fail "$shortName no encontrado."
    }
}

# === 6. VITE.CONFIG.JS ===
Write-Step "6. Verificando vite.config.js"
$vitePath = Join-Path $base "frontend\vite.config.js"
if (Test-Path -LiteralPath $vitePath) {
    $viteContent = Get-Content $vitePath -Raw
    if ($viteContent -match "componentes|contextos|paginas|servicios|datos") {
        Write-Warn "vite.config.js contiene referencias a carpetas antiguas"
    } else {
        Write-Pass
    }
} else {
    Write-Fail "vite.config.js no encontrado."
}

# === 7. RESUMEN ===
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESULTADO DE VALIDACION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$errColor = if ($errors -gt 0) { "Red" } else { "Green" }
$warnColor = if ($warnings -gt 0) { "Yellow" } else { "Green" }

Write-Host "  Errores  : $errors" -ForegroundColor $errColor
Write-Host "  Warnings : $warnings" -ForegroundColor $warnColor

if ($errors -gt 0) {
    Write-Host ("`n  ATENCION: Se encontraron $errors error(es). Corrigelos antes de continuar.") -ForegroundColor Red
} elseif ($warnings -gt 0) {
    Write-Host ("`n  Validacion completada con $warnings warning(s). Revisa las advertencias.") -ForegroundColor Yellow
} else {
    Write-Host "`n  Estructura MVC correcta. Sin errores ni advertencias." -ForegroundColor Green
}

Write-Host ""
exit $errors
