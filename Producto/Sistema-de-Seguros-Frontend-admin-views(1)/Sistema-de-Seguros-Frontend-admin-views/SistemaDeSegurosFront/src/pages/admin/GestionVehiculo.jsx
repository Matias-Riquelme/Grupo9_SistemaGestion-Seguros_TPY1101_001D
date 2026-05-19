import React, { useState, useEffect } from "react";
import { validarCamposObligatorios, esEntero } from "../../utils/validaciones";
import BackButton from "../../components/BackButton";
import Swal from 'sweetalert2';
import { useFormulario } from "../../hooks/useFormulario";
import vehiculoService from "../../services/vehiculoService";
import operacionesService from "../../services/operacionesService";
import baseService from "../../services/baseService";
import polizaService from "../../services/polizaService";
import tipoVehiculoService from "../../services/tipoVehiculoService";


const vehiculoVacio = {
    patente: "",
    marca: "",
    modelo: "",
    id_tipo_vehiculo: "",
    anio: "",
    anioRegistro: "",
    num_motor_veh: "",
    num_chasis_veh: "",
    id_operacion: "",
    idPoliza: "",
};

function GestionVehiculo() {
    const [vehiculos, setVehiculos] = useState([]);
    const [tiposVehiculo, setTiposVehiculo] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [bases, setBases] = useState([]);
    const [polizas, setPolizas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
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
            const resultado = await vehiculoService.importar(file);
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
            await cargarVehiculos();
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
            const blob = await vehiculoService.exportar();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vehiculos.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al exportar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error de exportación',
                text: 'Error al exportar los vehículos.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setExportando(false);
        }
    };

    // Cargar vehículos y tipos desde la API
    const cargarVehiculos = async () => {
        try {
            setCargando(true);
            setError(null);
            const data = await vehiculoService.listar();
            setVehiculos(data);
        } catch (err) {
            console.error("Error al cargar vehículos:", err);
            setError("No se pudieron cargar los vehículos. Verifica que el servidor esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVehiculos();
        // Cargar catálogos
        tipoVehiculoService.listar().then(setTiposVehiculo).catch(() => setTiposVehiculo([]));
        operacionesService.listar().then(setOperaciones).catch(() => setOperaciones([]));
        baseService.listar().then(setBases).catch(() => setBases([]));
        polizaService.listar().then(setPolizas).catch(() => setPolizas([]));
    }, []);

    // Hook formulario
    const {
        datos: vehiculoActual,
        editandoId,
        mostrar: mostrarFormulario,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
    } = useFormulario(vehiculoVacio);

    const handleNuevo = () => {
        abrirNuevo();
    };

    const handleEditar = (vehiculo) => {
        abrirEditar(vehiculo, vehiculo.id_vehiculo);
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
                await vehiculoService.eliminar(id);
                await cargarVehiculos();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El vehículo ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el vehículo.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleGuardar = async () => {
        const campos = [
            { nombre: "Patente", valor: vehiculoActual.patente },
            { nombre: "Marca", valor: vehiculoActual.marca },
            { nombre: "Modelo", valor: vehiculoActual.modelo },
            { nombre: "Año", valor: vehiculoActual.anio },
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

        if (!esEntero(vehiculoActual.anio)) {
            Swal.fire({
                icon: 'warning',
                title: 'Dato inválido',
                text: 'El campo Año debe ser un número entero.',
                confirmButtonColor: '#045524'
            });
            return;
        }

        try {
            setGuardando(true);
            if (editandoId) {
                await vehiculoService.actualizar(editandoId, vehiculoActual);
            } else {
                await vehiculoService.crear(vehiculoActual);
            }
            cerrar();
            await cargarVehiculos();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Vehículo guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el vehículo. Revisa los datos e intenta de nuevo.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        cerrar();
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header flex-between">
                <div>
                    <h1>Gestión de Vehículos</h1>
                    <p>Administra los vehículos registrados en el sistema</p>
                </div>
                {!mostrarFormulario && (
                    <div className="flex gap-1">
                        <button className="btn btn-primary" onClick={handleNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                            Nuevo Vehículo
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
                            {editandoId ? "Editar Vehículo" : "Nuevo Vehículo"}
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
                                <label className="form-label">Patente</label>
                                <input
                                    className="form-input"
                                    name="patente"
                                    value={vehiculoActual.patente}
                                    onChange={handleInputChange}
                                    placeholder="Ej: ABCD12"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Marca</label>
                                <input
                                    className="form-input"
                                    name="marca"
                                    value={vehiculoActual.marca}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Toyota"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Modelo</label>
                                <input
                                    className="form-input"
                                    name="modelo"
                                    value={vehiculoActual.modelo}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Hilux"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tipo</label>
                                <select
                                    className="form-input"
                                    name="id_tipo_vehiculo"
                                    value={vehiculoActual.id_tipo_vehiculo}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    {tiposVehiculo.map((t) => (
                                        <option key={t.id_tipo_vehiculo} value={t.id_tipo_vehiculo}>
                                            {t.tipo_vehiculo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Año</label>
                                <input
                                    className="form-input"
                                    name="anio"
                                    value={vehiculoActual.anio}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 2023"
                                    type="number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Año Registro</label>
                                <input
                                    className="form-input"
                                    name="anioRegistro"
                                    value={vehiculoActual.anioRegistro}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 2023"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">N° Motor</label>
                                <input
                                    className="form-input"
                                    name="num_motor_veh"
                                    value={vehiculoActual.num_motor_veh}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 12345"
                                    type="number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">N° Chasis</label>
                                <input
                                    className="form-input"
                                    name="num_chasis_veh"
                                    value={vehiculoActual.num_chasis_veh}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 67890"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Operación</label>
                                <select
                                    className="form-input"
                                    name="id_operacion"
                                    value={vehiculoActual.id_operacion}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar operación...</option>
                                    {operaciones.map((op) => (
                                        <option key={op.id_operacion} value={op.id_operacion}>
                                            {op.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Póliza</label>
                                <select
                                    className="form-input"
                                    name="idPoliza"
                                    value={vehiculoActual.idPoliza}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar póliza...</option>
                                    {polizas.map((p) => (
                                        <option key={p.idPol} value={p.idPol}>
                                            {p.nombrePol}
                                        </option>
                                    ))}
                                </select>
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
                            placeholder="Buscar por patente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ maxWidth: "300px", margin: 0 }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Listado de Vehículos ({vehiculos.filter(v => v.patente.toLowerCase().includes(busqueda.toLowerCase())).length})</h3>
                </div>
                {cargando ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>Cargando vehículos...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                        <p>{error}</p>
                        <button className="btn btn-outline" onClick={cargarVehiculos} style={{ marginTop: '12px' }}>
                            Reintentar
                        </button>
                    </div>
                ) : vehiculos.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>No hay vehículos registrados.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patente</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Tipo</th>
                                <th>Base</th>
                                <th>Operación</th>
                                <th>Póliza</th>
                                <th>Año</th>
                                <th>Año Registro</th>
                                <th>N° Motor</th>
                                <th>N° Chasis</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehiculos
                                .filter((v) => v.patente.toLowerCase().includes(busqueda.toLowerCase()))
                                .map((v) => (
                                    <tr key={v.id_vehiculo} style={{ textTransform: "uppercase" }}>
                                        <td>{v.id_vehiculo}</td>
                                        <td><strong>{v.patente}</strong></td>
                                        <td>{v.marca}</td>
                                        <td>{v.modelo}</td>
                                        <td>{tiposVehiculo.find(t => String(t.id_tipo_vehiculo) === String(v.id_tipo_vehiculo))?.tipo_vehiculo || '—'}</td>
                                        <td>
                                            {(() => {
                                                const operacion = operaciones.find(op => String(op.id_operacion) === String(v.id_operacion));
                                                if (!operacion) return '—';
                                                const base = bases.find(b => String(b.id_base) === String(operacion.id_base));
                                                return base ? base.nombre : '—';
                                            })()}
                                        </td>
                                        <td>{operaciones.find(op => String(op.id_operacion) === String(v.id_operacion))?.nombre || '—'}</td>
                                        <td>{polizas.find(p => String(p.idPol) === String(v.idPoliza))?.nombrePol || '—'}</td>
                                        <td>{v.anio}</td>
                                        <td>{v.anioRegistro || '—'}</td>
                                        <td>{v.num_motor_veh || '—'}</td>
                                        <td>{v.num_chasis_veh || '—'}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEditar(v)} title="Editar">
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                    Editar
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(v.id_vehiculo)} title="Eliminar">
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

export default GestionVehiculo;
