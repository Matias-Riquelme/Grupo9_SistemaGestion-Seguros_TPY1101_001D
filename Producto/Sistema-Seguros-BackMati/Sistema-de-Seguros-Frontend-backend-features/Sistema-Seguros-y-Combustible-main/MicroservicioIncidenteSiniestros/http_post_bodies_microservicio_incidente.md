# Ejemplos de Peticiones POST (Microservicio Incidente Siniestros)

A continuación se muestran ejemplos de peticiones HTTP POST para los endpoints `/crear` de cada entidad, con el body correspondiente en formato JSON.

---

## Comuna
POST `/api/comuna/crear`
```json
{
  "nombreComuna": "Santiago Centro",
  "region": { "idReg": 1 }
}
```

## Region
POST `/api/region/crear`
```json
{
  "nombreReg": "Región Metropolitana",
  "pais": { "idPais": 1 }
}
```

## Pais
POST `/api/pais/crear`
```json
{
  "nombrePais": "Chile"
}
```

## Siniestro
POST `/api/siniestro/crear`
```json
{
  "fechaHoraSin": "2024-01-01T12:00:00",
  "deducibleApliSin": 10000.0,
  "indemnizacionSin": 50000.0,
  "numeroSin": 12345,
  "costoSin": 60000.0,
  "poliza": { "idPol": 1 },
  "estadoSiniestro": { "idEstado": 1 },
  "tipoSiniestro": { "idTipoSin": 1 },
  "cierre": { "idCierre": 1 },
  "formularioIncidente": { "idForm": 1 }
}
```

## Poliza
POST `/api/poliza/crear`
```json
{
  "nombrePol": "Poliza Vehicular",
  "numeroPol": 123456,
  "fechaEmiPol": "2024-01-01T00:00:00",
  "fechaIniPol": "2024-01-01T00:00:00",
  "fechaFinPol": "2025-01-01T00:00:00",
  "fechaVencPol": "2025-01-01T00:00:00",
  "primaPol": 1200.0,
  "aseguradosAdi": "Juan Perez",
  "tipoPoliza": { "idTipoPol": 1 },
  "asegurado": { "idAsegurado": 1 },
  "contratante": { "idContratante": 1 }
}
```

## TipoIncidente
POST `/api/tipo-incidente/crear`
```json
{
  "nombreTipoIncidente": "Colisión"
}
```

## TipoSiniestro
POST `/api/tipo-siniestro/crear`
```json
{
  "nombreTipoSiniestro": "Robo",
  "descTipoSiniestro": "Robo de vehículo asegurado"
}
```

## UbicacionIncidente
POST `/api/ubicacion-incidente/crear`
```json
{
  "descripcionUbi": "Av. Libertador 1234",
  "comuna": { "idComuna": 1 }
}
```

## TipoPoliza
POST `/api/tipo-poliza/crear`
```json
{
  "nomTipoPol": "Automotriz"
}
```

## Tercero
POST `/api/tercero/crear`
```json
{
  "nombreTer": "Pedro",
  "apellidoTer": "Gonzalez",
  "telefonoTer": "987654321",
  "emailTer": "pedro@mail.com",
  "aseguradoraTer": "Seguros XYZ",
  "numeroSinTer": "SIN-2024-001",
  "formularioIncidente": { "idForm": 1 }
}
```

## FormularioIncidente
POST `/api/formulario-incidente/crear`
```json
{
  "ubicacion": { "idUbicacion": 1 },
  "idUsuario": "user-keycloak-uuid",
  "tipoIncidente": { "idTipoIncidente": 1 },
  "fechaIngresoForm": "2024-01-01T10:00:00",
  "fechaHoraIncidente": "2024-01-01T09:00:00",
  "relatoForm": "Descripción del incidente...",
  "patente1": "ABCD12",
  "patente2": "EFGH34",
  "nombreConductor": "Juan Perez",
  "rutConductor": "12.345.678-9",
  "base": "Base Central",
  "operacion": "Operación 1",
  "lugarCarga": "Puerto Central",
  "fechaIniTransporteCarga": "2024-01-01T08:00:00",
  "destinoCarga": "Destino Final"
}
```

## EstadoSiniestro
POST `/api/estado-siniestro/crear`
```json
{
  "nombreEstado": "En Proceso"
}
```

## Deducible
POST `/api/deducible/crear`
```json
{
  "nombreDedu": "Deducible Básico",
  "poliza": { "idPol": 1 }
}
```

## Contratante
POST `/api/contratante/crear`
```json
{
  "razonSocialContra": "Empresa ABC S.A.",
  "rutContra": "76.543.210-1"
}
```

## Cobertura
POST `/api/cobertura/crear`
```json
{
  "descripcionCob": "Cobertura total por daños",
  "poliza": { "idPol": 1 }
}
```

## Cierre
POST `/api/cierre/crear`
```json
{
  "fechaCierre": "2024-01-10T15:00:00",
  "motivoCierre": "Siniestro resuelto"
}
```

## Asegurado
POST `/api/asegurado/crear`
```json
{
  "razonSocialAse": "Persona Natural",
  "rutAse": "11.111.111-1"
}
```

---

**Nota:** Los campos con referencias a otras entidades deben ser reemplazados por los IDs reales existentes en la base de datos.
