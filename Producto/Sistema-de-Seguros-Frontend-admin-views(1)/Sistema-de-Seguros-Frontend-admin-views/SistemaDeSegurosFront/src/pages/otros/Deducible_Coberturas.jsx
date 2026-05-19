import React, { useState, useEffect } from "react";
import { validarCamposObligatorios } from "../../utils/validaciones";
import Swal from 'sweetalert2';
import deducibleService from "../../services/deducibleService";
import coberturaService from "../../services/coberturaService";
import BackButton from "../../components/BackButton";

function DeducibleCoberturas() {
    const [activeTab, setActiveTab] = useState("deducibles");

    // --- DEDUCIBLES ---
    const [deducibles, setDeducibles] = useState([]);
    const [cargandoDedu, setCargandoDedu] = useState(true);
    const [errorDedu, setErrorDedu] = useState(null);
    const [guardandoDedu, setGuardandoDedu] = useState(false);
    const [formDedu, setFormDedu] = useState(null); // null = cerrado, {} = abierto
    const [editandoDeduId, setEditandoDeduId] = useState(null);

    // --- COBERTURAS ---
    const [coberturas, setCoberturas] = useState([]);
    const [cargandoCob, setCargandoCob] = useState(true);
    const [errorCob, setErrorCob] = useState(null);
    const [guardandoCob, setGuardandoCob] = useState(false);
    const [formCob, setFormCob] = useState(null);
    const [editandoCobId, setEditandoCobId] = useState(null);

    // --- BÚSQUEDA POR PÓLIZA ---
    const [polizaIdDedu, setPolizaIdDedu] = useState("");
    const [polizaIdCob, setPolizaIdCob] = useState("");

    const cargarDeducibles = async () => {
        try {
            setCargandoDedu(true);
            setErrorDedu(null);
            const data = await deducibleService.listar();
            setDeducibles(data);
        } catch (err) {
            console.error("Error al cargar deducibles:", err);
            setErrorDedu("No se pudieron cargar los deducibles.");
        } finally {
            setCargandoDedu(false);
        }
    };

    const cargarCoberturas = async () => {
        try {
            setCargandoCob(true);
            setErrorCob(null);
            const data = await coberturaService.listar();
            setCoberturas(data);
        } catch (err) {
            console.error("Error al cargar coberturas:", err);
            setErrorCob("No se pudieron cargar las coberturas.");
        } finally {
            setCargandoCob(false);
        }
    };

    useEffect(() => {
        cargarDeducibles();
        cargarCoberturas();
    }, []);

    // --- CRUD DEDUCIBLES ---
    const abrirNuevoDedu = () => {
        setFormDedu({ nombreDedu: "", idPoliza: polizaIdDedu || "" });
        setEditandoDeduId(null);
    };

    const abrirEditarDedu = (d) => {
        setFormDedu({ nombreDedu: d.nombreDedu || "", idPoliza: d.idPoliza || "" });
        setEditandoDeduId(d.idDedu);
    };

    const cerrarFormDedu = () => { setFormDedu(null); setEditandoDeduId(null); };

    const handleGuardarDedu = async () => {
        const campos = [
            { nombre: "Nombre Deducible", valor: formDedu.nombreDedu },
            { nombre: "ID Póliza", valor: formDedu.idPoliza },
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
            setGuardandoDedu(true);
            const payload = { nombreDedu: formDedu.nombreDedu };
            if (editandoDeduId) {
                await deducibleService.actualizar(editandoDeduId, payload);
            } else {
                await deducibleService.crearParaPoliza(parseInt(formDedu.idPoliza), payload);
            }
            cerrarFormDedu();
            await cargarDeducibles();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Deducible guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar deducible:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al guardar deducible: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoDedu(false);
        }
    };

    const handleEliminarDedu = async (id) => {
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
                await deducibleService.eliminar(id);
                await cargarDeducibles();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El deducible ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar deducible:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el deducible.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    // --- CRUD COBERTURAS ---
    const abrirNuevoCob = () => {
        setFormCob({ descripcionCob: "", idPoliza: polizaIdCob || "" });
        setEditandoCobId(null);
    };

    const abrirEditarCob = (c) => {
        setFormCob({ descripcionCob: c.descripcionCob || "", idPoliza: c.idPoliza || "" });
        setEditandoCobId(c.idCobertura);
    };

    const cerrarFormCob = () => { setFormCob(null); setEditandoCobId(null); };

    const handleGuardarCob = async () => {
        const campos = [
            { nombre: "Descripción Cobertura", valor: formCob.descripcionCob },
            { nombre: "ID Póliza", valor: formCob.idPoliza },
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
            setGuardandoCob(true);
            const payload = { descripcionCob: formCob.descripcionCob };
            if (editandoCobId) {
                await coberturaService.actualizar(editandoCobId, payload);
            } else {
                await coberturaService.crearParaPoliza(parseInt(formCob.idPoliza), payload);
            }
            cerrarFormCob();
            await cargarCoberturas();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Cobertura guardada correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar cobertura:", err);
            const msg = err.response?.data?.message || err.response?.data || err.message;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al guardar cobertura: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoCob(false);
        }
    };

    const handleEliminarCob = async (id) => {
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
                await coberturaService.eliminar(id);
                await cargarCoberturas();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'La cobertura ha sido eliminada.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar cobertura:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar la cobertura.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    // --- FILTRO POR PÓLIZA ---
    const buscarDeduPorPoliza = async () => {
        if (!polizaIdDedu) { await cargarDeducibles(); return; }
        try {
            setCargandoDedu(true);
            setErrorDedu(null);
            const data = await deducibleService.listarPorPoliza(parseInt(polizaIdDedu));
            setDeducibles(data.deducibles || data);
        } catch (err) {
            console.error("Error al buscar deducibles por póliza:", err);
            setErrorDedu("No se encontraron deducibles para esa póliza.");
        } finally {
            setCargandoDedu(false);
        }
    };

    const buscarCobPorPoliza = async () => {
        if (!polizaIdCob) { await cargarCoberturas(); return; }
        try {
            setCargandoCob(true);
            setErrorCob(null);
            const data = await coberturaService.listarPorPoliza(parseInt(polizaIdCob));
            setCoberturas(data.coberturas || data);
        } catch (err) {
            console.error("Error al buscar coberturas por póliza:", err);
            setErrorCob("No se encontraron coberturas para esa póliza.");
        } finally {
            setCargandoCob(false);
        }
    };

    // --- RENDER ---
    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Deducible y Coberturas</h1>
                <p>Gestión de deducibles y coberturas asociados a pólizas</p>
            </div>

            {/* TABS */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "deducibles" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("deducibles")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>receipt_long</span> Deducibles
                </button>
                <button
                    className={`btn ${activeTab === "coberturas" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("coberturas")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>shield</span> Coberturas
                </button>
            </div>

            {/* TAB DEDUCIBLES */}
            {activeTab === "deducibles" && (
                <div>
                    {/* Filtro por póliza */}
                    <div className="card mb-3 p-3">
                        <div className="flex gap-1" style={{ alignItems: "flex-end" }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: "300px" }}>
                                <label className="form-label">Filtrar por ID Póliza</label>
                                <input className="form-input" type="number" value={polizaIdDedu}
                                    onChange={e => setPolizaIdDedu(e.target.value)} placeholder="ID de póliza..." />
                            </div>
                            <button className="btn btn-outline" onClick={buscarDeduPorPoliza}>
                                <span className="material-icons" style={{ fontSize: "1rem" }}>search</span> Buscar
                            </button>
                            <button className="btn btn-outline" onClick={() => { setPolizaIdDedu(""); cargarDeducibles(); }}>
                                Ver Todos
                            </button>
                        </div>
                    </div>

                    <div className="flex-between mb-3">
                        <h3>Listado de Deducibles ({deducibles.length})</h3>
                        {!formDedu && (
                            <button className="btn btn-primary" onClick={abrirNuevoDedu}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nuevo Deducible
                            </button>
                        )}
                    </div>

                    {formDedu && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">{editandoDeduId ? "Editar" : "Nuevo"} Deducible</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Nombre del Deducible</label>
                                        <input className="form-input" value={formDedu.nombreDedu}
                                            onChange={e => setFormDedu({ ...formDedu, nombreDedu: e.target.value })}
                                            placeholder="Ej: Deducible por choque" type="text" />
                                    </div>
                                    {!editandoDeduId && (
                                        <div className="form-group">
                                            <label className="form-label">ID Póliza</label>
                                            <input className="form-input" type="number" value={formDedu.idPoliza}
                                                onChange={e => setFormDedu({ ...formDedu, idPoliza: e.target.value })}
                                                placeholder="ID de la póliza asociada" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarDedu} disabled={guardandoDedu}>
                                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                        {guardandoDedu ? "Guardando..." : editandoDeduId ? "Actualizar" : "Guardar"}
                                    </button>
                                    <button className="btn btn-outline" onClick={cerrarFormDedu} disabled={guardandoDedu}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {cargandoDedu ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando deducibles...</p></div>
                        ) : errorDedu ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                <p>{errorDedu}</p>
                                <button className="btn btn-outline" onClick={cargarDeducibles} style={{ marginTop: "12px" }}>Reintentar</button>
                            </div>
                        ) : deducibles.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay deducibles registrados.</p></div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Póliza</th>
                                        <th>Tipo Deducible</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deducibles.map((d) => (
                                        <tr key={d.idDedu}>
                                            <td>{d.idDedu}</td>
                                            <td><strong>{d.nombreDedu}</strong></td>
                                            <td>{d.idPoliza || "—"}</td>
                                            <td>{d.tipoDeducible?.nombre || "—"}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => abrirEditarDedu(d)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleEliminarDedu(d.idDedu)}>
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

            {/* TAB COBERTURAS */}
            {activeTab === "coberturas" && (
                <div>
                    {/* Filtro por póliza */}
                    <div className="card mb-3 p-3">
                        <div className="flex gap-1" style={{ alignItems: "flex-end" }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: "300px" }}>
                                <label className="form-label">Filtrar por ID Póliza</label>
                                <input className="form-input" type="number" value={polizaIdCob}
                                    onChange={e => setPolizaIdCob(e.target.value)} placeholder="ID de póliza..." />
                            </div>
                            <button className="btn btn-outline" onClick={buscarCobPorPoliza}>
                                <span className="material-icons" style={{ fontSize: "1rem" }}>search</span> Buscar
                            </button>
                            <button className="btn btn-outline" onClick={() => { setPolizaIdCob(""); cargarCoberturas(); }}>
                                Ver Todos
                            </button>
                        </div>
                    </div>

                    <div className="flex-between mb-3">
                        <h3>Listado de Coberturas ({coberturas.length})</h3>
                        {!formCob && (
                            <button className="btn btn-primary" onClick={abrirNuevoCob}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nueva Cobertura
                            </button>
                        )}
                    </div>

                    {formCob && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">{editandoCobId ? "Editar" : "Nueva"} Cobertura</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Descripción de la Cobertura</label>
                                        <input className="form-input" value={formCob.descripcionCob}
                                            onChange={e => setFormCob({ ...formCob, descripcionCob: e.target.value })}
                                            placeholder="Ej: Cobertura contra robo total" type="text" />
                                    </div>
                                    {!editandoCobId && (
                                        <div className="form-group">
                                            <label className="form-label">ID Póliza</label>
                                            <input className="form-input" type="number" value={formCob.idPoliza}
                                                onChange={e => setFormCob({ ...formCob, idPoliza: e.target.value })}
                                                placeholder="ID de la póliza asociada" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarCob} disabled={guardandoCob}>
                                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                        {guardandoCob ? "Guardando..." : editandoCobId ? "Actualizar" : "Guardar"}
                                    </button>
                                    <button className="btn btn-outline" onClick={cerrarFormCob} disabled={guardandoCob}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {cargandoCob ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando coberturas...</p></div>
                        ) : errorCob ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                <p>{errorCob}</p>
                                <button className="btn btn-outline" onClick={cargarCoberturas} style={{ marginTop: "12px" }}>Reintentar</button>
                            </div>
                        ) : coberturas.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay coberturas registradas.</p></div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Póliza</th>
                                        <th>Tipo Cobertura</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coberturas.map((c) => (
                                        <tr key={c.idCobertura}>
                                            <td>{c.idCobertura}</td>
                                            <td><strong>{c.descripcionCob}</strong></td>
                                            <td>{c.idPoliza || "—"}</td>
                                            <td>{c.tipoCobertura?.nombre || "—"}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => abrirEditarCob(c)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleEliminarCob(c.idCobertura)}>
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

export default DeducibleCoberturas;
