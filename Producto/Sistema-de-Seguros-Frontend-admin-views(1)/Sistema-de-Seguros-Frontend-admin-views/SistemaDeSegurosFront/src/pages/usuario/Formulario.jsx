import BackButton from "../../components/BackButton";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Formulario.css';
import FormularioServices from '../../services/formularioServices';
import UbicacionServices from '../../services/ubicacionServices';
import DocumentoServices from '../../services/documentoServices';
import AuthKeycloakServices from '../../services/authKeycloakServices';
import api from '../../config/api';
import Swal from 'sweetalert2';
import logoImg from '../../assets/logo.png';
import notificacionService from '../../services/notificacionService';
import {
  BsPersonFill, BsTruck, BsCalendarEventFill, BsGeoAltFill, BsMapFill,
  BsExclamationTriangleFill, BsInfoCircleFill, BsImageFill, BsFileEarmarkTextFill,
  BsBoxSeamFill, BsPeopleFill, BsPencilSquare, BsFolderFill, BsPersonBadgeFill,
  BsDownload, BsCheckSquareFill, BsSearch, BsCheckLg, BsQuestionCircleFill, BsGeoFill, BsTruckFlatbed,
  BsXLg, BsPlusLg, BsTrashFill, BsTelephoneFill, BsEnvelopeFill, BsShieldFill, BsFuelPump, BsCheckAll, BsFileTextFill,
} from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
import ListaFormulario from "./ListaFormulario";

// Mapeo de nombre a id de tipo de documento
const tipoDocumentoIds = {
  cedula: 1,
  licencia: 2,
  declaracion_jurada: 3,
  foto_danos: 4,
  foto_lugar: 5,
  panoramica_frontal: 6,
  panoramica_trasera: 7,
  documento_tracto: 8,
  documento_semi: 9,
  foto_carga: 10,
  documento_vehiculo: 11
};
// Utilidad para generar el idIncidente en formato INCDT00X
const generarIdIncidente = (id) => `INCDT00${id}`;


// Ícono de bootstrap para auto (SVG)
const BootstrapCarIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"></path>
  </svg>
);


// Normaliza la categoría para documentos
function getCategoriaGeneral(nombre) {
  if (!nombre) return "Siniestro";
  const n = nombre.trim().toLowerCase();
  if (n.includes("vehiculo") || n.includes("vehículo") || n.includes("declaracion")) return "Vehiculo";
  if (n.includes("conductor") || n.includes("licencia") || n.includes("carnet")) return "Conductor";
  if (n.includes("tercero")) return "Tercero";
  if (n.startsWith("siniestro") || n.includes("foto") || n.includes("incidente")) return "Siniestro";
}

// ═══════════════════════════════════════════════════════════════════════════
// ── CONSTANTES Y HELPERS PARA CARRITO DE VEHÍCULOS ──
// ═══════════════════════════════════════════════════════════════════════════
const TIPOS_VEHICULO_ESPECIALES = ['Tracto', 'Semirremolque', 'tracto', 'semirremolque', 'TRACTO', 'SEMIRREMOLQUE'];
const MAX_VEHICULOS = 2;
// Formatea un RUT chileno agregando puntos y guion automáticamente
function formatearRut(rut) {
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length <= 1) return rut;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  cuerpo = cuerpo.replace(/^0+/, '');
  let formateado = '';
  for (let i = cuerpo.length; i > 0; i -= 3) {
    let ini = Math.max(i - 3, 0);
    let parte = cuerpo.substring(ini, i);
    formateado = parte + (formateado ? '.' + formateado : '');
  }
  return formateado + '-' + dv;
}

// ═══════════════════════════════════════════════════════════════════════════
// ── HELPERS PARA CARRITO DE INCIDENTES ──
// ═══════════════════════════════════════════════════════════════════════════

// Helper: Normalizar categoría de incidente
/* const normalizarCategoria = (tipoIncidente) => {
  const categoria = (tipoIncidente?.categoria || '').toString().trim().toLowerCase();

  if (categoria === 'incidente vehicular' || categoria === 'vehicular') {
    return 'vehicular';
  }
  // Usar la misma lógica que esCategoriaDeCargas
  if (categoria === 'incidente de carga' || categoria === 'carga' || categoria.includes('carga')) {
    return 'carga';
  }
  if (categoria === 'incidente persona' || categoria === 'persona') {
    return 'persona';
  }

  // Fallback: analizar por nombre
  const nombre = (tipoIncidente?.nombreTipoIncidente || '').toLowerCase();
  if (nombre.includes('carga') || nombre.includes('robo') || nombre.includes('pérdida')) {
    return 'carga';
  }

  return 'vehicular';
}; */

// ── Estado inicial tercero ───
const emptyTercero = {
  rutTer: '', nombreTer: '', telefonoTer: '',
  emailTer: '', aseguradoraTer: '', numeroSinTer: ''
};

function Formulario() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  // const mapRef = useRef(null);
  // const mapInstanceRef = useRef(null);
  // const markerRef = useRef(null);
  // const autocompleteRef = useRef(null);

  // ── Data from API ──
  const [tiposIncidente, setTiposIncidente] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [paises, setPaises] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [bases, setBases] = useState([]);
  const [operaciones, setOperaciones] = useState([]);
  const [allConductores, setAllConductores] = useState([]);
  const [allVehiculos, setAllVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Current step ──
  const [currentStep, setCurrentStep] = useState(1);

  // ══════════════════════════════════════════════════════════════════════════
  // ── NUEVOS ESTADOS: CARRITO DE VEHÍCULOS ──
  // ══════════════════════════════════════════════════════════════════════════
  const [vehiculosCarrito, setVehiculosCarrito] = useState([]);
  // Estructura: [{ id: unique, patente, tipoVehiculo, base, operacion, vehiculoData }]

  // ══════════════════════════════════════════════════════════════════════════
  // ── NUEVOS ESTADOS: CARRITO DE INCIDENTES ──
  // ══════════════════════════════════════════════════════════════════════════
  const [incidentesCarrito, setIncidentesCarrito] = useState([]);
  /* Estructura:
  [
    {
      id: unique,
      idTipoIncidente,
      categoria: 'vehicular' | 'carga',
      nombreTipo,
      datos: {
        fotosDanos: [],
        fotosLugar: [],
        fotosPanoramicas: {},
        docTracto: null,
        docSemi: null,
        fotoCarga: null,
        lugarCarga: '',
        fechaIniTransporte: '',
        destinoCarga: ''
      }
    }
  ]
  */

  // ── Step 1: Datos Iniciales ──
  const [conductor, setConductor] = useState({ nombre: '', rut: '' });
  const [conductorFound, setConductorFound] = useState(false);
  const [searchingRut, setSearchingRut] = useState(false);

  // Vehículo
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  // ¿El incidente involucra vehículo? (Si/No)
  const [involucraVehiculo, setInvolucraVehiculo] = useState(true);
  const [patenteSearch, setPatenteSearch] = useState('');
  const [patenteSuggestions, setPatenteSuggestions] = useState([]);
  const [showPatenteSuggestions, setShowPatenteSuggestions] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [patentes, setPatentes] = useState({ tracto: '', semi: '', vehiculo: '' });
  const [base, setBase] = useState('');
  const [operacion, setOperacion] = useState('');
  const [fechaSiniestro, setFechaSiniestro] = useState('');
  const [horaSiniestro, setHoraSiniestro] = useState('');

  // ── Step 2: Tipo de Incidente ──
  // Selección única de tipo de incidente (combobox clásico)
  const [tipoIncidenteSeleccionado, setTipoIncidenteSeleccionado] = useState('');

  // Utilidad: saber si el tipo seleccionado es vehicular/carga (robusto a espacios y mayúsculas)
  const tipoSeleccionadoObj = tiposIncidente.find(t => String(t.idTipoIncidente) === String(tipoIncidenteSeleccionado));

  // Helper function para verificar si es categoría de carga
  const esCategoriaDeCargas = (cat) => {
    if (!cat) return false;
    const categoria = cat.toString().trim().toLowerCase();
    return categoria === 'incidente de carga' || 
           categoria === 'carga' || 
           categoria.includes('incidente de carga') || 
           categoria.includes('carga');
  };

  const categoria = (tipoSeleccionadoObj?.categoria || '').toString().trim().toLowerCase();
  const hayVehicular = categoria === 'incidente vehicular' || categoria === 'vehicular' || categoria.includes('vehicular');
  const hayCarga = esCategoriaDeCargas(categoria);
  const hayPersona = categoria === 'incidente persona' || categoria === 'persona' || categoria.includes('persona');
  const [fotosVehiculo, setFotosVehiculo] = useState([]);
  const [fotosDanos, setFotosDanos] = useState([]);
  const [fotosLugar, setFotosLugar] = useState([]);
  const [selectedPais, setSelectedPais] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [ubicacionSiniestro, setUbicacionSiniestro] = useState("");

  const [fotosPanoramicas, setFotosPanoramicas] = useState({
    frente: null, trasera: null, lateralIzq: null, lateralDer: null
  });
  const [docTracto, setDocTracto] = useState(null);
  const [docSemi, setDocSemi] = useState(null);
  const [fotoCarga, setFotoCarga] = useState(null);
  const [lugarCarga, setLugarCarga] = useState('');
  const [fechaIniTransporte, setFechaIniTransporte] = useState('');
  const [destinoCarga, setDestinoCarga] = useState('');

  // Normalizar valores de inputs `datetime-local` (agregar segundos si faltan)
  const normalizeDateTimeLocal = (val) => {
    if (!val) return val;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
      return `${val}:00`;
    }
    return val;
  };

  // Terceros
  const [hayTerceros, setHayTerceros] = useState(false);
  const [terceros, setTerceros] = useState([]);
  const [terceroForm, setTerceroForm] = useState({ ...emptyTercero });
  const [showTerceroForm, setShowTerceroForm] = useState(false);


  // Relato
  const [relato, setRelato] = useState('');

  // ── Step 3: Documentación ──
  const [cedulaFile, setCedulaFile] = useState(null);
  const [licenciaFile, setLicenciaFile] = useState(null);
  // Declaración jurada (modo global, si se requiere)
  const [djFile, setDjFile] = useState(null);
  // Declaración jurada por incidente vehicular en el carrito
  const [djFiles, setDjFiles] = useState({}); // { [incidenteId]: file }
  // Estado para mostrar/ocultar declaración jurada
  const [mostrarDJ, setMostrarDJ] = useState(false);
  // Mostrar declaración jurada solo si es incidente vehicular
  useEffect(() => {
    const tieneVehicular = incidentesCarrito.some(inc => {
      const cat = (inc.categoria || '').trim().toLowerCase();
      return cat === 'incidente vehicular' || cat === 'vehicular';
    });
    setMostrarDJ(tieneVehicular);
    if (!tieneVehicular) setDjFiles({});
  }, [incidentesCarrito]);




  // ── Submitting ──
  const [submitting, setSubmitting] = useState(false);

  // Helper: extrae siempre un array de la respuesta
  const asList = (res) => {
    if (!res?.data) return [];
    const d = res.data;
    if (Array.isArray(d)) return d;
    return Array.isArray(d.data) ? d.data : (Array.isArray(d.content) ? d.content : []);
  };
  const logApiError = (label, reason) => {
    const status = reason?.response?.status;
    const data = reason?.response?.data;
    if (status != null) console.warn(`${label}: HTTP ${status}`, data != null ? data : reason?.message || reason);
    else console.warn(label, reason?.message || reason);
  };

  // ═══════════════════════════════════════════
  // ── Load all data from API ──
  // ═══════════════════════════════════════════
  useEffect(() => {
    // Si NO hay token (modo interno), validar Keycloak. Si es modo público, dejamos pasar.
    if (!token && !AuthKeycloakServices.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      const baseFetches = [
        FormularioServices.getTiposIncidente(),
        UbicacionServices.getPaises(),
        UbicacionServices.getRegiones(),
        UbicacionServices.getComunas(),
        FormularioServices.getBases(),
        FormularioServices.getOperaciones(),
        FormularioServices.getTiposVehiculo()
      ];

      // Si NO hay token publico, cargamos toda la lista desde la API
      if (!token) {
        baseFetches.push(FormularioServices.getConductores(), FormularioServices.getVehiculos());
      } else {
        // Obtenemos info precargada para este token
        try {
          const publicResponse = await api.get(`/api/formulario-publico/validar/${token}`);
          const pData = publicResponse.data;
          
          setConductor({ rut: pData.rutConductor || '', nombre: pData.nombreConductor || '' });
          setConductorFound(!!pData.rutConductor);
          
          if (pData.vehiculoId || pData.patenteVehiculo) {
            setSelectedVehiculo({
              idVehiculo: pData.vehiculoId,
              patenteVehiculo: pData.patenteVehiculo || '',
              marcaVehiculo: pData.marcaVehiculo || '',
              modeloVehiculo: pData.modeloVehiculo || ''
            });
          }
          
          if(pData.tipoSiniestro) {
             // Opcionalmente buscar la categoria de siniestro 
          }
        } catch(e) {
             Swal.fire('Enlace inválido', 'El enlace caducó o ya fue utilizado.', 'error');
             setLoading(false);
             return;
        }
      }

      const results = await Promise.allSettled(baseFetches);
      const [
        tiposResult,
        paisesResult,
        regionesResult,
        comunasResult,
        basesResult,
        operacionesResult,
        tiposVehResult,
        conductoresResult, // Puede ser indefinido si es modo online
        vehiculosResult // Puede ser indefinido si es modo online
      ] = results;

      if (tiposResult.status === 'fulfilled') {
        const listaTipos = asList(tiposResult.value);
        setTiposIncidente(listaTipos.sort((a, b) => (a.nombreTipoIncidente || '').localeCompare(b.nombreTipoIncidente || '')));
      } else logApiError('Tipos de incidente', tiposResult.reason);
      if (paisesResult && paisesResult.status === 'fulfilled') setPaises(asList(paisesResult.value));
      else logApiError('Países', paisesResult?.reason);
      if (regionesResult.status === 'fulfilled') setRegiones(asList(regionesResult.value));
      else logApiError('Regiones', regionesResult.reason);
      if (comunasResult.status === 'fulfilled') setComunas(asList(comunasResult.value));
      else logApiError('Comunas', comunasResult.reason);
      if (basesResult.status === 'fulfilled') setBases(asList(basesResult.value));
      else logApiError('Bases', basesResult.reason);
      if (operacionesResult.status === 'fulfilled') setOperaciones(asList(operacionesResult.value));
      else logApiError('Operaciones', operacionesResult.reason);
      if (tiposVehResult.status === 'fulfilled') setTiposVehiculo(asList(tiposVehResult.value));
      else logApiError('Tipos de vehículo', tiposVehResult.reason);
      
      if (conductoresResult?.status === 'fulfilled') setAllConductores(asList(conductoresResult.value));
      else if (conductoresResult) logApiError('Conductores', conductoresResult.reason);
      
      if (vehiculosResult?.status === 'fulfilled') setAllVehiculos(asList(vehiculosResult.value));
      else if (vehiculosResult) logApiError('Vehículos', vehiculosResult.reason);

      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  // Filtrar regiones, comunas y operaciones según selección
  const regionesFiltradas = Array.isArray(regiones) && selectedPais
    ? regiones.filter(r => String(r.pais?.idPais ?? r.idPais ?? r.id_pais ?? "") === String(selectedPais))
    : [];
  const comunasFiltradas = Array.isArray(comunas) && selectedRegion
    ? comunas.filter(c => String(c.region?.idReg ?? c.idRegion ?? c.id_region ?? "") === String(selectedRegion))
    : [];
  // Filtrar operaciones por base seleccionada (el backend ahora envía id_base en cada operación)
  const operacionesFiltradas = Array.isArray(operaciones) && base
    ? operaciones.filter(o => String(o.id_base ?? "") === String(base))
    : [];


  // Resetear selección de región y comuna al cambiar país
  useEffect(() => {
    setSelectedRegion('');
    setSelectedComuna('');
  }, [selectedPais]);

  // Resetear selección de comuna al cambiar región
  useEffect(() => {
    setSelectedComuna('');
  }, [selectedRegion]);

  // ── Step 1: Datos Iniciales ──
  const handleRutSearch = async () => {
    if (!conductor.rut || conductor.rut.length < 3) {
      Swal.fire({ icon: 'warning', title: 'RUT inválido', text: 'Ingrese un RUT válido para buscar.', confirmButtonColor: '#045524' });
      return;
    }
    setSearchingRut(true);
    try {
      const rutClean = conductor.rut.replace(/\s/g, '');
      const found = allConductores.find(c => c.rut === rutClean);
      if (found) {
        setConductor({
          rut: found.rut,
          nombre: `${found.primerNombre || ''} ${found.segundoNombre || ''} ${found.apellidoPaterno || ''} ${found.apellidoMaterno || ''}`.replace(/\s+/g, ' ').trim()
        });
        setConductorFound(true);
        Swal.fire({ icon: 'success', title: 'Colaborador encontrado', text: 'Los datos se han autocompletado.', confirmButtonColor: '#045524', timer: 2000, showConfirmButton: false });
      } else {
        setConductorFound(false);
        setConductor(prev => ({ ...prev, nombre: '' }));
        Swal.fire({ icon: 'info', title: 'No encontrado', text: 'El RUT no existe en la base de datos. Puede ingresar los datos manualmente.', confirmButtonColor: '#045524' });
      }
    } catch (err) {
      console.error('Error buscando conductor:', err);
    } finally {
      setSearchingRut(false);
    }
  };

  // ═══════════════════════════════════════════
  // ── Vehículo: Buscar por Patente ──
  // ═══════════════════════════════════════════
  const handlePatenteSearch = (value) => {
    setPatenteSearch(value);
    if (!value) {
      setPatenteSuggestions([]);
      setShowPatenteSuggestions(false);
      return;
    }
    const query = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const matches = allVehiculos.filter(v => {
      const p = (v.patente || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return p.includes(query);
    }).slice(0, 8);
    setPatenteSuggestions(matches);
    setShowPatenteSuggestions(matches.length > 0);
  };

  const selectVehiculo = (veh) => {
    // DEBUG: log para ayudar a detectar por qué no se completa la operación
    console.log('selectVehiculo -> veh:', veh);
    setSelectedVehiculo(veh);
    setPatenteSearch(veh.patente || '');
    setPatentes({ ...patentes, vehiculo: veh.patente || '', tracto: '', semi: '' });
    // Tipo de vehículo: soportar varias formas de la propiedad
    const tipoId = veh.id_tipo_vehiculo ?? veh.idTipoVehiculo ?? veh.tipoVehiculo ?? veh.tipoVehiculoId ?? veh.tipo_id;
    if (tipoId) setTipoVehiculo(String(tipoId));

    // Base: soportar distintas claves (id_base, idBase, base)
    const baseId = veh.id_base ?? veh.idBase ?? (veh.base && (veh.base.id_base ?? veh.base.id)) ?? veh.base;
    if (baseId) setBase(String(baseId));

    // Operación: soportar distintas formas (id_operacion, idOperacion, operacion, operacionId, objeto operacion)
    let operacionId = veh.id_operacion ?? veh.idOperacion ?? veh.operacionId ?? (veh.operacion && (veh.operacion.id_operacion ?? veh.operacion.id)) ?? veh.operacion_id;
    // Si `veh.operacion` es un nombre (no un id), intentar resolverlo buscando en la lista `operaciones`
    if (!operacionId && veh.operacion) {
      const nombreOp = String(veh.operacion).trim();
      const foundOp = operaciones.find(o => (String(o.nombre || o.name || '').trim().toLowerCase() === nombreOp.toLowerCase()));
      console.log('selectVehiculo -> trying resolve operacion by name:', nombreOp, 'foundOp:', foundOp);
      if (foundOp) operacionId = foundOp.id_operacion ?? foundOp.idOperacion ?? foundOp.id;
    }
    console.log('selectVehiculo -> resolved operacionId:', operacionId);
    // Si no se resolvió la operación desde el objeto vehículo, intentar autoseleccionar
    // la operación cuando la base ya está establecida y sólo existe una operación para esa base.
    if (!operacionId && baseId) {
      const opsParaBase = operaciones.filter(o => String(o.id_base ?? o.idBase) === String(baseId));
      if (opsParaBase.length === 1) {
        operacionId = opsParaBase[0].id_operacion ?? opsParaBase[0].idOperacion ?? opsParaBase[0].id;
        console.log('selectVehiculo -> auto-selected operacion by single-op-for-base:', operacionId);
      }
    }
    if (operacionId) setOperacion(String(operacionId));
    setShowPatenteSuggestions(false);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── FUNCIONES CARRITO DE VEHÍCULOS ──
  // ══════════════════════════════════════════════════════════════════════════

  // Helper: Verificar si un tipo de vehículo es especial (Tracto o Semirremolque)
  const esTipoVehiculoEspecial = (tipoVehiculoId, tiposVehiculo) => {
    const tipo = tiposVehiculo.find(t =>
      String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(tipoVehiculoId)
    );
    const nombreTipo = (tipo?.tipo_vehiculo ?? tipo?.tipoVehiculo ?? '').toLowerCase();
    return TIPOS_VEHICULO_ESPECIALES.some(especial =>
      nombreTipo.includes(especial.toLowerCase())
    );
  };

  // Helper: Validar si se puede agregar un vehículo al carrito
  const puedeAgregarVehiculo = (carritoActual, nuevoTipoVehiculoId, tiposVehiculo) => {
    const cantidadActual = carritoActual.length;

    // Si ya hay 2, no se puede agregar más
    if (cantidadActual >= MAX_VEHICULOS) {
      return {
        valido: false,
        mensaje: 'Ya alcanzó el máximo de 2 vehículos permitidos.'
      };
    }

    // Si no hay ninguno, siempre se puede agregar
    if (cantidadActual === 0) {
      return { valido: true };
    }

    // Si ya hay 1 vehículo
    const primerVehiculo = carritoActual[0];
    const primerEsEspecial = esTipoVehiculoEspecial(primerVehiculo.tipoVehiculo, tiposVehiculo);

    // Solo permite agregar un segundo vehículo si el primero es Tracto o Semirremolque
    if (primerEsEspecial) {
      return { valido: true };
    }

    return {
      valido: false,
      mensaje: 'Solo puede agregar un segundo vehículo si el primero es Tracto o Semirremolque.'
    };
  };

  const addVehicleToCarrito = () => {
    // Validaciones básicas
    if (!patenteSearch && !selectedVehiculo) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debe buscar y seleccionar un vehículo primero.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    if (!tipoVehiculo) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo de vehículo requerido',
        text: 'Debe seleccionar un tipo de vehículo.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    if (!base) {
      Swal.fire({
        icon: 'warning',
        title: 'Base requerida',
        text: 'Debe seleccionar una base.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    if (!operacion) {
      Swal.fire({
        icon: 'warning',
        title: 'Operación requerida',
        text: 'Debe seleccionar una operación.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    // Validar duplicados
    const patenteActual = patenteSearch || selectedVehiculo?.patente || '';
    const yaDuplicado = vehiculosCarrito.some(v => v.patente === patenteActual);
    if (yaDuplicado) {
      Swal.fire({
        icon: 'warning',
        title: 'Vehículo duplicado',
        text: 'Este vehículo ya está en el carrito.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    // Validar reglas de negocio
    const validacion = puedeAgregarVehiculo(vehiculosCarrito, tipoVehiculo, tiposVehiculo);
    if (!validacion.valido) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede agregar',
        text: validacion.mensaje,
        confirmButtonColor: '#045524'
      });
      return;
    }

    // Crear objeto vehículo
    const nuevoVehiculo = {
      id: Date.now(), // ID único temporal
      patente: patenteActual,
      tipoVehiculo,
      base,
      operacion,
      vehiculoData: selectedVehiculo // Guardar datos completos si existen
    };

    // Agregar al carrito
    setVehiculosCarrito(prev => [...prev, nuevoVehiculo]);

    // Limpiar formulario
    setPatenteSearch('');
    setSelectedVehiculo(null);
    setTipoVehiculo('');
    setBase('');
    setOperacion('');

    Swal.fire({
      icon: 'success',
      title: 'Vehículo agregado',
      text: `Se agregó ${patenteActual} al carrito.`,
      confirmButtonColor: '#045524',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const removeVehicleFromCarrito = (vehiculoId) => {
    setVehiculosCarrito(prev => prev.filter(v => v.id !== vehiculoId));

    Swal.fire({
      icon: 'info',
      title: 'Vehículo eliminado',
      text: 'El vehículo ha sido removido del carrito.',
      confirmButtonColor: '#045524',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── FUNCIONES CARRITO DE INCIDENTES ──
  // ══════════════════════════════════════════════════════════════════════════

  const addIncidenteToCarrito = () => {
    if (!tipoIncidenteSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipo de incidente requerido',
        text: 'Debe seleccionar un tipo de incidente.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    // Validar duplicados
    const yaExiste = incidentesCarrito.some(inc =>
      String(inc.idTipoIncidente) === String(tipoIncidenteSeleccionado)
    );

    if (yaExiste) {
      Swal.fire({
        icon: 'warning',
        title: 'Incidente duplicado',
        text: 'Este tipo de incidente ya está en el carrito.',
        confirmButtonColor: '#045524'
      });
      return;
    }


    const tipoObj = tiposIncidente.find(t =>
      String(t.idTipoIncidente) === String(tipoIncidenteSeleccionado)
    );

    // Guardar la categoría exactamente como viene de la base de datos
    const categoriaIncidente = tipoObj?.categoria || '';

    const nuevoIncidente = {
      id: Date.now(),
      idTipoIncidente: tipoIncidenteSeleccionado,
      categoria: categoriaIncidente,
      nombreTipo: tipoObj?.nombreTipoIncidente || 'Sin nombre',
      datos: {
        // Vehicular — captura los valores actuales del formulario
        fotosVehiculo: [...fotosVehiculo],
        fotosDanos: [...fotosDanos],
        fotosLugar: [...fotosLugar],
        fotosPanoramicas: { ...fotosPanoramicas },
        // Carga — captura los valores actuales del formulario
        docTracto: docTracto,
        docSemi: docSemi,
        fotoCarga: fotoCarga,
        lugarCarga: lugarCarga,
        // Guardar la fecha en ambos nombres por compatibilidad (normalizada)
        fechaIniTransporteCarga: normalizeDateTimeLocal(fechaIniTransporte),
        fechaIniTransporte: normalizeDateTimeLocal(fechaIniTransporte),
        // clave snake_case que el backend espera
        fecha_ini_transporte_carga: normalizeDateTimeLocal(fechaIniTransporte),
        destinoCarga: destinoCarga
      }
    };

    setIncidentesCarrito(prev => [...prev, nuevoIncidente]);
    // Limpiar todos los campos de detalles del incidente y ocultar el formulario
    setTipoIncidenteSeleccionado(''); // Esto oculta el formulario de detalles
    setFotosVehiculo([]);
    setFotosDanos([]);
    setFotosLugar([]);
    setFotosPanoramicas({ frente: null, trasera: null, lateralIzq: null, lateralDer: null });
    setDocTracto(null);
    setDocSemi(null);
    setFotoCarga(null);
    setLugarCarga('');
    setFechaIniTransporte('');
    setDestinoCarga('');

    Swal.fire({
      icon: 'success',
      title: 'Incidente agregado',
      text: `Se agregó "${nuevoIncidente.nombreTipo}" al carrito.`,
      confirmButtonColor: '#045524',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const removeIncidenteFromCarrito = (incidenteId) => {
    setIncidentesCarrito(prev => prev.filter(inc => inc.id !== incidenteId));

    Swal.fire({
      icon: 'info',
      title: 'Incidente eliminado',
      text: 'El incidente ha sido removido del carrito.',
      confirmButtonColor: '#045524',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const updateIncidenteDatos = (incidenteId, campo, valor) => {
    setIncidentesCarrito(prev => prev.map(inc => {
      if (inc.id === incidenteId) {
        return {
          ...inc,
          datos: {
            ...inc.datos,
            [campo]: valor
          }
        };
      }
      return inc;
    }));
  };


  // ── Terceros management ──
  const addTercero = () => {
    if (!terceroForm.rutTer || !terceroForm.nombreTer || !terceroForm.telefonoTer) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'RUT, Nombre y Teléfono son obligatorios.', confirmButtonColor: '#045524' });
      return;
    }
    setTerceros([...terceros, { ...terceroForm }]);
    setTerceroForm({ ...emptyTercero });
    setShowTerceroForm(false);
  };
  const removeTercero = (i) => setTerceros(terceros.filter((_, idx) => idx !== i));

  // ── Step navigation ──
  // ── Step navigation ──
  const goNext = () => {
    // Validaciones para Paso 1
    if (currentStep === 1) {
      // 1. Datos del Colaborador (Obligatorios)
      if (!conductor.nombre || !conductor.rut) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos del Colaborador',
          text: 'Debe completar los datos del colaborador (RUT y Nombre).',
          confirmButtonColor: '#045524'
        });
        return;
      }

      // Los datos del vehículo NO son obligatorios según requerimiento del usuario.
      // Sin embargo, si NO involucra vehículo, Base y Operación sí deben ser seleccionados.
      if (!involucraVehiculo && (!base || !operacion)) {
        Swal.fire({
          icon: 'warning',
          title: 'Base y Operación',
          text: 'Debe seleccionar la Base y Operación correspondientes.',
          confirmButtonColor: '#045524'
        });
        return;
      }

      // 2. Fecha y Hora del Siniestro (Obligatorios)
      if (!fechaSiniestro || !horaSiniestro) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha y Hora',
          text: 'La fecha y hora del siniestro son obligatorias para continuar.',
          confirmButtonColor: '#045524'
        });
        return;
      }

      // 3. Ubicación del Siniestro (Obligatorios)
      if (!ubicacionSiniestro || !selectedPais || !selectedRegion || !selectedComuna) {
        Swal.fire({
          icon: 'warning',
          title: 'Ubicación del Siniestro',
          text: 'Debe completar la descripción de ubicación y los campos de País, Región y Comuna.',
          confirmButtonColor: '#045524'
        });
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ══════════════════════════════════════════════════════════════════════════
  // ── SUBMIT MODIFICADO PARA INCLUIR CARRITOS ──
  // ══════════════════════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    // Helper: reemplaza strings vacías por 'NO APLICA' en todo el payload (solo strings)
    const replaceEmptyStrings = (value) => {
      if (value === null || value === undefined) return value;
      if (typeof value === 'string') return value.trim() === '' ? '' : value;
      if (Array.isArray(value)) return value.map(replaceEmptyStrings);
      if (typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
          out[k] = replaceEmptyStrings(v);
        }
        return out;
      }
      return value;
    };

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar Envío?',
      text: 'Se enviará el formulario y se notificará automáticamente al revisor encargado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar formulario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#045524',
      cancelButtonColor: '#d33'
    });

    if (!isConfirmed) {
      return;
    }

    // Validar campos requeridos específicos por tipo de incidente
    const tieneIncidentesCarga = incidentesCarrito.some(inc => esCategoriaDeCargas(inc.categoria));
    if (tieneIncidentesCarga) {
      const incidenteCargaInvalido = incidentesCarrito.find(inc => {
        if (esCategoriaDeCargas(inc.categoria)) {
          return !inc.datos.lugarCarga || !inc.datos.fechaIniTransporte || !inc.datos.destinoCarga;
        }
        return false;
      });
      
      if (incidenteCargaInvalido) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos Incompletos',
          text: 'Debe completar todos los campos requeridos de incidentes de carga (Lugar de carga, Fecha de transporte y Destino).',
          confirmButtonColor: '#045524'
        });
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);
    let userId = null;
    
    // Si NO estamos en modo publico (sin token), exigimos un usuario
    if (!token) {
      userId = AuthKeycloakServices.getUserId();
      if (!userId) {
        Swal.fire({ icon: 'error', title: 'Sesión expirada', text: 'Inicie sesión nuevamente.', confirmButtonColor: '#045524' });
        setSubmitting(false);
        return;
      }
    }

    if (incidentesCarrito.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin incidentes',
        text: 'Debe agregar al menos un incidente antes de enviar el formulario.',
        confirmButtonColor: '#045524'
      });
      setSubmitting(false);
      return;
    }

    // Formato LocalDateTime para Java: yyyy-MM-ddTHH:mm:ss (sin 'Z', sin milisegundos)
    const fechaHoraStr = (fechaSiniestro && horaSiniestro)
      ? `${fechaSiniestro}T${horaSiniestro}:00`
      : new Date().toISOString().split('.')[0];

    // const ahora = new Date().toISOString().split('.')[0]; // formato: 2026-02-20T15:30:00

    // VERIFICACIÓN OFFLINE ANTES DE ENVIAR
    if (!navigator.onLine) {
      // Si no hay conexión, guardamos TODO el estado para procesarlo después
      const { enviarFormularioSiniestro } = await import('../../services/formularioIncidenteService');
      const offlineCompleto = {
        userId, selectedComuna, ubicacionSiniestro,
        incidentesCarrito, involucraVehiculo, vehiculosCarrito,
        fechaHoraStr, relato, conductor, base, bases, operacion, operaciones,
        terceros, hayTerceros,
        archivos: { 
          cedulaFile, licenciaFile, djFile, djFiles 
        }
      };
      
      const resultado = await enviarFormularioSiniestro(offlineCompleto);
      if (resultado.offline) {
        await Swal.fire({
          icon: 'info',
          title: 'Guardado sin conexión',
          html: `<p>No hay señal en este momento.</p>
                 <p><strong>El formulario y las fotos están guardados en tu dispositivo</strong> y se enviarán
                 automáticamente cuando recuperes internet.</p>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#045524'
        });
        resetFormulario();
        setSubmitting(false);
        return;
      }
    }

    try {
      // 1. Crear la Ubicación del Incidente
      let idUbicacionFinal = 1;
      try {
        const ubiPayload = {
          descripcionUbi: ubicacionSiniestro,
          comuna: { idComuna: parseInt(selectedComuna) }
        };
        const ubiRes = await UbicacionServices.createUbicacionIncidente(ubiPayload);
        idUbicacionFinal = ubiRes.data.idUbicacion;
      } catch (ubiErr) {
        console.warn('Error creando ubicación, se usará default ID 1:', ubiErr);
      }

      // 2. Preparar payload del Formulario con CARRITOS
      // Extraer lugarCarga y destinoCarga del primer incidente de carga
      let lugarCargaGlobal = '';
      let destinoCargaGlobal = '';
      const incidenteCarga = incidentesCarrito.find(inc => esCategoriaDeCargas(inc.categoria));
      if (incidenteCarga) {
        lugarCargaGlobal = incidenteCarga.datos?.lugarCarga || '';
        destinoCargaGlobal = incidenteCarga.datos?.destinoCarga || '';
      }
      let payload = {
        idUsuario: userId,
        incidentes: incidentesCarrito.map(inc => ({
          idTipoIncidente: parseInt(inc.idTipoIncidente),
          categoria: inc.categoria,
          nombreTipo: inc.nombreTipo,
          datos: {
            ...inc.datos,
            // Asegurar nombre de campo que espera el backend (incluye snake_case)
            fechaIniTransporteCarga: inc.datos?.fechaIniTransporteCarga || inc.datos?.fechaIniTransporte || null,
            fecha_ini_transporte_carga: inc.datos?.fecha_ini_transporte_carga || inc.datos?.fechaIniTransporteCarga || inc.datos?.fechaIniTransporte || null
          }
        })),
        tipoIncidente: incidentesCarrito.length > 0
          ? { idTipoIncidente: parseInt(incidentesCarrito[0].idTipoIncidente) }
          : { idTipoIncidente: 1 },
        ubicacion: { idUbicacion: idUbicacionFinal },
        vehiculos: involucraVehiculo ? vehiculosCarrito.map(v => ({
          patente: v.patente,
          idTipoVehiculo: parseInt(v.tipoVehiculo),
          idBase: parseInt(v.base),
          idOperacion: parseInt(v.operacion),
          marca: v.vehiculoData?.marca || '',
          modelo: v.vehiculoData?.modelo || '',
          anio: v.vehiculoData?.anio || ''
        })) : [],
        idTipoVehiculo: involucraVehiculo ? (vehiculosCarrito.length > 0 ? parseInt(vehiculosCarrito[0].tipoVehiculo) : 1) : null,
        patente1: involucraVehiculo ? (vehiculosCarrito[0]?.patente || "") : null,
        patente2: involucraVehiculo ? (vehiculosCarrito[1]?.patente || "") : null,
        fechaHoraIncidente: fechaHoraStr,
        relatoForm: relato || "Sin relato",
        nombreConductor: involucraVehiculo ? (conductor.nombre || "") : null,
        rutConductor: involucraVehiculo ? (conductor.rut || "") : null,
        base: (base || (involucraVehiculo && vehiculosCarrito.length > 0 ? vehiculosCarrito[0].base : ""))
          ? (bases.find(b => String(b.id_base ?? b.idBase) === String(base || (involucraVehiculo && vehiculosCarrito.length > 0 ? vehiculosCarrito[0].base : "")))?.nombre || "") : "",
        operacion: (operacion || (involucraVehiculo && vehiculosCarrito.length > 0 ? vehiculosCarrito[0].operacion : ""))
          ? (operaciones.find(o => String(o.id_operacion ?? o.idOperacion) === String(operacion || (involucraVehiculo && vehiculosCarrito.length > 0 ? vehiculosCarrito[0].operacion : "")))?.nombre || "") : "",
        lugarCarga: lugarCargaGlobal,
        destinoCarga: destinoCargaGlobal,
        fechaIniTransporteCarga: incidenteCarga ? (incidenteCarga.datos?.fechaIniTransporteCarga || incidenteCarga.datos?.fechaIniTransporte || incidenteCarga.datos?.fecha_ini_transporte_carga || null) : null,
        fechaIngresoForm: new Date().toISOString()
      };
      // Normalizar campos string vacíos a 'NO APLICA'
      payload = replaceEmptyStrings(payload);
      // Guardar formulario en base de datos
      let createdForm = null;
      let idIncidente = null;
      try {
        let res;
        if (token) {
          res = await api.post(`/api/formulario-publico/enviar/${token}`, payload);
          createdForm = res.data;
          idIncidente = createdForm?.idForm; 
        } else {
          res = await FormularioServices.createFormulario(payload, "riquelmemati1904@gmail.com");
          createdForm = res.data;
          idIncidente = createdForm?.idForm || createdForm?.id_form || createdForm?.idIncidente || createdForm?.id_incidente || createdForm?.incidente?.idIncidente || createdForm?.incidente?.id_incidente || createdForm?.id || null;
        }
        console.log('Formulario guardado:', createdForm);
      } catch (err) {
        console.error('Error guardando formulario:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el formulario.', confirmButtonColor: '#045524' });
        setSubmitting(false);
        return;
      }
      if (hayTerceros && terceros.length > 0) {
        for (const ter of terceros) {
          try {
            const terPayload = {
              rutTer: ter.rutTer || ter.rut || '',
              nombreTer: ter.nombreTer || ter.nombre || '',
              telefonoTer: ter.telefonoTer || ter.telefono || '',
              emailTer: ter.emailTer || ter.email || '',
              aseguradoraTer: ter.aseguradoraTer || ter.aseguradora || '',
              numeroSinTer: ter.numeroSinTer || ter.numeroSin || '',
              formularioIncidente: { idForm: idIncidente || createdForm?.idForm || createdForm?.id_form || createdForm?.idIncidente || createdForm?.id_incidente || null }
            };
            console.log('Enviando tercero JSON:', terPayload);
            // CONSUMO-API-TERCEROS: Crear tercero asociado al formulario (envío JSON limpio, sin File)
            let createdTerc;
            if (token) {
              createdTerc = await api.post('/api/tercero/publico/crear', terPayload);
            } else {
              createdTerc = await FormularioServices.createTercero(terPayload);
            }
            // FIN CONSUMO-API-TERCEROS

            // Subir archivos asociados al tercero, si existen
            try {
              const terceroIdForLog = createdTerc?.data?.id || createdTerc?.data?.idTercero || createdTerc?.id || ter.rutTer || 'unknown';

              // Carnet / cédula del tercero
              if (ter.carnetFile) {
                const fdCarnet = new FormData();
                fdCarnet.append('Archivo', ter.carnetFile);
                fdCarnet.append('idIncidente', createdForm?.idIncidente || idIncidente || '');
                fdCarnet.append('categoria', getCategoriaGeneral('Tercero'));
                fdCarnet.append('idTipoDocumento', tipoDocumentoIds.cedula);
                console.log(`Subiendo carnet tercero ${terceroIdForLog}: ${ter.carnetFile.name}`);
                await DocumentoServices.uploadDocument(fdCarnet);
              }

              // Licencia del tercero
              if (ter.licenciaFile) {
                const fdLic = new FormData();
                fdLic.append('Archivo', ter.licenciaFile);
                fdLic.append('idIncidente', createdForm?.idIncidente || idIncidente || '');
                fdLic.append('categoria', getCategoriaGeneral('Tercero'));
                fdLic.append('idTipoDocumento', tipoDocumentoIds.licencia);
                console.log(`Subiendo licencia tercero ${terceroIdForLog}: ${ter.licenciaFile.name}`);
                await DocumentoServices.uploadDocument(fdLic);
              }

              // Otros archivos (varios)
              if (ter.otrosFiles && Array.isArray(ter.otrosFiles) && ter.otrosFiles.length > 0) {
                for (const ofile of ter.otrosFiles) {
                  const fdO = new FormData();
                  fdO.append('Archivo', ofile);
                  fdO.append('idIncidente', createdForm?.idIncidente || idIncidente || '');
                  fdO.append('categoria', getCategoriaGeneral('Tercero'));
                  // utilizar un tipo genérico (foto_danos) para archivos adicionales
                  fdO.append('idTipoDocumento', tipoDocumentoIds.foto_danos);
                  console.log(`Subiendo archivo tercero ${terceroIdForLog}: ${ofile.name}`);
                  await DocumentoServices.uploadDocument(fdO);
                }
              }
            } catch (uploadTerErr) {
              console.warn('Error subiendo archivos de tercero:', ter.rutTer || ter.nombreTer, uploadTerErr.response?.status, uploadTerErr.response?.data || uploadTerErr.message || uploadTerErr);
            }
          } catch (terErr) {
            console.warn('Error creando tercero:', ter.nombreTer, terErr);
          }
        }
      }


      // 5. Subir documentos organizados por categoría
      // idIncidente ya fue calculado justo después de crear el formulario
      console.log('idIncidente para documentos (backend):', idIncidente);

      // 5. Subir documentos individuales del conductor y DJ
      // Cédula Conductor
      if (cedulaFile) {
        const fd = new FormData();
        fd.append('Archivo', cedulaFile);
        fd.append('idIncidente', idIncidente);
        fd.append('categoria', getCategoriaGeneral('Conductor'));
        fd.append('idTipoDocumento', tipoDocumentoIds.cedula);
        try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn('Error cedula:', e); }
      }

      if (licenciaFile) {
        const fd = new FormData();
        fd.append('Archivo', licenciaFile);
        fd.append('idIncidente', idIncidente);
        fd.append('categoria', getCategoriaGeneral('Conductor'));
        fd.append('idTipoDocumento', tipoDocumentoIds.licencia);
        try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn('Error licencia:', e); }
      }

      // Subir declaración jurada global (si se adjuntó). Usar mostrarDJ para cubrir casos donde el carrito contiene un incidente vehicular.
      if ((hayVehicular || mostrarDJ) && djFile) {
        const fd = new FormData();
        fd.append('Archivo', djFile);
        fd.append('idIncidente', idIncidente);
        // Es categoría vehicular ya que solo para incidentes vehiculares se solicita la declaración jurada
        fd.append('categoria', getCategoriaGeneral('Vehicular'));
        fd.append('idTipoDocumento', tipoDocumentoIds.declaracion_jurada);
        try {
          console.log(`Subiendo Declaración Jurada global filename=${djFile.name}`);
          await DocumentoServices.uploadDocument(fd);
        } catch (e) {
          console.warn('Error dj global:', e.response?.status, e.response?.data || e.message || e);
        }
      }

      // ── INCIDENTES DEL CARRITO (Archivos específicos de cada incidente) ──
      for (const inc of incidentesCarrito) {
        // Normaliza la categoría del incidente
        // const catLabel = getCategoriaGeneral(inc.categoria);

        // Fotos Daños
        if (inc.datos.fotosDanos) {
          for (const file of inc.datos.fotosDanos) {
            // Subida de Foto de daños
            // Input: <input type="file" ... /> (ubicación: incidentesCarrito.datos.fotosDanos)
            // Tipo de documento: foto_danos (id 4)
            const fd = new FormData();
            fd.append('Archivo', file);
            fd.append('idIncidente', idIncidente);
            //Se le asigna la categoria de Siniestro ya que esa categoria engloba todo esa informacion del incidente
            fd.append('categoria', getCategoriaGeneral('Siniestro'));
            fd.append('idTipoDocumento', tipoDocumentoIds.foto_danos);
            try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn('Error fotosDanos:', e); }
          }
        }

        // Declaración jurada por incidente (si existe archivo adjunto para este incidente en djFiles)
        if (djFiles && djFiles[inc.id]) {
          const dj = djFiles[inc.id];
          const fdDj = new FormData();
          fdDj.append('Archivo', dj);
          fdDj.append('idIncidente', idIncidente);
          fdDj.append('categoria', getCategoriaGeneral('Vehicular'));
          fdDj.append('idTipoDocumento', tipoDocumentoIds.declaracion_jurada);
          try {
            console.log(`Subiendo Declaración Jurada para incidente ${inc.id} filename=${dj.name}`);
            await DocumentoServices.uploadDocument(fdDj);
          } catch (e) {
            console.warn(`Error dj incidente ${inc.id}:`, e.response?.status, e.response?.data || e.message || e);
          }
        }

        // Fotos Lugar
        if (inc.datos.fotosLugar) {
          for (const file of inc.datos.fotosLugar) {
            // Subida de Foto del lugar
            // Input: <input type="file" ... /> (ubicación: incidentesCarrito.datos.fotosLugar)
            // Tipo de documento: foto_lugar (id 5)
            const fd = new FormData();
            fd.append('Archivo', file);
            fd.append('idIncidente', idIncidente);
            fd.append('categoria', getCategoriaGeneral('Siniestro'));
            fd.append('idTipoDocumento', tipoDocumentoIds.foto_lugar);
            try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn('Error fotosLugar:', e); }
          }
        }

        // Fotos Vehiculo
        if (inc.datos.fotosVehiculo) {
          for (const file of inc.datos.fotosVehiculo) {
            const fd = new FormData();
            fd.append('Archivo', file);
            fd.append('idIncidente', idIncidente);
            fd.append('categoria', getCategoriaGeneral('Vehiculo'));
            fd.append('idTipoDocumento', tipoDocumentoIds.documento_vehiculo);
            try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn('Error fotosVehiculo:', e); }
          }
        }

        // Panorámicas
        if (inc.datos.fotosPanoramicas) {
          for (const [key, file] of Object.entries(inc.datos.fotosPanoramicas)) {
            if (file) {
              // Subida de Foto panorámica
              // Input: <input type="file" ... /> (ubicación: incidentesCarrito.datos.fotosPanoramicas)
              // Tipo de documento: panoramica_frontal (id 6) o panoramica_trasera (id 7)
              const fd = new FormData();
              fd.append('Archivo', file);
              fd.append('idIncidente', idIncidente);
              fd.append('categoria', getCategoriaGeneral('Siniestro'));

              // Determinar idTipoDocumento de forma robusta y con fallback
              let tipoId = tipoDocumentoIds[`panoramica_${key}`];
              if (!tipoId) {
                // Mapear claves internas a los tipos disponibles
                if (key === 'frente' || key === 'lateralIzq' || key === 'lateralDer') {
                  tipoId = tipoDocumentoIds.panoramica_frontal;
                } else if (key === 'trasera') {
                  tipoId = tipoDocumentoIds.panoramica_trasera;
                } else {
                  tipoId = tipoDocumentoIds.panoramica_frontal;
                }
              }
              fd.append('idTipoDocumento', tipoId);

              try {
                console.log(`Subiendo panorámica [${key}] tipoId=${tipoId} filename=${file.name}`);
                await DocumentoServices.uploadDocument(fd);
              } catch (e) {
                console.warn('Error panoramica:', e.response?.status, e.response?.data || e.message || e);
              }
            }
          }
        }

        // Carga
        if (esCategoriaDeCargas(inc.categoria)) {
          const docsCarga = [
            { file: inc.datos.docTracto, tipo: 'documento_tracto' },
            { file: inc.datos.docSemi, tipo: 'documento_semi' }
          ];

          for (const d of docsCarga) {
            if (d.file) {
              // Subida de documentos de carga y vehículo
              // Input: <input type="file" ... /> (ubicación: incidentesCarrito.datos.docTracto, docSemi, fotoCarga, docVehiculo)
              // Tipo de documento: documento_tracto (id 8), documento_semi (id 9), foto_carga (id 10), documento_vehiculo (id 11)
              const fd = new FormData();
              fd.append('Archivo', d.file);
              fd.append('idIncidente', idIncidente);
              fd.append('categoria', getCategoriaGeneral('Vehiculo'));
              fd.append('idTipoDocumento', tipoDocumentoIds[d.tipo]);
              try { await DocumentoServices.uploadDocument(fd); } catch (e) { console.warn(`Error ${d.tipo}:`, e); }
            }
          }

          // Subir foto de carga por separado como categoría Siniestro y tipo foto_carga
          if (inc.datos && inc.datos.fotoCarga) {
            try {
              const fdFoto = new FormData();
              fdFoto.append('Archivo', inc.datos.fotoCarga);
              fdFoto.append('idIncidente', idIncidente);
              fdFoto.append('categoria', getCategoriaGeneral('Siniestro'));
              fdFoto.append('idTipoDocumento', tipoDocumentoIds.foto_carga);
              await DocumentoServices.uploadDocument(fdFoto);
            } catch (e) {
              console.warn('Error foto_carga:', e);
            }
          }
        }
      }

      // Enviar notificación por correo
      try {
        const emailAdmin = "riquelmemati1904@gmail.com"; // Reemplazar con el correo real del administrador o leer de config
        const siniestroData = {
          descripcion: relato || "Sin descripción proporcionada"
        };
        await notificacionService.notificarNuevoSiniestro(emailAdmin, siniestroData);
      } catch (emailErr) {
        console.error("Error al enviar notificación por correo:", emailErr);
        // No bloqueamos el flujo principal si el correo falla
      }

      Swal.fire({
        icon: 'success',
        title: '¡Solicitud Enviada!',
        html: `Su formulario de incidente <strong>${generarIdIncidente(idIncidente)}</strong> ha sido enviado exitosamente.<br><br>Un administrador lo revisará a la brevedad.`,
        confirmButtonColor: '#045524'
      }).then(() => navigate(`/login`));
    } catch (err) {
      console.error('Error enviando formulario:', err);
      console.error('Respuesta del servidor:', JSON.stringify(err.response?.data, null, 2));
      console.error('Status:', err.response?.status);

      // Mostrar mensaje más detallado según el error
      let mensajeError = 'No se pudo enviar el formulario. Intente nuevamente.';
      if (err.response) {
        const status = err.response.status;
        const serverMsg = err.response.data?.message || err.response.data?.error || '';
        if (status === 400) {
          mensajeError = `Error en los datos del formulario: ${serverMsg || 'Verifique los campos e intente nuevamente.'}`;
        } else if (status === 401 || status === 403) {
          mensajeError = 'Su sesión ha expirado o no tiene permisos. Inicie sesión nuevamente.';
        } else if (status === 500) {
          mensajeError = `Error interno del servidor: ${serverMsg || 'Contacte al administrador.'}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        mensajeError = 'El servidor no respondió a tiempo. Intente nuevamente.';
      } else if (!err.response) {
        mensajeError = 'No se pudo conectar con el servidor. Verifique su conexión.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensajeError,
        confirmButtonColor: '#045524'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) return <div className="loading-container">Cargando formulario...</div>;

  // ═══════════════════════════════════════════
  // ── RENDER ──
  // ═══════════════════════════════════════════
  return (
    <div className="formulario-page-wrapper">
      <BackButton />
      <div className="formulario-card">

        {/* ══════ Header con Logo ══════ */}
        <div className="form-top-header">
          <div className="form-header-content">
            <img src={logoImg} alt="Logo" className="form-header-logo" />
            <div className="form-header-text">
              <h1>Sistema de Registro de Siniestros</h1>
              <p>Gestión de Incidentes y Documentación</p>
            </div>
          </div>
        </div>

        {/* ══════ Stepper ══════ */}
        <div className="wizard-stepper">
          {['Datos Iniciales', 'Tipo Incidente', 'Documentación', 'Revisión'].map((label, i) => (
            <React.Fragment key={i}>
              <div className={`step-item ${currentStep === i + 1 ? 'active' : ''} ${currentStep > i + 1 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {currentStep > i + 1 ? <BsCheckLg /> : i + 1}
                </div>
                <span className="step-label">{label}</span>
                {currentStep === i + 1 && <span className="step-progress-text">Paso {currentStep} de 4</span>}
              </div>
              {i < 3 && <div className={`step-line ${currentStep > i + 1 ? 'completed' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="form-content-animator" key={currentStep}>

          {/* ══════════════════════════════════════════════
            Step 1: Datos Iniciales
        ══════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="form-body" key="step1">

              {/* ── Datos del Conductor ── */}
              <div className="form-section-card" style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1f2937' }}>
                <div className="section-title">
                  <div className="section-title-icon"><BsPersonFill /></div>
                  <h3>Datos del Colaborador</h3>
                </div>
                <div className="fields-grid">
                  <div className="field-group">
                    <label>RUT del Colaborador <span className="req">*</span></label>
                    <div className="input-with-button">
                      <input
                        type="text"
                        value={conductor.rut}
                        onChange={e => {
                          const valor = e.target.value.replace(/[^0-9kK]/g, '');
                          setConductor({ ...conductor, rut: formatearRut(valor) });
                          setConductorFound(false);
                        }}
                        placeholder="12.345.678-9"
                        className={conductorFound ? 'input-success' : ''}
                      />
                      <button type="button" className="btn-inline-search" onClick={handleRutSearch} disabled={searchingRut}>
                        {searchingRut ? '...' : <BsSearch />}
                      </button>
                    </div>
                    <p className="field-hint">Ingrese el RUT y presione buscar para autocompletar</p>
                  </div>
                  <div className="field-group">
                    <label>Nombre del Colaborador <span className="req">*</span></label>
                    <input
                      type="text"
                      value={conductor.nombre}
                      onChange={e => setConductor({ ...conductor, nombre: e.target.value })}
                      placeholder="Ingrese nombre completo"
                      readOnly={conductorFound}
                      className={conductorFound ? 'input-success' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* ── Datos del Vehículo ── */}
              <div className="form-section-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '18px', fontSize: '0.95rem', lineHeight: 1.6, color: '#1f2937' }}>
                <div className="section-title">
                  <div className="section-title-icon"><BsTruckFlatbed /></div>
                  <h3>Datos del Vehículo</h3>
                </div>

                <div className="field-group">
                  <label>¿El incidente involucra vehículo?</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="involucraVehiculo"
                        value="si"
                        checked={involucraVehiculo === true}
                        onChange={() => setInvolucraVehiculo(true)}
                      />
                      Sí
                    </label>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="involucraVehiculo"
                        value="no"
                        checked={involucraVehiculo === false}
                        onChange={() => {
                          setInvolucraVehiculo(false);
                          // Limpiar sólo los campos específicos de vehículo, mantener base/operación
                          setTipoVehiculo('');
                          setPatenteSearch('');
                          setPatenteSuggestions([]);
                          setShowPatenteSuggestions(false);
                          setSelectedVehiculo(null);
                          setPatentes({ tracto: '', semi: '', vehiculo: '' });
                          setVehiculosCarrito([]);
                        }}
                      />
                      No
                    </label>
                  </div>
                </div>

                {involucraVehiculo && (
                  <>
                    {/* Búsqueda por patente */}
                    <div className="field-group" style={{ marginBottom: 20, position: 'relative' }}>
                      <label>Buscar por Patente <BsSearch style={{ color: '#045524', marginLeft: 6 }} /></label>
                      <input
                        type="text"
                        value={patenteSearch}
                        onChange={e => handlePatenteSearch(e.target.value)}
                        onFocus={() => { if (patenteSuggestions.length > 0) setShowPatenteSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowPatenteSuggestions(false), 200)}
                        placeholder="Escriba la patente para buscar..."
                        className={selectedVehiculo ? 'input-success' : ''}
                      />
                      {showPatenteSuggestions && (
                        <div className="patente-suggestions">
                          {patenteSuggestions.map((veh, idx) => (
                            <div key={idx} className="patente-suggestion-item" onMouseDown={() => selectVehiculo(veh)}>
                              <strong>{veh.patente}</strong>
                              <span>{veh.marca} {veh.modelo} ({veh.anio || '-'})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedVehiculo && (
                        <div className="autocomplete-badge">
                          <BsCheckLg /> Vehículo seleccionado: <strong>{selectedVehiculo.patente}</strong> — {selectedVehiculo.marca} {selectedVehiculo.modelo}
                          <button type="button" className="badge-clear" onClick={() => { setSelectedVehiculo(null); setPatenteSearch(''); setTipoVehiculo(''); }}>
                            <BsXLg />
                          </button>
                        </div>
                      )}
                      <p className="field-hint">Mientras escribe, se mostrarán las coincidencias de la base de datos

                      </p>
                    </div>

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* ── CARRITO DE VEHÍCULOS: UI ── */}
                    {/* ══════════════════════════════════════════════════════════════ */}

                    {vehiculosCarrito.length > 0 && (
                      <div className="vehiculos-carrito-container" style={{
                        marginTop: 20,
                        padding: 20,
                        backgroundColor: '#F8FAF9',
                        borderRadius: 12,
                        border: '2px solid # rgba(4, 85, 36, 0.1)'
                      }}>
                        <h4 style={{
                          fontSize: '1rem',
                          marginBottom: 16,
                          color: '#045524',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <BsTruck /> Vehículos Agregados ({vehiculosCarrito.length}/{MAX_VEHICULOS})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {vehiculosCarrito.map((veh) => {
                            const tipoLabel = tiposVehiculo.find(t =>
                              String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(veh.tipoVehiculo)
                            )?.tipo_vehiculo ?? tiposVehiculo.find(t =>
                              String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(veh.tipoVehiculo)
                            )?.tipoVehiculo ?? '-';
                            const baseLabel = bases.find(b =>
                              String(b.id_base ?? b.idBase) === String(veh.base)
                            )?.nombre ?? '-';
                            const operacionLabel = operaciones.find(o =>
                              String(o.id_operacion ?? o.idOperacion) === String(veh.operacion)
                            )?.nombre ?? '-';

                            return (
                              <div key={veh.id} style={{
                                backgroundColor: '#f0fdf4',
                                padding: 16,
                                borderRadius: 8,
                                border: '1px solid #d1fae5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    color: '#045524',
                                    marginBottom: 6
                                  }}>
                                    {veh.patente}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    <strong>Tipo:</strong> {tipoLabel} |
                                    <strong> Base:</strong> {baseLabel} |
                                    <strong> Operación:</strong> {operacionLabel}
                                  </div>
                                  {veh.vehiculoData && (
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                                      {veh.vehiculoData.marca} {veh.vehiculoData.modelo} ({veh.vehiculoData.anio || '-'})
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeVehicleFromCarrito(veh.id)}
                                  style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                  }}
                                >
                                  <BsTrashFill /> Eliminar
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {/* Campos: Tipo / Base / Operación (cuando aplica) */}
                    <div className="fields-grid">
                      <div className="field-group">
                        <label>Tipo de Vehículo</label>
                        <select value={tipoVehiculo} onChange={e => setTipoVehiculo(e.target.value)}>
                          <option value="">Seleccione un tipo...</option>
                          {tiposVehiculo.map((tv, idx) => {
                            const id = tv.id_tipo_vehiculo ?? tv.idTipoVehiculo;
                            const label = tv.tipo_vehiculo ?? tv.tipoVehiculo ?? '-';
                            return <option key={id ?? `tv-${idx}`} value={String(id ?? '')}>{label}</option>;
                          })}
                        </select>
                      </div>

                      <div className="field-group">
                        <label>Base <span className="req">*</span></label>
                        <select value={base} onChange={e => { setBase(e.target.value); setOperacion(''); }}>
                          <option value="">Seleccione una base</option>
                          {bases.map((b, idx) => {
                            const id = b.id_base ?? b.idBase;
                            const label = b.nombre ?? '-';
                            return <option key={id ?? `base-${idx}`} value={String(id ?? '')}>{label}</option>;
                          })}
                        </select>
                      </div>

                      <div className="field-group">
                        <label>Operación <span className="req">*</span></label>
                        <select value={operacion} onChange={e => setOperacion(e.target.value)} disabled={!base}>
                          <option value="">{base ? 'Seleccione operación' : 'Primero seleccione una base'}</option>
                          {operacionesFiltradas.map((op, idx) => {
                            const id = op.id_operacion ?? op.idOperacion;
                            const label = op.nombre ?? '-';
                            return <option key={id ?? `op-${idx}`} value={String(id ?? '')}>{label}</option>;
                          })}
                        </select>
                      </div>

                    </div>

                    {/* Botón para agregar vehículo (cuando aplica) */}
                    <div style={{ marginTop: 16 }}>
                      <button
                        type="button"
                        onClick={addVehicleToCarrito}
                        disabled={vehiculosCarrito.length >= MAX_VEHICULOS}
                        style={{
                          backgroundColor: vehiculosCarrito.length >= MAX_VEHICULOS ? '#94a3b8' : '#045524',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 18px',
                          minHeight: 42,
                          cursor: vehiculosCarrito.length >= MAX_VEHICULOS ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '0.95rem',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                      >
                        <BsPlusLg /> {vehiculosCarrito.length >= MAX_VEHICULOS ? 'Máximo alcanzado' : 'Agregar Vehículo'}
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Cuando el incidente NO involucra vehículo, mostrar una card separada para Base/Operación */}
              {!involucraVehiculo && (
                <div className="form-section-card" style={{ marginTop: 12 }}>
                  <div className="section-title">
                    <div className="section-title-icon"><BsFuelPump /></div>
                    <h3>Base y Operación </h3>
                  </div>
                  <div className="fields-grid">
                    <div className="field-group">
                      <label>Base <span className="req">*</span></label>
                      <select value={base} onChange={e => { setBase(e.target.value); setOperacion(''); }}>
                        <option value="">Seleccione una base</option>
                        {bases.map((b, idx) => {
                          const id = b.id_base ?? b.idBase;
                          const label = b.nombre ?? '-';
                          return <option key={id ?? `base-${idx}`} value={String(id ?? '')}>{label}</option>;
                        })}
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Operación <span className="req">*</span></label>
                      <select value={operacion} onChange={e => setOperacion(e.target.value)} disabled={!base}>
                        <option value="">{base ? 'Seleccione operación' : 'Primero seleccione una base'}</option>
                        {operacionesFiltradas.map((op, idx) => {
                          const id = op.id_operacion ?? op.idOperacion;
                          const label = op.nombre ?? '-';
                          return <option key={id ?? `op-${idx}`} value={String(id ?? '')}>{label}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}


              {/* ── Fecha y Hora ── */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsCalendarEventFill /></div>
                  <h3>Fecha y Hora del Siniestro</h3>
                </div>
                <div className="fields-grid">
                  <div className="field-group">
                    <label>Fecha del Siniestro <span className="req">*</span></label>
                    <input type="date" value={fechaSiniestro} onChange={e => setFechaSiniestro(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Hora del Siniestro <span className="req">*</span></label>
                    <input type="time" value={horaSiniestro} onChange={e => setHoraSiniestro(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ── Ubicación del Siniestro ── */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsGeoFill /></div>
                  <h3>Ubicación del Siniestro</h3>
                </div>
                <div className="fields-grid">
                  <div className="field-group">
                    <label>País <span className="req">*</span></label>
                    <select value={selectedPais} onChange={e => setSelectedPais(e.target.value)}>
                      <option value="">Seleccione país</option>
                      {paises.map(p => (
                        <option key={p.idPais ?? p.id_pais} value={p.idPais ?? p.id_pais}>{p.nombrePais ?? p.nombre_pais}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Región <span className="req">*</span></label>
                    <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} disabled={!selectedPais}>
                      <option value="">{selectedPais ? 'Seleccione región' : 'Primero seleccione país'}</option>
                      {regionesFiltradas.map(r => (
                        <option key={r.idReg} value={r.idReg}>{r.nombreReg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Comuna <span className="req">*</span></label>
                    <select value={selectedComuna} onChange={e => setSelectedComuna(e.target.value)} disabled={!selectedRegion}>
                      <option value="">{selectedRegion ? 'Seleccione comuna' : 'Primero seleccione región'}</option>
                      {comunasFiltradas.map(c => (
                        <option key={c.idComuna} value={c.idComuna}>{c.nombreComuna}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Ubicación Siniestro <span className="req">*</span></label>
                    <input type="text" value={ubicacionSiniestro} onChange={e => setUbicacionSiniestro(e.target.value)} placeholder="Dirección, calle, referencias" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            Step 2: Tipo de Incidente
        ══════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="form-body" key="step2">

              {/* Tipo de Incidente */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsExclamationTriangleFill /></div>
                  <h3>Tipo de Incidente</h3>
                </div>
                <div className="guide-box">
                  <h4><BsInfoCircleFill /> Guía para seleccionar el tipo de incidente:</h4>
                  <p><strong>Incidente Vehicular:</strong> Colisiones, volcamientos, atropellos, daños a infraestructura</p>
                  <p><strong>Incidente de Carga:</strong> Pérdida de carga, daño a mercancía, robo de carga</p>
                  <p><strong>Incidente Persona:</strong> Responsabilidad civil, accidentes personales</p>
                </div>
                <div className="field-group">
                  <label>Seleccione el tipo de incidente <span className="req">*</span></label>
                  <Form.Select
                    value={tipoIncidenteSeleccionado}
                    onChange={e => setTipoIncidenteSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione el tipo de incidente..</option>
                    {tiposIncidente.map(t => (
                      <option key={t.idTipoIncidente} value={t.idTipoIncidente}>{t.nombreTipoIncidente}</option>
                    ))}
                  </Form.Select>
                </div>

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ── DETALLE Y AGREGADO DE INCIDENTE SEGÚN CATEGORÍA ── */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {tipoIncidenteSeleccionado && (() => {
                  const tipoObj = tiposIncidente.find(t => String(t.idTipoIncidente) === String(tipoIncidenteSeleccionado));
                  const categoria = (tipoObj?.categoria || '').toString().trim().toLowerCase();
                  if (categoria === 'incidente vehicular' || categoria === 'vehicular') {
                    return (
                      <div className="form-section-card" style={{ marginTop: 20 }}>
                        <div className="section-title">
                          <div className="section-title-icon"><BootstrapCarIcon /></div>
                          <h3>Detalles del Incidente Vehicular</h3>
                        </div>
                        {/* Aparatado de subir documentacion del vehiculo ya sea jpg , png y pdf */}
                        <div className="field-group" style={{ marginBottom: 16 }}>
                          <label>Documentación del vehículo <span className="req">*</span></label>
                          <div className={`upload-zone ${fotosVehiculo.length > 0 ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsFileTextFill /></div>
                            <p>Arrastre o haga click para subir documentos del vehículo</p>
                            <small>PNG, JPG, PDF hasta 10MB</small>
                            <input type="file" accept="image/*,application/pdf" multiple onChange={e => setFotosVehiculo([...e.target.files])} />
                            {fotosVehiculo.length > 0 && <div className="upload-file-name"><BsCheckAll /> {fotosVehiculo.length} archivo(s) seleccionado(s)</div>}
                          </div>
                        </div>
                        <div className="field-group" style={{ marginBottom: 16 }}>
                          <label>Fotos de los daños <span className="req">*</span></label>
                          <div className={`upload-zone ${fotosDanos.length > 0 ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsImageFill /></div>
                            <p>Arrastre o haga click para subir fotos de daños</p>
                            <small>PNG, JPG, PDF hasta 10MB</small>
                            <input type="file" accept="image/*,application/pdf" multiple onChange={e => setFotosDanos([...e.target.files])} />
                            {fotosDanos.length > 0 && <div className="upload-file-name"><BsCheckAll /> {fotosDanos.length} foto(s) seleccionada(s)</div>}
                          </div>
                        </div>
                        <div className="field-group" style={{ marginBottom: 16 }}>
                          <label>Fotos del lugar del incidente</label>
                          <div className={`upload-zone ${fotosLugar.length > 0 ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsGeoAltFill /></div>
                            <p>Arrastre o haga click para subir fotos del lugar</p>
                            <input type="file" accept="image/*" multiple onChange={e => setFotosLugar([...e.target.files])} />
                            {fotosLugar.length > 0 && <div className="upload-file-name"><BsCheckAll /> {fotosLugar.length} foto(s) seleccionada(s)</div>}
                          </div>
                        </div>
                        <div className="field-group" style={{ marginBottom: 16 }}>
                          <label>Fotos panorámicas del vehículo (4 ángulos) <span className="req">*</span></label>
                          <div className="panoramic-grid">
                            {[
                              { key: 'frente', label: 'Frente', icon: '↑' },
                              { key: 'trasera', label: 'Trasera', icon: '↓' },
                              { key: 'lateralIzq', label: 'Lateral Izq.', icon: '←' },
                              { key: 'lateralDer', label: 'Lateral Der.', icon: '→' }
                            ].map(p => (
                              <div key={p.key} className={`panoramic-item ${fotosPanoramicas[p.key] ? 'has-file' : ''}`}>
                                <div className="panoramic-label">{p.label}</div>
                                <div className="panoramic-icon">{fotosPanoramicas[p.key] ? <BsCheckAll /> : p.icon}</div>
                                <input type="file" accept="image/*" onChange={e => {
                                  if (e.target.files[0]) setFotosPanoramicas({ ...fotosPanoramicas, [p.key]: e.target.files[0] });
                                }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            marginTop: 16,
                            backgroundColor: '#f26928', // Naranja para el botón de agregar incidente
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            justifyContent: 'center',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 6px 15px rgba(242, 105, 40, 0.25)'
                          }}
                          onClick={addIncidenteToCarrito}
                        >
                          <BsPlusLg /> Agregar Incidente Vehicular
                        </button>
                      </div>
                    );
                  }
                  if (esCategoriaDeCargas(categoria)) {
                    // Determinar tipos de vehículos en el carrito
                    const tiposVehiculosCarrito = vehiculosCarrito.map(v => {
                      const tipo = tiposVehiculo.find(t => String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(v.tipoVehiculo));
                      return (tipo?.tipo_vehiculo ?? tipo?.tipoVehiculo ?? '').toLowerCase();
                    });
                    const tieneTracto = tiposVehiculosCarrito.some(tipo => tipo.includes('tracto'));
                    const tieneSemi = tiposVehiculosCarrito.some(tipo => tipo.includes('semirremolque'));
                    const soloUnVehiculo = vehiculosCarrito.length === 1;
                    const esVehiculoEspecial = tieneTracto && tieneSemi && vehiculosCarrito.length === 2;
                    const esUnVehiculoNoEspecial = soloUnVehiculo && !tiposVehiculosCarrito[0]?.includes('tracto') && !tiposVehiculosCarrito[0]?.includes('semirremolque');

                    return (
                      <div className="form-section-card" style={{ marginTop: 20 }}>
                        <div className="section-title">
                          <div className="section-title-icon"><BsBoxSeamFill /></div>
                          <h3>Detalles del Incidente de Carga</h3>
                        </div>
                        <div className="fields-grid" style={{ marginBottom: 16 }}>
                          {/* Mostrar documentos tracto y semirremolque solo si ambos están presentes */}
                          {esVehiculoEspecial && (
                            <>
                              <div className="field-group">
                                <label>Documento Tracto</label>
                                <div className={`upload-zone ${docTracto ? 'has-file' : ''}`} style={{ padding: '16px 12px' }}>
                                  <div className="upload-zone-icon"><BsFileEarmarkTextFill /></div>
                                  <p>Subir documento</p>
                                  <input type="file" accept=".pdf,image/*" onChange={e => setDocTracto(e.target.files[0] || null)} />
                                  {docTracto && <div className="upload-file-name"><BsCheckLg /> {docTracto.name}</div>}
                                </div>
                              </div>
                              <div className="field-group">
                                <label>Documento Semiremolque</label>
                                <div className={`upload-zone ${docSemi ? 'has-file' : ''}`} style={{ padding: '16px 12px' }}>
                                  <div className="upload-zone-icon"><BsFileEarmarkTextFill /></div>
                                  <p>Subir documento</p>
                                  <input type="file" accept=".pdf,image/*" onChange={e => setDocSemi(e.target.files[0] || null)} />
                                  {docSemi && <div className="upload-file-name"><BsCheckLg /> {docSemi.name}</div>}
                                </div>
                              </div>
                            </>
                          )}
                          {/* Si es un solo vehículo y no es tracto/semirremolque, mostrar solo documento del vehículo */}
                          {esUnVehiculoNoEspecial && (
                            <div className="field-group">
                              <label>Documento del vehículo</label>
                              <div className={`upload-zone ${docTracto ? 'has-file' : ''}`} style={{ padding: '20px', width: '100%' }}>
                                <div className="upload-zone-icon"><BsFileEarmarkTextFill /></div>
                                <p>Subir documento</p>
                                <input type="file" accept=".pdf,image/*" onChange={e => setDocTracto(e.target.files[0] || null)} />
                                {docTracto && <div className="upload-file-name"><BsCheckLg /> {docTracto.name}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="field-group" style={{ marginBottom: 16 }}>
                          <label>Fotografía de la unidad de carga <span className="req">*</span></label>
                          <div className={`upload-zone ${fotoCarga ? 'has-file' : ''}`} style={{ borderColor: '#0bf57c' }}>
                            <div className="upload-zone-icon"><BsImageFill /></div>
                            <p>Subir foto de la carga</p>
                            <input type="file" accept="image/*" onChange={e => setFotoCarga(e.target.files[0] || null)} />
                            {fotoCarga && <div className="upload-file-name"><BsCheckLg /> {fotoCarga.name}</div>}
                          </div>
                        </div>
                        <div className="section-title" style={{ marginTop: 10 }}>
                          <h3 style={{ fontSize: '.85rem' }}>Datos del Transporte</h3>
                        </div>
                        <div className="fields-grid">
                          <div className="field-group">
                            <label>Lugar donde cargó <span className="req">*</span></label>
                            <input 
                              type="text" 
                              value={lugarCarga} 
                              onChange={e => setLugarCarga(e.target.value)} 
                              placeholder="Dirección o ubicación de carga" 
                              required={hayCarga}
                            />
                          </div>
                          <div className="field-group">
                            <label>Fecha y hora de inicio del transporte <span className="req">*</span></label>
                            <input 
                              type="datetime-local" 
                              value={fechaIniTransporte} 
                              onChange={e => setFechaIniTransporte(e.target.value)} 
                              required={hayCarga}
                            />
                          </div>
                          <div className="field-group field-full">
                            <label>Lugar donde se debía realizar la entrega <span className="req">*</span></label>
                            <input 
                              type="text" 
                              value={destinoCarga} 
                              onChange={e => setDestinoCarga(e.target.value)} 
                              placeholder="Dirección de destino" 
                              required={hayCarga}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className='btn-add-inc'
                          onClick={addIncidenteToCarrito}
                        >
                          <BsPlusLg /> Agregar Incidente de Carga
                        </button>
                      </div>
                    );
                  }
                  if (categoria === 'incidente persona' || categoria === 'persona') {
                    return (
                      <div className="form-section-card" style={{ marginTop: 20 }}>
                        <div className="section-title">
                          <div className="section-title-icon"><BsPeopleFill /></div>
                          <h3>Detalles del Incidente Persona</h3>
                        </div>
                        <div className="alert-box-info" style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 16,
                          fontSize: '0.9rem',
                          color: '#92400e'
                        }}>
                          Este tipo de incidente se enfoca en la cobertura de riesgos a personas. Seleccione "Agregar" para confirmar e incluirlo en su declaración.
                        </div>
                        <button
                          type="button"
                          className="btn-add-inc"
                          onClick={addIncidenteToCarrito}
                        >
                          <BsPlusLg /> Agregar Incidente Persona
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ── CARRITO DE INCIDENTES: UI ── */}
                {/* ══════════════════════════════════════════════════════════════ */}


                {incidentesCarrito.length > 0 && (
                  <div className="incidentes-carrito-container" style={{
                    marginTop: 20,
                    padding: 20,
                    backgroundColor: '#F8FAF9', // Contenedor del carrito
                    borderRadius: 12,
                    border: '2px solid rgba(4, 85, 36, 0.10)', // Borde más visible en verde
                    boxShadow: '0 2px 8px rgba(4,85,36,0.08)'
                  }}>
                    <h4 style={{
                      fontSize: '1rem',
                      marginBottom: 16,
                      color: '#045524',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <BsExclamationTriangleFill /> Incidentes Registrados ({incidentesCarrito.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {currentStep === 2 && incidentesCarrito.map((inc) => (
                        <div key={inc.id} style={{
                          backgroundColor: '#f6fef8',
                          padding: 16,
                          borderRadius: 8,
                          border: '1.5px solid #045524'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12
                          }}>
                            <div>
                              <div style={{
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                color: '#045524'
                              }}>
                                {inc.categoria === 'Incidente Vehicular' ? '' : ''} {inc.nombreTipo}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#3b6650' }}>
                                Categoría: <strong>
                                  {inc.categoria === 'Incidente Vehicular' ? 'Vehicular' :
                                    inc.categoria === 'Incidente de Carga' ? 'Carga' :
                                      inc.categoria === 'Incidente Persona' ? 'Persona' : inc.categoria}
                                </strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeIncidenteFromCarrito(inc.id)}
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <BsTrashFill /> Eliminar
                            </button>
                          </div>

                          {/* Mostrar y editar campos específicos de incidentes de carga */}
                          {inc.categoria.toLowerCase().includes('carga') && (
                            <div style={{
                              marginTop: 16,
                              paddingTop: 12,
                              borderTop: '1px solid #c8d8ce'
                            }}>
                              <div style={{ marginBottom: 8, fontWeight: 600, color: '#045524', fontSize: '0.85rem' }}>
                                📦 Datos de Transporte de Carga:
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                  <label style={{ fontSize: '0.75rem', color: '#5a6b60', display: 'block', marginBottom: 4 }}>
                                    Lugar donde cargó:
                                  </label>
                                  <input
                                    type="text"
                                    value={inc.datos.lugarCarga || ''}
                                    onChange={(e) => updateIncidenteDatos(inc.id, 'lugarCarga', e.target.value)}
                                    placeholder="Dirección de carga"
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      border: '1px solid #c8d8ce',
                                      borderRadius: 6,
                                      fontSize: '0.85rem'
                                    }}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#5a6b60', display: 'block', marginBottom: 4 }}>
                                      Fecha/hora inicio transporte:
                                    </label>
                                    <input
                                      type="datetime-local"
                                      value={inc.datos.fechaIniTransporte || ''}
                                      onChange={(e) => updateIncidenteDatos(inc.id, 'fechaIniTransporte', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #c8d8ce',
                                        borderRadius: 6,
                                        fontSize: '0.85rem'
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', color: '#5a6b60', display: 'block', marginBottom: 4 }}>
                                      Destino de entrega:
                                    </label>
                                    <input
                                      type="text"
                                      value={inc.datos.destinoCarga || ''}
                                      onChange={(e) => updateIncidenteDatos(inc.id, 'destinoCarga', e.target.value)}
                                      placeholder="Dirección de destino"
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #c8d8ce',
                                        borderRadius: 6,
                                        fontSize: '0.85rem'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Terceros Involucrados ── */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsPeopleFill /></div>
                  <h3>Terceros Involucrados</h3>
                </div>

                <div className="terceros-toggle">
                  <span className="terceros-toggle-label">¿Hay terceros involucrados? <span className="req">*</span></span>
                  <div className="toggle-buttons">
                    <button
                      type="button"
                      className={`toggle-btn ${hayTerceros ? 'toggle-btn-active' : ''}`}
                      onClick={() => {
                        setHayTerceros(true);
                        setShowTerceroForm(true);
                      }}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${!hayTerceros ? 'toggle-btn-active toggle-btn-no' : ''}`}
                      onClick={() => setHayTerceros(false)}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hayTerceros && (
                  <>
                    {terceros.length > 0 && (
                      <div className="terceros-list">
                        <h4 className="terceros-list-title">Terceros Registrados ({terceros.length})</h4>
                        {terceros.map((ter, i) => (
                          <div className="tercero-list-item" key={i}>
                            <div className="tercero-list-info">
                              <span className="tercero-list-name"><BsPersonFill /> {ter.nombreTer}</span>
                              <span className="tercero-list-rut">RUT: {ter.rutTer}</span>
                              <span className="tercero-list-phone"><BsTelephoneFill /> {ter.telefonoTer}</span>
                            </div>
                            <button type="button" className="btn-remove-tercero" onClick={() => removeTercero(i)}>
                              <BsTrashFill /> Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showTerceroForm ? (
                      <div className="tercero-form-card">
                        <h4 className="tercero-form-title"><BsPlusLg /> Agregar Nuevo Tercero</h4>
                        <div className="fields-grid">
                          <div className="field-group">
                            <label>RUT <span className="req">*</span></label>
                            <input type="text" value={terceroForm.rutTer} onChange={e => setTerceroForm({ ...terceroForm, rutTer: e.target.value })} placeholder="12.345.678-9" />
                          </div>
                          <div className="field-group">
                            <label>Nombre Completo <span className="req">*</span></label>
                            <input type="text" value={terceroForm.nombreTer} onChange={e => setTerceroForm({ ...terceroForm, nombreTer: e.target.value })} placeholder="Nombre del tercero" />
                          </div>
                          <div className="field-group">
                            <label>Teléfono <span className="req">*</span></label>
                            <input type="tel" value={terceroForm.telefonoTer} onChange={e => setTerceroForm({ ...terceroForm, telefonoTer: e.target.value })} placeholder="+56 9 1234 5678" />
                          </div>
                          <div className="field-group">
                            <label>Correo Electrónico</label>
                            <input type="email" value={terceroForm.emailTer} onChange={e => setTerceroForm({ ...terceroForm, emailTer: e.target.value })} placeholder="correo@ejemplo.com" />
                          </div>
                          <div className="field-group field-full">
                            <label>Compañía Aseguradora</label>
                            <input type="text" value={terceroForm.aseguradoraTer} onChange={e => setTerceroForm({ ...terceroForm, aseguradoraTer: e.target.value })} placeholder="Nombre de la aseguradora" />
                          </div>
                        </div>

                        <div className='field-group'>
                          <label>Carnet de Identidad (Adjunto)</label>
                          <div className={`upload-zone ${terceroForm.carnetFile ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsPersonBadgeFill /></div>
                            <p>Subir Carnet de Identidad</p>
                            <small>PDF o imagen</small>
                            <input type="file" accept=".pdf,image/*" onChange={e => setTerceroForm({ ...terceroForm, carnetFile: e.target.files[0] || null })} />
                            {terceroForm.carnetFile && <div className="upload-file-name"><BsCheckLg /> {terceroForm.carnetFile.name}</div>}
                          </div>
                        </div>

                        <div className='field-group'>
                          <label>Licencia de Conducir (Adjunto)</label>
                          <div className={`upload-zone ${terceroForm.licenciaFile ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsFileEarmarkTextFill /></div>
                            <p>Subir Licencia de Conducir</p>
                            <small>PDF o imagen</small>
                            <input type="file" accept=".pdf,image/*" onChange={e => setTerceroForm({ ...terceroForm, licenciaFile: e.target.files[0] || null })} />
                            {terceroForm.licenciaFile && <div className="upload-file-name"><BsCheckLg /> {terceroForm.licenciaFile.name}</div>}
                          </div>
                        </div>

                        <div className='field-group'>
                          <label>Otros Documentos (Adjunto)</label>
                          <div className={`upload-zone ${terceroForm.otrosFiles && terceroForm.otrosFiles.length > 0 ? 'has-file' : ''}`}>
                            <div className="upload-zone-icon"><BsFolderFill /></div>
                            <p>Subir otros documentos</p>
                            <small>PDF o imagen (puede seleccionar varios)</small>
                            <input type="file" accept=".pdf,image/*" onChange={e => setTerceroForm({ ...terceroForm, otrosFiles: Array.from(e.target.files) || [] })} multiple />
                            {terceroForm.otrosFiles && terceroForm.otrosFiles.length > 0 && (
                              <div className="upload-file-name">
                                <BsCheckLg /> {terceroForm.otrosFiles.length} archivo(s) seleccionado(s)
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button type="button" className="btn-add-tercero" onClick={addTercero} style={{ flex: 1 }}>
                            <BsPlusLg /> Agregar Tercero
                          </button>
                          {terceros.length > 0 && (
                            <button
                              type="button"
                              className="btn-cancel-tercero"
                              onClick={() => setShowTerceroForm(false)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-show-tercero-form"
                        onClick={() => setShowTerceroForm(true)}
                      >
                        <BsPlusLg /> Agregar {terceros.length > 0 ? 'otro' : ''} tercero involucrado
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* ── Relato ── */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsPencilSquare /></div>
                  <h3>Relato o Descripción del Suceso</h3>
                </div>
                <div className="field-group">
                  <textarea value={relato} onChange={e => setRelato(e.target.value)} rows="6"
                    placeholder="Describa detalladamente cómo ocurrió el incidente, incluyendo circunstancias, condiciones climáticas, testigos, etc."
                    maxLength={500}
                  ></textarea>
                  <p className="field-hint">Mínimo 50 caracteres recomendados para una descripción completa ({relato.length}/500)</p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            Step 3: Documentación (Carga de Archivos por Categoría)
        ══════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="form-body" key="step3">
              {/* Documentos del Conductor */}
              <div className="form-section-card">
                <div className="section-title">
                  <div className="section-title-icon"><BsPersonBadgeFill /></div>
                  <h3>Documentos del Colaborador</h3>
                </div>
                <div className="fields-grid">
                  <div className="field-group">
                    <label>Cédula de Identidad <span className="req">*</span></label>
                    <div className={`upload-zone ${cedulaFile ? 'has-file' : ''}`}>
                      <div className="upload-zone-icon"><BsPersonBadgeFill /></div>
                      <p>Subir Cédula de Identidad</p>
                      <small>PDF o imagen</small>
                      <input type="file" accept=".pdf,image/*" onChange={e => setCedulaFile(e.target.files[0] || null)} />
                      {cedulaFile && <div className="upload-file-name"><BsCheckLg /> {cedulaFile.name}</div>}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Licencia de Conducir <span className="req">*</span></label>
                    <div className={`upload-zone ${licenciaFile ? 'has-file' : ''}`}>
                      <div className="upload-zone-icon"><BsFileEarmarkTextFill /></div>
                      <p>Subir Licencia de Conducir</p>
                      <small>PDF o imagen</small>
                      <input type="file" accept=".pdf,image/*" onChange={e => setLicenciaFile(e.target.files[0] || null)} />
                      {licenciaFile && <div className="upload-file-name"><BsCheckLg /> {licenciaFile.name}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Declaración Jurada: solo para incidente vehicular */}
              {mostrarDJ && (
                <div className="form-section-card">
                  <div className="section-title">
                    <div className="section-title-icon"><BsCheckSquareFill /></div>
                    <h3>Declaración Jurada</h3>
                  </div>

                  <div className="alert-box-warning" style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 20,
                    display: 'flex',
                    gap: 12
                  }}>
                    <div className="alert-icon" style={{ color: '#d97706', fontSize: '1.5rem' }}><BsExclamationTriangleFill /></div>
                    <div className="alert-content">
                      <strong style={{ color: '#92400e', display: 'block', marginBottom: 4 }}>Documento Obligatorio</strong>
                      <p style={{ color: '#b45309', fontSize: '0.9rem', margin: 0 }}>
                        La declaración jurada es obligatoria para poder enviar la solicitud. Por favor, descargue el documento, complételo y adjúntelo firmado.
                      </p>
                    </div>
                  </div>

                  {/* ENLACE PARA DESCARGAR EL FORMATO DE DECLARACIÓN JURADA */}
                  <a
                    href="#"
                    className="btn-download-pdf"
                    style={{
                      backgroundColor: '#334155',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      marginBottom: 24,
                      width: '100%'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      Swal.fire('Descarga', 'Se iniciará la descarga del formato de Declaración Jurada.', 'info');
                    }}
                  >
                    <BsDownload /> Descargar Declaración Jurada (PDF)
                  </a>

                  <div className="field-group">
                    <label>Adjuntar Declaración Jurada firmada <span className="req">*</span></label>
                    <div className={`upload-zone ${djFile ? 'has-file' : ''}`}>
                      <div className="upload-zone-icon"><BsCheckSquareFill /></div>
                      <p>Subir Declaración Jurada firmada</p>
                      <small>PDF o imagen escaneada</small>
                      <input type="file" accept=".pdf,image/*" onChange={e => setDjFile(e.target.files[0] || null)} required={hayVehicular} />
                      {djFile && <div className="upload-file-name"><BsCheckLg /> {djFile.name}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje informativo para incidentes de carga */}
              {hayCarga && incidentesCarrito.some(inc => inc.categoria.toLowerCase().includes('carga')) && (
                <div className="form-section-card">
                  <div className="alert-box-info" style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}>
                    <div className="alert-icon" style={{ color: '#2563eb', fontSize: '1.5rem' }}><BsInfoCircleFill /></div>
                    <div className="alert-content">
                      <strong style={{ color: '#1e40af', display: 'block', marginBottom: 4 }}>Incidente de Carga Detectado</strong>
                      <p style={{ color: '#1e3a8a', fontSize: '0.9rem', margin: 0 }}>
                        Se han detectado incidentes relacionados con transporte de carga. Asegúrese de completar todos los datos de transporte en el carrito de incidentes (lugar de carga, fecha de inicio y destino de entrega).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
            Step 4: Revisión
        ══════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="form-body" key="step4">

              {/* Contenedor: Datos del Conductor */}
              <div className="review-card">
                <div className="review-card-header">
                  <BsPersonFill /> Datos del Conductor
                </div>
                <div className="review-card-body">
                  <div className="review-row">
                    <div className="review-label">RUT</div>
                    <div className={`review-value ${!conductor.rut ? 'empty' : ''}`}>{conductor.rut || 'Sin datos'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Nombre</div>
                    <div className={`review-value ${!conductor.nombre ? 'empty' : ''}`}>{conductor.nombre || 'Sin datos'}</div>
                  </div>
                </div>
              </div>

              {/* Contenedor: Vehículos del Carrito */}
              {vehiculosCarrito.length > 0 && (
                <div className="review-card">
                  <div className="review-card-header">
                    <BsTruck /> Vehículos Registrados ({vehiculosCarrito.length})
                  </div>
                  <div className="review-card-body">
                    {vehiculosCarrito.map((veh, idx) => {
                      const tipoLabel = tiposVehiculo.find(t =>
                        String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(veh.tipoVehiculo)
                      )?.tipo_vehiculo ?? tiposVehiculo.find(t =>
                        String(t.id_tipo_vehiculo ?? t.idTipoVehiculo) === String(veh.tipoVehiculo)
                      )?.tipoVehiculo ?? '-';
                      const baseLabel = bases.find(b =>
                        String(b.id_base ?? b.idBase) === String(veh.base)
                      )?.nombre ?? '-';
                      const operacionLabel = operaciones.find(o =>
                        String(o.id_operacion ?? o.idOperacion) === String(veh.operacion)
                      )?.nombre ?? '-';

                      return (
                        <div key={veh.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx < vehiculosCarrito.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                          <div className="review-row">
                            <div className="review-label">Vehículo #{idx + 1}</div>
                            <div className="review-value"><strong>{veh.patente}</strong></div>
                          </div>
                          <div className="review-row">
                            <div className="review-label">Tipo</div>
                            <div className="review-value">{tipoLabel}</div>
                          </div>
                          <div className="review-row">
                            <div className="review-label">Base</div>
                            <div className="review-value">{baseLabel}</div>
                          </div>
                          <div className="review-row">
                            <div className="review-label">Operación</div>
                            <div className="review-value">{operacionLabel}</div>
                          </div>
                          {veh.vehiculoData && (
                            <div className="review-row">
                              <div className="review-label">Detalles</div>
                              <div className="review-value">{veh.vehiculoData.marca} {veh.vehiculoData.modelo} ({veh.vehiculoData.anio || '-'})</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contenedor: Datos del Incidente */}
              <div className="review-card">
                <div className="review-card-header">
                  <BsExclamationTriangleFill /> Datos del Incidente
                </div>
                <div className="review-card-body">
                  <div className="review-row">
                    <div className="review-label">Fecha</div>
                    <div className="review-value">{fechaSiniestro || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Hora</div>
                    <div className="review-value">{horaSiniestro || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">País</div>
                    <div className="review-value">{paises.find(p => String(p.idPais ?? p.id_pais) === String(selectedPais))?.nombrePais || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Región</div>
                    <div className="review-value">{regiones.find(r => String(r.idReg) === String(selectedRegion))?.nombreReg || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Comuna</div>
                    <div className="review-value">{comunasFiltradas.find(c => String(c.idComuna) === String(selectedComuna))?.nombreComuna || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Ubicación Siniestro</div>
                    <div className="review-value">{ubicacionSiniestro || '-'}</div>
                  </div>
                  <div className="review-row">
                    <div className="review-label">Terceros Involucrados</div>
                    <div className="review-value">{hayTerceros ? `Sí (${terceros.length})` : 'No'}</div>
                  </div>
                  <div className="review-row review-row-full">
                    <div className="review-label">Relato / Descripción</div>
                    <div className="review-value" style={{ whiteSpace: 'pre-wrap' }}>{relato || 'Sin relato'}</div>
                  </div>
                </div>
              </div>

              {/* Contenedor: Incidentes del Carrito */}
              {incidentesCarrito.length > 0 && (
                <div className="review-card">
                  <div className="review-card-header">
                    <BsExclamationTriangleFill /> Incidentes Registrados ({incidentesCarrito.length})
                  </div>
                  <div className="review-card-body">
                    {currentStep === 4 && incidentesCarrito.map((inc, idx) => (
                      <div key={inc.id} style={{
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottom: idx < incidentesCarrito.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <div className="review-row">
                          <div className="review-label">Incidente #{idx + 1}</div>
                          <div className="review-value">
                            <strong>{inc.nombreTipo}</strong>
                            <span style={{
                              marginLeft: 8,
                              fontSize: '0.85rem',
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: inc.categoria === 'Incidente Vehicular' ? '#dbeafe' : '#fef3c7',
                              color: inc.categoria === 'Incidente Vehicular' ? '#1e40af' : '#92400e'
                            }}>
                              {inc.categoria === 'Incidente Vehicular' ? 'Vehicular' :
                                inc.categoria === 'Incidente de Carga' ? 'Carga' :
                                  inc.categoria === 'Incidente Persona' ? 'Persona' : inc.categoria}
                            </span>
                          </div>
                        </div>
                        {inc.categoria === 'Incidente Vehicular' && (
                          <>
                            <div className="review-row">
                              <div className="review-label">Documentación</div>
                              <div className="review-value">{inc.datos.fotosVehiculo?.length || 0} archivo(s)</div>
                            </div>
                            <div className="review-row">
                              <div className="review-label">Fotos de daños</div>
                              <div className="review-value">{inc.datos.fotosDanos.length} archivo(s)</div>
                            </div>
                            <div className="review-row">
                              <div className="review-label">Fotos del lugar</div>
                              <div className="review-value">{inc.datos.fotosLugar.length} archivo(s)</div>
                            </div>
                            <div className="review-row">
                              <div className="review-label">Fotos panorámicas</div>
                              <div className="review-value">
                                {Object.values(inc.datos.fotosPanoramicas).filter(Boolean).length} de 4 ángulos
                              </div>
                            </div>
                          </>
                        )}
                        {inc.categoria === 'Incidente de Carga' && (
                          <>
                            <div className="review-row">
                              <div className="review-label">Lugar de carga</div>
                              <div className="review-value">{inc.datos.lugarCarga || '-'}</div>
                            </div>
                            <div className="review-row">
                              <div className="review-label">Destino</div>
                              <div className="review-value">{inc.datos.destinoCarga || '-'}</div>
                            </div>
                            <div className="review-row">
                              <div className="review-label">Documentos</div>
                              <div className="review-value">
                                {[inc.datos.docTracto, inc.datos.docSemi, inc.datos.fotoCarga].filter(Boolean).length} archivo(s)
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenedor: Terceros */}
              {hayTerceros && terceros.length > 0 && (
                <div className="review-card">
                  <div className="review-card-header">
                    <BsPeopleFill /> Terceros Involucrados ({terceros.length})
                  </div>
                  <div className="review-card-body">
                    {terceros.map((ter, i) => (
                      <div key={i} className="review-tercero-item">
                        <span><strong>#{i + 1}</strong> — {ter.nombreTer} | RUT: {ter.rutTer} | Tel: {ter.telefonoTer}</span>
                        {ter.emailTer && <span style={{ fontSize: '0.8rem', color: '#64748b' }}> | {ter.emailTer}</span>}
                        {ter.aseguradoraTer && <span style={{ fontSize: '0.8rem', color: '#64748b' }}> | Aseg: {ter.aseguradoraTer}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenedor: Documentación Adjunta */}
              <div className="review-card">
                <div className="review-card-header">
                  <BsFolderFill /> Documentación Adjunta
                </div>
                <div className="review-card-body">
                  <div className="review-file-list">
                    {cedulaFile && <span className="review-file-tag"><BsPersonBadgeFill /> {cedulaFile.name}</span>}
                    {licenciaFile && <span className="review-file-tag"><BsFileEarmarkTextFill /> {licenciaFile.name}</span>}
                    {djFile && <span className="review-file-tag"><BsCheckSquareFill /> {djFile.name}</span>}

                    {/* Archivos de incidentes */}
                    {currentStep === 4 && incidentesCarrito.map((inc, idx) => (
                      <React.Fragment key={inc.id}>
                        {inc.categoria === 'Incidente Vehicular' && (
                          <>
                            {inc.datos.fotosDanos.length > 0 && (
                              <span className="review-file-tag" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                                <BsImageFill /> Incidente #{idx + 1}: {inc.datos.fotosDanos.length} fotos daños
                              </span>
                            )}
                            {inc.datos.fotosLugar.length > 0 && (
                              <span className="review-file-tag" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                                <BsGeoAltFill /> Incidente #{idx + 1}: {inc.datos.fotosLugar.length} fotos lugar
                              </span>
                            )}
                            {Object.values(inc.datos.fotosPanoramicas).filter(Boolean).length > 0 && (
                              <span className="review-file-tag" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                                <BsTruck /> Incidente #{idx + 1}: {Object.values(inc.datos.fotosPanoramicas).filter(Boolean).length} panorámicas
                              </span>
                            )}
                          </>
                        )}
                        {inc.categoria === 'Incidente de Carga' && (
                          <>
                            {inc.datos.docTracto && (
                              <span className="review-file-tag" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                <BsFileEarmarkTextFill /> Incidente #{idx + 1}: Doc Tracto
                              </span>
                            )}
                            {inc.datos.docSemi && (
                              <span className="review-file-tag" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                <BsFileEarmarkTextFill /> Incidente #{idx + 1}: Doc Semi
                              </span>
                            )}
                            {inc.datos.fotoCarga && (
                              <span className="review-file-tag" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                <BsImageFill /> Incidente #{idx + 1}: Foto Carga
                              </span>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    ))}

                    {!cedulaFile && !licenciaFile && !djFile && incidentesCarrito.length === 0 && (
                      <span className="review-file-tag" style={{ color: '#ef4444' }}>Sin documentos adjuntos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ══════ Navigation ══════ */}
        <div className="wizard-nav">
          <button type="button" className="btn-prev" onClick={goPrev} disabled={currentStep === 1}>
            ‹ Anterior
          </button>
          {currentStep < 4 ? (
            <button type="button" className="btn-next" onClick={goNext}>
              Siguiente ›
            </button>
          ) : (
            <button type="button" className="btn-submit-final" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Solicitud ›'}
            </button>
          )}
        </div>
      </div >
    </div >
  );
}

export default Formulario;