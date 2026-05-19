import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocumentoServices from '../../services/documentoServices';
import Swal from 'sweetalert2';

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

// Badge helper
const EstadoBadge = ({ estado }) => {
  if (!estado) return <span className="badge bg-secondary">Pendiente</span>;
  const e = estado.toString().toLowerCase();
  if (e.includes('enviado') || e.includes('enviado')) return <span className="badge bg-success">Enviado</span>;
  if (e.includes('pend')) return <span className="badge bg-warning">Pendiente</span>;
  if (e.includes('rechaz')) return <span className="badge bg-danger">Rechazado</span>;
  if (e.includes('revision') || e.includes('revisión') || e.includes('en revis')) return <span className="badge bg-info">En revisión</span>;
  return <span className="badge bg-secondary">{estado}</span>;
};

export default function ListaFormulario({ idIncidente }) {
  const location = useLocation();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const expected = [
    { key: 'cedula', label: 'Cédula Conductor', tipo: tipoDocumentoIds.cedula },
    { key: 'licencia', label: 'Licencia Conduc.', tipo: tipoDocumentoIds.licencia },
    { key: 'declaracion_jurada', label: 'Declaración Jurada', tipo: tipoDocumentoIds.declaracion_jurada },
    { key: 'foto_danos', label: 'Fotos de Daños', tipo: tipoDocumentoIds.foto_danos },
    { key: 'foto_lugar', label: 'Fotos del Lugar', tipo: tipoDocumentoIds.foto_lugar },
  ];

  // compute effective id from prop or query param
  const effectiveId = idIncidente || (() => {
    try {
      const qp = new URLSearchParams(location.search);
      return qp.get('id') || qp.get('idIncidente') || null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    if (!effectiveId) return;
    setLoading(true);
    DocumentoServices.getDocumentsByIncidente(effectiveId)
      .then(res => setDocs(res.data || []))
      .catch(err => console.error('ListaFormulario get docs', err))
      .finally(() => setLoading(false));
  }, [effectiveId]);

  const findDocByTipo = (tipo) => docs.find(d => String(d.idTipoDocumento || d.id_tipo_documento || d.tipo) === String(tipo) || String(d.idTipoDocumento) === String(tipo));

  const formatDate = (d) => {
    if (!d) return '-';
    const keys = ['fechaRegistro','fecha_envio','createdAt','fecha','fechaCreacion','uploadDate'];
    for (const k of keys) if (d[k]) return new Date(d[k]).toLocaleString();
    // try common names
    if (d.fecha) return new Date(d.fecha).toLocaleString();
    return d.toString ? d.toString() : '-';
  };

  const handleFileUpload = async (file, tipo) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('Archivo', file);
    fd.append('idIncidente', effectiveId);
    fd.append('categoria', 'Siniestro');
    fd.append('idTipoDocumento', tipo);
    try {
      await DocumentoServices.uploadDocument(fd);
      Swal.fire({ icon: 'success', title: 'Archivo subido', timer: 1400, showConfirmButton: false, confirmButtonColor: '#045524' });
      const res = await DocumentoServices.getDocumentsByIncidente(effectiveId);
      setDocs(res.data || []);
    } catch (err) {
      console.error('Error upload', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el archivo.' });
    } finally {
      setUploading(false);
    }
  };

  if (!effectiveId) return (
    <div style={{ padding: 20 }}>
      <h4 style={{ color: '#555' }}>Incidente no especificado</h4>
      <p style={{ color: '#777' }}>No se proporcionó un identificador de incidente. Asegúrate de navegar a <code>/mis-formularios?id=INCDTxxx</code> o de que el formulario redirija correctamente tras el envío.</p>
    </div>
  );

  return (
    <div className="card shadow-sm rounded-3 mb-3 table-card">
      <div className="card-header d-flex align-items-center justify-content-between py-2 px-3 table-card-header">
        <div className="d-flex align-items-center gap-2">
          <strong className="mb-0" style={{ color: 'var(--color-text)' }}>Documentación</strong>
          <small className="text-muted">Estado de los documentos</small>
        </div>
        <div className="text-muted small">Formulario {effectiveId}</div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0 docs-table">
            <thead className="table-header-green">
              <tr>
                <th>Nombre documento</th>
                <th>Estado</th>
                <th>Fecha envío</th>
                <th>Observaciones</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {expected.map((e) => {
                const found = findDocByTipo(e.tipo);
                const estado = found?.estado || found?.status || (found ? 'Enviado' : 'Pendiente');
                const fecha = found ? (found.fechaRegistro || found.createdAt || found.fecha || found.uploadDate) : null;
                const obs = found?.observaciones || found?.observacion || found?.comments || '';
                return (
                  <tr key={e.key}>
                    <td>{e.label}</td>
                    <td style={{ width: 160 }}><EstadoBadge estado={estado} /></td>
                    <td style={{ width: 200 }}>{fecha ? new Date(fecha).toLocaleString() : '-'}</td>
                    <td>{obs || '-'}</td>
                    <td className="text-end">
                      {found ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <a className="btn btn-sm btn-outline-success" href={DocumentoServices.getDownloadUrl(found.filename)} target="_blank" rel="noreferrer">Ver</a>
                          <label className="btn btn-sm btn-outline-secondary mb-0" style={{ cursor: 'pointer' }}>
                            Reemplazar
                            <input type="file" accept="*/*" style={{ display: 'none' }} onChange={ev => handleFileUpload(ev.target.files[0], e.tipo)} />
                          </label>
                        </div>
                      ) : (
                        <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                          Adjuntar
                          <input type="file" accept="*/*" style={{ display: 'none' }} onChange={ev => handleFileUpload(ev.target.files[0], e.tipo)} />
                        </label>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
