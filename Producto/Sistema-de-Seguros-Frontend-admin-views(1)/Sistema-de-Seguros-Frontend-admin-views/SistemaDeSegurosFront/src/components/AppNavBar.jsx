import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authKeycloakServices';

const pageTitles = {
  '/': 'Inicio',
  '/gestion-dashboard': 'Dashboard',
  '/gestion-conductor': 'Gestión de Conductores',
  '/gestion-vehiculo': 'Gestión de Vehículos',
  '/gestion-poliza': 'Gestión de Pólizas',
  '/gestion-siniestro': 'Gestión de Siniestros',
  '/gestion-incidente': 'Gestión de Incidentes',
  '/formulario': 'Formulario',
};

function AppNavBar({ onToggleSidebar }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Sistema de Seguros';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const handleCerrarSesion = () => {
    authService.logout();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onToggleSidebar}>
          <span className="material-icons">menu</span>
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>
      <div className="topbar-right">
        <div className="topbar-user-wrapper" ref={menuRef}>
          <div className="topbar-user" onClick={() => setMenuAbierto(!menuAbierto)}>
            <div className="topbar-avatar">A</div>
            <span className="topbar-username">Admin</span>
            <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>
              {menuAbierto ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {menuAbierto && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div className="topbar-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>A</div>
                <div>
                  <strong>Admin</strong>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Administrador</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider"></div>
              <button className="topbar-dropdown-item" onClick={handleCerrarSesion}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppNavBar;
