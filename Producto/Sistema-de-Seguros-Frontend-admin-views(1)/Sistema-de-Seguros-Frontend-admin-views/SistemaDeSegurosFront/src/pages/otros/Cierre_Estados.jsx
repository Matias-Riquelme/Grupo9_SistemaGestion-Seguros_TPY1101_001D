import React, { useState, useEffect } from "react";
import { validarCamposObligatorios } from "../../utils/validaciones";
import { useFormulario } from "../../hooks/useFormulario";
import Swal from 'sweetalert2';
import cierreService from "../../services/cierreService";
import estadoSiniestroService from "../../services/estadoSiniestroService";
import BackButton from "../../components/BackButton";

const cierreVacio = { motivoCierre: "", fechaCierre: "" };
const estadoVacio = { nombreEstado: "" };

function CierreEstados() {
    const [activeTab, setActiveTab] = useState("cierres");

    // --- CIERRES ---
    const [cierres, setCierres] = useState([]);
    const [cargandoCierres, setCargandoCierres] = useState(true);
    const [errorCierres, setErrorCierres] = useState(null);
    const [guardandoCierre, setGuardandoCierre] = useState(false);

    // --- ESTADOS SINIESTRO ---
    const [estados, setEstados] = useState([]);
    const [cargandoEstados, setCargandoEstados] = useState(true);
    const [errorEstados, setErrorEstados] = useState(null);
    const [guardandoEstado, setGuardandoEstado] = useState(false);

    const cargarCierres = async () => {
        try {
            setCargandoCierres(true);
            setErrorCierres(null);
            const data = await cierreService.listar();
            setCierres(data);
        } catch (err) {
            console.error("Error al cargar cierres:", err);
            setErrorCierres("No se pudieron cargar los cierres.");
        } finally {
            setCargandoCierres(false);
        }
    };

    const cargarEstados = async () => {
        try {
            setCargandoEstados(true);
            setErrorEstados(null);
            const data = await estadoSiniestroService.listar();
            setEstados(data);
        } catch (err) {
            console.error("Error al cargar estados:", err);
            setErrorEstados("No se pudieron cargar los estados de siniestro.");
        } finally {
            setCargandoEstados(false);
        }
    };

    useEffect(() => {
        cargarCierres();
        cargarEstados();
    }, []);

    const formCierre = useFormulario(cierreVacio);
    const formEstado = useFormulario(estadoVacio);

    // --- CRUD CIERRES ---
    const handleGuardarCierre = async () => {
        const campos = [
            { nombre: "Motivo de Cierre", valor: formCierre.datos.motivoCierre },
            { nombre: "Fecha de Cierre", valor: formCierre.datos.fechaCierre },
        ];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: validarCamposObligatorios(campos).mensaje,
                confirmButtonColor: '#045524'
            });
            return;
        }
        try {
            setGuardandoCierre(true);
            const payload = {
                motivoCierre: formCierre.datos.motivoCierre,
                fechaCierre: formCierre.datos.fechaCierre.includes("T")
                    ? formCierre.datos.fechaCierre
                    : formCierre.datos.fechaCierre + "T00:00:00",
            };
            if (formCierre.editandoId) {
                await cierreService.actualizar(formCierre.editandoId, payload);
            } else {
                await cierreService.crear(payload);
            }
            formCierre.cerrar();
            await cargarCierres();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Cierre guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar cierre:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el cierre.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoCierre(false);
        }
    };

    const handleEliminarCierre = async (id) => {
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
                await cierreService.eliminar(id);
                await cargarCierres();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El cierre ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar cierre:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el cierre.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleEditarCierre = (cierre) => {
        const datos = {
            motivoCierre: cierre.motivoCierre || "",
            fechaCierre: cierre.fechaCierre ? cierre.fechaCierre.substring(0, 16) : "",
        };
        formCierre.abrirEditar(datos, cierre.idCierre);
    };

    // --- CRUD ESTADOS ---
    const handleGuardarEstado = async () => {
        const campos = [{ nombre: "Nombre del Estado", valor: formEstado.datos.nombreEstado }];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: validarCamposObligatorios(campos).mensaje,
                confirmButtonColor: '#045524'
            });
            return;
        }
        try {
            setGuardandoEstado(true);
            const payload = { nombreEstado: formEstado.datos.nombreEstado };
            if (formEstado.editandoId) {
                await estadoSiniestroService.actualizar(formEstado.editandoId, payload);
            } else {
                await estadoSiniestroService.crear(payload);
            }
            formEstado.cerrar();
            await cargarEstados();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Estado guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar estado:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el estado de siniestro.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoEstado(false);
        }
    };

    const handleEliminarEstado = async (id) => {
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
                await estadoSiniestroService.eliminar(id);
                await cargarEstados();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El estado ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar estado:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el estado.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const formatFechaLocal = (fechaISO) => {
        if (!fechaISO) return "—";
        try {
            const d = new Date(fechaISO);
            return d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch { return fechaISO; }
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Cierre de Estados</h1>
                <p>Gestión de cierres y estados de siniestro</p>
            </div>

            {/* TABS */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "cierres" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("cierres")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>lock</span> Cierres
                </button>
                <button
                    className={`btn ${activeTab === "estados" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("estados")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>flag</span> Estados de Siniestro
                </button>
            </div>

            {/* TAB CIERRES */}
            {activeTab === "cierres" && (
                <div>
                    <div className="flex-between mb-3">
                        <h3>Listado de Cierres ({cierres.length})</h3>
                        {!formCierre.mostrar && (
                            <button className="btn btn-primary" onClick={formCierre.abrirNuevo}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nuevo Cierre
                            </button>
                        )}
                    </div>

                    {formCierre.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">{formCierre.editandoId ? "Editar" : "Nuevo"} Cierre</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Fecha de Cierre</label>
                                        <input className="form-input" type="datetime-local" name="fechaCierre"
                                            value={formCierre.datos.fechaCierre} onChange={formCierre.handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Motivo de Cierre</label>
                                        <input className="form-input" name="motivoCierre"
                                            value={formCierre.datos.motivoCierre} onChange={formCierre.handleInputChange}
                                            placeholder="Ej: Cierre por resolución administrativa" type="text" />
                                    </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarCierre} disabled={guardandoCierre}>
                                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                        {guardandoCierre ? "Guardando..." : formCierre.editandoId ? "Actualizar" : "Guardar"}
                                    </button>
                                    <button className="btn btn-outline" onClick={formCierre.cerrar} disabled={guardandoCierre}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {cargandoCierres ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando cierres...</p></div>
                        ) : errorCierres ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                <p>{errorCierres}</p>
                                <button className="btn btn-outline" onClick={cargarCierres} style={{ marginTop: "12px" }}>Reintentar</button>
                            </div>
                        ) : cierres.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay cierres registrados.</p></div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Motivo</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cierres.map((c) => (
                                        <tr key={c.idCierre}>
                                            <td>{c.idCierre}</td>
                                            <td>{formatFechaLocal(c.fechaCierre)}</td>
                                            <td>{c.motivoCierre}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => handleEditarCierre(c)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleEliminarCierre(c.idCierre)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span> Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* TAB ESTADOS DE SINIESTRO */}
            {activeTab === "estados" && (
                <div>
                    <div className="flex-between mb-3">
                        <h3>Listado de Estados ({estados.length})</h3>
                        {!formEstado.mostrar && (
                            <button className="btn btn-primary" onClick={formEstado.abrirNuevo}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nuevo Estado
                            </button>
                        )}
                    </div>

                    {formEstado.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">{formEstado.editandoId ? "Editar" : "Nuevo"} Estado</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre del Estado</label>
                                    <input className="form-input" name="nombreEstado"
                                        value={formEstado.datos.nombreEstado} onChange={formEstado.handleInputChange}
                                        placeholder="Ej: En proceso, Cerrado, Rechazado" type="text" />
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarEstado} disabled={guardandoEstado}>
                                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                        {guardandoEstado ? "Guardando..." : formEstado.editandoId ? "Actualizar" : "Guardar"}
                                    </button>
                                    <button className="btn btn-outline" onClick={formEstado.cerrar} disabled={guardandoEstado}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {cargandoEstados ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando estados...</p></div>
                        ) : errorEstados ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                <p>{errorEstados}</p>
                                <button className="btn btn-outline" onClick={cargarEstados} style={{ marginTop: "12px" }}>Reintentar</button>
                            </div>
                        ) : estados.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay estados registrados.</p></div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre del Estado</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estados.map((e) => (
                                        <tr key={e.idEstado}>
                                            <td>{e.idEstado}</td>
                                            <td><strong>{e.nombreEstado}</strong></td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => formEstado.abrirEditar(e, e.idEstado)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleEliminarEstado(e.idEstado)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span> Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CierreEstados;
