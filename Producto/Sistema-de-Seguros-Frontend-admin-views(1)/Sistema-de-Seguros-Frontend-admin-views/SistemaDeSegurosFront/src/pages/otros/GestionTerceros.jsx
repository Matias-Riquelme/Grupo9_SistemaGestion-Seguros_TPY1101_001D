import React, { useState, useEffect } from "react";
import FormularioServices from "../../services/formularioServices";
import BackButton from "../../components/BackButton";
import Swal from 'sweetalert2';

const terceroVacio = {
    rutTer: '',
    nombreTer: '',
    telefonoTer: '',
    emailTer: '',
    aseguradoraTer: '',
    numeroSinTer: '', // Número de siniestro del tercero
};

function GestionTerceros() {
    const [terceros, setTerceros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [guardando, setGuardando] = useState(false);
    
    // Formulario
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [terceroActual, setTerceroActual] = useState({ ...terceroVacio });

    // Cargar terceros desde la API
    const cargarTerceros = async () => {
        try {
            setCargando(true);
            setError(null);
            const response = await FormularioServices.getTerceros();
            const data = response?.data?.data || response?.data || [];
            setTerceros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar terceros:", err);
            setError("No se pudieron cargar los terceros. Verifica que el servidor esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarTerceros();
    }, []);

    // Handlers del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTerceroActual(prev => ({ ...prev, [name]: value }));
    };

    const handleNuevo = () => {
        setTerceroActual({ ...terceroVacio });
        setEditandoId(null);
        setMostrarFormulario(true);
    };

    const handleEditar = (tercero) => {
        setTerceroActual({
            rutTer: tercero.rutTer || tercero.rut_ter || '',
            nombreTer: tercero.nombreTer || tercero.nombre_ter || '',
            telefonoTer: tercero.telefonoTer || tercero.telefono_ter || '',
            emailTer: tercero.emailTer || tercero.email_ter || '',
            aseguradoraTer: tercero.aseguradoraTer || tercero.aseguradora_ter || '',
            numeroSinTer: tercero.numeroSinTer || tercero.numero_sin_ter || '',
        });
        setEditandoId(tercero.id || tercero.idTercero || tercero.id_tercero);
        setMostrarFormulario(true);
    };

    const handleCerrar = () => {
        setMostrarFormulario(false);
        setEditandoId(null);
        setTerceroActual({ ...terceroVacio });
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await FormularioServices.deleteTercero(id);
                await cargarTerceros();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El tercero ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el tercero.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleGuardar = async () => {
        // Validaciones
        const campos = [
            { nombre: "Nombre", valor: terceroActual.nombreTer },
            { nombre: "Teléfono", valor: terceroActual.telefonoTer },
        ];

        const camposVacios = campos.filter(c => !c.valor || c.valor.trim() === '');
        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                text: `Por favor complete: ${camposVacios.map(c => c.nombre).join(', ')}`,
                confirmButtonColor: '#045524'
            });
            return;
        }

        // Validar email si fue ingresado
        if (terceroActual.emailTer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(terceroActual.emailTer)) {
            Swal.fire({
                icon: 'warning',
                title: 'Email inválido',
                text: 'Por favor ingrese un email válido.',
                confirmButtonColor: '#045524'
            });
            return;
        }

        try {
            setGuardando(true);
            
            if (editandoId) {
                await FormularioServices.updateTercero(editandoId, terceroActual);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'El tercero ha sido actualizado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await FormularioServices.createTercero(terceroActual);
                Swal.fire({
                    icon: 'success',
                    title: '¡Creado!',
                    text: 'El tercero ha sido creado exitosamente.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            await cargarTerceros();
            handleCerrar();
        } catch (err) {
            console.error("Error al guardar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo ${editandoId ? 'actualizar' : 'crear'} el tercero.`,
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardando(false);
        }
    };

    // Filtrar terceros por búsqueda
    const tercerosFiltrados = terceros.filter(tercero => {
        if (!busqueda) return true;
        const busq = busqueda.toLowerCase();
        const rut = (tercero.rutTer || tercero.rut_ter || '').toLowerCase();
        const nombre = (tercero.nombreTer || tercero.nombre_ter || '').toLowerCase();
        const telefono = (tercero.telefonoTer || tercero.telefono_ter || '').toLowerCase();
        const email = (tercero.emailTer || tercero.email_ter || '').toLowerCase();
        const numeroSin = (tercero.numeroSinTer || tercero.numero_sin_ter || '').toLowerCase();
        
        return rut.includes(busq) ||
               nombre.includes(busq) || 
               telefono.includes(busq) || 
               email.includes(busq) ||
               numeroSin.includes(busq);
    });

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setEditandoId(null);
        setTerceroActual({ ...terceroVacio });
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header flex-between">
                <div>
                    <h1>Gestión de Terceros</h1>
                    <p>Administra los terceros involucrados en incidentes</p>
                </div>
                {!mostrarFormulario && (
                    <button className="btn btn-primary" onClick={handleNuevo}>
                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                        Nuevo Tercero
                    </button>
                )}
            </div>

            {mostrarFormulario && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h3 className="card-title">
                            {editandoId ? "Editar Tercero" : "Nuevo Tercero"}
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
                                <label className="form-label">RUT</label>
                                <input
                                    className="form-input"
                                    name="rutTer"
                                    value={terceroActual.rutTer}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 12.345.678-9"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    className="form-input"
                                    name="nombreTer"
                                    value={terceroActual.nombreTer}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Juan Pérez González"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Número de Siniestro</label>
                                <input
                                    className="form-input"
                                    name="numeroSinTer"
                                    value={terceroActual.numeroSinTer}
                                    onChange={handleInputChange}
                                    placeholder="Ej: SIN-2024-001"
                                    type="text"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input
                                    className="form-input"
                                    name="telefonoTer"
                                    value={terceroActual.telefonoTer}
                                    onChange={handleInputChange}
                                    placeholder="Ej: +56912345678"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    className="form-input"
                                    name="emailTer"
                                    value={terceroActual.emailTer}
                                    onChange={handleInputChange}
                                    placeholder="ejemplo@correo.com"
                                    type="email"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Aseguradora</label>
                                <input
                                    className="form-input"
                                    name="aseguradoraTer"
                                    value={terceroActual.aseguradoraTer}
                                    onChange={handleInputChange}
                                    placeholder="Nombre de la aseguradora"
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
                            placeholder="Buscar por nombre, número de siniestro, teléfono o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ maxWidth: "450px", margin: 0 }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Listado de Terceros ({tercerosFiltrados.length})</h3>
                </div>
                {cargando ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>Cargando terceros...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                        <p>{error}</p>
                        <button className="btn btn-outline" onClick={cargarTerceros} style={{ marginTop: '12px' }}>
                            Reintentar
                        </button>
                    </div>
                ) : terceros.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>No hay terceros registrados.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>RUT</th>
                                <th>Nombre Completo</th>
                                <th>Nº Siniestro</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Aseguradora</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tercerosFiltrados.map((tercero) => {
                                const id = tercero.id || tercero.idTercero || tercero.id_tercero;
                                return (
                                    <tr key={id}>
                                        <td>{id}</td>
                                        <td>{tercero.rutTer || tercero.rut_ter || '-'}</td>
                                        <td><strong>{tercero.nombreTer || tercero.nombre_ter || '-'}</strong></td>
                                        <td>{tercero.numeroSinTer || tercero.numero_sin_ter || '-'}</td>
                                        <td>{tercero.telefonoTer || tercero.telefono_ter || '-'}</td>
                                        <td>{tercero.emailTer || tercero.email_ter || '-'}</td>
                                        <td>{tercero.aseguradoraTer || tercero.aseguradora_ter || '-'}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEditar(tercero)} title="Editar">
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                    Editar
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(id)} title="Eliminar">
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default GestionTerceros;
