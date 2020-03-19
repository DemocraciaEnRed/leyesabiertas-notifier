# CHANGELOG

### 1.7.2

* Corregido la URL de un avatar en el template de comment-contribution (cuando se marca un comentario como aporte)

Compatible con:
* `leyesabiertas-core:1.7.1`
* `leyesabiertas-web:1.7.2`

### 1.7.1

* Corregido el path de varios iconos que no apuntaban correctamente
* Corregido el error que habia que evitaba que se manden los siguientes correos: Nuevo comentario, Nueva respuesta, Comentario relevante, Comentario destacado, Comentario resuelto.
* Corregido un error visual de como se veia la card del proyecto cuando contenia una imagen en el template de proyecto cerrado.
* Cambiado el numero del telefono de diputados en el footer del email

Compatible con:
* `leyesabiertas-core:1.7.1`
* `leyesabiertas-web:1.7.1`


### 1.5.0

* Se hizo un FIX sobre un ID que provocaba que en algunos casos no se enviarán algunas  notificaciones

Compatible con:
* `leyesabiertas-core:1.5.0`
* `leyesabiertas-web:1.5.0`

### 1.3.0

* Se hizo un FIX donde el link a la propuesta se parseaba como `Object` y habia que sacar el `id`
* DERLA-58 Se agrego el feature de que se envia un correo al diputado al recibir un comentario tanto en fundamentacion como contextual.
* Se hizo un FIX en el saludo, donde a veces no existia nombre a quien 

Compatible con:
* `leyesabiertas-core:1.3.0`
* `leyesabiertas-web:1.3.0`

#### 1.1.2
- Fixing sending of comments notifications
- Fixing sending of closing topics
- Tagged: 15-02-2019