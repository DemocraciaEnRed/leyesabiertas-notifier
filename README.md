![Header](docs/header-doc.png)

# Leyes Abiertas - API Notifier (Mailer)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DemocraciaEnRed_leyesabiertas-notifier&metric=alert_status)](https://sonarcloud.io/dashboard?id=DemocraciaEnRed_leyesabiertas-notifier)
[![GitHub license](https://img.shields.io/github/license/DemocraciaEnRed/leyesabiertas-notifier)](https://github.com/DemocraciaEnRed/leyesabiertas-notifier/blob/master/LICENSE)

Este es uno de los cuatros modulos que se requieren descargar, hacer setup e instalar cada uno de los repositorios para poder utilizar Leyes Abiertas.
Para saber mas del conjunto de modulos que compone leyes abiertas, hace [click aqui](https://github.com/DemocraciaEnRed/leyesabiertas) 

---

### Setup leyesabiertas-notifier

> #### ⚠️ NOTAS IMPORTANTES
> 
> El siguiente conjunto de sistemas requiere de:
> - Mongo3.6
> - Keycloak 4.4.x o 6.0.x
> 
> Sobre Mongo3.6, es necesario que instales mongo 3.6 en tu computadora, con una base de datos llamada "leyesabiertas". No hace falta crear alguna collection, eso lo hace la app en inicio.
> 
> Keycloak es un sistema open source de identificación y gestión de acceso de usuarios. Es un sistema complejo y para fines de testing, en [Democracia en Red](https://democraciaenred.org) sabemos que la instalacion de Keycloak puede ser un bloqueo para intenciones de testing. Para eso, comunicate con nosotros y podemos ayudarte a hacer el setup y utilizar nuestro Keycloak de Democracia en Red. Envianos un correo electronico en [mailto:it@democraciaenred.org](it@democraciaenred.org) o contactanos a través de nuestro [Twitter](https://twitter.com/fundacionDER).


Ir a la carpeta del repo y instalar las dependencias.

```
dev/:$ cd leyesabiertas-notifier
dev/leyesabiertas-notifier:$ npm install
```

Ahora tenemos que crear un archivo `.env` que son nuestras variables de entorno

```env
PORT=5000
MONGO_URL=mongodb://localhost
DB_COLLECTION=leyesabiertas
ORGANIZATION_EMAIL=##############TODO
ORGANIZATION_NAME=###############TODO
ORGANIZATION_API_URL=http://localhost:4000
NODEMAILER_HOST=##############TODO
NODEMAILER_PASS=##############TODO
NODEMAILER_USER=##############TODO
NODEMAILER_PORT=##############TODO
NODEMAILER_SECURE=true||false
NODE_ENV=development || production
BULK_EMAIL_CHUNK_SIZE=100-or-change-it
```

Comando para ejecutar:

```
dev/leyesabiertas-notifier:$ npm run dev
```

#### ℹ Simple test

Por el momento, intentá hacer un POST a...

```
/api/sendemail
```

Con el siguiente body...

```javascript
{
	"type":"the-type",
	"info": {
		"to":"the-email-to@notify.com",
		"document": {
			"comment":"The original comment",
			"title":"The document title",
			"author":"The document author"
		}
	}
}
```

Actualmente hay 3 tipos de notificaciones al momento: "comment-resolved", "comment-liked", "document-edited"

Esto se puede realizar rápidamente editando el archivo `test-post-data.json` y ejecutando:
`curl -v -H "Content-Type: application/json" -d @test-post-data.json http://localhost:5000/api/send-email`

---

## Licencia

El siguiente repositorio es un desarrollo de codigo abierto bajo la licencia GNU General Public License v3.0. Pueden acceder a la haciendo [click aqui](./LICENSE).
