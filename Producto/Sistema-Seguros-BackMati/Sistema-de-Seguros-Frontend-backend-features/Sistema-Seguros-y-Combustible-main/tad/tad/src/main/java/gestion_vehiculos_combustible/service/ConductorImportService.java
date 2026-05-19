package gestion_vehiculos_combustible.service;

import gestion_vehiculos_combustible.model.Conductor;
import gestion_vehiculos_combustible.repository.ConductorRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class ConductorImportService {

    @Autowired
    private ConductorRepository repository;

    @Async("taskExecutor")
    public CompletableFuture<String> procesarArchivo(InputStream inputStream) {
        long start = System.currentTimeMillis();
        List<Conductor> buffer = new ArrayList<>();
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
                    Conductor c = new Conductor();

                    // Mapeo de las columnas según orden de exportación (0-indexed)
                    // Columna 0 (ID) se omite, es autogenerado
                    c.setPrimerNombre(getCellValueAsString(row.getCell(0)));
                    c.setSegundoNombre(getCellValueAsString(row.getCell(1)));
                    c.setApellidoPaterno(getCellValueAsString(row.getCell(2)));
                    c.setApellidoMaterno(getCellValueAsString(row.getCell(3)));
                    c.setRut(getCellValueAsString(row.getCell(4)));
                    c.setDireccion(getCellValueAsString(row.getCell(5)));
                    c.setTelefono(getCellValueAsString(row.getCell(6)));

                    buffer.add(c);

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
            log.error("Error crítico al procesar archivo Excel de conductores", e);
            return CompletableFuture.completedFuture("Error crítico: " + e.getMessage());
        }

        long duration = System.currentTimeMillis() - start;
        log.info("Carga Conductores: {} ms. Errores: {}", duration, errores.size());
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

    public void exportarAExcel(OutputStream outputStream) {
        List<Conductor> conductores = repository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Conductores");
            
            // Crear fila de encabezados (sin ID para importación)
            Row headerRow = sheet.createRow(0);
            String[] headers = {"NOMBRE", "SEGUNDO NOMBRE", "APELLIDO P.", 
                               "APELLIDO M.", "RUT", "DIRECCIÓN", "TELÉFONO"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos (sin ID ya que es autogenerado)
            int rowNum = 1;
            for (Conductor c : conductores) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(c.getPrimerNombre() != null ? c.getPrimerNombre() : "");
                row.createCell(1).setCellValue(c.getSegundoNombre() != null ? c.getSegundoNombre() : "");
                row.createCell(2).setCellValue(c.getApellidoPaterno() != null ? c.getApellidoPaterno() : "");
                row.createCell(3).setCellValue(c.getApellidoMaterno() != null ? c.getApellidoMaterno() : "");
                row.createCell(4).setCellValue(c.getRut() != null ? c.getRut() : "");
                row.createCell(5).setCellValue(c.getDireccion() != null ? c.getDireccion() : "");
                row.createCell(6).setCellValue(c.getTelefono() != null ? c.getTelefono() : "");
            }
            
            // Auto ajustar el ancho de las columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            
        } catch (IOException e) {
            log.error("Error al exportar conductores a Excel", e);
        }
    }
}