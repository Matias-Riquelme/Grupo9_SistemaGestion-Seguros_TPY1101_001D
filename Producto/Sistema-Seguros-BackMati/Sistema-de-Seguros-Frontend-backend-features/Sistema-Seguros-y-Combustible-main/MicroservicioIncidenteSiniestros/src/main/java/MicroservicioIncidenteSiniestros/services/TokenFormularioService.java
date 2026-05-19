package MicroservicioIncidenteSiniestros.services;

import MicroservicioIncidenteSiniestros.entities.TokenFormularioPublico;
import MicroservicioIncidenteSiniestros.repositories.TokenFormularioPublicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TokenFormularioService {

    @Autowired
    private TokenFormularioPublicoRepository repository;

    public TokenFormularioPublico guardar(TokenFormularioPublico tokenFormularioPublico) {
        return repository.save(tokenFormularioPublico);
    }

    public Optional<TokenFormularioPublico> buscarToken(String token) {
        return repository.findByToken(token);
    }
}
