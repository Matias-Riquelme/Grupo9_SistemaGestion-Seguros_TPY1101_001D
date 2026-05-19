import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const modulos = [
    {
        titulo: "Base de Operaciones",
        descripcion: "Gestión de bases de operaciones del sistema",
        icon: "business",
        ruta: "/otros/base-operaciones",
    },
    {
        titulo: "Cierre de Estados",
        descripcion: "Gestión de cierres y estados del sistema",
        icon: "lock",
        ruta: "/otros/cierre-estados",
    },
    {
        titulo: "Deducible y Coberturas",
        descripcion: "Gestión de deducibles y coberturas de pólizas",
        icon: "shield",
        ruta: "/otros/deducible-coberturas",
    },
    {
        titulo: "Ubicación y Tipo de Incidente",
        descripcion: "Gestión de ubicaciones y tipos de incidentes",
        icon: "map",
        ruta: "/otros/ubicacion-tipo-incidente",
    },
    {
        titulo: "Tipo de Vehículo",
        descripcion: "Gestión de los tipos de vehículos disponibles",
        icon: "directions_car",
        ruta: "/otros/tipo-vehiculo",
    },
    {
        titulo: "Asegurado y Contratante",
        descripcion: "Gestión de asegurados y contratantes del sistema",
        icon: "people",
        ruta: "/otros/asegurado-contratante",
    },
    {
        titulo: "Tipo de Póliza y Siniestro",
        descripcion: "Gestión de tipos de pólizas y siniestros del sistema",
        icon: "report",
        ruta: "/otros/tipo-poliza-siniestro",
    },
    {
        titulo: "Gestión de Terceros",
        descripcion: "Gestión de terceros involucrados en el sistema",
        icon: "person",
        ruta: "/otros/terceros",
    }
];

function OtrosMenu() {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Otros Módulos</h1>
                <p>Accede a módulos complementarios del sistema</p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "20px",
            }}>
                {modulos.map((mod) => (
                    <div
                        key={mod.ruta}
                        className="card"
                        style={{
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onClick={() => navigate(mod.ruta)}
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
                                {mod.icon}
                            </span>
                            <h3 style={{ marginBottom: "8px" }}>{mod.titulo}</h3>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", margin: 0 }}>
                                {mod.descripcion}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OtrosMenu;