import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MallaProvider } from './contexts/MallaContext'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import LoginProfesor from './pages/LoginProfesor'
import LoginAdministrativo from './pages/LoginAdministrativo'
import Panel from './pages/Panel'
import UnidadesCompetencia from './pages/UnidadesCompetencia'
import MallaCurricular from './pages/MallaCurricular'
import SemestreDetalle from './pages/SemestreDetalle'
import Calendario from './pages/Calendario'
import NoEncontrada from './pages/NoEncontrada'
import Docentes from './pages/Docentes'
import GestionMallas from './pages/admin/GestionMallas'
import DetalleMalla from './pages/admin/DetalleMalla'
import EjesPorSemestre from './pages/admin/EjesPorSemestre'
import ModulosPorEje from './pages/admin/ModulosPorEje'
import UnidadesPorModulo from './pages/admin/UnidadesPorModulo'
import EditarUnidadCompetencia from './pages/admin/EditarUnidadCompetencia'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import GestionRoles from './pages/admin/GestionRoles'
import GestionCalendario from './pages/admin/GestionCalendario'
import GestionUnidades from './pages/admin/GestionUnidades'
import LogsSistema from './pages/admin/LogsSistema'
import Recomendaciones from './pages/admin/Recomendaciones'
import Presentacion from './pages/admin/Presentacion'

export default function App() {
  return (
    <AuthProvider>
      <MallaProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas - SIN Layout ni protección */}
          <Route path="/"                    element={<Inicio />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/login/profesor"      element={<LoginProfesor />} />
          <Route path="/login/administrativo" element={<LoginAdministrativo />} />

          {/* Páginas protegidas - CON Layout y autenticación */}
          <Route path="/dashboard"          element={<RutaProtegida><Layout><Panel /></Layout></RutaProtegida>} />
          <Route path="/malla"              element={<RutaProtegida><Layout><MallaCurricular /></Layout></RutaProtegida>} />
          <Route path="/malla/semestre/:id" element={<RutaProtegida><Layout><SemestreDetalle /></Layout></RutaProtegida>} />
          <Route path="/calendario"         element={<RutaProtegida><Layout><Calendario /></Layout></RutaProtegida>} />
          <Route path="/unidades"           element={<RutaProtegida><Layout><UnidadesCompetencia /></Layout></RutaProtegida>} />
          <Route path="/docentes"           element={<RutaProtegida><Layout><Docentes /></Layout></RutaProtegida>} />

          {/* Páginas de administración */}
          <Route path="/admin/mallas"                   element={<RutaProtegida requiredPermission="mallas:editar"><Layout><GestionMallas /></Layout></RutaProtegida>} />
          <Route path="/admin/mallas/:mallaId"          element={<RutaProtegida requiredPermission="mallas:ver"><Layout><DetalleMalla /></Layout></RutaProtegida>} />
          <Route path="/admin/semestres/:semestreId/ejes" element={<RutaProtegida requiredPermission="mallas:ver"><Layout><EjesPorSemestre /></Layout></RutaProtegida>} />
          <Route path="/admin/ejes/:ejeId/modulos"      element={<RutaProtegida requiredPermission="mallas:ver"><Layout><ModulosPorEje /></Layout></RutaProtegida>} />
          <Route path="/admin/modulos/:moduloId/unidades" element={<RutaProtegida requiredPermission="mallas:ver"><Layout><UnidadesPorModulo /></Layout></RutaProtegida>} />
          <Route path="/admin/unidades/:id/editar"      element={<RutaProtegida requiredPermission="mallas:ver"><Layout><EditarUnidadCompetencia /></Layout></RutaProtegida>} />
          <Route path="/admin/usuarios"     element={<RutaProtegida requiredPermission="usuarios:editar"><Layout><GestionUsuarios /></Layout></RutaProtegida>} />
          <Route path="/admin/roles"        element={<RutaProtegida requiredPermission="roles:admin"><Layout><GestionRoles /></Layout></RutaProtegida>} />
          <Route path="/admin/calendario"   element={<RutaProtegida requiredPermission="calendario:editar"><Layout><GestionCalendario /></Layout></RutaProtegida>} />
          <Route path="/admin/unidades"     element={<RutaProtegida requiredPermission="mallas:editar"><Layout><GestionUnidades /></Layout></RutaProtegida>} />
          <Route path="/admin/logs"         element={<RutaProtegida requiredPermission="logs:ver"><Layout><LogsSistema /></Layout></RutaProtegida>} />
          <Route path="/admin/recomendaciones" element={<RutaProtegida requiredPermission="mallas:ver"><Layout><Recomendaciones /></Layout></RutaProtegida>} />
          <Route path="/admin/presentacion" element={<RutaProtegida requiredPermission="presentacion:editar"><Layout><Presentacion /></Layout></RutaProtegida>} />

          {/* 404 */}
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </BrowserRouter>
      </MallaProvider>
    </AuthProvider>
  )
}
