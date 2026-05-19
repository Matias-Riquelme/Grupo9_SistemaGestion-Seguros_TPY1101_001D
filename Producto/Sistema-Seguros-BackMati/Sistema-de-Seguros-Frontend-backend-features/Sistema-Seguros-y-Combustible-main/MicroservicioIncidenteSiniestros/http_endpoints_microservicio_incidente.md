# Endpoints HTTP MicroservicioIncidenteSiniestros

Base URL: http://localhost:8082

---


## Contratante
- GET    http://localhost:8082/api/contratante/listar
- GET    http://localhost:8082/api/contratante/obtener/{id}
- POST   http://localhost:8082/api/contratante/crear
- PUT    http://localhost:8082/api/contratante/actualizar/{id}
- DELETE http://localhost:8082/api/contratante/eliminar/{id}


## Region
- GET    http://localhost:8082/api/region/listar
- GET    http://localhost:8082/api/region/obtener/{id}
- POST   http://localhost:8082/api/region/crear
- PUT    http://localhost:8082/api/region/actualizar/{id}
- DELETE http://localhost:8082/api/region/eliminar/{id}


## Tercero
- GET    http://localhost:8082/api/tercero/listar
- GET    http://localhost:8082/api/tercero/obtener/{id}
- POST   http://localhost:8082/api/tercero/crear
- PUT    http://localhost:8082/api/tercero/actualizar/{id}
- DELETE http://localhost:8082/api/tercero/eliminar/{id}


## TipoPoliza
- GET    http://localhost:8082/api/tipo-poliza/listar
- GET    http://localhost:8082/api/tipo-poliza/obtener/{id}
- POST   http://localhost:8082/api/tipo-poliza/crear
- PUT    http://localhost:8082/api/tipo-poliza/actualizar/{id}
- DELETE http://localhost:8082/api/tipo-poliza/eliminar/{id}


## TipoSiniestro
- GET    http://localhost:8082/api/tipo-siniestro/listar
- GET    http://localhost:8082/api/tipo-siniestro/obtener/{id}
- POST   http://localhost:8082/api/tipo-siniestro/crear
- PUT    http://localhost:8082/api/tipo-siniestro/actualizar/{id}
- DELETE http://localhost:8082/api/tipo-siniestro/eliminar/{id}


## UbicacionIncidente
- GET    http://localhost:8082/api/ubicacion-incidente/listar
- GET    http://localhost:8082/api/ubicacion-incidente/obtener/{id}
- POST   http://localhost:8082/api/ubicacion-incidente/crear
- PUT    http://localhost:8082/api/ubicacion-incidente/actualizar/{id}
- DELETE http://localhost:8082/api/ubicacion-incidente/eliminar/{id}


## TipoIncidente
- GET    http://localhost:8082/api/tipo-incidente/listar
- GET    http://localhost:8082/api/tipo-incidente/obtener/{id}
- POST   http://localhost:8082/api/tipo-incidente/crear
- PUT    http://localhost:8082/api/tipo-incidente/actualizar/{id}
- DELETE http://localhost:8082/api/tipo-incidente/eliminar/{id}


## Pais
- GET    http://localhost:8082/api/pais/listar
- GET    http://localhost:8082/api/pais/obtener/{id}
- POST   http://localhost:8082/api/pais/crear
- PUT    http://localhost:8082/api/pais/actualizar/{id}
- DELETE http://localhost:8082/api/pais/eliminar/{id}


## Siniestro
- GET    http://localhost:8082/api/siniestro/listar
- GET    http://localhost:8082/api/siniestro/obtener/{id}
- POST   http://localhost:8082/api/siniestro/crear
- PUT    http://localhost:8082/api/siniestro/actualizar/{id}
- DELETE http://localhost:8082/api/siniestro/eliminar/{id}
- GET    http://localhost:8082/api/siniestro/contar-mes-ano
- GET    http://localhost:8082/api/siniestro/contar-ano/{ano}
- GET    http://localhost:8082/api/siniestro/contar-por-poliza/{polizaId}
- GET    http://localhost:8082/api/siniestro/contar-por-incidente/{incidenteId}


## FormularioIncidente
- GET    http://localhost:8082/api/formulario-incidente/listar
- GET    http://localhost:8082/api/formulario-incidente/obtener/{id}
- POST   http://localhost:8082/api/formulario-incidente/crear
- PUT    http://localhost:8082/api/formulario-incidente/actualizar/{id}
- DELETE http://localhost:8082/api/formulario-incidente/eliminar/{id}
- GET    http://localhost:8082/api/formulario-incidente/por-siniestro/{siniestroId}
- GET    http://localhost:8082/api/formulario-incidente/contar-por-siniestro/{siniestroId}


## Poliza
- GET    http://localhost:8082/api/poliza/listar
- GET    http://localhost:8082/api/poliza/obtener/{id}
- POST   http://localhost:8082/api/poliza/crear
- PUT    http://localhost:8082/api/poliza/actualizar/{id}
- DELETE http://localhost:8082/api/poliza/eliminar/{id}
- GET    http://localhost:8082/api/poliza/por-siniestro/{idSin}
- GET    http://localhost:8082/api/poliza/contar-siniestros/{idPol}


## EstadoSiniestro
- GET    http://localhost:8082/api/estado-siniestro/listar
- GET    http://localhost:8082/api/estado-siniestro/obtener/{id}
- POST   http://localhost:8082/api/estado-siniestro/crear
- PUT    http://localhost:8082/api/estado-siniestro/actualizar/{id}
- DELETE http://localhost:8082/api/estado-siniestro/eliminar/{id}


## Deducible
- GET    http://localhost:8082/api/deducible/listar
- GET    http://localhost:8082/api/deducible/obtener/{id}
- POST   http://localhost:8082/api/deducible/crear
- PUT    http://localhost:8082/api/deducible/actualizar/{id}
- DELETE http://localhost:8082/api/deducible/eliminar/{id}


## Comuna
- GET    http://localhost:8082/api/comuna/listar
- GET    http://localhost:8082/api/comuna/obtener/{id}
- POST   http://localhost:8082/api/comuna/crear
- PUT    http://localhost:8082/api/comuna/actualizar/{id}
- DELETE http://localhost:8082/api/comuna/eliminar/{id}


## Cobertura
- GET    http://localhost:8082/api/cobertura/listar
- GET    http://localhost:8082/api/cobertura/obtener/{id}
- POST   http://localhost:8082/api/cobertura/crear
- PUT    http://localhost:8082/api/cobertura/actualizar/{id}
- DELETE http://localhost:8082/api/cobertura/eliminar/{id}


## Cierre
- GET    http://localhost:8082/api/cierre/listar
- GET    http://localhost:8082/api/cierre/obtener/{id}
- POST   http://localhost:8082/api/cierre/crear
- PUT    http://localhost:8082/api/cierre/actualizar/{id}
- DELETE http://localhost:8082/api/cierre/eliminar/{id}


## Asegurado
- GET    http://localhost:8082/api/asegurado/listar
- GET    http://localhost:8082/api/asegurado/obtener/{id}
- POST   http://localhost:8082/api/asegurado/crear
- PUT    http://localhost:8082/api/asegurado/actualizar/{id}
- DELETE http://localhost:8082/api/asegurado/eliminar/{id}

---

**Nota:** Todas las rutas deben ser precedidas por http://localhost:8082
