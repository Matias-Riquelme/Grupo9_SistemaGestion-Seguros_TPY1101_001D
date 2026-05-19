import React, { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import DetalleIncidente from "../../pages/admin/DetalleIncidente";
import FormularioServices from "../../services/formularioServices";
import Swal from "sweetalert2";

function GestionIncidenteUbi() {
  const [incidentes, setIncidentes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [incidenteSeleccionado, setIncidenteSeleccionado] = React.useState(null);
  const [tiposIncidente, setTiposIncidente] = React.useState([]);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    idIncidente: "",
    rut: "",
    base: "",
    tipoIncidente: "",
    patente: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      idIncidente: "",
      rut: "",
      base: "",
      tipoIncidente: "",
      patente: "",
      fechaDesde: "",
      fechaHasta: ""
    });
  };

  // Eliminar incidente
  const handleEliminarIncidente = async (idIncidente) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar incidente?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (confirm.isConfirmed) {
      try {
        await FormularioServices.deleteFormulario(idIncidente);
        Swal.fire({ icon: "success", title: "Incidente eliminado", timer: 1200 });
        setIncidentes(prev => prev.filter(inc => inc.idIncidente !== idIncidente));
      } catch (err) {
        const data = err.response?.data;
        const mensaje = typeof data === 'string' ? data : (data?.message || data?.error || data?.mensaje || err.message || "No se pudo eliminar.");
        Swal.fire({ icon: "error", title: "Error", text: mensaje });
      }
    }
  };



  const handleExportar = async () => {
    try {
      await FormularioServices.exportar();
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

  const handleImportar = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Importar Incidentes',
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
        didOpen: () => {
          const input = Swal.getInput();
          if (input) {
            input.click();
          }
        }
      });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        await Swal.fire({
          title: 'Importando...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const resultado = await FormularioServices.importar(formData);
        
        Swal.fire({
          icon: 'success',
          title: '¡Importación exitosa!',
          text: resultado || 'Los incidentes se han importado correctamente.',
          confirmButtonColor: '#045524'
        });

        // Recargar la lista de incidentes
        const [formulariosRes, tiposIncidenteRes] = await Promise.all([
          FormularioServices.getFormularios(),
          FormularioServices.getTiposIncidente()
        ]);
        const data = formulariosRes.data || formulariosRes;
        const incidentesNormalizados = (Array.isArray(data) ? data : []).map(inc => ({
          ...inc,
          idIncidente: inc.idIncidente || inc.idForm || inc.id_form || inc.codigoIncidente || inc.id || inc.incidenteId || inc._id,
          nombreConductor: inc.nombreConductor || inc.nombre_conductor,
          rutConductor: inc.rutConductor || inc.rut_conductor,
        }));

        incidentesNormalizados.sort((a, b) => {
          const dateA = new Date(a.fecha_hora_incidente || a.fechaHoraIncidente || a.fecha || 0);
          const dateB = new Date(b.fecha_hora_incidente || b.fechaHoraIncidente || b.fecha || 0);
          return dateB - dateA;
        });

        setIncidentes(incidentesNormalizados);
        setTiposIncidente(tiposIncidenteRes.data || tiposIncidenteRes || []);
      }
    } catch (err) {
      console.error("Error al importar:", err);
      const mensaje = err.response?.data?.message || err.message || 'Error al importar los incidentes.';
      Swal.fire({
        icon: 'error',
        title: 'Error en la importación',
        text: mensaje,
        confirmButtonColor: '#045524'
      });
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [formulariosRes, tiposIncidenteRes] = await Promise.all([
          FormularioServices.getFormularios(),
          FormularioServices.getTiposIncidente()
        ]);
        const data = formulariosRes.data || formulariosRes;
        const incidentesNormalizados = (Array.isArray(data) ? data : []).map(inc => ({
          ...inc,
          idIncidente: inc.idIncidente || inc.idForm || inc.id_form || inc.codigoIncidente || inc.id || inc.incidenteId || inc._id,
          nombreConductor: inc.nombreConductor || inc.nombre_conductor,
          rutConductor: inc.rutConductor || inc.rut_conductor,
        }));

        // Ordenar por fecha (más reciente primero)
        incidentesNormalizados.sort((a, b) => {
          const dateA = new Date(a.fecha_hora_incidente || a.fechaHoraIncidente || a.fecha || 0);
          const dateB = new Date(b.fecha_hora_incidente || b.fechaHoraIncidente || b.fecha || 0);
          return dateB - dateA;
        });

        setIncidentes(incidentesNormalizados);
        setTiposIncidente(tiposIncidenteRes.data || tiposIncidenteRes || []);
      } catch (err) {
        setError(err.message || "Error al cargar incidentes");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Si hay incidente seleccionado, mostrar detalle
  if (incidenteSeleccionado) {
    return (
      <div>
        <button
          className="btn btn-outline"
          onClick={() => setIncidenteSeleccionado(null)}
          style={{ marginBottom: 16 }}
        >
          Volver a la lista
        </button>
        <DetalleIncidente id={incidenteSeleccionado} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <BackButton />
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Gestión de Incidentes</h1>
          <p className="text-muted">Administración integral de incidentes y ubicaciones.</p>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-outline" onClick={handleImportar}>
            <span className="material-icons" style={{ fontSize: "1.2rem" }}>upload</span>
            Importar XLSX
          </button>
          <button className="btn btn-outline" onClick={handleExportar}>
            <span className="material-icons" style={{ fontSize: "1.2rem" }}>download</span>
            Exportar XLSX
          </button>
        </div>
      </div>

      {/* Card de Búsqueda y Filtros */}
      <div className="card mb-5">
        <div className="card-header">
          <h3 className="card-title">
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>search</span>
            Búsqueda y Filtros
          </h3>
          <button className="btn btn-sm btn-outline" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px 24px'
          }}>
            {/* Primera fila: Identificadores */}
            <div className="form-group">
              <label className="form-label">ID Incidente</label>
              <input
                type="text"
                name="idIncidente"
                className="form-input"
                placeholder="Ej: 123..."
                value={filtros.idIncidente}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">RUT Colaborador</label>
              <input
                type="text"
                name="rut"
                className="form-input"
                placeholder="12.345.678-k"
                value={filtros.rut}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Patente</label>
              <input
                type="text"
                name="patente"
                className="form-input"
                placeholder="AB-CD-12"
                value={filtros.patente}
                onChange={handleFilterChange}
              />
            </div>

            {/* Segunda fila: Categorización */}
            <div className="form-group">
              <label className="form-label">Base</label>
              <input
                type="text"
                name="base"
                className="form-input"
                placeholder="Nombre de la base..."
                value={filtros.base}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Incidente</label>
              <select
                name="tipoIncidente"
                className="form-input"
                value={filtros.tipoIncidente}
                onChange={handleFilterChange}
              >
                <option value="">Todos los tipos</option>
                {tiposIncidente.map((tipo) => (
                  <option key={tipo.idTipoIncidente || tipo.id} value={tipo.nombreTipoIncidente || tipo.nombre}>
                    {tipo.nombreTipoIncidente || tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tercera fila / Grupo: Rango de Fechas */}
            <div className="form-group">
              <label className="form-label">Fecha Desde</label>
              <input
                type="date"
                name="fechaDesde"
                className="form-input"
                value={filtros.fechaDesde}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Hasta</label>
              <input
                type="date"
                name="fechaHasta"
                className="form-input"
                value={filtros.fechaHasta}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="table-container">
        <div className="table-header">
          <h3>Listado de Incidentes ({incidentes.length})</h3>
        </div>
        {loading ? (
          <div className="loading-container"><p>Cargando incidentes...</p></div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}{" "}
            <button
              className="btn btn-sm btn-outline ml-3"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Fecha/Hora</th>
                <th>Conductor</th>
                <th>RUT Conductor</th>
                <th>Patente(s)</th>
                <th>Tipo Incidente</th>
                <th>Base</th>
                <th>Operación</th>
                <th>Nº Siniestro</th>
                <th>Relato</th>
                <th style={{ width: "180px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const incidentesFiltrados = incidentes.filter(inc => {
                  const matchId = !filtros.idIncidente || String(inc.idIncidente).toLowerCase().includes(filtros.idIncidente.toLowerCase());
                  const matchRut = !filtros.rut || (inc.rut_conductor || inc.rutConductor || "").toLowerCase().includes(filtros.rut.toLowerCase());
                  const matchBase = !filtros.base || (inc.base || "").toLowerCase().includes(filtros.base.toLowerCase());

                  const tipoInc = (inc.tipoIncidente && inc.tipoIncidente.nombreTipoIncidente) ||
                    inc.tipo_incidente || inc.tipoVehiculo || inc.tipo || inc.tipo_vehiculo_nombre || "";
                  const matchTipo = !filtros.tipoIncidente || tipoInc.toLowerCase() === filtros.tipoIncidente.toLowerCase();

                  const patentes = [inc.patente_1, inc.patente_2, inc.patente1, inc.patente2, inc.patente]
                    .filter(Boolean).join(", ");
                  const matchPatente = !filtros.patente || patentes.toLowerCase().includes(filtros.patente.toLowerCase());

                  // Filtro por fecha
                  const fechaIncStr = inc.fecha_hora_incidente || inc.fechaHoraIncidente || inc.fecha || "";
                  const matchFecha = (() => {
                    if (!fechaIncStr) return !filtros.fechaDesde && !filtros.fechaHasta;
                    const fechaInc = new Date(fechaIncStr).toISOString().split('T')[0];
                    if (filtros.fechaDesde && fechaInc < filtros.fechaDesde) return false;
                    if (filtros.fechaHasta && fechaInc > filtros.fechaHasta) return false;
                    return true;
                  })();

                  return matchId && matchRut && matchBase && matchTipo && matchPatente && matchFecha;
                });

                if (incidentesFiltrados.length === 0) {
                  return (
                    <tr>
                      <td colSpan="11" className="text-center py-4">
                        No se encontraron incidentes que coincidan con los filtros
                      </td>
                    </tr>
                  );
                }

                return incidentesFiltrados.map((inc, idx) => {
                  if (!inc || typeof inc !== "object") {
                    return null;
                  }

                  if (!inc.idIncidente) {
                    return null;
                  }

                  const fechaHora =
                    inc.fecha_hora_incidente
                      ? String(inc.fecha_hora_incidente).replace("T", " ").slice(0, 16)
                      : inc.fechaHoraIncidente
                        ? String(inc.fechaHoraIncidente).replace("T", " ").slice(0, 16)
                        : inc.fecha
                          ? String(inc.fecha).replace("T", " ").slice(0, 16)
                          : "";

                  const patentes = [
                    inc.patente_1,
                    inc.patente_2,
                    inc.patente1,
                    inc.patente2,
                    inc.patente,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  const tipoIncidente =
                    (inc.tipoIncidente && inc.tipoIncidente.nombreTipoIncidente) ||
                    inc.tipo_incidente ||
                    inc.tipoVehiculo ||
                    inc.tipo ||
                    inc.tipo_vehiculo_nombre ||
                    "";

                  const relato =
                    inc.relatoForm ||
                    inc.relato_form ||
                    inc.relato ||
                    inc.relatoDescripcion ||
                    inc.descripcion ||
                    "-";

                  const key = inc.idIncidente || idx;

                  return (
                    <tr key={key}>
                      <td>{inc.idIncidente}</td>
                      <td>{fechaHora}</td>
                      <td>{inc.nombre_conductor || inc.nombreConductor}</td>
                      <td>{inc.rut_conductor || inc.rutConductor}</td>
                      <td>{patentes}</td>
                      <td>{tipoIncidente}</td>
                      <td>{inc.base}</td>
                      <td>{inc.operacion}</td>
                      <td>{inc.numerosSiniestros || "No relacionado"}</td>
                      <td>{relato}</td>
                      <td className="text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setIncidenteSeleccionado(inc.idIncidente)}
                          >
                            <span className="material-icons">visibility</span> Ver Detalle
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleEliminarIncidente(inc.idIncidente)}
                          >
                            <span className="material-icons">delete</span> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GestionIncidenteUbi;