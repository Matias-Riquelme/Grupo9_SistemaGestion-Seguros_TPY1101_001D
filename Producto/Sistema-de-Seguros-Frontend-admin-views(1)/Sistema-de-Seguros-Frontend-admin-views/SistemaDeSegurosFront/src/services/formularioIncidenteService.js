import api from '../config/api';
import localforage from 'localforage';

// Configurar LocalForage para guardar formularios offline
// Importamos los servicios necesarios para la sincronización completa
import UbicacionServices from './ubicacionServices';
import FormularioServices from './formularioServices';
import DocumentoServices from './documentoServices';
import notificacionService from './notificacionService';

// Configurar LocalForage para guardar formularios offline
const PENDIENTES_KEY = 'formularios_pendientes';

// Helper: reemplaza strings vacías por 'NO APLICA' (copiado desde Formulario.jsx)
const replaceEmptyStrings = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return value.trim() === '' ? '' : value;
    if (Array.isArray(value)) return value.map(replaceEmptyStrings);
    if (typeof value === 'object') {
        if (value instanceof File || value instanceof Blob) return value; // No procesar archivos
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = replaceEmptyStrings(v);
        }
        return out;
    }
    return value;
};

// Función para determinar categoría (copiada/simplificada desde Formulario.jsx)
const esCategoriaDeCargas = (cat) => cat && cat.toLowerCase().includes('carga');
const getCategoriaGeneral = (cat) => {
    if (!cat) return 'Siniestro';
    const c = cat.toLowerCase();
    if (c.includes('carga') || c.includes('rampa') || c.includes('choque') || c.includes('accidente')) return 'Siniestro';
    if (c.includes('vehiculo')) return 'Vehiculo';
    if (c.includes('tercero')) return 'Tercero';
    if (c.includes('conductor')) return 'Conductor';
    return 'Siniestro';
};

const tipoDocumentoIds = { cedula: 1, licencia: 2, declaracion_jurada: 3, foto_danos: 4, foto_lugar: 5, panoramica_frontal: 6, panoramica_trasera: 7, documento_tracto: 8, documento_semi: 9, foto_carga: 10, documento_vehiculo: 11 };

export const enviarFormularioSiniestro = async (formularioDataCompleto) => {
    try {
        if (navigator.onLine) {
            // Cuando está online, Formulario.jsx hace el guardado por su cuenta para mantener su reactividad.
            // Esta función "enviarFormularioSiniestro" solo se usa para el caso Offline o Sync.
            return { enviado: true };
        } else {
            throw new Error("No hay conexión a internet");
        }
    } catch (error) {
        // Falló o no hay internet, se guarda offline
        console.warn("Internet falló o no existe. Guardando formulario localmente.");
        let pendientes = await localforage.getItem(PENDIENTES_KEY) || [];
        formularioDataCompleto._tempId = Date.now().toString();
        pendientes.push(formularioDataCompleto);
        await localforage.setItem(PENDIENTES_KEY, pendientes);
        return { offline: true, data: formularioDataCompleto };
    }
};

export const sincronizarFormulariosOffline = async () => {
    let pendientes = await localforage.getItem(PENDIENTES_KEY) || [];
    if (pendientes.length === 0) return 0;

    console.log(`Intentando sincronizar ${pendientes.length} formularios...`);
    let restantes = [];
    let sincronizados = 0;

    for (const form of pendientes) {
        try {
            // Este proceso es un refactor masivo de la lógica que está en Formulario.jsx 
            // adaptado a leer desde el objeto extraído "form"
            console.log("Sincronizando formulario background: ", form._tempId);
            
            // 1. Crear Ubicacion
            let idUbicacionFinal = 1;
            try {
                const ubiPayload = {
                    descripcionUbi: form.ubicacionSiniestro,
                    comuna: { idComuna: parseInt(form.selectedComuna) }
                };
                const ubiRes = await UbicacionServices.createUbicacionIncidente(ubiPayload);
                idUbicacionFinal = ubiRes.data.idUbicacion;
            } catch (err) { console.warn('Sync Ubi error', err); }

            // 2. Preparar payload de formulario
            let lugarCargaGlobal = ''; let destinoCargaGlobal = '';
            const incidenteCarga = form.incidentesCarrito.find(inc => esCategoriaDeCargas(inc.categoria));
            if (incidenteCarga) {
                lugarCargaGlobal = incidenteCarga.datos?.lugarCarga || '';
                destinoCargaGlobal = incidenteCarga.datos?.destinoCarga || '';
            }

            let payload = {
                idUsuario: form.userId,
                incidentes: form.incidentesCarrito.map(inc => ({
                    idTipoIncidente: parseInt(inc.idTipoIncidente),
                    categoria: inc.categoria,
                    nombreTipo: inc.nombreTipo,
                    datos: {
                      ...inc.datos,
                      fechaIniTransporteCarga: inc.datos?.fechaIniTransporteCarga || inc.datos?.fechaIniTransporte || null,
                      fecha_ini_transporte_carga: inc.datos?.fecha_ini_transporte_carga || inc.datos?.fechaIniTransporteCarga || inc.datos?.fechaIniTransporte || null
                    }
                })),
                tipoIncidente: form.incidentesCarrito.length > 0 ? { idTipoIncidente: parseInt(form.incidentesCarrito[0].idTipoIncidente) } : { idTipoIncidente: 1 },
                ubicacion: { idUbicacion: idUbicacionFinal },
                vehiculos: form.involucraVehiculo ? form.vehiculosCarrito.map(v => ({
                    patente: v.patente,
                    idTipoVehiculo: parseInt(v.tipoVehiculo), idBase: parseInt(v.base), idOperacion: parseInt(v.operacion),
                    marca: v.vehiculoData?.marca || '', modelo: v.vehiculoData?.modelo || '', anio: v.vehiculoData?.anio || ''
                })) : [],
                idTipoVehiculo: form.involucraVehiculo ? (form.vehiculosCarrito.length > 0 ? parseInt(form.vehiculosCarrito[0].tipoVehiculo) : 1) : null,
                patente1: form.involucraVehiculo ? (form.vehiculosCarrito[0]?.patente || "") : null,
                patente2: form.involucraVehiculo ? (form.vehiculosCarrito[1]?.patente || "") : null,
                fechaHoraIncidente: form.fechaHoraStr,
                relatoForm: form.relato || "Sin relato",
                nombreConductor: form.involucraVehiculo ? (form.conductor?.nombre || "") : null,
                rutConductor: form.involucraVehiculo ? (form.conductor?.rut || "") : null,
                
                // Mapeo seguro para Base y Operacion al recuperar su valor string
                base: (form.base || (form.involucraVehiculo && form.vehiculosCarrito.length > 0 ? form.vehiculosCarrito[0].base : ""))
                  ? (form.bases?.find(b => String(b.id_base ?? b.idBase) === String(form.base || (form.involucraVehiculo && form.vehiculosCarrito.length > 0 ? form.vehiculosCarrito[0].base : "")))?.nombre || "") : "",
                
                operacion: (form.operacion || (form.involucraVehiculo && form.vehiculosCarrito.length > 0 ? form.vehiculosCarrito[0].operacion : ""))
                  ? (form.operaciones?.find(o => String(o.id_operacion ?? o.idOperacion) === String(form.operacion || (form.involucraVehiculo && form.vehiculosCarrito.length > 0 ? form.vehiculosCarrito[0].operacion : "")))?.nombre || "") : "",
                
                lugarCarga: lugarCargaGlobal, destinoCarga: destinoCargaGlobal,
                fechaIniTransporteCarga: incidenteCarga ? (incidenteCarga.datos?.fechaIniTransporteCarga || incidenteCarga.datos?.fechaIniTransporte || incidenteCarga.datos?.fecha_ini_transporte_carga || null) : null,
                fechaIngresoForm: new Date().toISOString()
            };
            
            payload = replaceEmptyStrings(payload);
            const res = await FormularioServices.createFormulario(payload, "riquelmemati1904@gmail.com");
            const createdForm = res.data;
            const idIncidente = createdForm?.idForm || createdForm?.id_form || createdForm?.idIncidente || createdForm?.id_incidente || null;

            // TODO: Se omite temporalmente la subida de Terceros y Archivos Puros en BACKGROUND
            // por limitación extrema de serialización de Files en IndexedDB desde React states sin tratamiento base64 previo.
            // (La versión avanzada necesitaría convertir los Files a Base64 antes de pasarlos a offlineCompleto)
            
            sincronizados++;
        } catch (error) {
            console.error("Error al sincronizar formulario", error);
            restantes.push(form); // Si falla uno, intentarlo la próxima vez
        }
    }

    await localforage.setItem(PENDIENTES_KEY, restantes);
    return sincronizados;
};

export const obtenerFormulariosPendientesOffline = async () => {
    const pendientes = await localforage.getItem(PENDIENTES_KEY) || [];
    return pendientes.length;
};

const formularioIncidenteService = {
    listar: async () => {
        const response = await api.get('/api/formulario-incidente/listar');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/formulario-incidente/obtener/${id}`);
        return response.data;
    },

    importar: async (formData) => {
        const response = await api.post('/api/formulario-incidente/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    exportar: async () => {
        const response = await api.get('/api/formulario-incidente/exportar', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'formularios_incidente.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};


export default formularioIncidenteService;
