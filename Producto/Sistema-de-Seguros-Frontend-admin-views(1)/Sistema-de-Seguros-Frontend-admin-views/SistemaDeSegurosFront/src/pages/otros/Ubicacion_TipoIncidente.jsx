import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { validarCamposObligatorios } from "../../utils/validaciones";
import { useFormulario } from "../../hooks/useFormulario";
import ubicacionService from "../../services/ubicacionService";
import tipoIncidenteService from "../../services/tipoIncidenteService";
import BackButton from "../../components/BackButton";

// Valores iniciales
const ubicacionVacia = { descripcion_ubi: "", id_comuna: "" };
const paisVacio = { nombre_pais: "" };
const regionVacia = { nombre_reg: "", id_pais: "" };
const comunaVacia = { nombre_comuna: "", id_reg: "" };
const tipoIncidenteVacio = { nombreTipoIncidente: "", categoria: "" };

function UbicacionTipoIncidente() {
    const [activeTab, setActiveTab] = useState("ubicacion");

    // --- ESTADOS DE DATOS ---
    const [ubicaciones, setUbicaciones] = useState([]);
    const [paises, setPaises] = useState([]);
    const [todasRegiones, setTodasRegiones] = useState([]); // Todas las regiones
    const [todasComunas, setTodasComunas] = useState([]);   // Todas las comunas
    const [regionesFiltradas, setRegionesFiltradas] = useState([]); // Filtradas por país
    const [comunasFiltradas, setComunasFiltradas] = useState([]);   // Filtradas por región
    const [busqueda, setBusqueda] = useState("");

    // Filtros para el listado (Cascada)
    const [filtroPais, setFiltroPais] = useState("");
    const [filtroRegion, setFiltroRegion] = useState("");
    const [filtroComuna, setFiltroComuna] = useState("");
    const [opcionesRegionesFiltro, setOpcionesRegionesFiltro] = useState([]);
    const [opcionesComunasFiltro, setOpcionesComunasFiltro] = useState([]);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // --- TIPOS DE INCIDENTE ---
    const [tiposIncidente, setTiposIncidente] = useState([]);
    const [cargandoTipos, setCargandoTipos] = useState(true);
    const [errorTipos, setErrorTipos] = useState(null);
    const [guardandoTipo, setGuardandoTipo] = useState(false);

    // Estados para Ubicaciones (Selectores auxiliares)
    const [selectedPais, setSelectedPais] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");

    // --- ESTADOS PARA MODALES DE GEOGRAFÍA ---
    // Controlan la visibilidad de los modales
    const [modalPaisOpen, setModalPaisOpen] = useState(false);
    const [modalRegionOpen, setModalRegionOpen] = useState(false);
    const [modalComunaOpen, setModalComunaOpen] = useState(false);

    // Datos temporales para crear geografía
    const [nuevoPais, setNuevoPais] = useState(paisVacio);
    const [nuevaRegion, setNuevaRegion] = useState(regionVacia);
    const [nuevaComuna, setNuevaComuna] = useState(comunaVacia);

    // LISTAS COMPLETAS (Auxiliares para crear regiones/comunas sin depender del filtro de ubicación)
    // Para crear región necesitamos listar TODOS los países. 
    // Para crear comuna necesitamos listar TODAS las regiones (o filtrar por país seleccionado).
    // Reutilizaremos 'paises' ya que siempre se carga full.
    // Para regiones, cargaremos bajo demanda o todo si es necesario. 
    // Simplificación: al abrir modal Comuna, pediremos seleccionar país -> región.

    // --- CARGA INICIAL ---
    const cargarUbicaciones = async () => {
        try {
            setCargando(true);
            const data = await ubicacionService.listar();
            setUbicaciones(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar ubicaciones.");
        } finally {
            setCargando(false);
        }
    };

    const cargarPaises = async () => {
        try {
            const data = await ubicacionService.listarPaises();
            setPaises(data);
        } catch (err) {
            console.error(err);
        }
    };

    const cargarRegiones = async () => {
        try {
            const data = await ubicacionService.listarRegiones();
            setTodasRegiones(data);
        } catch (err) {
            console.error("Error al cargar regiones:", err);
        }
    };

    const cargarComunas = async () => {
        try {
            const data = await ubicacionService.listarComunas();
            setTodasComunas(data);
        } catch (err) {
            console.error("Error al cargar comunas:", err);
        }
    };

    const cargarTiposIncidente = async () => {
        try {
            setCargandoTipos(true);
            setErrorTipos(null);
            const data = await tipoIncidenteService.listar();
            setTiposIncidente(data);
        } catch (err) {
            console.error("Error al cargar tipos de incidente:", err);
            setErrorTipos("No se pudieron cargar los tipos de incidente.");
        } finally {
            setCargandoTipos(false);
        }
    };

    useEffect(() => {
        cargarUbicaciones();
        cargarPaises();
        cargarRegiones();
        cargarComunas();
        cargarTiposIncidente();
    }, []);

    // --- HOOK FORMULARIO UBICACIÓN ---
    const {
        datos: ubicacionActual,
        setDatos,
        editandoId,
        mostrar: mostrarFormulario,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
    } = useFormulario(ubicacionVacia);

    const formTipo = useFormulario(tipoIncidenteVacio);

    // --- LÓGICA DE UBICACIÓN (CASCADA) ---
    const handlePaisChange = (e) => {
        const idPais = e.target.value;
        setSelectedPais(idPais);
        setSelectedRegion("");
        setComunasFiltradas([]);
        setDatos(prev => ({ ...prev, id_comuna: "" }));

        if (idPais) {
            const filtradas = todasRegiones.filter(r => {
                const paisId = r.pais?.idPais || r.pais?.id_pais;
                return String(paisId) === String(idPais);
            });
            setRegionesFiltradas(filtradas);
        } else {
            setRegionesFiltradas([]);
        }
    };

    const handleRegionChange = (e) => {
        const idRegion = e.target.value;
        setSelectedRegion(idRegion);
        setDatos(prev => ({ ...prev, id_comuna: "" }));

        if (idRegion) {
            const filtradas = todasComunas.filter(c => {
                const regId = c.region?.idReg || c.region?.id_reg;
                return String(regId) === String(idRegion);
            });
            setComunasFiltradas(filtradas);
        } else {
            setComunasFiltradas([]);
        }
    };

    // --- LÓGICA DE FILTRAJE DE LISTADO (CASCADA) ---
    const handleFiltroPaisChange = (e) => {
        const idPais = e.target.value;
        setFiltroPais(idPais);
        setFiltroRegion("");
        setFiltroComuna("");
        setOpcionesComunasFiltro([]);

        if (idPais) {
            const filtradas = todasRegiones.filter(r => {
                const paisId = r.pais?.idPais || r.pais?.id_pais;
                return String(paisId) === String(idPais);
            });
            setOpcionesRegionesFiltro(filtradas);
        } else {
            setOpcionesRegionesFiltro([]);
        }
    };

    const handleFiltroRegionChange = (e) => {
        const idRegion = e.target.value;
        setFiltroRegion(idRegion);
        setFiltroComuna("");

        if (idRegion) {
            const filtradas = todasComunas.filter(c => {
                const regId = c.region?.idReg || c.region?.id_reg;
                return String(regId) === String(idRegion);
            });
            setOpcionesComunasFiltro(filtradas);
        } else {
            setOpcionesComunasFiltro([]);
        }
    };

    const ubicacionesFiltradas = ubicaciones.filter(u => {
        const pId = u.comuna?.region?.pais?.idPais || u.comuna?.region?.pais?.id_pais;
        const rId = u.comuna?.region?.idReg || u.comuna?.region?.id_reg;
        const cId = u.comuna?.idComuna || u.comuna?.id_comuna;

        const cumplePais = !filtroPais || String(pId) === String(filtroPais);
        const cumpleRegion = !filtroRegion || String(rId) === String(filtroRegion);
        const cumpleComuna = !filtroComuna || String(cId) === String(filtroComuna);

        return cumplePais && cumpleRegion && cumpleComuna;
    });

    // --- CRUD UBICACIÓN ---
    const handleEliminarUbicacion = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar esta ubicación?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await ubicacionService.eliminar(id);
                await cargarUbicaciones();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La ubicación ha sido eliminada correctamente.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar ubicación:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la ubicación.' });
            }
        }
    };

    const handleGuardarUbicacion = async () => {
        const campos = [
            { nombre: "Descripción", valor: ubicacionActual.descripcion_ubi },
            { nombre: "Comuna", valor: ubicacionActual.id_comuna },
        ];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: validarCamposObligatorios(campos).mensaje });
            return;
        }

        try {
            setGuardando(true);
            const payload = {
                descripcionUbi: ubicacionActual.descripcion_ubi,
                comuna: { idComuna: parseInt(ubicacionActual.id_comuna) }
            };

            if (editandoId) {
                await ubicacionService.actualizar(editandoId, payload);
            } else {
                await ubicacionService.crear(payload);
            }
            cerrar();
            await cargarUbicaciones();
            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Ubicación guardada correctamente.',
                confirmButtonColor: '#045524',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la ubicación.',
                confirmButtonColor: '#045524'
            });
        } finally {
            setGuardando(false);
        }
    };

    // --- CRUD GEOGRAFÍA ---

    // 1. PAÍS
    const handleGuardarPais = async () => {
        if (!nuevoPais.nombre_pais.trim()) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Nombre del país es obligatorio' });
            return;
        }
        try {
            const payload = { nombrePais: nuevoPais.nombre_pais };
            console.log("Enviando payload para crear país:", payload);
            await ubicacionService.crearPais(payload);
            Swal.fire({ icon: 'success', title: 'OK', text: 'País creado correctamente' });
            setModalPaisOpen(false);
            setNuevoPais(paisVacio);
            await cargarPaises();
        } catch (err) {
            console.error("Error al crear país:", err);
            const status = err.response?.status;
            const msg = err.response?.data?.message || err.response?.data || err.message;
            Swal.fire({ icon: 'error', title: 'Error', text: `Error ${status || ''} al crear país: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}` });
        }
    };

    // 2. REGIÓN
    // Necesitamos seleccionar un país para la nueva región
    // Usaremos un estado local para el pais seleccionado en el modal de región
    const [paisParaNuevaRegion, setPaisParaNuevaRegion] = useState("");

    const handleGuardarRegion = async () => {
        if (!nuevaRegion.nombre_reg.trim()) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Nombre de región es obligatorio' });
            return;
        }
        if (!paisParaNuevaRegion) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar un país para la región' });
            return;
        }

        try {
            const payload = {
                nombreReg: nuevaRegion.nombre_reg,
                pais: { idPais: parseInt(paisParaNuevaRegion) }
            };
            console.log("Enviando payload para crear región:", payload);
            await ubicacionService.crearRegion(payload);
            Swal.fire({ icon: 'success', title: 'OK', text: 'Región creada correctamente' });
            setModalRegionOpen(false);
            setNuevaRegion(regionVacia);
            setPaisParaNuevaRegion("");
            // Recargar todas las regiones para tenerla disponible
            await cargarRegiones();
            // Actualizar filtro si coincide con país seleccionado
            if (selectedPais && String(selectedPais) === String(paisParaNuevaRegion)) {
                const data = await ubicacionService.listarRegiones();
                const filtradas = data.filter(r => String(r.pais?.idPais || r.pais?.id_pais) === String(selectedPais));
                setRegionesFiltradas(filtradas);
            }
        } catch (err) {
            console.error("Error al crear región:", err);
            const status = err.response?.status;
            const msg = err.response?.data?.message || err.response?.data || err.message;
            Swal.fire({ icon: 'error', title: 'Error', text: `Error ${status || ''} al crear región: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}` });
        }
    };

    // 3. COMUNA
    // Selector en cascada dentro del modal de comuna
    const [paisParaNuevaComuna, setPaisParaNuevaComuna] = useState("");
    const [regionParaNuevaComuna, setRegionParaNuevaComuna] = useState("");
    const [regionesParaModalComuna, setRegionesParaModalComuna] = useState([]);

    const handlePaisModalComunaChange = (e) => {
        const id = e.target.value;
        setPaisParaNuevaComuna(id);
        setRegionParaNuevaComuna("");
        if (id) {
            const filtradas = todasRegiones.filter(r => {
                const paisId = r.pais?.idPais || r.pais?.id_pais;
                return String(paisId) === String(id);
            });
            setRegionesParaModalComuna(filtradas);
        } else {
            setRegionesParaModalComuna([]);
        }
    };

    // --- CRUD TIPO INCIDENTE ---
    const handleGuardarTipoIncidente = async () => {
        const campos = [
            { nombre: "Nombre Tipo Incidente", valor: formTipo.datos.nombreTipoIncidente },
            { nombre: "Categoría", valor: formTipo.datos.categoria }
        ];
        if (!validarCamposObligatorios(campos).valido) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: validarCamposObligatorios(campos).mensaje });
            return;
        }
        try {
            setGuardandoTipo(true);
            const payload = {
                nombreTipoIncidente: formTipo.datos.nombreTipoIncidente,
                categoria: formTipo.datos.categoria
            };
            
            console.log("Enviando payload:", payload); // Debug log
            
            if (formTipo.editandoId) {
                await tipoIncidenteService.actualizar(formTipo.editandoId, payload);
            } else {
                await tipoIncidenteService.crear(payload);
            }
            formTipo.cerrar();
            await cargarTiposIncidente();
        } catch (err) {
            console.error("Error completo al guardar tipo incidente:", err);
            console.error("Error response:", err.response);
            console.error("Error data:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.message || 'Error desconocido al guardar el tipo de incidente.';
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: `Error al guardar el tipo de incidente: ${errorMsg}`,
                html: `<p>Error al guardar el tipo de incidente:</p><pre>${errorMsg}</pre>` 
            });
        } finally {
            setGuardandoTipo(false);
        }
    };

    const handleEliminarTipoIncidente = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas eliminar este tipo de incidente?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#045524',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await tipoIncidenteService.eliminar(id);
                await cargarTiposIncidente();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El tipo de incidente ha sido eliminado.',
                    confirmButtonColor: '#045524',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar tipo incidente:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el tipo de incidente.' });
            }
        }
    };

    const handleGuardarComuna = async () => {
        if (!nuevaComuna.nombre_comuna.trim()) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Nombre de comuna es obligatorio' });
            return;
        }
        if (!regionParaNuevaComuna) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar una región' });
            return;
        }

        try {
            const payload = {
                nombreComuna: nuevaComuna.nombre_comuna,
                region: { idReg: parseInt(regionParaNuevaComuna) }
            };
            console.log("Enviando payload para crear comuna:", payload);
            await ubicacionService.crearComuna(payload);
            Swal.fire({ icon: 'success', title: 'OK', text: 'Comuna creada correctamente' });
            setModalComunaOpen(false);
            setNuevaComuna(comunaVacia);
            setPaisParaNuevaComuna("");
            setRegionParaNuevaComuna("");

            // Recargar todas las comunas
            await cargarComunas();
            // Actualizar filtro si coincide con región seleccionada
            if (selectedRegion && String(selectedRegion) === String(regionParaNuevaComuna)) {
                const data = await ubicacionService.listarComunas();
                const filtradas = data.filter(c => String(c.region?.idReg || c.region?.id_reg) === String(selectedRegion));
                setComunasFiltradas(filtradas);
            }
        } catch (err) {
            console.error("Error al crear comuna:", err);
            const status = err.response?.status;
            const msg = err.response?.data?.message || err.response?.data || err.message;
            Swal.fire({ icon: 'error', title: 'Error', text: `Error ${status || ''} al crear comuna: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}` });
        }
    };


    // --- RENDER ---
    return (
        <div className="page-container">
            <BackButton />
            <div className="page-header">
                <h1>Ubicación y Tipo de Incidente</h1>
                <p>Gestión de ubicaciones geográficas y clasificación de incidentes</p>
            </div>

            {/* TABS */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button
                    className={`btn ${activeTab === "ubicacion" ? "btn-primary" : "btn-outline"}`}
                    style={{ marginRight: "10px", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("ubicacion")}
                >
                    Ubicaciones / Geografía
                </button>
                <button
                    className={`btn ${activeTab === "tipoIncidente" ? "btn-primary" : "btn-outline"}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    onClick={() => setActiveTab("tipoIncidente")}
                >
                    Tipos de Incidente
                </button>
            </div>

            {/* CONTENIDO TAB UBICACIÓN */}
            {activeTab === "ubicacion" && (
                <div>
                    {/* BOTONES ACCIONES GEOGRAFÍA */}
                    <div className="card mb-3 p-3">
                        <h4 className="mb-2">Administrar Geografía</h4>
                        <div className="flex gap-1 flex-wrap">
                            <button className="btn btn-sm btn-outline" onClick={() => setModalPaisOpen(true)}>
                                + Nuevo País
                            </button>
                            <button className="btn btn-sm btn-outline" onClick={() => setModalRegionOpen(true)}>
                                + Nueva Región
                            </button>
                            <button className="btn btn-sm btn-outline" onClick={() => setModalComunaOpen(true)}>
                                + Nueva Comuna
                            </button>
                        </div>
                    </div>

                    {/* LISTADO DE UBICACIONES Y FORMULARIO */}
                    <div className="flex-between mb-3">
                        <h3>Listado de Ubicaciones</h3>
                        {!mostrarFormulario && (
                            <button className="btn btn-primary" onClick={() => {
                                setSelectedPais(""); setSelectedRegion(""); setRegionesFiltradas([]); setComunasFiltradas([]); abrirNuevo();
                            }}>
                                <span className="material-icons">add_location</span>
                                Nueva Ubicación
                            </button>
                        )}
                    </div>

                    {mostrarFormulario && (
                        <div className="card mb-3">
                            <div className="card-header"><h3 className="card-title">{editandoId ? "Editar" : "Nueva"} Ubicación</h3></div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <input className="form-input" name="descripcion_ubi"
                                        value={ubicacionActual.descripcion_ubi} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">País</label>
                                        <select className="form-select" value={selectedPais} onChange={handlePaisChange}>
                                            <option value="">Seleccione...</option>
                                            {paises.map(p => <option key={p.id_pais || p.idPais} value={p.id_pais || p.idPais}>{p.nombre_pais || p.nombrePais}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Región</label>
                                        <select className="form-select" value={selectedRegion} onChange={handleRegionChange} disabled={!selectedPais}>
                                            <option value="">Seleccione...</option>
                                            {regionesFiltradas.map(r => <option key={r.idReg || r.id_reg} value={r.idReg || r.id_reg}>{r.nombreReg || r.nombre_reg}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Comuna</label>
                                        <select className="form-select" name="id_comuna" value={ubicacionActual.id_comuna} onChange={handleInputChange} disabled={!selectedRegion}>
                                            <option value="">Seleccione...</option>
                                            {comunasFiltradas.map(c => <option key={c.idComuna || c.id_comuna} value={c.idComuna || c.id_comuna}>{c.nombreComuna || c.nombre_comuna}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarUbicacion} disabled={guardando}>Guardar</button>
                                    <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FILTROS DE BÚSQUEDA */}
                    <div className="card mb-3 p-3">
                        <h4 className="mb-2">Filtrar por Geografía</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">País</label>
                                <select className="form-select" value={filtroPais} onChange={handleFiltroPaisChange}>
                                    <option value="">Todos los países</option>
                                    {paises.map(p => <option key={p.id_pais || p.idPais} value={p.id_pais || p.idPais}>{p.nombre_pais || p.nombrePais}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Región</label>
                                <select className="form-select" value={filtroRegion} onChange={handleFiltroRegionChange} disabled={!filtroPais}>
                                    <option value="">Todas las regiones</option>
                                    {opcionesRegionesFiltro.map(r => <option key={r.idReg || r.id_reg} value={r.idReg || r.id_reg}>{r.nombreReg || r.nombre_reg}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Comuna</label>
                                <select className="form-select" value={filtroComuna} onChange={(e) => setFiltroComuna(e.target.value)} disabled={!filtroRegion}>
                                    <option value="">Todas las comunas</option>
                                    {opcionesComunasFiltro.map(c => <option key={c.idComuna || c.id_comuna} value={c.idComuna || c.id_comuna}>{c.nombreComuna || c.nombre_comuna}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={() => { setFiltroPais(""); setFiltroRegion(""); setFiltroComuna(""); setOpcionesRegionesFiltro([]); setOpcionesComunasFiltro([]); }}>
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        {/* TABLA DE UBICACIONES MODIFICADA */}
                        {cargando ? <p className="p-4 text-center">Cargando...</p> :
                            error ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                    <p>{error}</p>
                                    <button className="btn btn-outline" onClick={() => { setError(null); cargarUbicaciones(); }} style={{ marginTop: "12px" }}>Reintentar</button>
                                </div>
                            ) :
                                <table>
                                    <thead>
                                        <tr>
                                            {/* Nuevas cabeceras solicitadas */}
                                            <th>País</th>
                                            <th>Región</th>
                                            <th>Comuna</th>
                                            <th>Descripción</th>
                                            <th style={{ textAlign: "right" }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ubicacionesFiltradas.length === 0 ? (
                                            <tr><td colSpan="5" className="p-4 text-center">No se encontraron ubicaciones con los filtros seleccionados.</td></tr>
                                        ) : ubicacionesFiltradas.map(u => (
                                            <tr key={u.idUbicacion}>

                                                {/* 1. PAÍS: Accedemos bajando por la jerarquía: Ubicación -> Comuna -> Región -> País */}
                                                <td style={{ textTransform: "uppercase" }}>
                                                    {u.comuna?.region?.pais?.nombrePais || u.comuna?.region?.pais?.nombre_pais || 'N/A'}
                                                </td>

                                                {/* 2. REGIÓN: Ubicación -> Comuna -> Región */}
                                                <td style={{ textTransform: "uppercase" }}>
                                                    {u.comuna?.region?.nombreReg || u.comuna?.region?.nombre_reg || 'N/A'}
                                                </td>

                                                {/* 3. COMUNA: Ubicación -> Comuna */}
                                                <td style={{ textTransform: "uppercase" }}>
                                                    {u.comuna?.nombreComuna || u.comuna?.nombre_comuna || 'N/A'}
                                                </td>

                                                {/* 4. DESCRIPCIÓN: Directo en Ubicación */}
                                                <td style={{ textTransform: "uppercase" }}>
                                                    {u.descripcionUbi || u.descripcion_ubi}
                                                </td>

                                                {/* BOTONES */}
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                        <button className="btn btn-sm btn-outline" onClick={() => {
                                                            setSelectedPais("");
                                                            setSelectedRegion("");
                                                            setRegionesFiltradas([]);
                                                            setComunasFiltradas([]);
                                                            abrirEditar({
                                                                descripcion_ubi: u.descripcionUbi || '',
                                                                id_comuna: u.comuna?.idComuna || ''
                                                            }, u.idUbicacion);
                                                        }}>
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminarUbicacion(u.idUbicacion)}>
                                                            <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span> Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        }
                    </div>
                </div>
            )}

            {activeTab === "tipoIncidente" && (
                <div>
                    <div className="flex-between mb-3">
                        <h3>Listado de Tipos de Incidente ({tiposIncidente.length})</h3>
                        {!formTipo.mostrar && (
                            <button className="btn btn-primary" onClick={formTipo.abrirNuevo}>
                                <span className="material-icons" style={{ fontSize: "1.1rem" }}>add</span> Nuevo Tipo
                            </button>
                        )}
                    </div>

                    {formTipo.mostrar && (
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">{formTipo.editandoId ? "Editar" : "Nuevo"} Tipo de Incidente</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre del Tipo de Incidente</label>
                                    <input className="form-input" name="nombreTipoIncidente"
                                        value={formTipo.datos.nombreTipoIncidente} onChange={formTipo.handleInputChange}
                                        placeholder="Ej: Colisión, Robo, Incendio" type="text" />
                                </div>
                                <div className="form-group mt-2">
                                    <label className="form-label">Categoría</label>
                                    <select className="form-select" name="categoria"
                                        value={formTipo.datos.categoria} onChange={formTipo.handleInputChange}
                                    >
                                        <option value="">Seleccione una categoría...</option>
                                        <option value="Vehicular">Vehicular</option>
                                        <option value="Carga">Carga</option>
                                        <option value="Persona">Persona</option>
                                    </select>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <button className="btn btn-primary" onClick={handleGuardarTipoIncidente} disabled={guardandoTipo}>
                                        <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
                                        {guardandoTipo ? "Guardando..." : formTipo.editandoId ? "Actualizar" : "Guardar"}
                                    </button>
                                    <button className="btn btn-outline" onClick={formTipo.cerrar} disabled={guardandoTipo}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {cargandoTipos ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>Cargando tipos de incidente...</p></div>
                        ) : errorTipos ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
                                <p>{errorTipos}</p>
                                <button className="btn btn-outline" onClick={cargarTiposIncidente} style={{ marginTop: "12px" }}>Reintentar</button>
                            </div>
                        ) : tiposIncidente.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}><p>No hay tipos de incidente registrados.</p></div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th style={{ textAlign: "right" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tiposIncidente.map((t) => (
                                        <tr key={t.idTipoIncidente}>
                                            <td>{t.idTipoIncidente}</td>
                                            <td><strong>{t.nombreTipoIncidente}</strong></td>
                                            <td>{t.categoria || 'N/A'}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => formTipo.abrirEditar(t, t.idTipoIncidente)}>
                                                        <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span> Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleEliminarTipoIncidente(t.idTipoIncidente)}>
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

            {/* MODAL PAIS */}
            {modalPaisOpen && (
                <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3 className="mb-3">Nuevo País</h3>
                        <input className="form-input mb-2" placeholder="Nombre País"
                            value={nuevoPais.nombre_pais} onChange={e => setNuevoPais({ ...nuevoPais, nombre_pais: e.target.value })} />
                        <div className="flex gap-1">
                            <button className="btn btn-primary" onClick={handleGuardarPais}>Crear</button>
                            <button className="btn btn-outline" onClick={() => setModalPaisOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REGION */}
            {modalRegionOpen && (
                <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3 className="mb-3">Nueva Región</h3>
                        <label className="form-label">País</label>
                        <select className="form-select mb-2" value={paisParaNuevaRegion} onChange={e => setPaisParaNuevaRegion(e.target.value)}>
                            <option value="">Seleccione...</option>
                            {paises.map(p => <option key={p.id_pais || p.idPais} value={p.id_pais || p.idPais}>{p.nombre_pais || p.nombrePais}</option>)}
                        </select>
                        <label className="form-label">Nombre Región</label>
                        <input className="form-input mb-2" placeholder="Nombre Región"
                            value={nuevaRegion.nombre_reg} onChange={e => setNuevaRegion({ ...nuevaRegion, nombre_reg: e.target.value })} />
                        <div className="flex gap-1">
                            <button className="btn btn-primary" onClick={handleGuardarRegion}>Crear</button>
                            <button className="btn btn-outline" onClick={() => setModalRegionOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COMUNA */}
            {modalComunaOpen && (
                <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3 className="mb-3">Nueva Comuna</h3>
                        <label className="form-label">País</label>
                        <select className="form-select mb-2" value={paisParaNuevaComuna} onChange={handlePaisModalComunaChange}>
                            <option value="">Seleccione...</option>
                            {paises.map(p => <option key={p.id_pais || p.idPais} value={p.id_pais || p.idPais}>{p.nombre_pais || p.nombrePais}</option>)}
                        </select>
                        <label className="form-label">Región</label>
                        <select className="form-select mb-2" value={regionParaNuevaComuna} onChange={e => setRegionParaNuevaComuna(e.target.value)} disabled={!paisParaNuevaComuna}>
                            <option value="">Seleccione...</option>
                            {regionesParaModalComuna.map(r => <option key={r.id_reg || r.idReg} value={r.id_reg || r.idReg}>{r.nombre_reg || r.nombreReg}</option>)}
                        </select>
                        <label className="form-label">Nombre Comuna</label>
                        <input className="form-input mb-2" placeholder="Nombre Comuna"
                            value={nuevaComuna.nombre_comuna} onChange={e => setNuevaComuna({ ...nuevaComuna, nombre_comuna: e.target.value })} />
                        <div className="flex gap-1">
                            <button className="btn btn-primary" onClick={handleGuardarComuna}>Crear</button>
                            <button className="btn btn-outline" onClick={() => setModalComunaOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UbicacionTipoIncidente;
