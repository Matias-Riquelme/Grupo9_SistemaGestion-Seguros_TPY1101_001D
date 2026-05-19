# MySQL: Docker vs local — por qué los combos pueden estar vacíos

**Contexto:** Todos los microservicios (usuario, incidentes, vehículos/combustible, documentación) usan **la misma base de datos** `db_sistema_seguros`. Una sola instancia MySQL sirve a todos.

---

## ¿El MySQL de Docker es el mismo que mi MySQL local?

**No.** Son dos bases de datos distintas:

| Dónde | Qué es | Dónde están los datos |
|-------|--------|------------------------|
| **MySQL local (Workbench)** | El que levantas en tu PC (localhost:3306) | En tu disco (tu PC) |
| **MySQL en Docker (mysql-db)** | Un contenedor con su propia instancia MySQL | En el volumen Docker `mysql-data` |

Cuando abres MySQL Workbench y te conectas a **localhost:3306**, estás usando la base de datos de tu máquina. Esa es la que tienes poblada.

Cuando los microservicios corren **dentro de Docker**, en `docker-compose.yml` están configurados con:

```text
SPRING_DATASOURCE_URL: jdbc:mysql://mysql-db:3306/db_sistema_seguros
```

Eso significa que **apuntan al contenedor `mysql-db`**, no a tu PC. Ese MySQL del contenedor es otro servidor: puede estar vacío o tener otros datos. Por eso los combos no cargan: las APIs responden bien pero devuelven listas vacías `[]` porque leen de una base sin datos.

---

## Cómo usar tu MySQL local (el que tiene datos) con Docker

Puedes hacer que los contenedores usen la base de datos de tu PC usando el archivo de override:

```bash
docker-compose -f docker-compose.yml -f docker-compose.local-mysql.yml up -d
```

Ese override hace que los microservicios usen:

- **host.docker.internal:3306** = MySQL de tu PC (el mismo que ves en Workbench)
- Misma base: `db_sistema_seguros`
- Mismo usuario/contraseña: root / admin (o los que tengas en tu `.env` local)

Requisitos:

1. MySQL corriendo en tu PC en el puerto **3306** (como en tu captura de Workbench).
2. Base de datos **db_sistema_seguros** creada y con datos.
3. Usuario **root** con contraseña **admin** (o ajusta en `docker-compose.local-mysql.yml` si usas otros).

Después de levantar con el override, reinicia los servicios si ya estaban arriba y recarga el front: los combos deberían llenarse con los datos de tu MySQL local.

---

## Resumen

- **Docker MySQL ≠ MySQL local.** No se asocian solos; cada uno tiene su propia base.
- Si los backend corren en Docker con el compose por defecto, usan el MySQL del contenedor (suele estar vacío) → combos vacíos.
- Con **docker-compose.local-mysql.yml** los backend en Docker usan tu MySQL local → mismos datos que en Workbench y combos con datos.
