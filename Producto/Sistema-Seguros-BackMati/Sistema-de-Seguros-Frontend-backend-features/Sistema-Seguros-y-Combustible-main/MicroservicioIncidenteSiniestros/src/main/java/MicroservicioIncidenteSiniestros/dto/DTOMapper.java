package MicroservicioIncidenteSiniestros.dto;

import MicroservicioIncidenteSiniestros.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DTOMapper {

    // ==================== PAIS ====================
    public PaisDTO toDTO(Pais entity) {
        if (entity == null) return null;
        return new PaisDTO(entity.getIdPais(), entity.getNombrePais());
    }

    public Pais toEntity(PaisDTO dto) {
        if (dto == null) return null;
        Pais entity = new Pais();
        entity.setIdPais(dto.getIdPais());
        entity.setNombrePais(dto.getNombrePais());
        return entity;
    }

    // ==================== REGION ====================
    public RegionDTO toDTO(Region entity) {
        if (entity == null) return null;
        RegionDTO dto = new RegionDTO();
        dto.setIdReg(entity.getIdReg());
        dto.setNombreReg(entity.getNombreReg());
        dto.setPais(toDTO(entity.getPais()));
        return dto;
    }

    public Region toEntity(RegionDTO dto) {
        if (dto == null) return null;
        Region entity = new Region();
        entity.setIdReg(dto.getIdReg());
        entity.setNombreReg(dto.getNombreReg());
        entity.setPais(toEntity(dto.getPais()));
        return entity;
    }

    // ==================== COMUNA ====================
    public ComunaDTO toDTO(Comuna entity) {
        if (entity == null) return null;
        ComunaDTO dto = new ComunaDTO();
        dto.setIdComuna(entity.getIdComuna());
        dto.setNombreComuna(entity.getNombreComuna());
        dto.setRegion(toDTO(entity.getRegion()));
        return dto;
    }

    public Comuna toEntity(ComunaDTO dto) {
        if (dto == null) return null;
        Comuna entity = new Comuna();
        entity.setIdComuna(dto.getIdComuna());
        entity.setNombreComuna(dto.getNombreComuna());
        entity.setRegion(toEntity(dto.getRegion()));
        return entity;
    }

    // ==================== UBICACION INCIDENTE ====================
    public UbicacionIncidenteDTO toDTO(UbicacionIncidente entity) {
        if (entity == null) return null;
        UbicacionIncidenteDTO dto = new UbicacionIncidenteDTO();
        dto.setIdUbicacion(entity.getIdUbicacion());
        dto.setDescripcionUbi(entity.getDescripcionUbi());
        dto.setComuna(toDTO(entity.getComuna()));
        return dto;
    }

    public UbicacionIncidente toEntity(UbicacionIncidenteDTO dto) {
        if (dto == null) return null;
        UbicacionIncidente entity = new UbicacionIncidente();
        entity.setIdUbicacion(dto.getIdUbicacion());
        entity.setDescripcionUbi(dto.getDescripcionUbi());
        entity.setComuna(toEntity(dto.getComuna()));
        return entity;
    }

    // ==================== TIPO POLIZA ====================
    public TipoPolizaDTO toDTO(TipoPoliza entity) {
        if (entity == null) return null;
        return new TipoPolizaDTO(entity.getIdTipoPol(), entity.getNomTipoPol());
    }

    public TipoPoliza toEntity(TipoPolizaDTO dto) {
        if (dto == null) return null;
        TipoPoliza entity = new TipoPoliza();
        entity.setIdTipoPol(dto.getIdTipoPol());
        entity.setNomTipoPol(dto.getNomTipoPol());
        return entity;
    }

    // ==================== ASEGURADO ====================
    public AseguradoDTO toDTO(Asegurado entity) {
        if (entity == null) return null;
        return new AseguradoDTO(entity.getIdAsegurado(), entity.getRazonSocialAse(), entity.getRutAse());
    }

    public Asegurado toEntity(AseguradoDTO dto) {
        if (dto == null) return null;
        Asegurado entity = new Asegurado();
        entity.setIdAsegurado(dto.getIdAsegurado());
        entity.setRazonSocialAse(dto.getRazonSocialAse());
        entity.setRutAse(dto.getRutAse());
        return entity;
    }

    // ==================== CONTRATANTE ====================
    public ContratanteDTO toDTO(Contratante entity) {
        if (entity == null) return null;
        return new ContratanteDTO(entity.getIdContratante(), entity.getRazonSocialContra(), entity.getRutContra());
    }

    public Contratante toEntity(ContratanteDTO dto) {
        if (dto == null) return null;
        Contratante entity = new Contratante();
        entity.setIdContratante(dto.getIdContratante());
        entity.setRazonSocialContra(dto.getRazonSocialContra());
        entity.setRutContra(dto.getRutContra());
        return entity;
    }

    // ==================== TIPO COBERTURA ====================
    public TipoCoberturaDTO toDTO(TipoCobertura entity) {
        if (entity == null) return null;
        return new TipoCoberturaDTO(entity.getIdTipoCobertura(), entity.getNombre(), entity.getDescripcion(), entity.getActivo());
    }

    public TipoCobertura toEntity(TipoCoberturaDTO dto) {
        if (dto == null) return null;
        TipoCobertura entity = new TipoCobertura();
        entity.setIdTipoCobertura(dto.getIdTipoCobertura());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setActivo(dto.getActivo());
        return entity;
    }

    // ==================== TIPO DEDUCIBLE ====================
    public TipoDeducibleDTO toDTO(TipoDeducible entity) {
        if (entity == null) return null;
        return new TipoDeducibleDTO(entity.getIdTipoDeducible(), entity.getNombre(), entity.getDescripcion(), entity.getActivo());
    }

    public TipoDeducible toEntity(TipoDeducibleDTO dto) {
        if (dto == null) return null;
        TipoDeducible entity = new TipoDeducible();
        entity.setIdTipoDeducible(dto.getIdTipoDeducible());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setActivo(dto.getActivo());
        return entity;
    }

    // ==================== DEDUCIBLE ====================
    public DeducibleDTO toDTO(Deducible entity) {
        if (entity == null) return null;
        DeducibleDTO dto = new DeducibleDTO();
        dto.setIdDedu(entity.getIdDedu());
        dto.setNombreDedu(entity.getNombreDedu());
        dto.setIdPoliza(entity.getPoliza() != null ? entity.getPoliza().getIdPol() : null);
        dto.setTipoDeducible(toDTO(entity.getTipoDeducible()));
        return dto;
    }

    // ==================== COBERTURA ====================
    public CoberturaDTO toDTO(Cobertura entity) {
        if (entity == null) return null;
        CoberturaDTO dto = new CoberturaDTO();
        dto.setIdCobertura(entity.getIdCobertura());
        dto.setDescripcionCob(entity.getDescripcionCob());
        dto.setIdPoliza(entity.getPoliza() != null ? entity.getPoliza().getIdPol() : null);
        dto.setTipoCobertura(toDTO(entity.getTipoCobertura()));
        return dto;
    }

    // ==================== POLIZA ====================
    public PolizaDTO toDTO(Poliza entity) {
        if (entity == null) return null;
        PolizaDTO dto = new PolizaDTO();
        dto.setIdPol(entity.getIdPol());
        dto.setNombrePol(entity.getNombrePol());
        dto.setNumeroPol(entity.getNumeroPol());
        dto.setFechaEmiPol(entity.getFechaEmiPol());
        dto.setFechaIniPol(entity.getFechaIniPol());
        dto.setFechaFinPol(entity.getFechaFinPol());
        dto.setFechaVencPol(entity.getFechaVencPol());
        dto.setPrimaPol(entity.getPrimaPol());
        dto.setTipoMoneda(entity.getTipoMoneda());
        dto.setAseguradosAdi(entity.getAseguradosAdi());
        dto.setTipoPoliza(toDTO(entity.getTipoPoliza()));
        dto.setAsegurado(toDTO(entity.getAsegurado()));
        dto.setContratante(toDTO(entity.getContratante()));
        if (entity.getDeducibles() != null) {
            dto.setDeducibles(entity.getDeducibles().stream().map(this::toDTO).collect(Collectors.toList()));
        }
        if (entity.getCoberturas() != null) {
            dto.setCoberturas(entity.getCoberturas().stream().map(this::toDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    // ==================== TIPO INCIDENTE ====================
    public TipoIncidenteDTO toDTO(TipoIncidente entity) {
        if (entity == null) return null;
        return new TipoIncidenteDTO(entity.getIdTipoIncidente(), entity.getNombreTipoIncidente(), entity.getCategoria());
    }

    public TipoIncidente toEntity(TipoIncidenteDTO dto) {
        if (dto == null) return null;
        TipoIncidente entity = new TipoIncidente();
        entity.setIdTipoIncidente(dto.getIdTipoIncidente());
        entity.setNombreTipoIncidente(dto.getNombreTipoIncidente());
        entity.setCategoria(dto.getCategoria());
        return entity;
    }

    // ==================== TIPO SINIESTRO ====================
    public TipoSiniestroDTO toDTO(TipoSiniestro entity) {
        if (entity == null) return null;
        return new TipoSiniestroDTO(entity.getIdTipoSin(), entity.getNombreTipoSiniestro(), entity.getDescTipoSiniestro());
    }

    public TipoSiniestro toEntity(TipoSiniestroDTO dto) {
        if (dto == null) return null;
        TipoSiniestro entity = new TipoSiniestro();
        entity.setIdTipoSin(dto.getIdTipoSin());
        entity.setNombreTipoSiniestro(dto.getNombreTipoSiniestro());
        entity.setDescTipoSiniestro(dto.getDescTipoSiniestro());
        return entity;
    }

    // ==================== ESTADO SINIESTRO ====================
    public EstadoSiniestroDTO toDTO(EstadoSiniestro entity) {
        if (entity == null) return null;
        return new EstadoSiniestroDTO(entity.getIdEstado(), entity.getNombreEstado());
    }

    public EstadoSiniestro toEntity(EstadoSiniestroDTO dto) {
        if (dto == null) return null;
        EstadoSiniestro entity = new EstadoSiniestro();
        entity.setIdEstado(dto.getIdEstado());
        entity.setNombreEstado(dto.getNombreEstado());
        return entity;
    }

    // ==================== CIERRE ====================
    public CierreDTO toDTO(Cierre entity) {
        if (entity == null) return null;
        return new CierreDTO(entity.getIdCierre(), entity.getFechaCierre(), entity.getMotivoCierre());
    }

    public Cierre toEntity(CierreDTO dto) {
        if (dto == null) return null;
        Cierre entity = new Cierre();
        entity.setIdCierre(dto.getIdCierre());
        entity.setFechaCierre(dto.getFechaCierre());
        entity.setMotivoCierre(dto.getMotivoCierre());
        return entity;
    }

    // ==================== TERCERO ====================
    public TerceroDTO toDTO(Tercero entity) {
        if (entity == null) return null;
        TerceroDTO dto = new TerceroDTO();
        dto.setIdTercero(entity.getIdTercero());
        dto.setRutTer(entity.getRutTer());
        dto.setNombreTer(entity.getNombreTer());
        dto.setTelefonoTer(entity.getTelefonoTer());
        dto.setEmailTer(entity.getEmailTer());
        dto.setAseguradoraTer(entity.getAseguradoraTer());
        dto.setNumeroSinTer(entity.getNumeroSinTer());
        dto.setIdFormularioIncidente(entity.getFormularioIncidente() != null ? entity.getFormularioIncidente().getIdForm() : null);
        return dto;
    }

    // ==================== FORMULARIO INCIDENTE ====================
    public FormularioIncidenteDTO toDTO(FormularioIncidente entity) {
        return toDTO(entity, true);
    }

    public FormularioIncidenteDTO toDTO(FormularioIncidente entity, boolean includeTerceros) {
        if (entity == null) return null;
        FormularioIncidenteDTO dto = new FormularioIncidenteDTO();
        dto.setIdForm(entity.getIdForm());
        dto.setUbicacion(toDTO(entity.getUbicacion()));
        dto.setIdUsuario(entity.getIdUsuario());
        dto.setTipoIncidente(toDTO(entity.getTipoIncidente()));
        dto.setIdTipoVehiculo(entity.getIdTipoVehiculo());
        dto.setFechaIngresoForm(entity.getFechaIngresoForm());
        dto.setFechaHoraIncidente(entity.getFechaHoraIncidente());
        dto.setRelatoForm(entity.getRelatoForm());
        dto.setPatente1(entity.getPatente1());
        dto.setPatente2(entity.getPatente2());
        dto.setNombreConductor(entity.getNombreConductor());
        dto.setRutConductor(entity.getRutConductor());
        dto.setBase(entity.getBase());
        dto.setOperacion(entity.getOperacion());
        dto.setLugarCarga(entity.getLugarCarga());
        dto.setFechaIniTransporteCarga(entity.getFechaIniTransporteCarga());
        dto.setDestinoCarga(entity.getDestinoCarga());
        // Agregar IDs y números de los siniestros relacionados si existen
        if (entity.getSiniestros() != null && !entity.getSiniestros().isEmpty()) {
            List<Integer> ids = entity.getSiniestros().stream()
                .map(Siniestro::getIdSin)
                .collect(Collectors.toList());
            dto.setIdsSiniestros(ids);
            
            String numeros = entity.getSiniestros().stream()
                .map(Siniestro::getNumeroSin)
                .filter(num -> num != null && !num.isEmpty())
                .collect(Collectors.joining(", "));
            dto.setNumerosSiniestros(numeros.isEmpty() ? null : numeros);
        }
        if (includeTerceros && entity.getTerceros() != null) {
            dto.setTerceros(entity.getTerceros().stream().map(this::toDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    // ==================== SINIESTRO ====================
    public SiniestroDTO toDTO(Siniestro entity) {
        if (entity == null) return null;
        SiniestroDTO dto = new SiniestroDTO();
        dto.setIdSin(entity.getIdSin());
        dto.setFechaHoraSin(entity.getFechaHoraSin());
        dto.setDeducibleApliSin(entity.getDeducibleApliSin());
        dto.setIndemnizacionSin(entity.getIndemnizacionSin());
        dto.setNumeroSin(entity.getNumeroSin());
        dto.setCostoSin(entity.getCostoSin());
        dto.setObservacion(entity.getObservacion());
        dto.setFechaUltimaModificacion(entity.getFechaUltimaModificacion());
        dto.setPoliza(toDTO(entity.getPoliza()));
        dto.setEstadoSiniestro(toDTO(entity.getEstadoSiniestro()));
        dto.setTipoSiniestro(toDTO(entity.getTipoSiniestro()));
        dto.setCierre(toDTO(entity.getCierre()));
        dto.setFormularioIncidente(toDTO(entity.getFormularioIncidente(), false)); // Sin terceros para evitar LAZY loading
        return dto;
    }

    // ==================== LIST CONVERTERS ====================
    public List<PaisDTO> toPaisDTOList(List<Pais> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<RegionDTO> toRegionDTOList(List<Region> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ComunaDTO> toComunaDTOList(List<Comuna> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<UbicacionIncidenteDTO> toUbicacionDTOList(List<UbicacionIncidente> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TipoPolizaDTO> toTipoPolizaDTOList(List<TipoPoliza> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AseguradoDTO> toAseguradoDTOList(List<Asegurado> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ContratanteDTO> toContratanteDTOList(List<Contratante> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PolizaDTO> toPolizaDTOList(List<Poliza> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TipoIncidenteDTO> toTipoIncidenteDTOList(List<TipoIncidente> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TipoSiniestroDTO> toTipoSiniestroDTOList(List<TipoSiniestro> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EstadoSiniestroDTO> toEstadoSiniestroDTOList(List<EstadoSiniestro> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CierreDTO> toCierreDTOList(List<Cierre> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TerceroDTO> toTerceroDTOList(List<Tercero> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FormularioIncidenteDTO> toFormularioIncidenteDTOList(List<FormularioIncidente> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SiniestroDTO> toSiniestroDTOList(List<Siniestro> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TipoCoberturaDTO> toTipoCoberturaDTOList(List<TipoCobertura> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TipoDeducibleDTO> toTipoDeducibleDTOList(List<TipoDeducible> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DeducibleDTO> toDeducibleDTOList(List<Deducible> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CoberturaDTO> toCoberturaDTOList(List<Cobertura> entities) {
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }
}
