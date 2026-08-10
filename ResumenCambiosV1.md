# RESUMEN DE CAMBIOS - SISPLANECEME (VERSIÓN 1)

## Cambio de arquitectura

El proyecto fue migrado de una arquitectura **cliente-servidor simple** a una arquitectura
**MVC (Modelo-Vista-Controlador)** como patrón principal del sistema.

| Antes | Ahora |
|---|---|
| Cliente-Servidor plano | MVC profesional con separación clara de responsabilidades |
| Carpetas en español | Carpetas en inglés (estándar internacional) |
| 2 carpetas raíz (`cliente/`, `servidor/`) | 8 carpetas raíz con estructura profesional |
| Sin scripts de automatización | Scripts PowerShell para migración y validación |

La arquitectura interna del backend sigue el patrón MVC:
```
HTTP Request → Middleware → Route → Controller → Model → Supabase/PostgreSQL
```

## Estructura final de carpetas

```
sisplaneceme/
├── .github/           # CI/CD (GitHub Actions)
├── .vscode/           # Configuración del editor
├── backend/           # Servidor Express (MVC)
│   └── src/
│       ├── controllers/
│       ├── data/
│       ├── infrastructure/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── docs/              # Documentación
├── frontend/          # Cliente React + Vite
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── contexts/
│       ├── data/
│       ├── hooks/
│       ├── pages/
│       │   └── admin/
│       └── services/
│   └── public/
├── scripts/           # Utilidades PowerShell
├── tests/             # Pruebas (estructura preparada)
│   ├── backend/
│   └── frontend/
├── .gitignore
├── LICENSE
└── README.md
```

## Tabla de equivalencias (español → inglés)

| Antes | Ahora | Ubicación |
|---|---|---|
| `servidor/` | `backend/` | Raíz |
| `cliente/` | `frontend/` | Raíz |
| `controladores/` | `controllers/` | Backend |
| `modelos/` | `models/` | Backend |
| `rutas/` | `routes/` | Backend |
| `servicios/` (backend) | `services/` | Backend |
| `utilidades/` | `utils/` | Backend |
| `infraestructura/` | `infrastructure/` | Backend |
| `datos/` (backend) | `data/` | Backend |
| `componentes/` | `components/` | Frontend |
| `contextos/` | `contexts/` | Frontend |
| `paginas/` | `pages/` | Frontend |
| `servicios/` (frontend) | `services/` | Frontend |
| `datos/` (frontend) | `data/` | Frontend |
| `middleware/` | `middleware/` | Sin cambio |
| `hooks/` | `hooks/` | Sin cambio |
| `assets/` | `assets/` | Sin cambio |
| `public/` | `public/` | Sin cambio (dentro de frontend/) |
| `docs/` | `docs/` | Sin cambio |

## Nuevas carpetas agregadas en la raíz

| Carpeta | Propósito |
|---|---|
| `.vscode/` | Configuración del editor (settings.json, extensiones recomendadas) |
| `.github/workflows/` | CI/CD con GitHub Actions |
| `scripts/` | Utilidades de automatización PowerShell |
| `tests/` | Pruebas unitarias e integración (backend + frontend) |
| `README.md` | Documentación principal del proyecto |
| `LICENSE` | Licencia MIT |
| `.gitignore` | Reglas de ignorados para Git (raíz) |

## Scripts de migración para Windows 11

| Script | Propósito |
|---|---|
| `scripts/migrate.ps1` | Migra desde estructura antigua a MVC. Detecta si ya fue migrado. |
| `scripts/validate.ps1` | Valida estructura MVC, detecta imports rotos, verifica .env y package.json |

Ambos scripts son 100% PowerShell 5.1+, sintácticamente verificados con el parser de PowerShell.

### Uso

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\validate.ps1        # Validar estado actual
.\scripts\migrate.ps1          # Migrar (solo si es necesario)
.\scripts\migrate.ps1 -Force   # Forzar re-migración
```

## Actualización de imports relativos

Todos los paths de import en archivos `.js` y `.jsx` fueron actualizados para reflejar
la nueva estructura de carpetas. El script `migrate.ps1` aplica estas transformaciones
automáticamente:

| Patrón antiguo (español) | Patrón nuevo (inglés) | Archivos |
|---|---|---|
| `from '../modelos/` | `from '../models/` | Controllers |
| `from '../controladores/` | `from '../controllers/` | Routes |
| `from '../servicios/` | `from '../services/` | Controllers, Components |
| `from '../utilidades/` | `from '../utils/` | Routes |
| `from '../infraestructura/` | `from '../infrastructure/` | Middleware, Models |
| `from '../datos/` | `from '../data/` | Pages, Controllers |
| `from './rutas/` | `from './routes/` | index.js |
| `from './componentes/` | `from './components/` | App.jsx |
| `from './contextos/` | `from './contexts/` | App.jsx, Hooks |
| `from './paginas/` | `from './pages/` | App.jsx |

**Resultado de validación:** 0 imports rotos encontrados en 92 referencias verificadas.

## Documentación creada

| Archivo | Contenido |
|---|---|
| `docs/MIGRATION_STEPS.md` | Guía paso a paso para migración y setup en Windows 11 |
| `docs/arquitectura.md` | Actualizado con nueva estructura MVC |
| `docs/INSTRUCCIONES.md` | Actualizado con nuevas rutas de carpetas |
| `scripts/README.md` | Descripción de scripts disponibles |
| `tests/README.md` | Estructura de pruebas del proyecto |
| `.vscode/` | Configuración recomendada para VS Code |

## Nota sobre correcciones de código

Este documento cubre los cambios estructurales de la migración a arquitectura MVC.
Las correcciones de errores de funcionamiento están documentadas en la sección
"Anexo: Correcciones de funcionamiento aplicadas" al final de este archivo.

---

> **Versión:** 1.0  
> **Fecha:** 2026-05-24  
> **Arquitectura:** MVC (Model-View-Controller)  
> **Plataforma:** Windows 11 / PowerShell 5.1+

---

## Anexo: Correcciones de funcionamiento aplicadas

### Corrección #1: Ruta /lote movida antes de /:id

**Problema:** `POST /api/calendario/lote` devolvía 404 porque Express interpretaba `"lote"` como un parámetro `:id`, capturándolo en el handler de `PUT /:id` antes de llegar a la ruta correcta.

**Solución:** Se movió `router.post('/lote', ...)` antes de cualquier ruta con `/:id` en el archivo de rutas.

**Archivo:** `backend/src/routes/calendario.js`

---

### Corrección #2: Comparación unificada en TF-IDF

**Problema:** El motor de recomendaciones no encontraba coincidencias por comparación inconsistente: `u.id == ucId` (laxa) para UCs y `d.id === docenteId` (estricta) para docentes. Los IDs enteros de Supabase fallaban contra strings de `req.params`.

**Solución:** Se unificó a `String(x.id) === String(id)` en todas las comparaciones de `recomendarDocentesParaUC` y `recomendarUCsParaDocente`, funcionando correctamente con UUIDs y con IDs enteros.

**Archivo:** `backend/src/services/recomendacionEngine.js`

---

### Corrección #3: Validador de horas corregido

**Problema:** `unidadCompetenciaCreateRules` validaba los campos `horas_teoricas`, `horas_practicas` y `horas_totales`, pero el controlador `crearUnidadCompetencia` solo lee `req.body.horas`. Los datos enviados eran ignorados silenciosamente y el campo real nunca era validado.

**Solución:** Se reemplazaron los tres validadores de horas por uno solo: `body('horas').optional().isInt({ min: 0 })`, que corresponde al campo que el controlador realmente usa.

**Archivo:** `backend/src/utils/validadores.js`

---

### Corrección #4: Permisos reales en rutas admin

**Problema:** Las rutas de administración en `App.jsx` requerían permisos como `mallas:admin`, `usuarios:admin` y `calendario:admin`, que no existen en la base de datos. Roles personalizados (profesor/lector) nunca podían acceder aunque tuviesen los permisos reales asignados.

**Solución:** Se cambiaron a permisos que sí existen en el sistema: `mallas:editar`, `usuarios:editar`, `calendario:editar`. El permiso `roles:admin` se mantuvo sin cambios porque es intencional (solo `super_admin`).

**Archivo:** `frontend/src/App.jsx`

---

### Corrección #5: Nombre de componente consistente

**Problema:** El archivo `RutaProtegida.jsx` exportaba `export default function ProtectedRoute(...)` con nombre en inglés, inconsistente con el nombre del archivo y su importación en `App.jsx`. Provocaba confusión en refactorizaciones.

**Solución:** Se renombró la función interna a `RutaProtegida` para que coincida con el nombre del archivo y la importación.

**Archivo:** `frontend/src/components/RutaProtegida.jsx`

---

### Corrección #6: Eliminación completa de usuario

**Problema:** `eliminarUsuario` solo ejecutaba `svc.eliminarUsuario(id)`, que borraba el registro de `public.usuarios` pero dejaba al usuario activo en `auth.users` de Supabase. Al volver a hacer login, el middleware de autenticación lo recreaba automáticamente en la tabla pública, haciendo imposible la eliminación efectiva.

**Solución:** Se agregó `adminClient.auth.admin.deleteUser(id)` después de borrar de `public.usuarios`, eliminando la cuenta de acceso definitivamente.

**Archivo:** `backend/src/controllers/usuariosControlador.js`

---

### Corrección #7: Validador sin campo fantasma

**Problema:** `asignarRolRules` exigía `body('usuario_id')` como campo requerido en el cuerpo de la petición. Sin embargo, el controlador `asignarRol` obtiene el ID del usuario desde `req.params.id` (el path param `:id`), nunca desde el body. El cliente debía enviar un campo que era ignorado, o recibía un error 400 innecesario.

**Solución:** Se eliminó la validación de `body('usuario_id')`, dejando solo la validación de `rol_id` que sí se usa.

**Archivo:** `backend/src/utils/validadores.js`

---

### Corrección #8: Validación de variables de entorno

**Problema:** Si el archivo `frontend/.env` no existía o estaba incompleto, `createClient(undefined, undefined)` generaba un error críptico de la SDK de Supabase, difícil de diagnosticar sin conocer la causa raíz.

**Solución:** Se agregó una validación explícita antes de crear el cliente: si `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` están vacías, se lanza un error con mensaje claro indicando qué archivo crear y qué variables configurar.

**Archivo:** `frontend/src/services/supabase.js`

---

## Estado final del proyecto

- [x] Migración estructural completada (DeepSeek)
- [x] Correcciones de funcionamiento aplicadas (Claude)
- [x] Documentación actualizada
- [x] Scripts de migración para Windows 11
- [x] Sistema operativo: Windows 11
- [x] Demo lista para presentación

## Fecha de finalización

2026-05-25
