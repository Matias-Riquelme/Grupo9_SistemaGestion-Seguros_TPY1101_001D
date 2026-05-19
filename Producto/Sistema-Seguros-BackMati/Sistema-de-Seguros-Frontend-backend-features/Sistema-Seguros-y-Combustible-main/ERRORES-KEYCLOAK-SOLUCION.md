# Errores de Keycloak + Spring Security + Docker - Guia de Solucion

## Contexto del Problema

Se tenia un sistema de microservicios con Spring Boot + Keycloak corriendo en Docker Compose.
Al consumir los endpoints protegidos (ej: `GET http://localhost:8080/keycloak/user/search`),
se recibia un error **401 Unauthorized** a pesar de enviar un JWT valido con los roles correctos.

---

## Error 1: KEYCLOAK_CLIENT_ID incorrecto

### Sintoma
El `JwtAuthenticationConverter` no extraia roles del token. `extractResourceRoles()` retornaba un Set vacio.

### Causa
En el archivo `.env` el client ID estaba mal escrito:

```properties
# INCORRECTO
KEYCLOAK_CLIENT_ID=spring-client-api-rest

# CORRECTO (debe coincidir con el nombre del client en Keycloak)
KEYCLOAK_CLIENT_ID=spring-boot-api-rest
```

### Por que falla
El `JwtAuthenticationConverter` busca los roles dentro del JWT en:

```json
{
  "resource_access": {
    "spring-boot-api-rest": {    <-- Esta clave debe coincidir con KEYCLOAK_CLIENT_ID
      "roles": ["admin_client_role"]
    }
  }
}
```

Si el `resourceId` no coincide, `resourceAccess.get(resourceId)` retorna `null` y no se extraen roles.

### Leccion
**Siempre verificar que `KEYCLOAK_CLIENT_ID` coincida exactamente con el nombre del client creado en la consola de Keycloak.**

---

## Error 2: KEYCLOAK_CLIENT_SECRET incorrecto

### Sintoma
El Keycloak Admin Client no podia autenticarse para gestionar usuarios.

### Causa
El secret en `.env` no coincidia con el secret real del client en Keycloak.

### Leccion
**Si se regenera el client secret en Keycloak, hay que actualizarlo en `.env` y en `docker-compose.yml`.**
Se puede consultar en: Keycloak Admin > Clients > spring-boot-api-rest > Credentials.

---

## Error 3: Solo se extraian roles del client, no del realm

### Sintoma
`@PreAuthorize("hasRole('admin_client_role')")` fallaba con 403 Forbidden incluso con token valido.

### Causa
Los `@PreAuthorize` usaban nombres de **realm roles** (ej: `admin_client_role`), pero el `JwtAuthenticationConverter`
solo extraia roles de `resource_access` (client roles). Los realm roles estan en otro claim: `realm_access`.

### Solucion
Se agrego el metodo `extractRealmRoles()` al `JwtAuthenticationConverter`:

```java
// Extrae roles del realm (realm_access)
private Collection<? extends GrantedAuthority> extractRealmRoles(Jwt jwt) {
    Map<String, Object> realmAccess = jwt.getClaim("realm_access");
    if (realmAccess == null) return Set.of();

    Collection<String> realmRoles = (Collection<String>) realmAccess.get("roles");
    if (realmRoles == null) return Set.of();

    return realmRoles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
            .collect(Collectors.toSet());
}
```

Y se combinaron ambas fuentes de roles en el metodo `convert()`:

```java
Collection<GrantedAuthority> authorities = Stream.of(
        jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
        extractResourceRoles(jwt).stream(),   // client roles
        extractRealmRoles(jwt).stream())       // realm roles
        .flatMap(s -> s)
        .collect(Collectors.toSet());
```

### Leccion
**Un token JWT de Keycloak tiene roles en DOS lugares:**
- `resource_access.<client-id>.roles` -> roles del client
- `realm_access.roles` -> roles del realm

Hay que extraer de ambos si los `@PreAuthorize` mezclan nombres de ambos tipos.

---

## Error 4 (CRITICO): Issuer mismatch entre Docker y localhost

### Sintoma
Log del microservicio:
```
The iss claim is not valid
Failed to authenticate since the JWT was invalid
```

### Causa
Este fue el error mas dificil de detectar. El JWT obtenido desde Postman/frontend tenia:

```json
{
  "iss": "http://localhost:9090/realms/spring-boot-realm-dev"
}
```

Pero el microservicio dentro de Docker tenia configurado:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://keycloak:8080/realms/spring-boot-realm-dev
```

Spring Security comparaba `localhost:9090` vs `keycloak:8080` y rechazaba el token.

### Por que ocurre
- **Desde tu maquina**: Keycloak esta en `localhost:9090` (mapeado por Docker)
- **Dentro de Docker**: Keycloak esta en `keycloak:8080` (nombre del servicio en la red interna)
- El JWT siempre lleva el issuer con la URL desde donde se obtuvo el token (`localhost:9090`)
- El microservicio dentro de Docker espera el issuer como `keycloak:8080`
- **Nunca van a coincidir**

### Solucion
Remover `issuer-uri` y dejar solo `jwk-set-uri` en el `application.properties`:

```properties
# ANTES (falla por mismatch de issuer)
spring.security.oauth2.resourceserver.jwt.issuer-uri=${KEYCLOAK_ISSUER_URI}
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=${KEYCLOAK_JWK_URI}

# DESPUES (solo valida la firma del token, no el issuer)
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=${KEYCLOAK_JWK_URI}
```

Con esto:
- La **firma** del token se sigue validando (seguridad intacta)
- El claim `iss` **no se valida** contra la URL interna de Docker
- Tokens obtenidos desde `localhost:9090` funcionan dentro de los contenedores

### Leccion
**Cuando Keycloak y los microservicios corren en Docker, NUNCA usar `issuer-uri` si los clientes
(Postman, frontend) obtienen tokens desde `localhost`. Usar solo `jwk-set-uri`.**

---

## Error 5: API Gateway con DNS cacheado (503 Service Unavailable)

### Sintoma
Despues de reconstruir los microservicios, el Gateway retornaba 503.

### Causa
El API Gateway (Spring Cloud Gateway) cachea las conexiones a los microservicios.
Al reconstruir un contenedor, este obtiene una nueva IP interna de Docker,
pero el Gateway seguia intentando conectar a la IP vieja.

### Solucion
Reiniciar el API Gateway despues de reconstruir microservicios:

```bash
docker compose restart api-gateway
```

### Leccion
**Siempre reiniciar el API Gateway despues de hacer `docker compose up --build` de los microservicios.**

---

## Error 6: KeycloakProvider con CLIENT_CREDENTIALS en realm incorrecto

### Sintoma
El Keycloak Admin Client no podia listar/crear usuarios (error de autorizacion interno).

### Causa
El `KeycloakProvider` se conectaba con `CLIENT_CREDENTIALS` al realm `spring-boot-realm-dev`,
pero el client no tenia permisos de Service Account para administrar usuarios.

### Solucion
Conectarse al realm `master` con las credenciales del administrador de Keycloak:

```java
@Bean
public Keycloak keycloakAdminClient() {
    return KeycloakBuilder.builder()
            .serverUrl(serverUrl)
            .realm("master")           // Realm master para admin
            .username(adminUsername)     // admin
            .password(adminPassword)    // admin_password
            .clientId("admin-cli")      // Client por defecto para admin
            .build();
}
```

### Leccion
**Para usar el Keycloak Admin Client (gestionar usuarios, roles, etc.), siempre autenticarse
contra el realm `master` con `admin-cli` y las credenciales del admin.**

---

## Error 7: CORS no configurado

### Sintoma
Peticiones desde el frontend React (`http://localhost:5173`) bloqueadas por el navegador.

### Solucion
Agregar configuracion CORS en el `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",   // React Vite
            "http://localhost:3000",   // React CRA
            "http://localhost:4200")); // Angular
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

Y habilitarlo en la cadena de seguridad:

```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

---

## Error 8: Faltaba application.properties en vehiculo-combustible-service

### Sintoma
El servicio no arrancaba con error:
```
Could not resolve placeholder 'jwt.auth.converter.principle-attribute'
```

### Causa
Solo existia `application.properties.example`, nunca se creo el `application.properties` real.

### Leccion
**Verificar que todos los microservicios tengan su `application.properties` con todas las propiedades requeridas.**

---

## Comandos Utiles para Debugging

```bash
# Ver logs de un servicio especifico
docker compose logs --tail=50 usuario-service

# Ver logs en tiempo real
docker compose logs -f usuario-service

# Reconstruir y reiniciar servicios (sin perder datos de BD/Keycloak)
docker compose up --build -d usuario-service incidentes-service vehiculo-combustible-service documentacion-service

# IMPORTANTE: Siempre reiniciar el Gateway despues
docker compose restart api-gateway

# Ver estado de todos los contenedores
docker compose ps

# Decodificar un JWT para ver su contenido
# Ir a https://jwt.io y pegar el token
```

---

## Checklist para Futuras Configuraciones

- [ ] `KEYCLOAK_CLIENT_ID` en `.env` coincide exactamente con el client en Keycloak
- [ ] `KEYCLOAK_CLIENT_SECRET` en `.env` coincide con el secret actual del client
- [ ] `KEYCLOAK_ADMIN_PASSWORD` en `.env` coincide con el del `docker-compose.yml`
- [ ] **NO** usar `issuer-uri` en `application.properties` (solo `jwk-set-uri`)
- [ ] `JwtAuthenticationConverter` extrae roles de `resource_access` Y `realm_access`
- [ ] CORS configurado en `SecurityConfig` para el frontend (`localhost:5173`)
- [ ] Todos los microservicios tienen `application.properties` (no solo `.example`)
- [ ] Despues de rebuild, reiniciar el API Gateway
