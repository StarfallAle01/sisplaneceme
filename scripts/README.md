# Scripts de Automatización

Scripts PowerShell para tareas de desarrollo, migración y validación del proyecto SISPLANECEME.

## Scripts disponibles

| Script | Propósito |
|---|---|
| `validate.ps1` | Verifica que la estructura MVC está correcta, sin imports rotos |
| `migrate.ps1` | Migra desde estructura antigua (`servidor/`, `cliente/`) a MVC (`backend/`, `frontend/`) |

## Uso

Ejecutar desde la raíz del proyecto (`sisplaneceme/`):

```powershell
.\scripts\validate.ps1
.\scripts\migrate.ps1   # Solo si el proyecto aún no ha sido migrado
```

> **Nota:** Si PowerShell bloquea la ejecución, ejecutar primero:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
