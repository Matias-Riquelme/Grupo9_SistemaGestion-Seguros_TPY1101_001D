package gestion_vehiculos_combustible.service;

import gestion_vehiculos_combustible.model.Vehiculo;
import gestion_vehiculos_combustible.repository.VehiculoRepository;
import gestion_vehiculos_combustible.repository.TipovehiculoRepository;
import gestion_vehiculos_combustible.repository.OperacionesRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import gestion_vehiculos_combustible.model.Operaciones;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class VehiculoImportService {

    @Autowired
    private VehiculoRepository repository;
    
    @Autowired
    private TipovehiculoRepository tipovehiculoRepository;
    
    @Autowired
    private OperacionesRepository operacionesRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    @Async("taskExecutor")
    public CompletableFuture<String> procesarArchivo(InputStream inputStream) {
        long start = System.currentTimeMillis();
        List<Vehiculo> buffer = new ArrayList<>();
        List<String> errores = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Obtener la fila de encabezados
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return CompletableFuture.completedFuture("Error: El archivo no contiene encabezados");
            }

            int rowNumber = 0;
            for (Row row : sheet) {
                rowNumber++;
                // Saltar la fila de encabezados
                if (rowNumber == 1) continue;
                
                // Saltar filas vacías
                if (row == null || isRowEmpty(row)) continue;

                try {
                    Vehiculo v = new Vehiculo();

                    // Mapeo de las columnas según orden de exportación (0-indexed)
                    v.setPatente(getCellValueAsString(row.getCell(0)));
                    v.setMarca(getCellValueAsString(row.getCell(1)));
                    v.setModelo(getCellValueAsString(row.getCell(2)));
                    
                    // Tipo de vehículo - puede ser ID o nombre
                    String tipoValue = getCellValueAsString(row.getCell(3));
                    Tipovehiculo tipoVehiculo = buscarTipoVehiculo(tipoValue);
                    if (tipoVehiculo != null) {
                        v.setId_tipo_vehiculo(tipoVehiculo);
                    } else {
                        throw new Exception("Tipo de vehículo no encontrado: " + tipoValue);
                    }
                    
// Base (Ignorada porque se obtiene según la operación, pero la leemos para mantener el orden)
                    String baseValue = getCellValueAsString(row.getCell(4));

                    // Operación - puede ser ID o nombre
                    String operacionValue = getCellValueAsString(row.getCell(5));
                    Operaciones operacion = buscarOperacion(operacionValue);
                    if (operacion != null) {
                        v.setId_operacion(operacion);
                    } else {
                        throw new Exception("Operación no encontrada: " + operacionValue);
                    }

                    // Póliza - puede ser ID o nombre
                    String polizaValue = getCellValueAsString(row.getCell(6));
                    Long idPoliza = buscarPoliza(polizaValue);
                    if (idPoliza != null) {
                        v.setIdPoliza(idPoliza);
                    }

                    v.setAnio(getCellValueAsInteger(row.getCell(7)));
                    v.setAnioRegistro(getCellValueAsInteger(row.getCell(8)));
                    v.setNum_motor_veh(getCellValueAsString(row.getCell(9)));
                    v.setNum_chasis_veh(getCellValueAsString(row.getCell(10)));

                    buffer.add(v);

                    if (buffer.size() >= 500) {
                        repository.saveAll(buffer);
                        buffer.clear();
                    }
                } catch (Exception e) {
                    log.error("Error en fila {}: {}", rowNumber, e.getMessage());
                    errores.add("Fila " + rowNumber + ": " + e.getMessage());
                }
            }

            if (!buffer.isEmpty()) {
                repository.saveAll(buffer);
            }

        } catch (IOException e) {
            log.error("Error crítico al procesar archivo Excel de vehículos", e);
            return CompletableFuture.completedFuture("Error crítico: " + e.getMessage());
        }

        long duration = System.currentTimeMillis() - start;
        log.info("Carga Vehiculos: {} ms. Errores: {}", duration, errores.size());
        return CompletableFuture.completedFuture("Procesado. Errores: " + errores.size());
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private Long getCellValueAsLong(Cell cell) {
        String value = getCellValueAsString(cell);
        return value.isEmpty() ? null : Long.parseLong(value);
    }

    private Integer getCellValueAsInteger(Cell cell) {
        String value = getCellValueAsString(cell);
        return value.isEmpty() ? null : Integer.parseInt(value);
    }
    
    /**
     * Busca un tipo de vehículo por ID o nombre
     */
    private Tipovehiculo buscarTipoVehiculo(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // Intentar buscar por ID si es numérico
        try {
            Long id = Long.parseLong(value);
            Optional<Tipovehiculo> porId = tipovehiculoRepository.findById(id);
            if (porId.isPresent()) {
                return porId.get();
            }
        } catch (NumberFormatException e) {
            // No es un número, buscar por nombre
        }
        
        // Buscar por nombre
        Optional<Tipovehiculo> porNombre = tipovehiculoRepository.findByTipoVehiculoNombre(value);
        return porNombre.orElse(null);
    }
    
    /**
     * Obtiene el nombre de una póliza por su ID usando consulta SQL nativa
     */
    private String obtenerNombrePoliza(Long idPoliza) {
        if (idPoliza == null) {
            return "";
        }
        
        try {
            Query query = entityManager.createNativeQuery(
                "SELECT nombre_pol FROM poliza WHERE id_pol = :idPoliza");
            query.setParameter("idPoliza", idPoliza);
            Object result = query.getSingleResult();
            return result != null ? result.toString() : "";
        } catch (Exception e) {
            log.warn("No se encontró póliza con ID: {}", idPoliza);
            return "";
        }
    }
    
    /**
     * Busca una póliza por ID o nombre y retorna su ID
     */
    private Long buscarPoliza(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // Intentar buscar por ID si es numérico
        try {
            Long id = Long.parseLong(value);
            Query query = entityManager.createNativeQuery(
                "SELECT id_pol FROM poliza WHERE id_pol = :id");
            query.setParameter("id", id);
            Object result = query.getSingleResult();
            return result != null ? ((Number) result).longValue() : null;
        } catch (NumberFormatException e) {
            // No es un número, buscar por nombre
        } catch (Exception e) {
            // No se encontró por ID
        }
        
        // Buscar por nombre
        try {
            Query query = entityManager.createNativeQuery(
                "SELECT id_pol FROM poliza WHERE nombre_pol = :nombre");
            query.setParameter("nombre", value);
            Object result = query.getSingleResult();
            return result != null ? ((Number) result).longValue() : null;
        } catch (Exception e) {
            log.warn("No se encontró póliza con nombre: {}", value);
            return null;
        }
    }
    
    /**
     * Busca una operación por ID o nombre
     */
    private Operaciones buscarOperacion(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        // Intentar buscar por ID si es numérico
        try {
            Long id = Long.parseLong(value);
            Optional<Operaciones> porId = operacionesRepository.findById(id);
            if (porId.isPresent()) {
                return porId.get();
            }
        } catch (NumberFormatException e) {
            // No es un número, buscar por nombre
        }
        
        // Buscar por nombre
        Optional<Operaciones> porNombre = operacionesRepository.findByNombre(value);
        return porNombre.orElse(null);
    }

    public void exportarAExcel(OutputStream outputStream) {
        List<Vehiculo> vehiculos = repository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Vehículos");
            
            // Crear fila de encabezados
            Row headerRow = sheet.createRow(0);
            String[] headers = {"PATENTE", "MARCA", "MODELO", "TIPO",
                               "BASE", "OPERACIÓN", "PÓLIZA", "AÑO", "AÑO REGISTRO", "N° MOTOR",
                               "N° CHASIS"};

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            int rowNum = 1;
            for (Vehiculo v : vehiculos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(v.getPatente() != null ? v.getPatente() : "");
                row.createCell(1).setCellValue(v.getMarca() != null ? v.getMarca() : "");
                row.createCell(2).setCellValue(v.getModelo() != null ? v.getModelo() : "");
                row.createCell(3).setCellValue(v.getId_tipo_vehiculo() != null ?
                    v.getId_tipo_vehiculo().getTipo_vehiculo() : "");
                row.createCell(4).setCellValue(v.getId_operacion() != null && v.getId_operacion().getBase() != null ?
                    v.getId_operacion().getBase().getNombre() : "");
                row.createCell(5).setCellValue(v.getId_operacion() != null ?
                    v.getId_operacion().getNombre() : "");
                row.createCell(6).setCellValue(obtenerNombrePoliza(v.getIdPoliza()));
                row.createCell(7).setCellValue((double) v.getAnio());
                row.createCell(8).setCellValue((double) v.getAnioRegistro());
                row.createCell(9).setCellValue(v.getNum_motor_veh() != null ? v.getNum_motor_veh() : "");
                row.createCell(10).setCellValue(v.getNum_chasis_veh() != null ? v.getNum_chasis_veh() : "");
            }
            
            // Auto ajustar el ancho de las columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            
        } catch (IOException e) {
            log.error("Error al exportar vehículos a Excel", e);
        }
    }
}
