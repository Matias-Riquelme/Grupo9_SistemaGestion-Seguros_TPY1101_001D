package MicroservicioIncidenteSiniestros.services;

import MicroservicioIncidenteSiniestros.model.*;
import MicroservicioIncidenteSiniestros.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class SiniestroImportService {

    @Autowired
    private SiniestroRepository repository;
    
    @Autowired
    private PolizaRepository polizaRepository;
    
    @Autowired
    private EstadoSiniestroRepository estadoSiniestroRepository;
    
    @Autowired
    private TipoSiniestroRepository tipoSiniestroRepository;
    
    @Autowired
    private FormularioIncidenteRepository formularioIncidenteRepository;
    
    @Autowired
    private CierreRepository cierreRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Async("taskExecutor")
    public CompletableFuture<String> procesarArchivo(InputStream inputStream) {
        long start = System.currentTimeMillis();
        List<Siniestro> buffer = new ArrayList<>();
        List<String> errores = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                return CompletableFuture.completedFuture("Error: El archivo no contiene encabezados");
            }

            int rowNumber = 0;
            for (Row row : sheet) {
                rowNumber++;
                if (rowNumber == 1) continue;
                if (row == null || isRowEmpty(row)) continue;

                try {
                    Siniestro siniestro = new Siniestro();

                    siniestro.setNumeroSin(getCellValueAsString(row.getCell(0)));
                    siniestro.setFechaHoraSin(getCellValueAsDateTime(row.getCell(1)));
                    siniestro.setCostoSin(getCellValueAsBigDecimal(row.getCell(2)));
                    siniestro.setDeducibleApliSin(getCellValueAsBigDecimal(row.getCell(3)));
                    siniestro.setIndemnizacionSin(getCellValueAsBigDecimal(row.getCell(4)));
                    
                    // Póliza
                    String polizaValue = getCellValueAsString(row.getCell(5));
                    Poliza poliza = buscarPoliza(polizaValue);
                    if (poliza != null) {
                        siniestro.setPoliza(poliza);
                    }
                    
                    // Estado Siniestro
                    String estadoValue = getCellValueAsString(row.getCell(6));
                    EstadoSiniestro estado = buscarEstadoSiniestro(estadoValue);
                    if (estado != null) {
                        siniestro.setEstadoSiniestro(estado);
                    }
                    
                    // Tipo Siniestro
                    String tipoValue = getCellValueAsString(row.getCell(7));
                    TipoSiniestro tipo = buscarTipoSiniestro(tipoValue);
                    if (tipo != null) {
                        siniestro.setTipoSiniestro(tipo);
                    }
                    
                    // Cierre (opcional)
                    String cierreValue = getCellValueAsString(row.getCell(8));
                    if (cierreValue != null && !cierreValue.isEmpty()) {
                        Cierre cierre = buscarCierre(cierreValue);
                        siniestro.setCierre(cierre);
                    }
                    
                    // Formulario Incidente (opcional)
                    String formValue = getCellValueAsString(row.getCell(9));
                    if (formValue != null && !formValue.isEmpty()) {
                        FormularioIncidente form = buscarFormulario(formValue);
                        siniestro.setFormularioIncidente(form);
                    }

                    buffer.add(siniestro);

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

            long end = System.currentTimeMillis();
            log.info("Importación completada en {} ms", (end - start));

            if (errores.isEmpty()) {
                return CompletableFuture.completedFuture("Importación exitosa");
            } else {
                return CompletableFuture.completedFuture("Importación con errores: " + String.join("; ", errores));
            }

        } catch (Exception e) {
            log.error("Error al procesar archivo", e);
            return CompletableFuture.completedFuture("Error: " + e.getMessage());
        }
    }

    private Poliza buscarPoliza(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return polizaRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return polizaRepository.findByNombrePol(value).orElse(null);
        }
    }

    private EstadoSiniestro buscarEstadoSiniestro(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return estadoSiniestroRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return estadoSiniestroRepository.findByNombreEstado(value).orElse(null);
        }
    }

    private TipoSiniestro buscarTipoSiniestro(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return tipoSiniestroRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return tipoSiniestroRepository.findByNombreTipoSiniestro(value).orElse(null);
        }
    }

    private Cierre buscarCierre(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return cierreRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private FormularioIncidente buscarFormulario(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return formularioIncidenteRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
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
                    return cell.getLocalDateTimeCellValue().format(DATE_FORMATTER);
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private LocalDateTime getCellValueAsDateTime(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue();
        }
        String value = getCellValueAsString(cell);
        if (value.isEmpty()) return null;
        return LocalDateTime.parse(value, DATE_FORMATTER);
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String value = getCellValueAsString(cell);
        return value.isEmpty() ? null : new BigDecimal(value);
    }

    public void exportarAExcel(OutputStream outputStream) {
        List<Siniestro> siniestros = repository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Siniestros");
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"NÚMERO", "FECHA", "COSTO", "DEDUCIBLE", "INDEMNIZACIÓN",
                               "PÓLIZA", "ESTADO", "TIPO", "CIERRE", "ID INCIDENTE"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (Siniestro s : siniestros) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getNumeroSin() != null ? s.getNumeroSin() : "");
                row.createCell(1).setCellValue(s.getFechaHoraSin() != null ? s.getFechaHoraSin().format(DATE_FORMATTER) : "");
                row.createCell(2).setCellValue(s.getCostoSin() != null ? s.getCostoSin().doubleValue() : 0.0);
                row.createCell(3).setCellValue(s.getDeducibleApliSin() != null ? s.getDeducibleApliSin().doubleValue() : 0.0);
                row.createCell(4).setCellValue(s.getIndemnizacionSin() != null ? s.getIndemnizacionSin().doubleValue() : 0.0);
                row.createCell(5).setCellValue(s.getPoliza() != null ? s.getPoliza().getNombrePol() : "");
                row.createCell(6).setCellValue(s.getEstadoSiniestro() != null ? s.getEstadoSiniestro().getNombreEstado() : "");
                row.createCell(7).setCellValue(s.getTipoSiniestro() != null ? s.getTipoSiniestro().getNombreTipoSiniestro() : "");
                row.createCell(8).setCellValue(s.getCierre() != null ? String.valueOf(s.getCierre().getIdCierre()) : "");
                row.createCell(9).setCellValue(s.getFormularioIncidente() != null ? String.valueOf(s.getFormularioIncidente().getIdForm()) : "");
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            
        } catch (IOException e) {
            log.error("Error al exportar siniestros a Excel", e);
        }
    }
}
