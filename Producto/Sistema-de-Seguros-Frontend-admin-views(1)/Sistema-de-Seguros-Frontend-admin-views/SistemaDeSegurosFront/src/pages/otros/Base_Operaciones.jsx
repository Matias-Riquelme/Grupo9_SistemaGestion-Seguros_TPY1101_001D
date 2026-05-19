import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { validarCamposObligatorios } from "../../utils/validaciones";
import { useFormulario } from "../../hooks/useFormulario";
import baseService from "../../services/baseService";
import operacionesService from "../../services/operacionesService";
import BackButton from "../../components/BackButton";

const baseVacia = { nombre: "" };
const operacionVacia = { nombre: "", id_base: "" };

function BaseOperaciones() {
    const [activeTab, setActiveTab] = useState("bases");

    // --- BASES ---
    const [bases, setBases] = useState([]);
    const [cargandoBases, setCargandoBases] = useState(true);
    const [errorBases, setErrorBases] = useState(null);
    const [guardandoBase, setGuardandoBase] = useState(false);

    // --- OPERACIONES ---
    const [operaciones, setOperaciones] = useState([]);
    const [cargandoOps, setCargandoOps] = useState(true);
    const [errorOps, setErrorOps] = useState(null);
    const [guardandoOp, setGuardandoOp] = useState(false);

    const cargarBases = async () => {
        try {
            setCargandoBases(true);
            setErrorBases(null);
            const data = await baseService.listar();
            setBases(data);
        } catch (err) {
            console.error("Error al cargar bases:", err);
            setErrorBases("No se pudieron cargar las bases de operaciones.");
        } finally {
            setCargandoBases(false);
        }
    };

    const cargarOperaciones = async () => {
        try {
            setCargandoOps(true);
            setErrorOps(null);
            const data = await operacionesService.listar();
            setOperaciones(data);
        } catch (err) {
            console.error("Error al cargar operaciones:", err);
            setErrorOps("No se pudieron cargar las operaciones.");
        } finally {
            setCargandoOps(false);
        }
    };

    useEffect(() => {
        cargarBases();
        cargarOperaciones();
    }, []);

    const formBase = useFormulario(baseVacia);
    const formOp = useFormulario(operacionVacia);

    // --- CRUD BASES ---
    const handleGuardarBase = async () => {
        const campos = [{ nombre: "Nombre", valor: formBase.datos.nombre }];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: validarCamposObligatorios(campos).mensaje });
            return;
        }
        try {
            setGuardandoBase(true);
            if (formBase.editandoId) {
                await baseService.actualizar(formBase.editandoId, formBase.datos);
            } else {
                await baseService.crear(formBase.datos);
            }
            formBase.cerrar();
            await cargarBases();
        } catch (err) {
            console.error("Error al guardar base:", err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la base de operaciones.' });
        } finally {
            setGuardandoBase(false);
        }
    };

    const handleEliminarBase = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar esta base de operaciones?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await baseService.eliminar(id);
                await cargarBases();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La base ha sido eliminada correctamente.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar base:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la base.' });
            }
        }
    };

    // --- CRUD OPERACIONES ---
    const handleGuardarOp = async () => {
        const campos = [
            { nombre: "Nombre", valor: formOp.datos.nombre },
            { nombre: "Base", valor: formOp.datos.id_base }
        ];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: validarCamposObligatorios(campos).mensaje });
            return;
        }
        try {
            setGuardandoOp(true);
            if (formOp.editandoId) {
                await operacionesService.actualizar(formOp.editandoId, formOp.datos);
            } else {
                await operacionesService.crear(formOp.datos);
            }
            formOp.cerrar();
            await cargarOperaciones();
        } catch (err) {
            console.error("Error al guardar operación:", err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la operación.' });
        } finally {
            setGuardandoOp(false);
        }
    };

    const handleEliminarOp = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar esta operación?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await operacionesService.eliminar(id);
                await cargarOperaciones();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La operación ha sido eliminada correctamente.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar operación:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la operación.' });
            }
        }
    };

    // --- RENDER HELPERS ---
    const renderTabla = ({ items, cargando, error, recargar, idField, nombreField, onEditar, onEliminar, label, isOperacion }) => {
        if (cargando) {
            return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando {label}...</p></div>;
        }
        if (error) {
            return (
                <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                    <p>{error}</p>
                    <button className="btn btn-outline" onClick={recargar} style={{ marginTop: "12px" }}>Reintentar</button>
                </div>
            );
        }
        if (items.length === 0) {
            return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay {label} registrados.</p></div>;
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        {isOperacion && <th>Base</th>}
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const baseAsociada = isOperacion ? bases.find(b => b.id_base == item.id_base) : null;
                        return (
                            <tr key={item[idField]}>
                                <td>{item[idField]}</td>
                                <td><strong>{item[nombreField]}</strong></td>
                                {isOperacion && <td>{baseAsociada ? baseAsociada.nombre : "Sin Base"}</td>}
                                <td style={{ textAlign: "right" }}>
                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                        <button className="btn btn-sm btn-outline" onClick={() => onEditar(item)}>
                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => onEliminar(item[idField])}>
                                            <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span> Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderFormulario = ({ form, guardando, onGuardar, placeholder, label, isOperacion }) => {
        if (!form.mostrar) return null;
        return (
            <div className="card mb-3">
                <div className="card-header">
                    <h3 className="card-title">{form.editandoId ? "Editar" : "Nuevo/a"} {label}</h3>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input className="form-input" name="nombre" value={form.datos.nombre}
                            onChange={form.handleInputChange} placeholder={placeholder} type="text" />
                    </div>
                    {isOperacion && (
                        <div className="form-group mt-2">
                            <label className="form-label">Base</label>
                            <select
                                className="form-input"
                                name="id_base"
                                value={form.datos.id_base}
                                onChange={form.handleInputChange}
                            >
                                <option value="">Seleccione una base...</option>
                                {bases.map((b) => (
                                    <option key={b.id_base} value={b.id_base}>
                                        {b.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex gap-1 mt-3">
                        <button className="btn btn-primary" onClick={onGuardar} disabled={guardando}>
                            <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                            {guardando ? "Guardando..." : form.editandoId ? "Actualizar" : "Guardar"}
                        </button>
                        <button className="btn btn-outline" onClick={form.cerrar} disabled={guardando}>Cancelar</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Base de Operaciones</h1>
                <p>Gestión de bases y operaciones del sistema</p>
            </div>

            {/* TABS */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "bases" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("bases")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>business</span> Bases
                </button>
                <button
                    className={`btn ${activeTab === "operaciones" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("operaciones")}
                >
                    <span className="material-icons" style={{ fontSize: "1.1rem" }}>settings</span> Operaciones
                </button>
            </div>

            {/* TAB BASES */}
            {activeTab === "bases" && (
                <div>
                    <div className="flex-between mb-3">
                        <h3>Listado de Bases ({bases.length})</h3>
                        {!formBase.mostrar && (
                            <button className="btn btn-primary" onClick={formBase.abrirNuevo}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nueva Base
                            </button>
                        )}
                    </div>
                    {renderFormulario({ form: formBase, guardando: guardandoBase, onGuardar: handleGuardarBase, placeholder: "Ej: Base Central Santiago", label: "Base" })}
                    <div className="table-container">
                        {renderTabla({ items: bases, cargando: cargandoBases, error: errorBases, recargar: cargarBases, idField: "id_base", nombreField: "nombre", onEditar: (item) => formBase.abrirEditar(item, item.id_base), onEliminar: handleEliminarBase, label: "bases" })}
                    </div>
                </div>
            )}

            {/* TAB OPERACIONES */}
            {activeTab === "operaciones" && (
                <div>
                    <div className="flex-between mb-3">
                        <h3>Listado de Operaciones ({operaciones.length})</h3>
                        {!formOp.mostrar && (
                            <button className="btn btn-primary" onClick={formOp.abrirNuevo}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nueva Operación
                            </button>
                        )}
                    </div>
                    {renderFormulario({ form: formOp, guardando: guardandoOp, onGuardar: handleGuardarOp, placeholder: "Ej: Transporte de carga", label: "Operación", isOperacion: true })}
                    <div className="table-container">
                        {renderTabla({ items: operaciones, cargando: cargandoOps, error: errorOps, recargar: cargarOperaciones, idField: "id_operacion", nombreField: "nombre", onEditar: (item) => formOp.abrirEditar(item, item.id_operacion), onEliminar: handleEliminarOp, label: "operaciones", isOperacion: true })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BaseOperaciones;
