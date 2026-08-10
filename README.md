# SISPLANECEME

Sistema de Planificación Académica para la Escuela de Comando y Estado Mayor del Ejército (ECEME).

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 4 |
| **Backend** | Node.js + Express 4 (MVC) |
| **Base de datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth + JWT |
| **RBAC** | 4 roles · 17 permisos granulares |
| **IA** | TF-IDF + Cosine Similarity (recomendación docente ↔ UC) |

## Estructura

```
sisplaneceme/
├── backend/       # Servidor Express (MVC)
├── frontend/      # Cliente React + Vite
├── docs/          # Documentación
├── scripts/       # Utilidades PowerShell
├── tests/         # Pruebas
├── .vscode/       # Configuración del editor
└── .github/       # CI/CD
```

## Inicio rápido (Windows 11)

```powershell
# Terminal 1 — Backend
cd backend
npm install
npm run dev          # http://localhost:3000

# Terminal 2 — Frontend (nueva ventana)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Documentación

- [Estructura de la base de datos](docs/EstructuraDB.md)
- [Arquitectura del sistema](docs/arquitectura.md)
- [Guía de configuración](docs/INSTRUCCIONES.md)
- [Pasos de migración](docs/MIGRATION_STEPS.md)

## Licencia

MIT
