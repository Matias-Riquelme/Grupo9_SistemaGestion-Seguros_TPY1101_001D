import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { validarCamposObligatorios } from "../../utils/validaciones";
import { useFormulario } from "../../hooks/useFormulario";
import tipoVehiculoService from "../../services/tipoVehiculoService";
import BackButton from "../../components/BackButton";

const tipoVehiculoVacio = {
    tipo_vehiculo: "",
};

function TipoVehiculo() {
    const [tipos, setTipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Cargar tipos de vehículo desde la API
    const cargarTipos = async () => {
        try {
            setCargando(true);
            setError(null);
            const data = await tipoVehiculoService.listar();
            setTipos(data);
        } catch (err) {
            console.error("Error al cargar tipos de vehículo:", err);
            setError("No se pudieron cargar los tipos de vehículo. Verifica que el servidor esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarTipos();
    }, []);

    // Hook formulario
    const {
        datos: tipoActual,
        editandoId,
        mostrar: mostrarFormulario,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
    } = useFormulario(tipoVehiculoVacio);

    const handleNuevo = () => {
        abrirNuevo();
    };

    const handleEditar = (tipo) => {
        abrirEditar(tipo, tipo.id_tipo_vehiculo);
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar este tipo de vehículo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await tipoVehiculoService.eliminar(id);
                await cargarTipos();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El tipo de vehículo ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el tipo de vehículo.' });
            }
        }
    };

    const handleGuardar = async () => {
        const campos = [
            { nombre: "Tipo de Vehículo", valor: tipoActual.tipo_vehiculo },
        ];

        const resultado = validarCamposObligatorios(campos);
        if (!resultado.valido) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: resultado.mensaje });
            return;
        }

        try {
            setGuardando(true);
            if (editandoId) {
                await tipoVehiculoService.actualizar(editandoId, tipoActual);
            } else {
                await tipoVehiculoService.crear(tipoActual);
            }
            cerrar();
            await cargarTipos();
        } catch (err) {
            console.error("Error al guardar:", err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar el tipo de vehículo. Revisa los datos e intenta de nuevo.' });
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
                    <h1>Gestión de Tipos de Vehículo</h1>
                    <p>Administra los tipos de vehículo del sistema</p>
                </div>
                {!mostrarFormulario && (
                    <button className="btn btn-primary" onClick={handleNuevo}>
                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                        Nuevo Tipo
                    </button>
                )}
            </div>

            {mostrarFormulario && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h3 className="card-title">
                            {editandoId ? "Editar Tipo" : "Nuevo Tipo"}
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Tipo de Vehículo</label>
                            <input
                                className="form-input"
                                name="tipo_vehiculo"
                                value={tipoActual.tipo_vehiculo}
                                onChange={handleInputChange}
                                placeholder="Ej: CAMIONETA"
                                type="text"
                            />
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

            <div className="table-container">
                <div className="table-header">
                    <h3>Listado de Tipos ({tipos.length})</h3>
                </div>
                {cargando ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>Cargando tipos de vehículo...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                        <p>{error}</p>
                        <button className="btn btn-outline" onClick={cargarTipos} style={{ marginTop: '12px' }}>
                            Reintentar
                        </button>
                    </div>
                ) : tipos.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>No hay tipos de vehículo registrados.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tipo de Vehículo</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.map((t) => (
                                <tr key={t.id_tipo_vehiculo} style={{ textTransform: "uppercase" }}>
                                    <td>{t.id_tipo_vehiculo}</td>
                                    <td><strong>{t.tipo_vehiculo}</strong></td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                            <button className="btn btn-sm btn-outline" onClick={() => handleEditar(t)} title="Editar">
                                                <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                Editar
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(t.id_tipo_vehiculo)} title="Eliminar">
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

export default TipoVehiculo;
