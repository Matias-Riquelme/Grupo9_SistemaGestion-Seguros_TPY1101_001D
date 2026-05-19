package tad.MicroservicioDocumentacion;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import tad.MicroservicioDocumentacion.storage.StorageProperties;
import tad.MicroservicioDocumentacion.storage.StorageService;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class MicroservicioDocumentacionApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroservicioDocumentacionApplication.class, args);
    }

    @Bean
    CommandLineRunner init(StorageService storageService) {
        return (args) -> {
            // Como storageService es un Mock en el test, esto no hará nada malo.
            storageService.init();
        };
    }
}