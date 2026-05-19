import { NavLink } from 'react-router-dom';
import logoTad2 from '../assets/logo.png';

const menuItems = [
  { path: '/', label: 'Inicio', icon: 'home' },
  { path: '/gestion-dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/gestion-usuarios', label: 'Usuarios', icon: 'people' },
  { path: '/gestion-conductor', label: 'Conductores', icon: 'person' },
  { path: '/gestion-vehiculo', label: 'Vehículos', icon: 'directions_car' },
  { path: '/gestion-poliza', label: 'Pólizas', icon: 'description' },
  { path: '/gestion-siniestro', label: 'Siniestros', icon: 'warning' },
  { path: '/gestion-incidente', label: 'Incidentes', icon: 'place' },
  { path: '/formulario', label: 'Formulario', icon: 'edit_note' },
  { path: '/otros', label: 'Otros', icon: 'more_horiz' },
];



function SideBar({ abierto, onCerrar }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${abierto ? 'active' : ''}`}
        onClick={onCerrar}
      ></div>

      <aside className={`sidebar ${abierto ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Sistema de Seguros</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
              onClick={onCerrar}
            >
              <span className="material-icons sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-logo">
          <img
            src={logoTad2}
            alt="TAD - Transporte Logística Distribución"
          />
        </div>

        <div className="sidebar-footer">
          <p>© 2026 Sistema de Seguros</p>
        </div>
      </aside>
    </>
  );
}


export default SideBar;
