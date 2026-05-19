import React, { useState, useEffect } from "react";
import { validarRut, validarCamposObligatorios, esNumerico } from "../../utils/validaciones";
import { formatRut } from "../../utils/formatos";
import { useFormulario } from "../../hooks/useFormulario";
import conductorService from "../../services/conductorService";
import BackButton from "../../components/BackButton";
import Swal from 'sweetalert2';

const conductorVacio = {
    primerNombre: '',
    segundoNombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rut: '',
    telefono: '',
    direccion: '',
};

function GestionConductores() {
    const [conductores, setConductores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Cargar conductores desde la API al montar
    const cargarConductores = async () => {
        try {
            setCargando(true);
            setError(null);
            const data = await conductorService.listar();
            setConductores(data);
        } catch (err) {
            console.error("Error al cargar conductores:", err);
            setError("No se pudieron cargar los conductores. Verifica que el servidor esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarConductores();
    }, []);

    // Handler personalizado para el input RUT
    const manejarInputEspecial = (name, value, setDatos) => {
        if (name === "rut") {
            const formatted = formatRut(value);
            if (formatted.length <= 12) {
                setDatos((prev) => ({ ...prev, [name]: formatted }));
                if (rutError) setRutError("");
            }
            return true;
        }
        return false;
    };

    // Hook formulario para el estado del form
    const {
        datos: conductorActual,
        editandoId,
        mostrar: mostrarFormulario,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
    } = useFormulario(conductorVacio, { onInputChange: manejarInputEspecial });

    const [rutError, setRutError] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [importando, setImportando] = useState(false);
    const [exportando, setExportando] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const fileInputRef = React.useRef(null);

    const handleImportar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setImportando(true);
            const resultado = await conductorService.importar(file);
            const errores = resultado?.match(/Errores:\s*(\d+)/);
            if (errores && parseInt(errores[1]) > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Importación con observaciones',
                    text: `Importación completada con ${errores[1]} error(es). Revisa los datos del archivo.`,
                    confirmButtonColor: '#045524'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Importación completada exitosamente.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            await cargarConductores();
        } catch (err) {
            console.error("Error al importar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error de importación',
                text: 'Error al importar el archivo. Verifica que sea un archivo Excel válido.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setImportando(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExportar = async () => {
        try {
            setExportando(true);
            const blob = await conductorService.exportar();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'conductores.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al exportar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error de exportación',
                text: 'Error al exportar los conductores.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setExportando(false);
        }
    };

    const handleRutBlur = () => {
        if (conductorActual.rut) {
            const esValido = validarRut(conductorActual.rut);
            setRutError(esValido ? "" : "RUT inválido");
        }
    };

    const handleNuevo = () => {
        setRutError("");
        abrirNuevo();
    };

    const handleEditar = (conductor) => {
        setRutError("");
        abrirEditar(conductor, conductor.id_conductor);
    };

    const handleEliminar = async (id) => {
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
                await conductorService.eliminar(id);
                await cargarConductores();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El conductor ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el conductor.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleGuardar = async () => {
        // 1. Validaciones de campos vacíos
        const campos = [
            { nombre: "Primer Nombre", valor: conductorActual.primerNombre },
            { nombre: "Apellido Paterno", valor: conductorActual.apellidoPaterno },
            { nombre: "RUT", valor: conductorActual.rut },
            { nombre: "Dirección", valor: conductorActual.direccion },
            { nombre: "Teléfono", valor: conductorActual.telefono },
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

        // 2. Validación de RUT
        if (!validarRut(conductorActual.rut)) {
            setRutError("Debes ingresar un RUT válido para guardar.");
            return;
        }

        // 3. Validación de Teléfono
        if (!esNumerico(conductorActual.telefono)) {
            Swal.fire({
                icon: 'warning',
                title: 'Dato inválido',
                text: 'El campo Teléfono debe ser numérico.',
                confirmButtonColor: '#045524'
            });
            return;
        }

        // Guardar o Actualizar vía API
        try {
            setGuardando(true);
            if (editandoId) {
                await conductorService.actualizar(editandoId, conductorActual);
            } else {
                await conductorService.crear(conductorActual);
            }
            setRutError("");
            cerrar();
            await cargarConductores();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: editandoId ? 'Conductor actualizado correctamente.' : 'Conductor creado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el conductor. Revisa los datos e intenta de nuevo.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        setRutError("");
        cerrar();
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header flex-between">
                <div>
                    <h1>Gestión de Conductores</h1>
                    <p>Administra los conductores registrados en el sistema</p>
                </div>
                {!mostrarFormulario && (
                    <div className="flex gap-1">
                        <button className="btn btn-primary" onClick={handleNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                            Nuevo Conductor
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importando}
                        >
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>upload_file</span>
                            {importando ? "Importando..." : "Importar Excel"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".xlsx"
                            style={{ display: 'none' }}
                            onChange={handleImportar}
                        />
                        <button
                            className="btn btn-outline"
                            onClick={handleExportar}
                            disabled={exportando}
                        >
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>download</span>
                            {exportando ? "Exportando..." : "Exportar Excel"}
                        </button>
                    </div>
                )}
            </div>

            {mostrarFormulario && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h3 className="card-title">
                            {editandoId ? "Editar Conductor" : "Nuevo Conductor"}
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">ID</label>
                                <input
                                    className="form-input"
                                    value={editandoId || "Auto-generado"}
                                    type="text"
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Primer Nombre</label>
                                <input
                                    className="form-input"
                                    name="primerNombre"
                                    value={conductorActual.primerNombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Juan"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Segundo Nombre</label>
                                <input
                                    className="form-input"
                                    name="segundoNombre"
                                    value={conductorActual.segundoNombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Carlos"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Apellido Paterno</label>
                                <input
                                    className="form-input"
                                    name="apellidoPaterno"
                                    value={conductorActual.apellidoPaterno}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Pérez"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellido Materno</label>
                                <input
                                    className="form-input"
                                    name="apellidoMaterno"
                                    value={conductorActual.apellidoMaterno}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Gómez"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">RUT</label>
                                <input
                                    className="form-input"
                                    name="rut"
                                    value={conductorActual.rut}
                                    onChange={handleInputChange}
                                    onBlur={handleRutBlur}
                                    placeholder="Ej: 12.345.678-9"
                                    type="text"
                                    style={rutError ? { borderColor: 'red' } : {}}
                                />
                                {rutError && (
                                    <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                        {rutError}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Dirección</label>
                                <input
                                    className="form-input"
                                    name="direccion"
                                    value={conductorActual.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Calle Falsa 123"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input
                                    className="form-input"
                                    name="telefono"
                                    value={conductorActual.telefono}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 987654321"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                            <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Guardar"}
                            </button>
                            <button className="btn btn-outline" onClick={handleCancelar} disabled={guardando}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>


            )}

            <div className="card mb-3">
                <div className="card-body" style={{ padding: "10px 15px" }}>
                    <div className="flex align-center gap-1">
                        <span className="material-icons text-muted">search</span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar por RUT..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ maxWidth: "300px", margin: 0 }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Listado de Conductores ({conductores.filter(c => c.rut.toLowerCase().includes(busqueda.toLowerCase())).length})</h3>
                </div>
                {cargando ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>Cargando conductores...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                        <p>{error}</p>
                        <button className="btn btn-outline" onClick={cargarConductores} style={{ marginTop: '12px' }}>
                            Reintentar
                        </button>
                    </div>
                ) : conductores.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>No hay conductores registrados.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido P.</th>
                                <th>Apellido M.</th>
                                <th>RUT</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conductores
                                .filter((c) => c.rut.toLowerCase().includes(busqueda.toLowerCase()))
                                .map((c) => (
                                    <tr key={c.id_conductor} style={{ textTransform: "uppercase" }}>
                                        <td>{c.id_conductor}</td>
                                        <td><strong>{c.primerNombre} {c.segundoNombre}</strong></td>
                                        <td>{c.apellidoPaterno}</td>
                                        <td>{c.apellidoMaterno}</td>
                                        <td>{c.rut}</td>
                                        <td>{c.direccion}</td>
                                        <td>{c.telefono}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEditar(c)} title="Editar">
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                    Editar
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(c.id_conductor)} title="Eliminar">
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                                                    Eliminar
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
    );
}

export default GestionConductores;