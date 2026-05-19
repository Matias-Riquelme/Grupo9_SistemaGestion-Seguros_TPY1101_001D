# Hosting y base de datos — guía para subir el proyecto

Esta guía responde: **cómo se crea la base de datos al alojar el proyecto** y **cómo es un hosting** (interfaz o terminal). Usamos Docker para que funcione igual en tu PC y en el servidor.

---

## Consideración importante: una sola base de datos

**Todos los microservicios usan la misma base de datos MySQL:** `db_sistema_seguros`.

- **Api Gateway** no usa BD (solo enruta).
- **Usuario (Keycloak/gestión), Incidentes, Vehículos/Combustible y Documentación** se conectan todos a esa misma base.
- Hay una única instancia MySQL (contenedor o gestionada); la misma URL (`SPRING_DATASOURCE_URL`) se configura en cada servicio con el mismo nombre de base.
- Las tablas las crea/actualiza cada microservicio con JPA (`ddl-auto=update`) según sus entidades; al ser la misma base, todo convive en un solo esquema.

Al alojar, basta con **crear o apuntar a una sola base** y usar la misma URL (y usuario/contraseña) en las variables de entorno de todos los servicios.

---

## 1. Cómo es un hosting: UI y terminal

Depende del tipo de servicio:

| Tipo | Qué es | Cómo se usa | Base de datos |
|------|--------|-------------|----------------|
| **VPS / servidor** (DigitalOcean, Linode, AWS EC2, etc.) | Una máquina virtual Linux. Tú instalas todo. | Casi todo por **terminal** (SSH). A veces panel web para reiniciar o ver recursos. | Tú la instalas (Docker con MySQL, o MySQL en el servidor). |
| **PaaS** (Railway, Render, Fly.io, etc.) | Plataforma que ejecuta tu código (por ejemplo tu `docker-compose` o servicios sueltos). | **UI** (paneles para ver logs, variables, dominios) + **terminal** (CLI o consola en la web). | Puedes usar **MySQL gestionado** (ellos te dan host, usuario, contraseña y a veces UI para ver tablas) o MySQL en Docker. |
| **Base de datos gestionada** (PlanetScale, AWS RDS, Railway DB, etc.) | MySQL/Postgres en la nube; ellos hacen backups y mantenimiento. | **UI** para crear la base, ver conexión, a veces un “query editor”. No necesitas crear la base a mano si usas su UI. | Ellos crean la base; tú solo pones la URL en las variables de entorno. |

En la práctica:

- **Solo terminal:** típico en un VPS donde subes el proyecto y ejecutas `docker-compose` por SSH.
- **UI + terminal:** típico en Railway/Render: panel para proyectos, variables, logs; y terminal/CLI para despliegue o revisar cosas.

---

## 2. Cómo se “crea” la base de datos al alojar

La base de datos no se “crea” a mano como en tu PC. Se hace de una de estas formas:

### Opción A: MySQL dentro de Docker (tu caso actual)

En el servidor (o en la plataforma) se ejecuta tu `docker-compose`. Ahí:

1. **El contenedor MySQL arranca** y lee los scripts en `mysql/init/` (por ejemplo `01-create-database.sql`).
2. Ese script **crea la base** `db_sistema_seguros` si no existe.
3. Cuando arrancan los microservicios (Gateway, incidentes, vehículos, etc.), Spring Boot se conecta a esa base. Con `spring.jpa.hibernate.ddl-auto=update`, **JPA crea o actualiza las tablas solas** la primera vez que cada microservicio arranca.

No hace falta entrar a MySQL ni ejecutar nada a mano: **la base se crea con el script de init y las tablas con la aplicación**.

### Opción B: MySQL gestionado (servicio externo)

En la UI del proveedor (Railway, PlanetScale, etc.):

1. Creas un servicio “MySQL” o “Database”.
2. Te dan **host**, **puerto**, **nombre de base**, **usuario** y **contraseña** (a veces la base ya viene creada).
3. Esas credenciales las pones en las variables de entorno de tu proyecto (por ejemplo `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, etc.).
4. Las tablas las sigue creando JPA al arrancar los microservicios (`ddl-auto=update`).

Aquí **la base la “crea” el proveedor** (o ya existe); tú solo configuras la URL.

### Opción C: Terminal en el servidor (sin init script)

Si por alguna razón no usas `mysql/init/`:

- Entras por SSH al servidor.
- Te conectas al MySQL (contenedor o instalado):  
  `docker-compose exec mysql-db mysql -u root -p`
- Ejecutas:  
  `CREATE DATABASE IF NOT EXISTS db_sistema_seguros;`  
  y luego reinicias los microservicios para que JPA cree las tablas.

Solo tiene sentido si no puedes usar la opción A.

---

## 3. Por qué usamos Docker para compatibilidad

- **En tu PC:** `docker-compose up` → mismo MySQL, mismos servicios, mismos puertos.
- **En el hosting:** el mismo `docker-compose` (o el mismo conjunto de contenedores en una plataforma) → mismo comportamiento.

Así evitas “en mi máquina funciona y en el servidor no”: si en ambos lados corre Docker con la misma configuración, la diferencia suele ser solo variables de entorno (URLs de BD, Keycloak, dominio).

---

## 4. Pasos resumidos para alojar (con Docker)

1. **Elegir dónde alojar**  
   - VPS: tendrás que instalar Docker y usar **terminal** (SSH) para clonar el repo y ejecutar `docker-compose`.  
   - PaaS (Railway, Render, etc.): sueles conectar el repo, configurar variables en la **UI** y a veces usar su **terminal/CLI**.

2. **Base de datos**  
   - **Con MySQL en Docker:** asegúrate de tener la carpeta `mysql/init/` con al menos un script que cree la base (por ejemplo `01-create-database.sql`). Al hacer `docker-compose up`, la base se crea sola y JPA crea las tablas.  
   - **Con MySQL gestionado:** en la UI del proveedor creas la base (o usas la que te dan), copias host, usuario, contraseña y nombre de base y los pones en las variables de entorno; no hace falta script de init.

3. **Variables de entorno**  
   En el hosting siempre se configuran en la **UI** (PaaS) o en archivos/env que cargas por **terminal** (VPS):  
   - URLs de base de datos.  
   - URLs de Keycloak (realm, issuer, etc.).  
   - Secretos (JWT, client secret).  
   - Dominio público si aplica.

4. **Desplegar**  
   - VPS: por terminal, `git pull` y `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d` (o el comando que uses en prod).  
   - PaaS: normalmente un “Deploy” desde la UI o desde su CLI al hacer push al repo.

En ningún caso necesitas “crear la base a mano” como en Workbench: o la crea el script de init (Docker) o el proveedor (BD gestionada), y las tablas las crea la aplicación al arrancar.

---

## 5. Archivo de init que ya tienes en el proyecto

En este repo está preparado:

- **`mysql/init/01-create-database.sql`**  
  Crea la base `db_sistema_seguros` la primera vez que el contenedor MySQL arranca (por ejemplo en producción con `docker-compose.prod.yml` que monta `./mysql/init:/docker-entrypoint-initdb.d`).

Con eso, al subir el proyecto a un hosting donde ejecutes Docker (o donde el PaaS use tu compose), **la base se crea sola** y las tablas las crea JPA al levantar los microservicios. No hace falta UI de base de datos en el hosting ni ejecutar comandos manuales para crear la base, salvo que elijas una base de datos gestionada y prefieras crearla desde la UI del proveedor.
