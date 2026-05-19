import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaShieldAlt, FaCar, FaUsers, FaChartPie, FaChartLine } from "react-icons/fa";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import vehiculoService from "../../services/vehiculoService";
import polizaService from "../../services/polizaService";
import siniestroServices from "../../services/siniestroServices";
import aseguradoService from "../../services/aseguradoService";

import "../../styles/Dashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

function GestionDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    siniestros: 0,
    vehiculos: 0,
    polizas: 0,
    asegurados: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [alerts, setAlerts] = useState({ vencimientos: [], siniestrosPendientes: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      // Realizamos las llamadas a la API en paralelo
      const [vehiculosRes, polizasRes, siniestrosRes, aseguradosRes, estadosRes] = await Promise.all([
        vehiculoService.listar().catch(() => []),
        polizaService.listar().catch(() => []),
        siniestroServices.getSiniestros().catch(() => ({ data: [] })),
        aseguradoService.listar().catch(() => []),
        siniestroServices.getEstadosSiniestro().catch(() => ({ data: [] }))
      ]);

      const vehiculos = Array.isArray(vehiculosRes) ? vehiculosRes : [];
      const polizas = Array.isArray(polizasRes) ? polizasRes : [];
      const siniestros = siniestrosRes?.data || [];
      const asegurados = Array.isArray(aseguradosRes) ? aseguradosRes : [];
      const estados = estadosRes?.data || [];

      setStats({
        vehiculos: vehiculos.length,
        polizas: polizas.length,
        siniestros: siniestros.length,
        asegurados: asegurados.length,
      });

      // 1. Procesar actividad reciente (últimos 5 siniestros)
      const sortedSiniestros = [...siniestros].sort((a, b) => {
        const dateA = new Date(a.fechaSiniestro || a.fecha || 0);
        const dateB = new Date(b.fechaSiniestro || b.fecha || 0);
        return dateB - dateA;
      });
      setRecentActivity(sortedSiniestros.slice(0, 5));

      // 2. Procesar tendencia mensual (año actual)
      const currentYear = new Date().getFullYear();
      const monthlyCounts = new Array(12).fill(0);
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

      siniestros.forEach(s => {
        const fecha = new Date(s.fechaSiniestro || s.fecha);
        if (!isNaN(fecha.getTime()) && fecha.getFullYear() === currentYear) {
          monthlyCounts[fecha.getMonth()]++;
        }
      });

      // 3. Procesar distribución por estado
      const countsByEstadoId = {};
      siniestros.forEach(s => {
        const idEstado = s.estadoSiniestro?.idEstado || s.id_estado_siniestro || s.idEstado || s.estadoSiniestro?.id;
        if (idEstado) {
          countsByEstadoId[idEstado] = (countsByEstadoId[idEstado] || 0) + 1;
        } else {
          countsByEstadoId["Desconocido"] = (countsByEstadoId["Desconocido"] || 0) + 1;
        }
      });

      const labels = [];
      const doughnutData = [];

      Object.keys(countsByEstadoId).forEach(key => {
        if (key === "Desconocido") {
          labels.push(key);
          doughnutData.push(countsByEstadoId[key]);
        } else {
          const estadoObj = estados.find(e => String(e.idEstado || e.id) === String(key));
          labels.push(estadoObj ? (estadoObj.estado || estadoObj.nombre || `Estado ${key}`) : `Estado ${key}`);
          doughnutData.push(countsByEstadoId[key]);
        }
      });

      // 4. Configurar Gráficos
      const rootStyles = getComputedStyle(document.documentElement);
      const getVar = (name) => rootStyles.getPropertyValue(name).trim();

      // Dona
      if (labels.length === 0) {
        setChartData({
          labels: ["Sin datos"],
          datasets: [{
            label: 'Siniestros por Estado',
            data: [1],
            backgroundColor: [getVar('--chart-empty-bg') || 'rgba(200, 200, 200, 0.5)'],
            borderColor: [getVar('--chart-empty-border') || 'rgba(200, 200, 200, 1)'],
            borderWidth: 1,
          }]
        });
      } else {
        setChartData({
          labels,
          datasets: [{
            label: 'Siniestros',
            data: doughnutData,
            backgroundColor: [
              getVar('--chart-color-1'), getVar('--chart-color-2'), getVar('--chart-color-3'),
              getVar('--chart-color-4'), getVar('--chart-color-5'), getVar('--chart-color-6'),
            ].filter(Boolean),
            borderColor: [
              getVar('--chart-border-1'), getVar('--chart-border-2'), getVar('--chart-border-3'),
              getVar('--chart-border-4'), getVar('--chart-border-5'), getVar('--chart-border-6'),
            ].filter(Boolean),
            borderWidth: 1,
          }],
        });
      }

      // Tendencia
      setTrendData({
        labels: monthNames,
        datasets: [{
          label: `Siniestros ${currentYear}`,
          data: monthlyCounts,
          fill: true,
          backgroundColor: 'rgba(52, 152, 219, 0.15)',
          borderColor: getVar('--color-primary') || '#3498db',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: getVar('--color-primary') || '#3498db',
        }]
      });

      // 5. Calcular Alertas
      const hoy = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(hoy.getDate() + 30);

      const vencimientosProximos = polizas.filter(p => {
        const fechaVenc = new Date(p.fechaVencPol || p.fechaFinPol);
        return !isNaN(fechaVenc.getTime()) && fechaVenc > hoy && fechaVenc <= en30Dias;
      }).sort((a, b) => new Date(a.fechaVencPol || a.fechaFinPol) - new Date(b.fechaVencPol || b.fechaFinPol));

      const pendientesCount = siniestros.filter(s => {
        const estado = (s.estadoSiniestro?.estado || s.estado || '').toLowerCase();
        return estado.includes('pend');
      }).length;

      setAlerts({
        vencimientos: vencimientosProximos.slice(0, 3), // Mostrar top 3
        siniestrosPendientes: pendientesCount
      });

    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      setError("No se pudieron cargar los datos del dashboard. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getStatusBadgeClass = (estado) => {
    const e = String(estado).toLowerCase();
    if (e.includes('pend')) return 'status-pend';
    if (e.includes('proc')) return 'status-proc';
    if (e.includes('cerr')) return 'status-cerr';
    if (e.includes('rech')) return 'status-rech';
    return 'status-def';
  };

  if (cargando) {
    return (
      <div className="page-container loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container error-container">
        <div className="error-box">
          <p className="error-text">{error}</p>
          <button className="btn btn-outline" onClick={cargarDatos} style={{ marginTop: '15px' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-container">
      <div className="page-header dashboard-header">
        <h1>Panel de Resumen</h1>
        <p>Métricas y estado general del Sistema de Seguros</p>
      </div>

      <div className="dashboard-kpi-grid">
        {/* Siniestros */}
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-title">Total Siniestros</span>
            <h2 className="dashboard-kpi-value">{stats.siniestros}</h2>
          </div>
          <div className="dashboard-icon-wrapper icon-siniestros">
            <FaFileAlt />
          </div>
        </div>

        {/* Polizas */}
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-title">Total Pólizas</span>
            <h2 className="dashboard-kpi-value">{stats.polizas}</h2>
          </div>
          <div className="dashboard-icon-wrapper icon-polizas">
            <FaShieldAlt />
          </div>
        </div>

        {/* Vehiculos */}
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-title">Vehículos Asegurados</span>
            <h2 className="dashboard-kpi-value">{stats.vehiculos}</h2>
          </div>
          <div className="dashboard-icon-wrapper icon-vehiculos">
            <FaCar />
          </div>
        </div>

        {/* Asegurados */}
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-title">Asegurados</span>
            <h2 className="dashboard-kpi-value">{stats.asegurados}</h2>
          </div>
          <div className="dashboard-icon-wrapper icon-asegurados">
            <FaUsers />
          </div>
        </div>
      </div>

      {/* Sección de Alertas y Notificaciones */}
      {(alerts.siniestrosPendientes > 0 || alerts.vencimientos.length > 0) && (
        <div className="dashboard-alerts-section">
          {alerts.siniestrosPendientes > 0 && (
            <div className="alert-card alert-danger">
              <div className="alert-icon">
                <FaFileAlt />
                <span className="alert-badge">{alerts.siniestrosPendientes}</span>
              </div>
              <div className="alert-info">
                <h4>Siniestros Pendientes</h4>
                <p>Hay {alerts.siniestrosPendientes} casos esperando revisión.</p>
              </div>
              <button className="alert-action-btn" onClick={() => navigate('/gestion-siniestro')}>
                Revisar
              </button>
            </div>
          )}

          {alerts.vencimientos.length > 0 && (
            <div className="alert-card alert-warning">
              <div className="alert-icon">
                <FaShieldAlt />
              </div>
              <div className="alert-info">
                <h4>Vencimientos Próximos</h4>
                <div className="vencimientos-list">
                  {alerts.vencimientos.map(v => (
                    <div key={v.idPol} className="vencimiento-item">
                      <span className="v-name">{v.asegurado?.razonSocialAse || 'Asegurado'}</span>
                      <span className="v-date">{new Date(v.fechaVencPol || v.fechaFinPol).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="alert-action-btn" onClick={() => navigate('/gestion-poliza')}>
                Gestionar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-chart-section">
        {/* Gráfico de Dona */}
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">
            <FaChartPie style={{ color: "#3498db" }} />
            Distribución por Estado
          </h3>
          <div className="chart-container-wrapper">
            {chartData && (
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        padding: 15,
                        font: { size: 12, family: "'Inter', sans-serif" }
                      }
                    }
                  },
                  cutout: '70%',
                }}
              />
            )}
          </div>
        </div>

        {/* Gráfico de Tendencia */}
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">
            <FaChartLine style={{ color: "#2ecc71" }} />
            Tendencia Mensual ({new Date().getFullYear()})
          </h3>
          <div className="chart-container-wrapper">
            {trendData && (
              <Line
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, precision: 0 }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sección Actividad Reciente */}
      <div className="dashboard-recent-section">
        <div className="dashboard-recent-card">
          <h3 className="dashboard-recent-title">
            <FaChartLine style={{ color: "#e67e22" }} />
            Actividad Reciente: Últimos Siniestros
          </h3>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asegurado</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <tr key={item.idSiniestro || item.id}>
                      <td className="activity-id">#{item.idSiniestro || item.id}</td>
                      <td>
                        {item.asegurado?.nombre || item.aseguradoNombre || 'No especificado'}
                      </td>
                      <td>{item.tipoSiniestro?.tipo || 'General'}</td>
                      <td className="activity-date">
                        {new Date(item.fechaSiniestro || item.fecha).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.estadoSiniestro?.estado || item.estado)}`}>
                          {item.estadoSiniestro?.estado || item.estado || 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
                      No hay actividad reciente para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionDashboard;
