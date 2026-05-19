import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import FormularioServices from "../../services/formularioServices";
import DocumentoServices from "../../services/documentoServices";
import AuthKeycloakServices from "../../services/authKeycloakServices";
import ListaFormulario from '../usuario/ListaFormulario';
import BackButton from '../../components/BackButton';

function DetalleIncidente({ id: propsId }) {
  const { id: paramsId } = useParams();
  const id = propsId || paramsId;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorDocs, setErrorDocs] = useState(null);
  const [usuariosMap, setUsuariosMap] = useState({});
  const [tiposVehiculoMap, setTiposVehiculoMap] = useState({});
  const [patenteToTipoIdMap, setPatenteToTipoIdMap] = useState({});
  // Eliminado fetchedRef: siempre cargar documentos al cambiar id

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await FormularioServices.getFormulario(id);
        if (!cancelled) setData(res.data || res);
      } catch (err) {
        if (!cancelled) setError(err.message || "Error al cargar el incidente");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const users = await AuthKeycloakServices.getAllUsersWithRoles();
        const map = {};
        users.forEach(u => {
          const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.id;
          map[u.id] = fullName;
        });
        setUsuariosMap(map);
      } catch (err) {
        console.error("Error al cargar nombres de usuarios:", err);
      }
    };
    fetchUsuarios();

    const fetchTiposVehiculo = async () => {
      try {
        const res = await FormularioServices.getTiposVehiculo();
        const dataRes = res.data || res;
        const map = {};
        if (Array.isArray(dataRes)) {
          dataRes.forEach(t => {
            // Se usa el ID correcto 'id_tipo_vehiculo' del backend
            const id = String(t.id_tipo_vehiculo || t.idTipoVehiculo || t.id);
            map[id] = t.tipo_vehiculo || t.nombreTipoVehiculo || t.nombre;
          });
        }
        if (process.env.NODE_ENV !== 'production') console.log('[DetalleIncidente] Map de Tipos Vehículo:', map);
        setTiposVehiculoMap(map);
      } catch (err) {
        console.error("Error al cargar tipos de vehículo:", err);
      }
    };
    fetchTiposVehiculo();

    const fetchVehiculosMap = async () => {
      try {
        const res = await FormularioServices.getVehiculos();
        const list = res.data || [];
        const map = {};
        list.forEach(v => {
          if (v.patente) {
            const cleanPat = v.patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
            const typeId = v.id_tipo_vehiculo || v.idTipoVehiculo || (v.tipoVehiculo && (v.tipoVehiculo.id || v.tipoVehiculo.id_tipo_vehiculo));
            if (typeId) map[cleanPat] = String(typeId);
          }
        });
        setPatenteToTipoIdMap(map);
      } catch (err) {
        console.error("Error al cargar mapeo de patentes:", err);
      }
    };
    fetchVehiculosMap();
  }, []);

  useEffect(() => {

    if (!id) {
      console.warn("[DetalleIncidente] id no definido para cargar documentos", id);
      return;
    }

    let cancelled = false;
    const fetchDocs = async () => {
      setLoadingDocs(true);
      setErrorDocs(null);
      console.log(`[DetalleIncidente] Cargando documentos para incidente id=`, id);
      try {
        const res = await DocumentoServices.getDocumentsByIncidente(id);
        console.log("[DetalleIncidente] Respuesta documentos:", res);
        if (!cancelled) {
          // Deduplicar por id por si acaso
          const data = res.data || [];
          const unique = data.filter(
            (doc, idx, self) => idx === self.findIndex(d => d.id === doc.id)
          );
          setDocumentos(unique);
        }
      } catch (err) {
        console.error("[DetalleIncidente] Error al cargar documentos:", err);
        if (!cancelled) setErrorDocs(err.message || "Error al cargar documentos");
      } finally {
        if (!cancelled) setLoadingDocs(false);
      }
    };
    fetchDocs();
    return () => { cancelled = true; };
  }, [id]);


  // Función para agrupar en categorías generales
  function getCategoriaGeneral(nombre) {
    if (!nombre) return "OTROS";
    const n = nombre.trim().toLowerCase();
    if (n.includes("vehiculo") || n.includes("vehículo") || n.includes("declaracion")) return "Vehiculo";
    if (n.includes("conductor") || n.includes("licencia") || n.includes("carnet")) return "Conductor";
    if (n.includes("tercero")) return "Tercero";
    if (n.startsWith("siniestro") || n.includes("foto") || n.includes("incidente")) return "Siniestro";
    return "Otros";
  }

  // Agrupa documentos por categoría general
  const documentosPorCategoria = React.useMemo(() => {
    if (!Array.isArray(documentos) || documentos.length === 0) return {};
    return documentos.reduce((acc, doc) => {
      const cat = getCategoriaGeneral(doc.categoria);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    }, {});
  }, [documentos]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.log('[DetalleIncidente] data:', data);
  }, [data]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div style={{ color: "#666", fontStyle: "italic" }}>No se encontraron datos del incidente.</div>;

  // Helper para mostrar atributos de incidente
  const fieldOrder = [
    "idIncidente",
    "idUsuario",
    "tipoIncidente",
    "fechaIngresoForm",
    "fechaHoraIncidente",
    "relatoForm",
    "patente1",
    "patente2",
    "nombreConductor",
    "rutConductor",
    "base",
    "operacion",
    "lugarCarga",
    "fechaIniTransporteCarga",
    "destinoCarga",
    "terceros",
    "ubicacion",
  ];

  const labelMap = {
    idIncidente: "ID Incidente",
    idUsuario: "Usuario",
    id_usuario: "Usuario",
    tipoIncidente: "Tipo de Incidente",
    idTipoVehiculo: "Tipo Vehículo",
    tipo_vehiculo: "Tipo Vehículo",
    fechaIngresoForm: "Fecha ingreso formulario",
    fechaHoraIncidente: "Fecha y hora incidente",
    relatoForm: "Relato",
    patente1: "Patente 1",
    patente2: "Patente 2",
    nombreConductor: "Conductor",
    rutConductor: "RUT Conductor",
    base: "Base",
    operacion: "Operación",
    lugarCarga: "Lugar carga",
    fechaIniTransporteCarga: "Fecha inicio transporte",
    destinoCarga: "Destino carga",
    terceros: "Terceros",
    ubicacion: "Ubicación",
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return "-";

    if (key === "idUsuario" || key === "id_usuario") {
      const name = usuariosMap[value];
      if (name) return name;
      // Tratar de buscar por ID si el match exacto falla (case insensitive o similar)
      const foundEntry = Object.entries(usuariosMap).find(([id]) => id.toLowerCase() === String(value).toLowerCase());
      return foundEntry ? foundEntry[1] : value;
    }

    if (key === "idTipoVehiculo" || key === "tipo_vehiculo") {
      return tiposVehiculoMap[String(value)] || value;
    }

    if (key === "patente1" || key === "patente2") {
      const cleanPat = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const tipoId = patenteToTipoIdMap[cleanPat];
      const tipoNombre = tipoId ? tiposVehiculoMap[tipoId] : null;
      return tipoNombre ? `${value} (${tipoNombre})` : value;
    }

    if (key === "ubicacion") {
      const desc = value.descripcionUbi || value.direccion || "";
      const comuna = value.comuna?.nombreComuna;
      const region = value.comuna?.region?.nombreReg;
      const pais = value.comuna?.region?.pais?.nombrePais;
      return (
        <div>
          <div>{desc}</div>
          <div style={{ color: "#666", fontSize: 12 }}>
            {comuna && <span>{comuna}</span>}
            {region && <span> · {region}</span>}
            {pais && <span> · {pais}</span>}
          </div>
        </div>
      );
    }
    if (key === "tipoIncidente") {
      return (
        <div>
          <div>{value?.nombreTipoIncidente || value?.nombre || JSON.stringify(value)}</div>
          {value?.categoria && (
            <div style={{ color: "#666", fontSize: 12 }}>{value.categoria}</div>
          )}
        </div>
      );
    }
    if (key === "terceros") {
      if (!Array.isArray(value) || value.length === 0) return "Ninguno";

      // Construir lista uniforme de objetos: si el elemento es string, lo guardamos en __rawString
      const rawList = value.map((t) => {
        const obj = typeof t === "object" && t !== null ? { ...t } : { __rawString: String(t) };
        // nombreTer ya contiene el nombre completo
        const nombre = obj.nombreTer || obj.nombre || obj.nombreTercero || "";
        obj.nombreCompleto = nombre || null;
        return obj;
      });

      // Reunir todas las claves presentes en los objetos (conservando el caso original)
      const allKeysSet = new Set();
      rawList.forEach((obj) => Object.keys(obj).forEach((k) => allKeysSet.add(k)));
      const allKeys = Array.from(allKeysSet);

      // Orden preferente de columnas (nombres en minúscula para matching)
      const preferred = [
        // Prioridad: mostrar nombre, RUT, teléfono y email primero
        "nombre",
        "nombreTercero",
        "nombreCompleto",
        "razonSocial",
        "rut",
        "rutTercero",
        "telefono",
        "telefonoContacto",
        "email",
        "correo",
        // Resto de campos comunes
        "direccion",
        "comuna",
        "ciudad",
        "pais",
        "observaciones",
        "comentario",
        "__rawString",
      ];

      // Función auxiliar para obtener etiqueta legible de una clave
      const labelFor = (k) => {
        const map = {
          nombre: "Nombre",
          nombreTercero: "Nombre Tercero",
          nombreCompleto: "Nombre Completo",
          razonSocial: "Razón social",
          rut: "RUT",
          rutTercero: "RUT",
          telefono: "Teléfono",
          telefonoContacto: "Teléfono",
          email: "Email",
          correo: "Email",
          direccion: "Dirección",
          comuna: "Comuna",
          ciudad: "Ciudad",
          pais: "País",
          observaciones: "Observaciones",
          comentario: "Comentario",
          __rawString: "Valor",


          /* Mapeos personalizados (según captura) */
          rutter: "RUT",
          aseguradorater: "ASEGURADORA",
          emailter: "EMAIL",
          idincidente: "IDINCIDENTE",
          idtercero: "IDTERCERO",
          nombreter: "NOMBRE COMPLETO",
          nombrecompleto: "NOMBRE COMPLETO",
          numerosinter: "NÚMERO SINIESTRO",
          telefonoter: "TELEFONO",
        };
        const lk = String(k || "").toLowerCase();
        return map[k] || map[lk] || k;
      };

      // Mapear lowercased -> actual key (primer encuentro)
      const lowerToKey = {};
      allKeys.forEach((k) => {
        const lk = String(k).toLowerCase();
        if (!lowerToKey[lk]) lowerToKey[lk] = k;
      });

      // Queremos mostrar exactamente estas columnas (en este orden):
      // Nombre Completo, RUT, Teléfono, Email, Aseguradora
      const desiredGroups = [
        ["nombrecompleto", "nombre", "nombreter", "nombret", "nombre_t"],
        ["rut", "rutt", "rutt_tercero", "rut_tercero", "numerosinter"],
        ["telefono", "telefonoter", "telefonocontacto", "telefono_contacto", "telefono_t"],
        ["email", "correo", "emailter", "mail"],
        ["aseguradorater", "aseguradora", "aseguradora_nombre", "asegurador"]
      ];

      const columns = desiredGroups.map((group) => {
        for (const keyLower of group) {
          if (lowerToKey[keyLower]) return lowerToKey[keyLower];
        }
        return null;
      }).filter(Boolean);

      // Ordenar la lista por el primer campo de nombre disponible
      const nameKeys = ["nombre", "nombreTercero", "nombreCompleto", "razonSocial", "__rawString"];
      const getNameValue = (obj) => {
        for (const nk of nameKeys) {
          if (nk in obj && obj[nk]) return String(obj[nk]);
        }
        return "";
      };

      const lista = rawList.slice().sort((a, b) => getNameValue(a).localeCompare(getNameValue(b)));

      const renderCell = (val) => {
        if (val === null || val === undefined || val === "") return <span style={{ color: '#6c757d' }}>-</span>;
        if (typeof val === 'object') {
          const s = JSON.stringify(val);
          const short = s.length > 80 ? s.slice(0, 77) + '...' : s;
          return <span title={s} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: 300 }}>{short}</span>;
        }
        return <span title={String(val)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: 300 }}>{String(val)}</span>;
      };

      return (
        <div style={{ padding: 8 }}>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover mb-0">
              <thead className="table-header-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{labelFor(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((obj, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>{renderCell(obj[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (typeof value === "object") {
      // render simple object as key: val lines
      return (
        <div>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} style={{ color: "#333", fontSize: 13 }}>
              <strong style={{ fontWeight: 600 }}>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  const renderIncidenteDetalle = () => {
    // build rows following fieldOrder, then any remaining keys
    const keys = Array.from(new Set([
      ...fieldOrder,
      ...Object.keys(data || {})
    ])).filter(k => k !== 'idTipoVehiculo' && k !== 'tipo_vehiculo' && k !== 'id_tipo_vehiculo');

    return (
      <div className="card shadow-sm rounded-3 mb-3 table-card">
        <div className="card-header d-flex align-items-center justify-content-between py-2 px-3 table-card-header">
          <div className="d-flex align-items-center gap-2">
            <strong className="mb-0" style={{ color: 'var(--color-text)' }}>Datos del Incidente</strong>
            <small className="text-muted"></small>
          </div>
          <div className="text-muted small"></div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="detalle-incidente-table table mb-0">
              <tbody>
                {keys.map((key) => {
                  if (!(key in data)) return null;
                  return (
                    <tr key={key}>
                      <th style={{ textAlign: "left", paddingRight: 12 }}>{labelMap[key] || key}</th>
                      <td>{renderValue(key, data[key])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Función para descargar y abrir el archivo con token de autenticación
  function handleDownloadAndOpen(url, filename) {
    const token = localStorage.getItem("token");
    fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al descargar el archivo");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        // Descargar
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        // Liberar blob
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al descargar',
          text: 'No se pudo descargar el archivo: ' + (err.message || ''),
        });
      });
  }

  // Helper para renderizar tabla de documentos por categoría dentro de un Card Bootstrap
  const renderDocsTable = (docs, categoria) => (
    <div className="card shadow-sm rounded-3 mb-3 table-card">
      <div className="card-header d-flex align-items-center justify-content-between py-2 px-3 table-card-header">
        <div className="d-flex align-items-center gap-2">
          <strong className="mb-0" style={{ color: 'var(--color-text)' }}>{categoria}</strong>
          <small className="text-muted">{docs.length} archivo{docs.length !== 1 ? 's' : ''}</small>
        </div>
        <div className="text-muted small"></div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0 docs-table">
            <thead className="table-header-green">
              <tr>
                <th>Nombre archivo</th>
                <th>Tipo</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td title={doc.originalFilename} style={{ maxWidth: '1px' }}>{doc.originalFilename}</td>
                  <td>{doc.contentType}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => handleDownloadAndOpen(DocumentoServices.getDownloadUrl(doc.filename), doc.originalFilename)}
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Categorías a mostrar y su orden
  const categorias = ["Vehiculo", "Conductor", "Tercero", "Siniestro"];

  return (
    <div className="detalle-incidente-container">
      {paramsId && (
        <div style={{ marginBottom: "15px" }}>
          <BackButton />
        </div>
      )}
      <section style={{ marginBottom: 20, padding: 16, borderRadius: 8, backgroundColor: "#f5f5f5" }}>
        <h2 className="detalle-incidente-title">Detalle de Incidente</h2>
      </section>
      <section style={{ marginBottom: 32, padding: 16, borderRadius: 8 }}>
        <h3>Datos del Incidente</h3>

        {renderIncidenteDetalle()}
      </section>
      <section>
        <h3 style={{ marginBottom: 20, color: "#555" }}>Documentación</h3>

        {loadingDocs ? (
          <div>Cargando documentos...</div>
        ) : errorDocs ? (
          <div style={{ color: "red" }}>Error al cargar documentos: {errorDocs}</div>
        ) : documentos && documentos.length > 0 ? (
          categorias.map((cat) =>
            documentosPorCategoria[cat] ? (
              <div key={cat} style={{ marginBottom: 24 }}>
                {renderDocsTable(documentosPorCategoria[cat], cat)}
              </div>
            ) : null
          )
        ) : (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            No hay documentación disponible para este incidente.
          </div>
        )}
      </section>
    </div>
  );
}

export default DetalleIncidente;