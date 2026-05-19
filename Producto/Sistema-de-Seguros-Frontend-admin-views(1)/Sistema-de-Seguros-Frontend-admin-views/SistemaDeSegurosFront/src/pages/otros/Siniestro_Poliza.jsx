import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { validarCamposObligatorios } from "../../utils/validaciones";
import BackButton from "../../components/BackButton";
import siniestroService from "../../services/tipoSiniestroService";
import polizaService from "../../services/tipoPolizaService";
import { useFormulario } from "../../hooks/useFormulario";

const siniestroVacio = { nombreTipoSiniestro: "", descTipoSiniestro: "" };
const polizaVacia = { nomTipoPol: "" };

function TipoSiniestroPoliza() {
    const [activeTab, setActiveTab] = useState("siniestro");

    // TIPO SINIESTRO
    const [siniestros, setSiniestros] = useState([]);
    const [cargandoSiniestro, setCargandoSiniestro] = useState(true);
    const [errorSiniestro, setErrorSiniestro] = useState(null);
    const [guardandoSiniestro, setGuardandoSiniestro] = useState(false);

    // TIPO POLIZAS
    const [polizas, setPolizas] = useState([]);
    const [cargandoPoliza, setCargandoPoliza] = useState(true);
    const [errorPoliza, setErrorPoliza] = useState(null);
    const [guardandoPoliza, setGuardandoPoliza] = useState(false);

    // Formularios usando el hook
    const formSiniestro = useFormulario(siniestroVacio);
    const formPoliza = useFormulario(polizaVacia);

    const cargarSiniestros = async () => {
        try {
            setCargandoSiniestro(true);
            setErrorSiniestro(null);
            const data = await siniestroService.listar();
            setSiniestros(data);
        } catch (error) {
            console.error("Error al cargar siniestros:", error);
            setErrorSiniestro("Error al cargar siniestros");
        } finally {
            setCargandoSiniestro(false);
        }
    };

    const cargarPolizas = async () => {
        try {
            setCargandoPoliza(true);
            setErrorPoliza(null);
            const data = await polizaService.listar();
            setPolizas(data);
        } catch (error) {
            console.error("Error al cargar pólizas:", error);
            setErrorPoliza("Error al cargar pólizas");
        } finally {
            setCargandoPoliza(false);
        }
    };

    useEffect(() => {
        cargarSiniestros();
        cargarPolizas();
    }, []);

    // CRUD SINIESTRO
    const handleGuardarSiniestro = async () => {
        const campos = [
            { nombre: "nombre", valor: formSiniestro.datos.nombreTipoSiniestro },
            { nombre: "descripcion", valor: formSiniestro.datos.descTipoSiniestro }
        ];
        if (!validarCamposObligatorios(campos).valido) {
            return;
        }
        try {
            setGuardandoSiniestro(true);
            const payload = {
                nombreTipoSiniestro: formSiniestro.datos.nombreTipoSiniestro,
                descTipoSiniestro: formSiniestro.datos.descTipoSiniestro
            };
            if (formSiniestro.editandoId) {
                await siniestroService.actualizar(formSiniestro.editandoId, payload);
            } else {
                await siniestroService.crear(payload);
            }
            formSiniestro.cerrar();
            cargarSiniestros();
        } catch (error) {
            console.error("Error al guardar siniestro:", error);
            const msg = error.response?.data?.message || "Error al guardar siniestro";
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: `Error al guardar siniestro: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}` });
        } finally {
            setGuardandoSiniestro(false);
        }
    };

    const handleEliminarSiniestro = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await siniestroService.eliminar(id);
                cargarSiniestros();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El siniestro ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error al eliminar siniestro:", error);
                const msg = error.response?.data?.message || "Error al eliminar siniestro";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error al eliminar siniestro: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    // CRUD POLIZA
    const handleGuardarPoliza = async () => {
        const campos = [
            { nombre: "nombre", valor: formPoliza.datos.nomTipoPol }
        ];
        if (!validarCamposObligatorios(campos).valido) {
            return;
        }
        try {
            setGuardandoPoliza(true);
            const payload = { nomTipoPol: formPoliza.datos.nomTipoPol };
            if (formPoliza.editandoId) {
                await polizaService.actualizar(formPoliza.editandoId, payload);
            } else {
                await polizaService.crear(payload);
            }
            formPoliza.cerrar();
            await cargarPolizas();
        } catch (error) {
            console.error("Error al guardar póliza:", error);
            const msg = error.response?.data?.message || "Error al guardar póliza";
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: `Error al guardar póliza: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}` });
        } finally {
            setGuardandoPoliza(false);
        }
    };

    const handleEliminarPoliza = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await polizaService.eliminar(id);
                await cargarPolizas();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'La póliza ha sido eliminada.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error al eliminar póliza:", error);
                const msg = error.response?.data?.message || "Error al eliminar póliza";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error al eliminar póliza: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    // RENDER
    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Tipo de Póliza y Siniestro</h1>
                <p className="text-muted">Gestión de tipos de pólizas y siniestros del sistema</p>
            </div>

            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "siniestro" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("siniestro")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>warning</span> Siniestros
                </button>
                <button
                    className={`btn ${activeTab === "poliza" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("poliza")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>description</span> Pólizas
                </button>
            </div>

            {/* TAB SINIESTRO */}
            {activeTab === "siniestro" && (
                <>
                    <div className="flex-between mb-3">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Tipos de Siniestro</h2>
                        <button className="btn btn-primary" onClick={formSiniestro.abrirNuevo}>
                            <span className="material-icons">add</span> Nuevo Siniestro
                        </button>
                    </div>
                    {errorSiniestro && (
                        <div className="alert alert-danger">
                            {errorSiniestro}
                            <button className="btn btn-sm btn-outline" onClick={cargarSiniestros} style={{ marginLeft: "16px" }}>
                                <span className="material-icons">refresh</span> Reintentar
                            </button>
                        </div>
                    )}

                    {formSiniestro.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3>{formSiniestro.editandoId ? "Editar Siniestro" : "Nuevo Siniestro"}</h3>
                            </div>

                            <div className="card-body">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="nombreTipoSiniestro"
                                        value={formSiniestro.datos.nombreTipoSiniestro}
                                        onChange={formSiniestro.handleInputChange}
                                        maxLength={150}
                                        placeholder="Ingrese el nombre del Siniestro"
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descTipoSiniestro"
                                        value={formSiniestro.datos.descTipoSiniestro}
                                        onChange={formSiniestro.handleInputChange}
                                        rows={3}
                                        maxLength={400}
                                        placeholder="Ingrese una descripción detallada del siniestro, incluyendo características, causas comunes, etc."
                                    />
                                </div>
                            </div>

                            <div className="card-footer flex-end">
                                <button className="btn btn-outline"
                                    onClick={formSiniestro.cerrar}
                                    disabled={guardandoSiniestro}
                                    style={{ marginRight: "8px" }}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary"
                                    onClick={handleGuardarSiniestro}
                                    disabled={guardandoSiniestro}>
                                    {guardandoSiniestro ? (
                                        <><span className="material-icons spin">autorenew</span> Guardando...</>
                                    ) : (
                                        "Guardar Siniestro"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {cargandoSiniestro ? (
                        <div className="loading-container">
                            <p>Cargando siniestros...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-header">
                                <h3>Listado de Tipos de Siniestro ({siniestros.length})</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>ID</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th style={{ width: "200px", textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {siniestros.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                                No hay tipos de siniestro registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        siniestros.map((s) => (
                                            <tr key={s.idTipoSin}>
                                                <td>{s.idTipoSin}</td>
                                                <td><strong>{s.nombreTipoSiniestro}</strong></td>
                                                <td>{s.descTipoSiniestro}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                        <button className="btn btn-sm btn-outline"
                                                            onClick={() => formSiniestro.abrirEditar({
                                                                nombreTipoSiniestro: s.nombreTipoSiniestro,
                                                                descTipoSiniestro: s.descTipoSiniestro
                                                            }, s.idTipoSin)}
                                                            title="Editar">
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                            Editar
                                                        </button>
                                                        <button className="btn btn-sm btn-danger"
                                                            onClick={() => handleEliminarSiniestro(s.idTipoSin)}
                                                            title="Eliminar">
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* TAB POLIZA */}
            {activeTab === "poliza" && (
                <>
                    <div className="flex-between mb-3">
                        <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>Tipos de Póliza</h2>
                        <button className="btn btn-primary" onClick={formPoliza.abrirNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.2rem" }}>add</span>
                            Agregar Póliza
                        </button>
                    </div>

                    {errorPoliza && (
                        <div className="alert alert-danger">
                            {errorPoliza}
                            <button className="btn btn-sm btn-outline" onClick={cargarPolizas} style={{ marginLeft: "12px" }}>
                                <span className="material-icons">refresh</span> Reintentar
                            </button>
                        </div>
                    )}

                    {formPoliza.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3>{formPoliza.editandoId ? "Editar Póliza" : "Nueva Póliza"}</h3>
                            </div>

                            <div className="card-body">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="nomTipoPol"
                                        value={formPoliza.datos.nomTipoPol}
                                        onChange={formPoliza.handleInputChange}
                                        maxLength={150}
                                        placeholder="Ingrese el nombre de la póliza"
                                    />
                                </div>
                            </div>

                            <div className="card-footer flex-end">
                                <button className="btn btn-outline"
                                    onClick={formPoliza.cerrar}
                                    disabled={guardandoPoliza}
                                    style={{ marginRight: "8px" }}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary"
                                    onClick={handleGuardarPoliza}
                                    disabled={guardandoPoliza}>
                                    {guardandoPoliza ? (
                                        <><span className="material-icons spin">autorenew</span> Guardando...</>
                                    ) : (
                                        "Guardar Póliza"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {cargandoPoliza ? (
                        <div className="loading-container">
                            <p>Cargando pólizas...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-header">
                                <h3>Listado de Tipos de Póliza ({polizas.length})</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>ID</th>
                                        <th>Nombre</th>
                                        <th style={{ width: "200px", textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {polizas.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                                No hay tipos de póliza registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        polizas.map((p) => (
                                            <tr key={p.idTipoPol}>
                                                <td>{p.idTipoPol}</td>
                                                <td><strong>{p.nomTipoPol}</strong></td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                        <button className="btn btn-sm btn-outline"
                                                            onClick={() => formPoliza.abrirEditar({ nomTipoPol: p.nomTipoPol }, p.idTipoPol)}
                                                            title="Editar">
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                            Editar
                                                        </button>
                                                        <button className="btn btn-sm btn-danger"
                                                            onClick={() => handleEliminarPoliza(p.idTipoPol)}
                                                            title="Eliminar">
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

export default TipoSiniestroPoliza;