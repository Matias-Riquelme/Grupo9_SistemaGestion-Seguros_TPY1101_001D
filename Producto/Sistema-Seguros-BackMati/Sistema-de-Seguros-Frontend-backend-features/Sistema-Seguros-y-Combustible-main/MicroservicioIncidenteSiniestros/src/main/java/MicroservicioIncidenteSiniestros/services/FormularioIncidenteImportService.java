package MicroservicioIncidenteSiniestros.services;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import MicroservicioIncidenteSiniestros.model.FormularioIncidente;
import MicroservicioIncidenteSiniestros.model.TipoIncidente;
import MicroservicioIncidenteSiniestros.model.UbicacionIncidente;
import MicroservicioIncidenteSiniestros.model.Siniestro;
import MicroservicioIncidenteSiniestros.repository.FormularioIncidenteRepository;
import MicroservicioIncidenteSiniestros.repository.TipoIncidenteRepository;
import MicroservicioIncidenteSiniestros.repository.UbicacionIncidenteRepository;
import MicroservicioIncidenteSiniestros.repository.SiniestroRepository;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class FormularioIncidenteImportService {

    @Autowired
    private FormularioIncidenteRepository formularioIncidenteRepository;

    @Autowired
    private TipoIncidenteRepository tipoIncidenteRepository;

    @Autowired
    private UbicacionIncidenteRepository ubicacionIncidenteRepository;

    @Autowired
    private SiniestroRepository siniestroRepository;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int BATCH_SIZE = 500;

    @Async
    @Transactional
    public CompletableFuture<String> procesarArchivo(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        List<FormularioIncidente> formularios = new ArrayList<>();
        int procesados = 0;
        int errores = 0;
        StringBuilder erroresDetalle = new StringBuilder();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            try {
                FormularioIncidente formulario = new FormularioIncidente();

                // FECHA/HORA INCIDENTE (columna 0)
                Cell fechaCell = row.getCell(0);
                if (fechaCell != null) {
                    formulario.setFechaHoraIncidente(parseDateTimeCell(fechaCell));
                }

                // CONDUCTOR (columna 1)
                Cell conductorCell = row.getCell(1);
                if (conductorCell != null) {
                    formulario.setNombreConductor(getCellValueAsString(conductorCell));
                }

                // RUT (columna 2)
                Cell rutCell = row.getCell(2);
                if (rutCell != null) {
                    formulario.setRutConductor(getCellValueAsString(rutCell));
                }

                // PATENTE 1 (columna 3)
                Cell patente1Cell = row.getCell(3);
                if (patente1Cell != null) {
                    formulario.setPatente1(getCellValueAsString(patente1Cell));
                }

                // PATENTE 2 (columna 4)
                Cell patente2Cell = row.getCell(4);
                if (patente2Cell != null) {
                    formulario.setPatente2(getCellValueAsString(patente2Cell));
                }

                // TIPO INCIDENTE (columna 5)
                Cell tipoCell = row.getCell(5);
                if (tipoCell != null) {
                    String tipoStr = getCellValueAsString(tipoCell);
                    TipoIncidente tipo = buscarTipoIncidente(tipoStr);
                    formulario.setTipoIncidente(tipo);
                }

                // BASE (columna 6)
                Cell baseCell = row.getCell(6);
                if (baseCell != null) {
                    formulario.setBase(getCellValueAsString(baseCell));
                }

                // OPERACIÓN (columna 7)
                Cell operacionCell = row.getCell(7);
                if (operacionCell != null) {
                    formulario.setOperacion(getCellValueAsString(operacionCell));
                }

                // UBICACIÓN (columna 8)
                Cell ubicacionCell = row.getCell(8);
                if (ubicacionCell != null) {
                    String ubicacionStr = getCellValueAsString(ubicacionCell);
                    UbicacionIncidente ubicacion = buscarUbicacion(ubicacionStr);
                    formulario.setUbicacion(ubicacion);
                }

                // RELATO (columna 9)
                Cell relatoCell = row.getCell(9);
                if (relatoCell != null) {
                    formulario.setRelatoForm(getCellValueAsString(relatoCell));
                }

                // Fecha ingreso form
                formulario.setFechaIngresoForm(LocalDateTime.now());

                formularios.add(formulario);

                if (formularios.size() >= BATCH_SIZE) {
                    formularioIncidenteRepository.saveAll(formularios);
                    procesados += formularios.size();
                    formularios.clear();
                }

            } catch (Exception e) {
                errores++;
                erroresDetalle.append("Fila ").append(i + 1).append(": ").append(e.getMessage()).append("\n");
            }
        }

        if (!formularios.isEmpty()) {
            formularioIncidenteRepository.saveAll(formularios);
            procesados += formularios.size();
        }

        workbook.close();

        String resultado = String.format("Procesamiento completado. Registros procesados: %d, Errores: %d", procesados, errores);
        if (errores > 0) {
            resultado += "\nDetalle de errores:\n" + erroresDetalle.toString();
        }

        return CompletableFuture.completedFuture(resultado);
    }

    public void exportarAExcel(OutputStream outputStream) throws IOException {
        List<FormularioIncidente> formularios = formularioIncidenteRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Formularios Incidente");

        // Crear encabezados
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "FECHA/HORA INCIDENTE", "CONDUCTOR", "RUT", "PATENTE 1", "PATENTE 2", 
                           "TIPO INCIDENTE", "BASE", "OPERACIÓN", "UBICACIÓN", "RELATO", "NÚMERO SINIESTRO"};
        
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Crear filas de datos
        int rowNum = 1;
        for (FormularioIncidente formulario : formularios) {
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(formulario.getIdForm() != null ? formulario.getIdForm() : 0);
            
            if (formulario.getFechaHoraIncidente() != null) {
                row.createCell(1).setCellValue(formulario.getFechaHoraIncidente().format(DATETIME_FORMATTER));
            }
            
            row.createCell(2).setCellValue(formulario.getNombreConductor() != null ? formulario.getNombreConductor() : "");
            row.createCell(3).setCellValue(formulario.getRutConductor() != null ? formulario.getRutConductor() : "");
            row.createCell(4).setCellValue(formulario.getPatente1() != null ? formulario.getPatente1() : "");
            row.createCell(5).setCellValue(formulario.getPatente2() != null ? formulario.getPatente2() : "");
            
            if (formulario.getTipoIncidente() != null) {
                row.createCell(6).setCellValue(formulario.getTipoIncidente().getNombreTipoIncidente());
            }
            
            row.createCell(7).setCellValue(formulario.getBase() != null ? formulario.getBase() : "");
            row.createCell(8).setCellValue(formulario.getOperacion() != null ? formulario.getOperacion() : "");
            
            if (formulario.getUbicacion() != null) {
                row.createCell(9).setCellValue(formulario.getUbicacion().getDescripcionUbi());
            }
            
            row.createCell(10).setCellValue(formulario.getRelatoForm() != null ? formulario.getRelatoForm() : "");
            
            // Buscar el número de siniestro asociado
            List<Siniestro> siniestros = siniestroRepository.findByFormularioIncidente_IdForm(formulario.getIdForm());
            String numeroSiniestro = "";
            if (siniestros != null && !siniestros.isEmpty()) {
                // Si hay múltiples siniestros, concatenarlos con comas
                numeroSiniestro = siniestros.stream()
                    .map(s -> s.getNumeroSin() != null ? s.getNumeroSin() : "")
                    .filter(s -> !s.isEmpty())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            }
            row.createCell(11).setCellValue(numeroSiniestro);
        }

        // Ajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(outputStream);
        workbook.close();
    }

    private TipoIncidente buscarTipoIncidente(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        try {
            Integer id = Integer.parseInt(valor.trim());
            return tipoIncidenteRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return tipoIncidenteRepository.findByNombreTipoIncidente(valor.trim()).orElse(null);
        }
    }

    private UbicacionIncidente buscarUbicacion(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        try {
            Integer id = Integer.parseInt(valor.trim());
            return ubicacionIncidenteRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return ubicacionIncidenteRepository.findByDescripcionUbi(valor.trim()).orElse(null);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().format(DATETIME_FORMATTER);
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

    private LocalDateTime parseDateTimeCell(Cell cell) {
        if (cell == null) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            String dateStr = cell.getStringCellValue().trim();
            try {
                return LocalDateTime.parse(dateStr, DATETIME_FORMATTER);
            } catch (DateTimeParseException e) {
                return null;
            }
        }
        
        return null;
    }
}
