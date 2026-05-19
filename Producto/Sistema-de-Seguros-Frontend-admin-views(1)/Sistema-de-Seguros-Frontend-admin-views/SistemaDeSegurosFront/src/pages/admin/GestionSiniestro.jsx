import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validarCamposObligatorios } from "../../utils/validaciones";
import BackButton from "../../components/BackButton";
import Swal from 'sweetalert2';
import { useFormulario } from "../../hooks/useFormulario";
import siniestroService from "../../services/siniestroService";
import polizaService from "../../services/polizaService";
import estadoSiniestroService from "../../services/estadoSiniestroService";
import tipoSiniestroService from "../../services/tipoSiniestroService";
import cierreService from "../../services/cierreService";
import formularioIncidenteService from "../../services/formularioIncidenteService";

const siniestroVacio = {
  fechaHoraSin: "",
  deducibleApliSin: "",
  indemnizacionSin: "",
  numeroSin: "",
  costoSin: "",
  poliza: { idPol: "", nombrePol: "" },
  estadoSiniestro: { idEstado: "" },
  tipoSiniestro: { idTipoSin: "" },
  cierre: { idCierre: "" },
  formularioIncidente: { idForm: "" },
};

function GestionSiniestro() {
  const navigate = useNavigate();

  const [siniestros, setSiniestros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Estados para observación
  const [mostrarModalObservacion, setMostrarModalObservacion] = useState(false);
  const [siniestroObservacion, setSiniestroObservacion] = useState(null);
  const [observacionTexto, setObservacionTexto] = useState("");

  // Listas para dropdowns
  const [polizas, setPolizas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [formularios, setFormularios] = useState([]);

  const {
    datos: siniestroActual,
    editandoId,
    mostrar: mostrarFormulario,
    setDatos,
    handleInputChange,
    abrirNuevo,
    abrirEditar,
    cerrar,
  } = useFormulario(siniestroVacio);

  const cargarSiniestros = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await siniestroService.listar();
      setSiniestros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar siniestros:", err);
      setError("No se pudieron cargar los siniestros.");
      setSiniestros([]); // Asegurar que sea array
    } finally {
      setCargando(false);
    }
  };

  const cargarDependencias = async () => {
    try {
      const [p, e, t, c, f] = await Promise.all([
        polizaService.listar().catch(() => []),
        estadoSiniestroService.listar().catch(() => []),
        tipoSiniestroService.listar().catch(() => []),
        cierreService.listar().catch(() => []),
        formularioIncidenteService.listar().catch(() => [])
      ]);
      setPolizas(Array.isArray(p) ? p : []);
      setEstados(Array.isArray(e) ? e : []);
      setTipos(Array.isArray(t) ? t : []);
      setCierres(Array.isArray(c) ? c : []);
      setFormularios(Array.isArray(f) ? f : []);
    } catch (err) {
      console.error("Error al cargar dependencias:", err);
    }
  };

  useEffect(() => {
    cargarSiniestros();
    cargarDependencias();
  }, []);

  const handleInputNested = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setDatos(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      handleInputChange(e);
    }
  };

  const handleGuardar = async () => {
    const campos = [
      { nombre: "Fecha y Hora", valor: siniestroActual.fechaHoraSin },
      { nombre: "Deducible", valor: siniestroActual.deducibleApliSin },
      { nombre: "Indemnización", valor: siniestroActual.indemnizacionSin },
      { nombre: "Número", valor: siniestroActual.numeroSin },
      { nombre: "Costo", valor: siniestroActual.costoSin },
      { nombre: "Póliza", valor: siniestroActual.poliza?.idPol },
      { nombre: "Estado", valor: siniestroActual.estadoSiniestro?.idEstado },
      { nombre: "Tipo", valor: siniestroActual.tipoSiniestro?.idTipoSin },
      { nombre: "Cierre", valor: siniestroActual.cierre?.idCierre },
      { nombre: "Formulario", valor: siniestroActual.formularioIncidente?.idForm },
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

    try {
      setGuardando(true);
      const payload = {
        ...siniestroActual,
        poliza: { idPol: parseInt(siniestroActual.poliza.idPol) },
        estadoSiniestro: { idEstado: parseInt(siniestroActual.estadoSiniestro.idEstado) },
        tipoSiniestro: { idTipoSin: parseInt(siniestroActual.tipoSiniestro.idTipoSin) },
        cierre: { idCierre: parseInt(siniestroActual.cierre.idCierre) },
        formularioIncidente: { idForm: parseInt(siniestroActual.formularioIncidente.idForm) }
      };

      if (editandoId) {
        await siniestroService.actualizar(editandoId, payload);
      } else {
        await siniestroService.crear(payload);
      }

      await cargarSiniestros();
      cerrar();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Siniestro guardado correctamente.',
        confirmButtonColor: '#045524',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el siniestro.',
        confirmButtonColor: '#045524'
      });
    } finally {
      setGuardando(false);
    }
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
        await siniestroService.eliminar(id);
        await cargarSiniestros();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El siniestro ha sido eliminado.',
          confirmButtonColor: '#045524',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el siniestro.',
          confirmButtonColor: '#045524'
        });
      }
    }
  };

  const abrirModalObservacion = (siniestro) => {
    setSiniestroObservacion(siniestro);
    setObservacionTexto(siniestro.observacion || "");
    setMostrarModalObservacion(true);
  };

  const cerrarModalObservacion = () => {
    setMostrarModalObservacion(false);
    setSiniestroObservacion(null);
    setObservacionTexto("");
  };

  const handleGuardarObservacion = async () => {
    if (!siniestroObservacion) return;

    try {
      const respuesta = await siniestroService.updateObservacion(siniestroObservacion.idSin, observacionTexto);
      
      // Actualizar el siniestro en la lista local con los datos de la respuesta
      setSiniestros(prevSiniestros => 
        prevSiniestros.map(s => {
          if (s.idSin === siniestroObservacion.idSin) {
            return { ...s, observacion: respuesta.observacion, fechaUltimaModificacion: respuesta.fechaUltimaModificacion };
          }
          return s;
        })
      );
      
      Swal.fire({
        icon: 'success',
        title: '\u00a1Observaci\u00f3n guardada!',
        text: 'La observaci\u00f3n se ha actualizado correctamente.',
        confirmButtonColor: '#045524',
        timer: 1500
      });
      
      cerrarModalObservacion();
    } catch (err) {
      console.error("Error al guardar observaci\u00f3n:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la observaci\u00f3n.',
        confirmButtonColor: '#045524'
      });
    }
  };



  const handleImportar = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Importar Siniestros',
        input: 'file',
        inputAttributes: {
          accept: '.xlsx,.xls',
          'aria-label': 'Selecciona un archivo Excel'
        },
        showCancelButton: true,
        confirmButtonText: 'Importar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#045524',
        cancelButtonColor: '#6c757d',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar un archivo';
          }
        }
      });

      if (file) {
        Swal.fire({
          title: 'Importando...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const formData = new FormData();
        formData.append('file', file);
        
        const resultado = await siniestroService.importar(formData);

        Swal.fire({
          icon: 'success',
          title: '¡Importación exitosa!',
          text: resultado || 'Los siniestros se han importado correctamente.',
          confirmButtonColor: '#045524'
        });

        cargarSiniestros();
      }
    } catch (err) {
      console.error("Error al importar:", err);
      const mensaje = err.response?.data?.message || err.message || 'Error al importar los siniestros.';
      Swal.fire({
        icon: 'error',
        title: 'Error en la importación',
        text: mensaje,
        confirmButtonColor: '#045524'
      });
    }
  };

  const handleExportar = async () => {
    try {
      const blob = await siniestroService.exportar();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'siniestros.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({
        icon: 'success',
        title: '¡Exportación exitosa!',
        text: 'El archivo se ha descargado correctamente.',
        confirmButtonColor: '#045524',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error al exportar:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar.',
        confirmButtonColor: '#045524'
      });
    }
  };

  return (
    <div className="page-container">
      <BackButton />
      <div className="page-header flex-between">
        <div>
          <h1>Gestión de Siniestros</h1>
          <p className="text-muted">Administración integral de siniestros, costos y estados relacionados.</p>
        </div>

        {!mostrarFormulario && (
          <div className="flex gap-1">
            <button className="btn btn-outline" onClick={handleImportar}>
              <span className="material-icons" style={{ fontSize: "1.2rem" }}>upload</span>
              Importar XLSX
            </button>
            <button className="btn btn-outline" onClick={handleExportar}>
              <span className="material-icons" style={{ fontSize: "1.2rem" }}>download</span>
              Exportar XLSX
            </button>
            <button className="btn btn-primary" onClick={abrirNuevo}>
              <span className="material-icons" style={{ fontSize: "1.2rem" }}>add</span>
              Nuevo Siniestro
            </button>
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <div className="card mb-4 bounce-in">
          <div className="card-header">
            <h3>{editandoId ? "Editar Siniestro" : "Nuevo Siniestro"}</h3>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label>Número de Siniestro</label>
                <input name="numeroSin"
                  type="number"
                  value={siniestroActual.numeroSin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input name="fechaHoraSin"
                  type="datetime-local"
                  value={siniestroActual.fechaHoraSin}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Costo</label>
                <input name="costoSin"
                  type="number"
                  step="0.01"
                  value={siniestroActual.costoSin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Deducible Aplicado</label>
                <input name="deducibleApliSin"
                  type="number"
                  step="0.01"
                  value={siniestroActual.deducibleApliSin}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Indemnización</label>
                <input name="indemnizacionSin"
                  type="number"
                  step="0.01"
                  value={siniestroActual.indemnizacionSin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Póliza Relacionada</label>
                <select name="poliza.idPol"
                  className="form-input"
                  value={siniestroActual.poliza?.idPol}
                  onChange={handleInputNested}
                >
                  <option value="">Seleccione Póliza</option>
                  {polizas.map(p => (
                    <option key={p.idPol} value={p.idPol}>
                      {p.nombrePol} - {p.asegurado?.razonSocialAse}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Estado del Siniestro</label>
                <select name="estadoSiniestro.idEstado"
                  className="form-input"
                  value={siniestroActual.estadoSiniestro?.idEstado}
                  onChange={handleInputNested}
                >
                  <option value="">Seleccione Estado</option>
                  {estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.nombreEstado}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Siniestro</label>
                <select name="tipoSiniestro.idTipoSin"
                  className="form-input"
                  value={siniestroActual.tipoSiniestro?.idTipoSin}
                  onChange={handleInputNested}
                >
                  <option value="">Seleccione Tipo</option>
                  {tipos.map(t => <option key={t.idTipoSin} value={t.idTipoSin}>{t.nombreTipoSiniestro}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cierre</label>
                <select name="cierre.idCierre"
                  className="form-input"
                  value={siniestroActual.cierre?.idCierre}
                  onChange={handleInputNested}
                >
                  <option value="">Seleccione Cierre</option>
                  {cierres.map(c => <option key={c.idCierre} value={c.idCierre}>ID: {c.idCierre} - {c.motivoCierre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Formulario de Incidente</label>
                <select name="formularioIncidente.idForm"
                  className="form-input"
                  value={siniestroActual.formularioIncidente?.idForm}
                  onChange={handleInputNested}
                >
                  <option value="">Seleccione Formulario</option>
                  {formularios.map(f => <option key={f.idForm} value={f.idForm}>ID: {f.idForm} - {f.fechaHoraIncidente}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <button
              className="btn btn-outline"
              onClick={cerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? <><span className="material-icons spin">autorenew</span> Guardando...</> : "Guardar Siniestro"}
            </button>
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
              placeholder="Buscar por numero siniestro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: "300px", margin: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Listado de Siniestros ({Array.isArray(siniestros) ? siniestros.filter(s => String(s?.numeroSin || "").toLowerCase().includes(busqueda.toLowerCase())).length : 0})</h3>
        </div>
        {cargando ? (
          <div className="loading-container"><p>Cargando siniestros...</p></div>
        ) : error ? (
          <div className="alert alert-danger">
            {error} <button className="btn btn-sm btn-outline ml-3" onClick={cargarSiniestros}>Reintentar</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Número</th>
                <th>Fecha</th>
                <th>Monto Costo</th>
                <th>Deducible</th>
                <th>Indemnización</th>
                <th>Póliza</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Cierre</th>
                <th>ID Incidente</th>
                <th style={{ width: "200px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(siniestros) || siniestros.filter(s => String(s?.numeroSin || "").toLowerCase().includes(busqueda.toLowerCase())).length === 0) ? (
                <tr><td colSpan="12" className="text-center py-4">No hay siniestros registrados</td></tr>
              ) : (
                siniestros.map((s, idx) => (
                  <tr key={s.idSin || idx}>
                    <td>{s.idSin}</td>
                    <td><strong>{s.numeroSin}</strong></td>
                    <td>{s.fechaSin || s.fechaHoraSin}</td>
                    <td>${s.costoSin}</td>
                    <td>${s.deducibleApliSin}</td>
                    <td>${s.indemnizacionSin}</td>
                    <td>{s.poliza?.nombrePol || "N/A"}</td>
                    <td><span className={`badge badge-${s.estadoSiniestro?.nombreEstado === 'Finalizado' ? 'success' : 'warning'}`}>{s.estadoSiniestro?.nombreEstado}</span></td>
                    <td>{s.tipoSiniestro?.nombreTipoSiniestro}</td>
                    <td>{s.cierre?.idCierre ? `ID ${s.cierre.idCierre}` : "Sin cierre"}</td>
                    <td>{s.formularioIncidente?.idForm || "N/A"}</td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {s.formularioIncidente?.idForm && (
                          <button className="btn btn-sm btn-outline" onClick={() => navigate(`/gestion-incidente/detalle/${s.formularioIncidente.idForm}`)} title="Ver Detalles del Incidente">
                            <span className="material-icons">visibility</span>
                          </button>
                        )}
                        <button className="btn btn-sm btn-info" onClick={() => abrirModalObservacion(s)} title="Observación">
                          <span className="material-icons">comment</span>
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => abrirEditar(s, s.idSin)}>
                          <span className="material-icons">edit</span> Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(s.idSin)}>
                          <span className="material-icons">delete</span> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Observación */}
      {mostrarModalObservacion && (
        <div className="modal-overlay" onClick={cerrarModalObservacion}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', minHeight: '500px' }}>
            <div className="modal-header">
              <h2>Observación del Siniestro #{siniestroObservacion?.numeroSin}</h2>
              <button className="btn-close" onClick={cerrarModalObservacion}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: '350px' }}>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                ID: {siniestroObservacion?.idSin} | Póliza: {siniestroObservacion?.poliza?.nombrePol || 'N/A'}
              </p>
              {siniestroObservacion?.fechaUltimaModificacion && (
                <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>
                  Última modificación: {new Date(siniestroObservacion.fechaUltimaModificacion).toLocaleString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              <div className="form-group">
                <label htmlFor="observacion" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Observación de Seguimiento:
                </label>
                <textarea
                  id="observacion"
                  className="form-control"
                  style={{ 
                    width: '100%',
                    minHeight: '250px',
                    resize: 'vertical',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                  value={observacionTexto}
                  onChange={(e) => setObservacionTexto(e.target.value)}
                  placeholder="Ingrese observaciones sobre el seguimiento del siniestro..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn" 
                onClick={cerrarModalObservacion}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleGuardarObservacion}
                style={{
                  backgroundColor: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionSiniestro;