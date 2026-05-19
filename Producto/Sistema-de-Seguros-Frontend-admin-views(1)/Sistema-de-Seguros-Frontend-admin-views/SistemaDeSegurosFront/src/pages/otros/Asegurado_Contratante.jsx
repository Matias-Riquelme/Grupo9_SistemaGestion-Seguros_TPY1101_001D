import React, { useState, useEffect } from "react";
import { validarCamposObligatorios, validarRut } from "../../utils/validaciones";
import { formatRut } from "../../utils/formatos";
import Swal from 'sweetalert2';
import { useFormulario } from "../../hooks/useFormulario";
import aseguradoService from "../../services/aseguradoService";
import contratanteService from "../../services/contratanteService";
import BackButton from "../../components/BackButton";

const aseguradoVacio = { razonSocialAse: "", rutAse: "" };
const contratanteVacio = { razonSocialContra: "", rutContra: "" };

function AseguradoContratante() {
    const [activeTab, setActiveTab] = useState("asegurados");

    // --- ASEGURADO ---
    const [asegurados, setAsegurados] = useState([]);
    const [cargandoAsegurados, setCargandoAsegurados] = useState(true);
    const [errorAsegurados, setErrorAsegurados] = useState(null);
    const [guardandoAsegurado, setGuardandoAsegurado] = useState(false);

    // --- CONTRATANTE ---
    const [contratantes, setContratantes] = useState([]);
    const [cargandoContratantes, setCargandoContratantes] = useState(true);
    const [errorContratantes, setErrorContratantes] = useState(null);
    const [guardandoContratante, setGuardandoContratante] = useState(false);

    // --- RUT Errors ---
    const [rutAseguradoError, setRutAseguradoError] = useState("");
    const [rutContratanteError, setRutContratanteError] = useState("");

    const cargarAsegurados = async () => {
        try {
            setCargandoAsegurados(true);
            setErrorAsegurados(null);
            const data = await aseguradoService.listar();
            setAsegurados(data);
        } catch (err) {
            console.error("Error al cargar asegurados:", err);
            setErrorAsegurados("No se pudieron cargar los asegurados.");
        } finally {
            setCargandoAsegurados(false);
        }
    };

    const cargarContratantes = async () => {
        try {
            setCargandoContratantes(true);
            setErrorContratantes(null);
            const data = await contratanteService.listar();
            setContratantes(data);
        } catch (err) {
            console.error("Error al cargar contratantes:", err);
            setErrorContratantes("No se pudieron cargar los contratantes.");
        } finally {
            setCargandoContratantes(false);
        }
    };

    useEffect(() => {
        cargarAsegurados();
        cargarContratantes();
    }, []);

    // Handler personalizado para el input RUT de Asegurado
    const manejarInputAsegurado = (name, value, setDatos) => {
        if (name === "rutAse") {
            const formatted = formatRut(value);
            if (formatted.length <= 12) {
                setDatos((prev) => ({ ...prev, [name]: formatted }));
                if (rutAseguradoError) setRutAseguradoError("");
            }
            return true;
        }
        return false;
    };

    // Handler personalizado para el input RUT de Contratante
    const manejarInputContratante = (name, value, setDatos) => {
        if (name === "rutContra") {
            const formatted = formatRut(value);
            if (formatted.length <= 12) {
                setDatos((prev) => ({ ...prev, [name]: formatted }));
                if (rutContratanteError) setRutContratanteError("");
            }
            return true;
        }
        return false;
    };

    const formAsegurado = useFormulario(aseguradoVacio, { onInputChange: manejarInputAsegurado });
    const formContratante = useFormulario(contratanteVacio, { onInputChange: manejarInputContratante });

    // --- CRUD ASEGURADOS ---
    const handleGuardarAsegurado = async () => {
        const campos = [
            { nombre: "Razón Social", valor: formAsegurado.datos.razonSocialAse },
            { nombre: "RUT", valor: formAsegurado.datos.rutAse },
        ];
        const resultado = validarCamposObligatorios(campos);
        if (!resultado.valido) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: resultado.mensaje,
                confirmButtonColor: '#045524'
            });
            return;
        }

        // Validar RUT
        if (!validarRut(formAsegurado.datos.rutAse)) {
            setRutAseguradoError("Debes ingresar un RUT válido para guardar.");
            return;
        }

        try {
            setGuardandoAsegurado(true);
            const payload = {
                razonSocialAse: formAsegurado.datos.razonSocialAse.trim(),
                rutAse: formAsegurado.datos.rutAse.trim(),
            };
            if (formAsegurado.editandoId) {
                await aseguradoService.actualizar(formAsegurado.editandoId, payload);
            } else {
                await aseguradoService.crear(payload);
            }
            setRutAseguradoError("");
            formAsegurado.cerrar();
            await cargarAsegurados();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Asegurado guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar asegurado:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el asegurado.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoAsegurado(false);
        }
    };

    const handleEliminarAsegurado = async (id) => {
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
                await aseguradoService.eliminar(id);
                await cargarAsegurados();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El asegurado ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar asegurado:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el asegurado.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleEditarAsegurado = (asegurado) => {
        const datos = {
            razonSocialAse: asegurado.razonSocialAse || "",
            rutAse: asegurado.rutAse || "",
        };
        setRutAseguradoError("");
        formAsegurado.abrirEditar(datos, asegurado.idAsegurado);
    };

    const handleRutAseguradoBlur = () => {
        if (formAsegurado.datos.rutAse) {
            const esValido = validarRut(formAsegurado.datos.rutAse);
            setRutAseguradoError(esValido ? "" : "RUT inválido");
        }
    };

    // --- CRUD CONTRATANTES ---
    const handleGuardarContratante = async () => {
        const campos = [
            { nombre: "Razón Social", valor: formContratante.datos.razonSocialContra },
            { nombre: "RUT", valor: formContratante.datos.rutContra },
        ];
        const resultado = validarCamposObligatorios(campos);
        if (!resultado.valido) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: resultado.mensaje,
                confirmButtonColor: '#045524'
            });
            return;
        }

        // Validar RUT
        if (!validarRut(formContratante.datos.rutContra)) {
            setRutContratanteError("Debes ingresar un RUT válido para guardar.");
            return;
        }

        try {
            setGuardandoContratante(true);
            const payload = {
                razonSocialContra: formContratante.datos.razonSocialContra.trim(),
                rutContra: formContratante.datos.rutContra.trim(),
            };
            if (formContratante.editandoId) {
                await contratanteService.actualizar(formContratante.editandoId, payload);
            } else {
                await contratanteService.crear(payload);
            }
            setRutContratanteError("");
            formContratante.cerrar();
            await cargarContratantes();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Contratante guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar contratante:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el contratante.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardandoContratante(false);
        }
    };

    const handleEliminarContratante = async (id) => {
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
                await contratanteService.eliminar(id);
                await cargarContratantes();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El contratante ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar contratante:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el contratante.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleEditarContratante = (contratante) => {
        const datos = {
            razonSocialContra: contratante.razonSocialContra || "",
            rutContra: contratante.rutContra || "",
        };
        setRutContratanteError("");
        formContratante.abrirEditar(datos, contratante.idContratante);
    };

    const handleRutContratanteBlur = () => {
        if (formContratante.datos.rutContra) {
            const esValido = validarRut(formContratante.datos.rutContra);
            setRutContratanteError(esValido ? "" : "RUT inválido");
        }
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Gestión de Asegurados y Contratantes</h1>
                <p className="text-muted">Administra los asegurados y contratantes del sistema</p>
            </div>

            {/* TABS */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "asegurados" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("asegurados")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>person</span> Asegurados
                </button>
                <button
                    className={`btn ${activeTab === "contratantes" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("contratantes")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>business</span> Contratantes
                </button>
            </div>

            {/* TAB: ASEGURADOS */}
            {activeTab === 'asegurados' && (
                <>
                    <div className="flex-between mb-3">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Asegurados</h2>
                        <button className="btn btn-primary" onClick={formAsegurado.abrirNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                            Nuevo Asegurado
                        </button>
                    </div>

                    {errorAsegurados && (
                        <div className="alert alert-error">
                            {errorAsegurados}
                            <button className="btn btn-sm btn-outline" onClick={cargarAsegurados} style={{ marginLeft: '12px' }}>
                                Reintentar
                            </button>
                        </div>
                    )}



                    {/* MODAL ASEGURADO */}
                    {formAsegurado.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h2>{formAsegurado.editandoId ? 'Editar Asegurado' : 'Nuevo Asegurado'}</h2>
                            </div>

                            <div className="card-body">
                                <div className="form-group">
                                    <label>Razón Social *</label>
                                    <input
                                        type="text"
                                        name="razonSocialAse"
                                        value={formAsegurado.datos.razonSocialAse}
                                        onChange={formAsegurado.handleInputChange}
                                        maxLength={150}
                                        placeholder="Ej: Empresa XYZ S.A."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>RUT *</label>
                                    <input
                                        type="text"
                                        name="rutAse"
                                        value={formAsegurado.datos.rutAse}
                                        onChange={formAsegurado.handleInputChange}
                                        onBlur={handleRutAseguradoBlur}
                                        maxLength={12}
                                        placeholder="Ej: 12.345.678-9"
                                        style={rutAseguradoError ? { borderColor: 'red' } : {}}
                                    />
                                    {rutAseguradoError && (
                                        <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                            {rutAseguradoError}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={formAsegurado.cerrar}
                                    disabled={guardandoAsegurado}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGuardarAsegurado}
                                    disabled={guardandoAsegurado}
                                >
                                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                    {guardandoAsegurado ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {cargandoAsegurados ? (
                        <div className="loading-container">
                            <p>Cargando asegurados...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-header">
                                <h3>Listado de Asegurados ({asegurados.length})</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Razón Social</th>
                                        <th>RUT</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asegurados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                                No hay asegurados registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        asegurados.map((aseg) => (
                                            <tr key={aseg.idAsegurado}>
                                                <td>{aseg.idAsegurado}</td>
                                                <td><strong>{aseg.razonSocialAse}</strong></td>
                                                <td>{aseg.rutAse}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => handleEditarAsegurado(aseg)}
                                                            title="Editar"
                                                        >
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleEliminarAsegurado(aseg.idAsegurado)}
                                                            title="Eliminar"
                                                        >
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

            {/* TAB: CONTRATANTES */}
            {activeTab === 'contratantes' && (
                <>
                    <div className="flex-between mb-3">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Contratantes</h2>
                        <button className="btn btn-primary" onClick={formContratante.abrirNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                            Nuevo Contratante
                        </button>
                    </div>

                    {errorContratantes && (
                        <div className="alert alert-error">
                            {errorContratantes}
                            <button className="btn btn-sm btn-outline" onClick={cargarContratantes} style={{ marginLeft: '12px' }}>
                                Reintentar
                            </button>
                        </div>
                    )}



                    {/* CONTRATANTE */}
                    {formContratante.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h2>{formContratante.editandoId ? 'Editar Contratante' : 'Nuevo Contratante'}</h2>
                            </div>

                            <div className="card-body">
                                <div className="form-group">
                                    <label>Razón Social *</label>
                                    <input
                                        type="text"
                                        name="razonSocialContra"
                                        value={formContratante.datos.razonSocialContra}
                                        onChange={formContratante.handleInputChange}
                                        maxLength={150}
                                        placeholder="Ej: Empresa XYZ S.A."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>RUT *</label>
                                    <input
                                        type="text"
                                        name="rutContra"
                                        value={formContratante.datos.rutContra}
                                        onChange={formContratante.handleInputChange}
                                        onBlur={handleRutContratanteBlur}
                                        maxLength={12}
                                        placeholder="Ej: 12.345.678-9"
                                        style={rutContratanteError ? { borderColor: 'red' } : {}}
                                    />
                                    {rutContratanteError && (
                                        <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                            {rutContratanteError}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={formContratante.cerrar}
                                    disabled={guardandoContratante}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGuardarContratante}
                                    disabled={guardandoContratante}
                                >
                                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                    {guardandoContratante ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {cargandoContratantes ? (
                        <div className="loading-container">
                            <p>Cargando contratantes...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-header">
                                <h3>Listado de Contratantes ({contratantes.length})</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Razón Social</th>
                                        <th>RUT</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contratantes.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                                No hay contratantes registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        contratantes.map((contr) => (
                                            <tr key={contr.idContratante}>
                                                <td>{contr.idContratante}</td>
                                                <td><strong>{contr.razonSocialContra}</strong></td>
                                                <td>{contr.rutContra}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => handleEditarContratante(contr)}
                                                            title="Editar"
                                                        >
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleEliminarContratante(contr.idContratante)}
                                                            title="Eliminar"
                                                        >
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

export default AseguradoContratante;