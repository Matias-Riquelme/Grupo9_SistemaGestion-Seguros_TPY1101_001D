import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import SideBar from './components/SideBar';
import Footer from './components/Footer';
import AppNavBar from './components/AppNavBar';
import Login from './pages/Login';
import AdminHome from './pages/admin/AdminHome';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionConductor from './pages/admin/GestionConductores';
import GestionVehiculo from './pages/admin/GestionVehiculo';
import GestionPoliza from './pages/admin/GestionPoliza';
import GestionSiniestro from './pages/admin/GestionSiniestro';
import GestionIncidente from './pages/admin/GestionIncidente_Ubi';
import DetalleIncidente from './pages/admin/DetalleIncidente';
import GestionDashboard from './pages/admin/GestionDashboard';
import Formulario from './pages/usuario/Formulario';
import OtrosMenu from './pages/otros/OtrosMenu';
import BaseOperaciones from './pages/otros/Base_Operaciones';
import CierreEstados from './pages/otros/Cierre_Estados';
import DeducibleCoberturas from './pages/otros/Deducible_Coberturas';
import UbicacionTipoIncidente from './pages/otros/Ubicacion_TipoIncidente';
import TipoPolizaSiniestro from './pages/otros/Siniestro_Poliza';
import TipoVehiculo from './pages/otros/TipoVehiculo';
import NotFound from './pages/NotFound';
import AdminRoute from './components/AdminRoute';
import AseguradoContratante from './pages/otros/Asegurado_Contratante';
import GestionTerceros from './pages/otros/GestionTerceros';
import ListaFormulario from './pages/usuario/ListaFormulario';
import { useNetworkSync } from './hooks/useNetworkSync';

// Función para mostrar el estado del incidente con un badge

// Layout con sidebar/navbar para rutas protegidas
function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);
  const cerrarSidebar = () => setSidebarAbierto(false);

  return (
    <div className="app-layout">
      <SideBar abierto={sidebarAbierto} onCerrar={cerrarSidebar} />
      {sidebarAbierto && <div className="sidebar-overlay" onClick={cerrarSidebar} />}
      <div className="main-wrapper">
        <AppNavBar onToggleSidebar={toggleSidebar} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/gestion-conductor" element={<GestionConductor />} />
            <Route path="/gestion-vehiculo" element={<GestionVehiculo />} />
            <Route path="/gestion-poliza" element={<GestionPoliza />} />
            <Route path="/gestion-siniestro" element={<GestionSiniestro />} />
            <Route path="/gestion-incidente" element={<GestionIncidente />} />
            <Route path="/gestion-incidente/detalle/:id" element={<DetalleIncidente />} />
            <Route path="/gestion-dashboard" element={<GestionDashboard />} />
            <Route path="/otros" element={<OtrosMenu />} />
            <Route path="/otros/base-operaciones" element={<BaseOperaciones />} />
            <Route path="/otros/cierre-estados" element={<CierreEstados />} />
            <Route path="/otros/deducible-coberturas" element={<DeducibleCoberturas />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
            <Route path="/otros/ubicacion-tipo-incidente" element={<UbicacionTipoIncidente />} />
            <Route path="/otros/tipo-vehiculo" element={<TipoVehiculo />} />
            <Route path="/otros/asegurado-contratante" element={<AseguradoContratante />} />
            <Route path="/otros/tipo-poliza-siniestro" element={<TipoPolizaSiniestro />} />
            <Route path="/otros/terceros" element={<GestionTerceros />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const { estaOnline, pendientes, sincronizar } = useNetworkSync();

  return (
    <>
      {!estaOnline && (
        <div style={{
          background: '#f59e0b',
          color: '#1c1917',
          textAlign: 'center',
          padding: '8px',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          Sin conexión — los formularios se guardarán automáticamente
        </div>
      )}
      {estaOnline && pendientes > 0 && (
        <div 
          onClick={() => sincronizar()}
          style={{
            background: '#3b82f6',
            color: '#fff',
            textAlign: 'center',
            padding: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
          Tienes {pendientes} formulario(s) pendiente(s). Toca aquí para enviar ahora.
        </div>
      )}
      <Router>
        <Routes>
          {/* Rutas sin el layout administrativo */}
          <Route path="/login" element={<Login />} />
          <Route path="/siniestro/:token" element={<Formulario />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/mis-formularios" element={<ListaFormulario />} />
          <Route path="/*" element={
          <AdminRoute>
            <AppLayout />
          </AdminRoute>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;
