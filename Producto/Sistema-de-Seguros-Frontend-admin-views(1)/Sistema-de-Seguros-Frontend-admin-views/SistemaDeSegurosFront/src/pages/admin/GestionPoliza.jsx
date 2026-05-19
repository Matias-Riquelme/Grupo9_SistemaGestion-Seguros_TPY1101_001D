import React, { useState, useEffect } from "react";
import { validarCamposObligatorios } from "../../utils/validaciones";
import { useFormulario } from "../../hooks/useFormulario";
import Swal from 'sweetalert2';
import polizaService from "../../services/polizaService";
import tipoPolizaService from "../../services/tipoPolizaService";
import aseguradoService from "../../services/aseguradoService";
import contratanteService from "../../services/contratanteService";
import BackButton from "../../components/BackButton";

const polizaVacia = {
  nombrePol: '',
  numeroPol: '',
  fechaEmiPol: '',
  fechaIniPol: '',
  fechaFinPol: '',
  fechaVencPol: '',
  primaPol: '',
  tipoMoneda: 'CLP',
  aseguradosAdi: '',
  tipoPoliza: { idTipoPol: '' },
  asegurado: { idAsegurado: '' },
  contratante: { idContratante: '' }
};

function GestionPoliza() {
  const [polizas, setPolizas] = useState([]);
  const [tiposPoliza, setTiposPoliza] = useState([]);
  const [asegurados, setAsegurados] = useState([]);
  const [contratantes, setContratantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cargar datos desde la API
  const cargarPolizas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await polizaService.listar();
      setPolizas(data);
    } catch (err) {
      console.error("Error al cargar pólizas:", err);
      setError("No se pudieron cargar las pólizas. Verifica que el servidor esté activo.");
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosComplementarios = async () => {
    try {
      const [tipos, aseg, contr] = await Promise.all([
        tipoPolizaService.listar(),
        aseguradoService.listar(),
        contratanteService.listar()
      ]);
      setTiposPoliza(tipos);
      setAsegurados(aseg);
      setContratantes(contr);
    } catch (err) {
      console.error("Error al cargar datos complementarios:", err);
    }
  };

  useEffect(() => {
    cargarPolizas();
    cargarDatosComplementarios();
  }, []);

  // Hook formulario para el estado del form
  const {
    datos: polizaActual,
    setDatos: setPolizaActual,
    editandoId,
    mostrar: mostrarFormulario,
    handleInputChange,
    abrirNuevo,
    abrirEditar,
    cerrar,
  } = useFormulario(polizaVacia);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipoPoliza') {
      setPolizaActual(prev => ({
        ...prev,
        tipoPoliza: { idTipoPol: value }
      }));
    } else if (name === 'asegurado') {
      setPolizaActual(prev => ({
        ...prev,
        asegurado: { idAsegurado: value }
      }));
    } else if (name === 'contratante') {
      setPolizaActual(prev => ({
        ...prev,
        contratante: { idContratante: value }
      }));
    }
  };

  const handleEditar = (poliza) => {
    const polizaEditada = {
      nombrePol: poliza.nombrePol || '',
      numeroPol: poliza.numeroPol || '',
      fechaEmiPol: poliza.fechaEmiPol ? poliza.fechaEmiPol.split('T')[0] : '',
      fechaIniPol: poliza.fechaIniPol ? poliza.fechaIniPol.slice(0, 16) : '',
      fechaFinPol: poliza.fechaFinPol ? poliza.fechaFinPol.slice(0, 16) : '',
      fechaVencPol: poliza.fechaVencPol ? poliza.fechaVencPol.split('T')[0] : '',
      primaPol: poliza.primaPol || '',
      tipoMoneda: poliza.tipoMoneda || 'CLP',
      aseguradosAdi: poliza.aseguradosAdi || '',
      tipoPoliza: { idTipoPol: poliza.tipoPoliza?.idTipoPol || '' },
      asegurado: { idAsegurado: poliza.asegurado?.idAsegurado || '' },
      contratante: { idContratante: poliza.contratante?.idContratante || '' }
    };
    abrirEditar(polizaEditada, poliza.idPol);
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
        await polizaService.eliminar(id);
        await cargarPolizas();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La póliza ha sido eliminada.',
          confirmButtonColor: '#045524',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error("Error al eliminar:", err);
        
        // Extraer el mensaje del error del backend
        let mensaje = 'Error al eliminar la póliza.';
        if (err.response?.data) {
          const responseData = err.response.data;
          // Si la respuesta es un string, usarlo directamente
          if (typeof responseData === 'string') {
            mensaje = responseData;
          } 
          // Si es un objeto, intentar extraer el mensaje de varias propiedades
          else if (typeof responseData === 'object') {
            mensaje = responseData.message || responseData.error || responseData.mensaje || mensaje;
          }
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonColor: '#045524'
        });
      }
    }
  };

  const handleGuardar = async () => {
    // Validaciones de campos obligatorios
    const campos = [
      { nombre: "Nombre de Póliza", valor: polizaActual.nombrePol },
      { nombre: "Número de Póliza", valor: polizaActual.numeroPol },
      { nombre: "Fecha de Emisión", valor: polizaActual.fechaEmiPol },
      { nombre: "Fecha de Inicio", valor: polizaActual.fechaIniPol },
      { nombre: "Fecha de Fin", valor: polizaActual.fechaFinPol },
      { nombre: "Fecha de Vencimiento", valor: polizaActual.fechaVencPol },
      { nombre: "Prima", valor: polizaActual.primaPol },
      { nombre: "Moneda", valor: polizaActual.tipoMoneda },
      { nombre: "Tipo de Póliza", valor: polizaActual.tipoPoliza.idTipoPol },
      { nombre: "Asegurado", valor: polizaActual.asegurado.idAsegurado },
      { nombre: "Contratante", valor: polizaActual.contratante.idContratante }
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

    // Validar que la prima sea un número positivo
    if (isNaN(polizaActual.primaPol) || parseFloat(polizaActual.primaPol) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Valor inválido',
        text: 'La prima debe ser un número positivo.',
        confirmButtonColor: '#045524'
      });
      return;
    }

    // Preparar payload con fechas en formato LocalDateTime
    const payload = {
      nombrePol: polizaActual.nombrePol.trim(),
      numeroPol: parseInt(polizaActual.numeroPol),
      fechaEmiPol: polizaActual.fechaEmiPol + 'T00:00:00',
      fechaIniPol: polizaActual.fechaIniPol.includes('T')
        ? (polizaActual.fechaIniPol.length === 16 ? polizaActual.fechaIniPol + ':00' : polizaActual.fechaIniPol)
        : polizaActual.fechaIniPol + 'T00:00:00',
      fechaFinPol: polizaActual.fechaFinPol.includes('T')
        ? (polizaActual.fechaFinPol.length === 16 ? polizaActual.fechaFinPol + ':00' : polizaActual.fechaFinPol)
        : polizaActual.fechaFinPol + 'T00:00:00',
      fechaVencPol: polizaActual.fechaVencPol + 'T00:00:00',
      primaPol: parseFloat(polizaActual.primaPol),        tipoMoneda: polizaActual.tipoMoneda,      aseguradosAdi: polizaActual.aseguradosAdi.trim(),
      tipoPoliza: { idTipoPol: parseInt(polizaActual.tipoPoliza.idTipoPol) },
      asegurado: { idAsegurado: parseInt(polizaActual.asegurado.idAsegurado) },
      contratante: { idContratante: parseInt(polizaActual.contratante.idContratante) }
    };

    try {
      setGuardando(true);
      if (editandoId) {
        await polizaService.actualizar(editandoId, payload);
      } else {
        await polizaService.crear(payload);
      }
      cerrar();
      await cargarPolizas();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Póliza guardada correctamente.',
        confirmButtonColor: '#045524',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error al guardar:", err);
      const errorMsg = err.response?.data?.message || err.message;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al guardar la póliza: ${errorMsg}`,
        confirmButtonColor: '#045524'
      });
    } finally {
      setGuardando(false);
    }
  };



  const handleImportar = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Importar Pólizas',
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
        
        const resultado = await polizaService.importar(formData);

        Swal.fire({
          icon: 'success',
          title: '¡Importación exitosa!',
          text: resultado || 'Las pólizas se han importado correctamente.',
          confirmButtonColor: '#045524'
        });

        cargarPolizas();
      }
    } catch (err) {
      console.error("Error al importar:", err);
      const mensaje = err.response?.data?.message || err.message || 'Error al importar las pólizas.';
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
      const blob = await polizaService.exportar();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'polizas.xlsx';
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
        text: 'Error al exportar las pólizas.',
        confirmButtonColor: '#045524'
      });
    }
  };

  const formatearFecha = (fechaISO, conHora = false) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', conHora ? {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    } : undefined);
  };

  const formatearMoneda = (valor) => {
    if (!valor) return '-';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  return (
    <div className="page-container">
      <BackButton />
      <div className="page-header flex-between">
        <div>
          <h1>Gestión de Pólizas</h1>
          <p className="text-muted">Administra las pólizas de seguro del sistema</p>
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
              Nueva Póliza
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-outline" onClick={cargarPolizas} style={{ marginLeft: '12px' }}>
            Reintentar
          </button>
        </div>
      )}



      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title">{editandoId ? 'Editar Póliza' : 'Nueva Póliza'}</h2>
          </div>

          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre de la Póliza *</label>
                <input
                  type="text"
                  name="nombrePol"
                  value={polizaActual.nombrePol}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="Ej: Póliza Todo Riesgo 2024"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número de Póliza *</label>
                <input
                  type="number"
                  name="numeroPol"
                  value={polizaActual.numeroPol}
                  onChange={handleInputChange}
                  placeholder="Ej: 123456"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Póliza *</label>
                <select
                  className="form-input"
                  name="tipoPoliza"
                  value={polizaActual.tipoPoliza.idTipoPol}
                  onChange={handleSelectChange}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposPoliza.map(tipo => (
                    <option key={tipo.idTipoPol} value={tipo.idTipoPol}>
                      {tipo.nomTipoPol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prima *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="form-input"
                    name="tipoMoneda"
                    value={polizaActual.tipoMoneda || 'CLP'}
                    onChange={handleInputChange}
                    style={{ width: '80px', padding: '0.4rem' }}
                  >
                    <option value="CLP">CLP</option>
                    <option value="UF">UF</option>
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="number"
                    name="primaPol"
                    value={polizaActual.primaPol}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="Ej: 150000.00"
                    style={{ flex: 1 }}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Asegurado *</label>
                <select
                  className="form-input"
                  name="asegurado"
                  value={polizaActual.asegurado.idAsegurado}
                  onChange={handleSelectChange}
                >
                  <option value="">Seleccione un asegurado</option>
                  {asegurados.map(aseg => (
                    <option key={aseg.idAsegurado} value={aseg.idAsegurado}>
                      {aseg.razonSocialAse} - {aseg.rutAse}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contratante *</label>
                <select
                  className="form-input"
                  name="contratante"
                  value={polizaActual.contratante.idContratante}
                  onChange={handleSelectChange}
                >
                  <option value="">Seleccione un contratante</option>
                  {contratantes.map(contr => (
                    <option key={contr.idContratante} value={contr.idContratante}>
                      {contr.razonSocialContra} - {contr.rutContra}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de Emisión *</label>
              <input
                className="form-input"
                type="date"
                name="fechaEmiPol"
                value={polizaActual.fechaEmiPol}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Inicio (con Hora) *</label>
              <input
                className="form-input"
                type="datetime-local"
                name="fechaIniPol"
                value={polizaActual.fechaIniPol}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de Fin (con Hora) *</label>
              <input
                className="form-input"
                type="datetime-local"
                name="fechaFinPol"
                value={polizaActual.fechaFinPol}
                onChange={handleInputChange}
              />
            </div>


            <div className="form-group">
              <label className="form-label">Fecha de Vencimiento *</label>
              <input
                className="form-input"
                type="date"
                name="fechaVencPol"
                value={polizaActual.fechaVencPol}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">Asegurados Adicionales</label>
            <textarea
              className="form-input"
              name="aseguradosAdi"
              value={polizaActual.aseguradosAdi}
              onChange={handleInputChange}
              maxLength={200}
              rows={3}
              placeholder="Ej: Juan Pérez, María González"
            />
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
              <span className="material-icons" style={{ fontSize: "1.1rem" }}>save</span>
              {guardando ? 'Guardando...' : 'Guardar'}
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
              placeholder="Buscar por nombre de póliza..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: "300px", margin: 0 }}
            />
          </div>
        </div>
      </div>

      {
        cargando ? (
          <div className="loading-container">
            <p>Cargando pólizas...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-header">
              <h3>Listado de Pólizas ({polizas.filter(poliza => poliza.nombrePol.toLowerCase().includes(busqueda.toLowerCase())).length})</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Asegurado</th>
                  <th>Contratante</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Fecha Vencimiento</th>
                  <th>Prima</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {polizas.filter(poliza => poliza.nombrePol.toLowerCase().includes(busqueda.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      No hay pólizas registradas
                    </td>
                  </tr>
                ) : (
                  polizas.map((poliza) => (
                    <tr key={poliza.idPol}>
                      <td>{poliza.idPol}</td>
                      <td>{poliza.nombrePol}</td>
                      <td>{poliza.numeroPol}</td>
                      <td>{poliza.tipoPoliza?.nomTipoPol || '-'}</td>
                      <td>{poliza.asegurado?.razonSocialAse || '-'}</td>
                      <td>{poliza.contratante?.razonSocialContra || '-'}</td>
                      <td>{formatearFecha(poliza.fechaEmiPol)}</td>
                      <td>{formatearFecha(poliza.fechaIniPol, true)}</td>
                      <td>{formatearFecha(poliza.fechaFinPol, true)}</td>
                      <td>{formatearFecha(poliza.fechaVencPol)}</td>
                        <td>{poliza.tipoMoneda === 'UF' ? 'UF ' + poliza.primaPol : poliza.tipoMoneda === 'USD' ? 'US$ ' + poliza.primaPol : formatearMoneda(poliza.primaPol)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleEditar(poliza)}
                            title="Editar"
                          >
                            <span className="material-icons" style={{ fontSize: "1rem" }}>edit</span>
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleEliminar(poliza.idPol)}
                            title="Eliminar"
                          >
                            <span className="material-icons" style={{ fontSize: "1rem" }}>delete</span>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      }
    </div >
  );
}

export default GestionPoliza;