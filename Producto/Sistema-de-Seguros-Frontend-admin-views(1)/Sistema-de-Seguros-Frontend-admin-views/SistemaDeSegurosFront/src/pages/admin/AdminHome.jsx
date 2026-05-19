import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import conductorService from "../../services/conductorService";
import vehiculoService from "../../services/vehiculoService";
import tipoIncidenteService from "../../services/tipoIncidenteService";
import ubicacionService from "../../services/ubicacionService";
import baseService from "../../services/baseService";
import operacionesService from "../../services/operacionesService";

const AdminHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        conductores: null,
        vehiculos: null,
        incidentes: null,
        ubicaciones: null,
        bases: null,
        operaciones: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [
                    conductores,
                    vehiculos,
                    incidentes,
                    ubicaciones,
                    bases,
                    operaciones,
                ] = await Promise.allSettled([
                    conductorService.listar(),
                    vehiculoService.listar(),
                    tipoIncidenteService.listar(),
                    ubicacionService.listar(),
                    baseService.listar(),
                    operacionesService.listar(),
                ]);

                setStats({
                    conductores: conductores.status === "fulfilled" ? conductores.value.length : null,
                    vehiculos: vehiculos.status === "fulfilled" ? vehiculos.value.length : null,
                    incidentes: incidentes.status === "fulfilled" ? incidentes.value.length : null,
                    ubicaciones: ubicaciones.status === "fulfilled" ? ubicaciones.value.length : null,
                    bases: bases.status === "fulfilled" ? bases.value.length : null,
                    operaciones: operaciones.status === "fulfilled" ? operaciones.value.length : null,
                });
            } catch (err) {
                console.error("Error al cargar estadísticas:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Conductores",
            value: stats.conductores,
            icon: "people",
            route: "/gestion-conductor",
        },
        {
            label: "Vehículos",
            value: stats.vehiculos,
            icon: "directions_car",
            route: "/gestion-vehiculo",
        },
        {
            label: "Tipos de Incidente",
            value: stats.incidentes,
            icon: "report_problem",
            route: "/gestion-incidente",
        },
        {
            label: "Ubicaciones",
            value: stats.ubicaciones,
            icon: "place",
            route: "/otros/ubicacion-tipo-incidente",
        },
        {
            label: "Bases",
            value: stats.bases,
            icon: "business",
            route: "/otros/base-operaciones",
        },
        {
            label: "Operaciones",
            value: stats.operaciones,
            icon: "settings",
            route: "/otros/base-operaciones",
        },
    ];

    // Obtener saludo según hora del día
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    // Formatear fecha actual
    const getFormattedDate = () => {
        return new Date().toLocaleDateString("es-CL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderValue = (value) => {
        if (loading) return <span style={{ color: "var(--color-text-muted)" }}>Cargando...</span>;
        if (value === null) return <span style={{ color: "var(--color-danger)" }}>Error</span>;
        return <span>{value} registrados</span>;
    };

    return (
        <div className="page-container">
            {/* Encabezado de bienvenida */}
            <div className="admin-home-header">
                <div>
                    <h1 className="admin-home-greeting">
                        {getGreeting()}, Administrador 👋
                    </h1>
                    <p className="admin-home-date">
                        <span className="material-icons" style={{ fontSize: "1rem", verticalAlign: "middle", marginRight: 4 }}>
                            calendar_today
                        </span>
                        {getFormattedDate()}
                    </p>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="page-header">
                <h1>Resumen General</h1>
                <p>Estadísticas del sistema en tiempo real</p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "20px",
            }}>
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="card"
                        style={{
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onClick={() => navigate(card.route)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "";
                        }}
                    >
                        <div className="card-body" style={{ textAlign: "center", padding: "32px 24px" }}>
                            <span
                                className="material-icons"
                                style={{
                                    fontSize: "3rem",
                                    color: "var(--color-primary)",
                                    marginBottom: "16px",
                                    display: "block",
                                }}
                            >
                                {card.icon}
                            </span>
                            <h3 style={{ marginBottom: "8px", fontSize: "2rem", fontWeight: 700 }}>
                                {loading ? "—" : card.value !== null ? card.value : "✕"}
                            </h3>
                            <h3 style={{ marginBottom: "8px" }}>{card.label}</h3>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", margin: 0 }}>
                                {renderValue(card.value)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminHome;
