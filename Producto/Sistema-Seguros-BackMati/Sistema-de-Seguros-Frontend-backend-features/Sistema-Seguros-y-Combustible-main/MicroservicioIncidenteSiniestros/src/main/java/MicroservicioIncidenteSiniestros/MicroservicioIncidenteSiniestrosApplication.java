package MicroservicioIncidenteSiniestros;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MicroservicioIncidenteSiniestrosApplication {

	public static void main(String[] args) {
		SpringApplication.run(MicroservicioIncidenteSiniestrosApplication.class, args);
	}

}
