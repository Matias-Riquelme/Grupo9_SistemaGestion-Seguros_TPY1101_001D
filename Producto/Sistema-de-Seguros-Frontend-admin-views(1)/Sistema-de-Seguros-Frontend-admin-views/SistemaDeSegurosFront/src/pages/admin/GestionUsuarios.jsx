import React, { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import { useFormulario } from "../../hooks/useFormulario";
import api from "../../config/api"; // Added API to call the form generation endpoint
import authKeycloakServices from "../../services/authKeycloakServices";
import Swal from 'sweetalert2';

const usuarioVacio = {
    username: "",
    firstName: "",
    lastName: "",
    email: ""

};

function GestionUsuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [filtros, setFiltros] = useState({
        busqueda: ""
    });

    const [linkMagico, setLinkMagico] = useState("");
    const [generandoLink, setGenerandoLink] = useState(false);

    const handleGenerarLink = async () => {
        try {
            setGenerandoLink(true);
            const tokenResponse = localStorage.getItem("accessToken"); 
            // El endpoint ahora permite mandar null / req vacío,
            // y no necesita tener datos quemados amarrados.
            const response = await api.post("/api/formulario-publico/generar-enlace", {}, {
                headers: { Authorization: `Bearer ${tokenResponse}` }
            });
            const relativeUrl = response.data.urlFormulario;
            const absoluteUrl = `${window.location.origin}${relativeUrl}`;
            setLinkMagico(absoluteUrl);
        } catch (error) {
            console.error("Error al generar enlace público", error);
            Swal.fire('Error', 'No se pudo generar el enlace. Revisa tus permisos', 'error');
        } finally {
            setGenerandoLink(false);
        }
    };

    const handleCopiarLink = () => {
        navigator.clipboard.writeText(linkMagico).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Enlace copiado',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: ""
        });
    };

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError(null);
            const data = await authKeycloakServices.getAllUsersWithRoles();
            setUsuarios(data);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError("No se pudieron cargar los usuarios. Verifica que el servidor esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);


    const {
        datos: usuarioActual,
        setDatos: setUsuarioActual,
        editandoId,
        mostrar: mostrarFormulario,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
    } = useFormulario(usuarioVacio);

    const handleNuevo = () => {
        abrirNuevo();
        setUsuarioActual(usuarioVacio);
    };

    const handleEditar = (usuario) => {
        const usuarioEditado = {
            username: usuario.username || '',
            firstName: usuario.firstName || '',
            lastName: usuario.lastName || '',
            email: usuario.email || '',
            rol: mapRole(usuario.roles && usuario.roles[0]), // Solo primer rol
        };
        abrirEditar(usuarioEditado, usuario.id); // Keycloak usa 'id'
    };

    // Mapeo de roles técnicos a nombres amigables
    const mapRole = (role) => {
        if (!role) return '';
        if (role === 'admin_client_role') return 'Admin';
        if (role === 'user_client_role') return 'User';
        if (role === 'ADMIN') return 'Admin';
        if (role === 'USER') return 'User';
        return role;
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
                await authKeycloakServices.deleteUser(id);
                await cargarUsuarios();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El usuario ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el usuario.',
                    confirmButtonColor: '#045524'
                });
            }
        }
    };

    const handleGuardar = async () => {
        try {
            setGuardando(true);
            setError(null);

            // Estructura UserDTO: { username, email, firstName, lastName }
            const userDTO = {
                username: usuarioActual.username,
                email: usuarioActual.email,
                firstName: usuarioActual.firstName,
                lastName: usuarioActual.lastName,
            };

            let userId = editandoId;
            if (editandoId) {
                await authKeycloakServices.updateUser(editandoId, userDTO);
            } else {
                const created = await authKeycloakServices.createUser(userDTO);
                if (created && created.id) {
                    userId = created.id;
                }
            }

            // Asignar rol explícitamente
            const roleToAssign = usuarioActual.rol === 'Admin' ? 'admin_client_role' :
                usuarioActual.rol === 'User' ? 'user_client_role' : usuarioActual.rol;
            if (userId && roleToAssign) {
                await authKeycloakServices.assignRoleToUser(userId, roleToAssign);
            }

            await cargarUsuarios();
            cerrar();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Usuario guardado correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error al guardar:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el usuario. Verifica que el servidor esté activo.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        cerrar();
        setUsuarioActual(usuarioVacio);
    };


    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header flex-between">
                <div>
                    <h1>Gestion de Usuarios</h1>
                    <p>Administra los usuarios del sistema</p>
                </div>
                <div className="flex gap-1" style={{ alignItems: "center" }}>
                    {!mostrarFormulario && (
                        <button className="btn btn-outline" onClick={handleNuevo}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span>
                            Nuevo Usuario
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleGenerarLink} disabled={generandoLink}>
                        <span className="material-icons" style={{ fontSize: "1.1rem", marginRight: '5px' }}>link</span>
                        {generandoLink ? "Generando..." : "Generar Link Público"}
                    </button>
                </div>
            </div>

            {linkMagico && (
                <div className="card mb-3" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                    <div className="card-body flex-between" style={{ alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, marginBottom: '5px' }}>Link Mágico Generado:</h4>
                            <p style={{ margin: 0, border: '1px solid #ccc', padding: '10px', borderRadius: '5px', background: '#f9f9f9', fontFamily: 'monospace' }}>
                                {linkMagico}
                            </p>
                        </div>
                        <button className="btn btn-dark" onClick={handleCopiarLink} style={{ height: 'fit-content', marginLeft: '10px' }}>
                            <span className="material-icons" style={{ fontSize: "1.1rem", marginRight: '5px' }}>content_copy</span>
                            Copiar Link
                        </button>
                    </div>
                </div>
            )}

            {!mostrarFormulario && (
                <div className="card mb-5">
                    <div className="card-header">
                        <h3 className="card-title">
                            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>search</span>
                            Buscar Usuarios
                        </h3>
                        <button className="btn btn-sm btn-outline" onClick={limpiarFiltros}>
                            Limpiar
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Filtrar por nombre o apellido</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="busqueda"
                                    className="form-input"
                                    placeholder="Escribe el nombre o apellido a buscar..."
                                    value={filtros.busqueda}
                                    onChange={handleFilterChange}
                                    style={{ paddingLeft: '40px' }}
                                />
                                <span className="material-icons" style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '1.2rem'
                                }}>search</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {mostrarFormulario && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h3 className="card-title">
                            {editandoId ? "Editar Usuario" : "Nuevo Usuario"}
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={usuarioActual.username}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!editandoId} // Keycloak no suele permitir cambiar el username
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={usuarioActual.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={usuarioActual.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={usuarioActual.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                        </div>
                        <div className="flex gap-1 mt-2">
                            <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                {guardando ? "Guardando..." : "Guardar"}
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
                    <h3>Listado de Usuarios ({usuarios.length})</h3>
                </div>
                {cargando ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>Cargando Usuarios...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                        <p>{error}</p>
                        <button className="btn btn-outline" onClick={cargarUsuarios} style={{ marginTop: "12px" }}>
                            Reintentar
                        </button>
                    </div>
                ) : usuarios.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        <p>No hay usuarios</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Roles</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const usuariosFiltrados = usuarios.filter(usuario => {
                                    const search = filtros.busqueda.toLowerCase();
                                    const nombreCompleto = `${usuario.firstName || ""} ${usuario.lastName || ""}`.toLowerCase();
                                    return (
                                        (usuario.firstName || "").toLowerCase().includes(search) ||
                                        (usuario.lastName || "").toLowerCase().includes(search) ||
                                        nombreCompleto.includes(search)
                                    );
                                });

                                if (usuariosFiltrados.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                No se encontraron usuarios que coincidan con la búsqueda
                                            </td>
                                        </tr>
                                    );
                                }

                                return usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.username}</td>
                                        <td>{usuario.firstName}</td>
                                        <td>{usuario.lastName}</td>
                                        <td>{usuario.email}</td>
                                        <td>{Array.isArray(usuario.roles) ? usuario.roles.map(mapRole).join(', ') : mapRole(usuario.roles)}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => handleEditar(usuario)}>
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                                                    Editar
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(usuario.id)}>
                                                    <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default GestionUsuario;

