package MicroservicioIncidenteSiniestros.services;

import MicroservicioIncidenteSiniestros.model.Poliza;
import MicroservicioIncidenteSiniestros.model.TipoPoliza;
import MicroservicioIncidenteSiniestros.model.Asegurado;
import MicroservicioIncidenteSiniestros.model.Contratante;
import MicroservicioIncidenteSiniestros.repository.PolizaRepository;
import MicroservicioIncidenteSiniestros.repository.TipoPolizaRepository;
import MicroservicioIncidenteSiniestros.repository.AseguradoRepository;
import MicroservicioIncidenteSiniestros.repository.ContratanteRepository;
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
public class PolizaImportService {

    @Autowired
    private PolizaRepository repository;
    
    @Autowired
    private TipoPolizaRepository tipoPolizaRepository;
    
    @Autowired
    private AseguradoRepository aseguradoRepository;
    
    @Autowired
    private ContratanteRepository contratanteRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Async("taskExecutor")
    public CompletableFuture<String> procesarArchivo(InputStream inputStream) {
        long start = System.currentTimeMillis();
        List<Poliza> buffer = new ArrayList<>();
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
                if (rowNumber == 1) continue; // Saltar encabezados
                if (row == null || isRowEmpty(row)) continue;

                try {
                    Poliza poliza = new Poliza();

                    poliza.setNombrePol(getCellValueAsString(row.getCell(0)));
                    poliza.setNumeroPol(getCellValueAsInteger(row.getCell(1)));
                    
                    // Tipo de póliza
                    String tipoValue = getCellValueAsString(row.getCell(2));
                    TipoPoliza tipo = buscarTipoPoliza(tipoValue);
                    if (tipo != null) {
                        poliza.setTipoPoliza(tipo);
                    }
                    
                    // Asegurado
                    String aseguradoValue = getCellValueAsString(row.getCell(3));
                    Asegurado asegurado = buscarAsegurado(aseguradoValue);
                    if (asegurado != null) {
                        poliza.setAsegurado(asegurado);
                    }
                    
                    // Contratante
                    String contratanteValue = getCellValueAsString(row.getCell(4));
                    Contratante contratante = buscarContratante(contratanteValue);
                    if (contratante != null) {
                        poliza.setContratante(contratante);
                    }
                    
                    poliza.setFechaEmiPol(getCellValueAsDateTime(row.getCell(5)));
                    poliza.setFechaIniPol(getCellValueAsDateTime(row.getCell(6)));
                    poliza.setFechaFinPol(getCellValueAsDateTime(row.getCell(7)));
                    poliza.setFechaVencPol(getCellValueAsDateTime(row.getCell(8)));
                    poliza.setPrimaPol(getCellValueAsBigDecimal(row.getCell(9)));
                    poliza.setTipoMoneda(getCellValueAsString(row.getCell(10)));
                    poliza.setAseguradosAdi(getCellValueAsString(row.getCell(11)));

                    buffer.add(poliza);

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

    private TipoPoliza buscarTipoPoliza(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return tipoPolizaRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return tipoPolizaRepository.findByNomTipoPol(value).orElse(null);
        }
    }

    private Asegurado buscarAsegurado(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return aseguradoRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return aseguradoRepository.findByRazonSocialAse(value).orElse(null);
        }
    }

    private Contratante buscarContratante(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            Integer id = Integer.parseInt(value);
            return contratanteRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return contratanteRepository.findByRazonSocialContra(value).orElse(null);
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

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        String value = getCellValueAsString(cell);
        return value.isEmpty() ? null : Integer.parseInt(value);
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String value = getCellValueAsString(cell);
        return value.isEmpty() ? null : new BigDecimal(value);
    }

    private LocalDateTime getCellValueAsDateTime(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue();
        }
        String value = getCellValueAsString(cell);
        if (value.isEmpty()) return null;
        try {
            return LocalDateTime.parse(value, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    public void exportarAExcel(OutputStream outputStream) {
        List<Poliza> polizas = repository.findAllWithRelations();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Pólizas");
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"NOMBRE", "NÚMERO", "TIPO", "ASEGURADO", "CONTRATANTE",
                               "FECHA EMISIÓN", "FECHA INICIO", "FECHA FIN", "FECHA VENCIMIENTO", "PRIMA", "MONEDA", "ASEGURADOS ADI"};
            
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
            for (Poliza p : polizas) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(p.getNombrePol() != null ? p.getNombrePol() : "");
                row.createCell(1).setCellValue(p.getNumeroPol() != null ? p.getNumeroPol() : 0);
                row.createCell(2).setCellValue(p.getTipoPoliza() != null ? p.getTipoPoliza().getNomTipoPol() : "");
                row.createCell(3).setCellValue(p.getAsegurado() != null ? p.getAsegurado().getRazonSocialAse() : "");
                row.createCell(4).setCellValue(p.getContratante() != null ? p.getContratante().getRazonSocialContra() : "");
                row.createCell(5).setCellValue(p.getFechaEmiPol() != null ? p.getFechaEmiPol().format(DATE_FORMATTER) : "");
                row.createCell(6).setCellValue(p.getFechaIniPol() != null ? p.getFechaIniPol().format(DATE_FORMATTER) : "");
                row.createCell(7).setCellValue(p.getFechaFinPol() != null ? p.getFechaFinPol().format(DATE_FORMATTER) : "");
                row.createCell(8).setCellValue(p.getFechaVencPol() != null ? p.getFechaVencPol().format(DATE_FORMATTER) : "");
                row.createCell(9).setCellValue(p.getPrimaPol() != null ? p.getPrimaPol().doubleValue() : 0.0);
                row.createCell(10).setCellValue(p.getTipoMoneda() != null ? p.getTipoMoneda() : "");
                row.createCell(11).setCellValue(p.getAseguradosAdi() != null ? p.getAseguradosAdi() : "");
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            
        } catch (IOException e) {
            log.error("Error al exportar pólizas a Excel", e);
        }
    }
}
