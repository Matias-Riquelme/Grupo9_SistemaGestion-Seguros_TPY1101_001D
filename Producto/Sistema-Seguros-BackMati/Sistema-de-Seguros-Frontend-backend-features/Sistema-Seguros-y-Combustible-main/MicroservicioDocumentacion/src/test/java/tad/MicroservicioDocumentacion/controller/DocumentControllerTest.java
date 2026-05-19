package tad.MicroservicioDocumentacion.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean; // 👈 La nueva importación para Spring Boot 3.4
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import tad.MicroservicioDocumentacion.model.Document;
import tad.MicroservicioDocumentacion.repository.DocumentRepository;
import tad.MicroservicioDocumentacion.storage.StorageService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 🛑 EXCLUSIONES CRÍTICAS:
// Security: Para no pedir login.
// DataSource & Hibernate: Para que NO intente conectarse a la Base de Datos.
@WebMvcTest(controllers = DocumentController.class, 
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // 👇 Usamos @MockitoBean en lugar de @MockBean (Spring Boot 3.4+)
    @MockitoBean
    private StorageService storageService;

    @MockitoBean
    private DocumentRepository documentRepository;
    
    // 👇 Esto evita que el CommandLineRunner de tu Main intente ejecutarse
    @MockitoBean
    private org.springframework.boot.CommandLineRunner commandLineRunner;

    @Test
    void listarDocumentos_DeberiaRetornarListaConUrls() throws Exception {
        Document doc1 = new Document(1L, "archivo1.pdf", "original.pdf", "application/pdf", 100L, null, LocalDateTime.now(), "Juan", "path", null, null, null);
        List<Document> listaDocs = Arrays.asList(doc1);

        given(documentRepository.findAll()).willReturn(listaDocs);

        mockMvc.perform(get("/api/documentos/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value("archivo1.pdf"));
    }

    @Test
    void subirArchivo_DeberiaGuardarYRetornarExito() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "Archivo", "test.pdf", "application/pdf", "Contenido del PDF".getBytes());

        given(storageService.store(any())).willReturn("test_guardado.pdf");

        mockMvc.perform(multipart("/api/documentos/")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Archivo guardado ID")));

        verify(documentRepository).save(any(Document.class));
    }

    @Test
    void descargarArchivo_DeberiaRetornarElArchivo() throws Exception {
        // 👇 TRUCO: Creamos una clase anónima para forzar un nombre de archivo
        Resource resource = new ByteArrayResource("Contenido real".getBytes()) {
            @Override
            public String getFilename() {
                return "test.pdf";
            }
        };
        
        String filename = "test.pdf";
        
        given(storageService.loadAsResource(filename)).willReturn(resource);

        mockMvc.perform(get("/api/documentos/Archivo/" + filename))
                .andExpect(status().isOk())
                // Ahora resource.getFilename() devolverá "test.pdf" y esto pasará
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.pdf\""))
                .andExpect(content().string("Contenido real"));
    }

    @Test
    void borrarArchivo_SiExiste_DeberiaBorrarDeBdYDisco() throws Exception {
        Long id = 1L;
        Document doc = new Document();
        doc.setId(id);
        doc.setFilename("borrame.pdf");

        given(documentRepository.findById(id)).willReturn(Optional.of(doc));
        given(storageService.delete("borrame.pdf")).willReturn(true);

        mockMvc.perform(delete("/api/documentos/" + id))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Eliminado correctamente")));
    }
    
    @Test
    void buscarDocumentos_PorNombre_DeberiaFiltrar() throws Exception {
        Document doc = new Document();
        doc.setFilename("contrato_final.pdf");
        
        given(documentRepository.findByFilenameContainingIgnoreCase("contrato")).willReturn(List.of(doc));

        mockMvc.perform(get("/api/documentos/Buscar").param("filename", "contrato"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value("contrato_final.pdf"));
    }
}