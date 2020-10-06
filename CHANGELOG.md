# CHANGELOG

**1.8.0**

Listado de cambios hasta el momento:

1. Inclusión de etiquetas en la plataforma:
    * En el menú “Mi perfil” de usuarios no diputados ahora hay un campo nuevo “Etiquetas de interés”
    * En la carga y edición de proyectos se agregó el campo “Etiquetas” al final del formulario
    * En la página de inicio, en los filtros de proyectos, ahora se puede filtrar por etiquetas
    * Si los usuarios no tienen ninguna etiqueta asignada se les muestra un aviso
    * Nota: los usuarios y proyectos previos a esta actualización no tendrán asignados ninguna etiqueta
2. Mejoras en el inicio de sesión:
    * Se sacó el botón de “Registrarse” y se dejó únicamente el de “Ingresar” (que antes decía “Iniciar sesión”) en todo el sitio web
    * Se sacó el botón de “Iniciar sesión” y se resaltó la sección que invita a registrarse en el formulario de inicio de sesión
3. Nuevo botón de descarga de excel de los proyectos propios, con sus comentarios y aportes, desde el perfil de usuario	
4. Mejoras de diseño en los filtros de proyectos en la página de inicio
5. Nueva funcionalidad de enviar notificaciones a usuarixs interesadxs al publicar proyecto. Y opción en el perfil de usuario para elegir si recibir estas notificaciones o no.
6. Se arregló un error de que en algunos navegadores, bajo ciertas condiciones, no se guardaban bien las modificaciones del perfil de usuario

Compatible con:
* `leyesabiertas-core:1.8.0`
* `leyesabiertas-web:1.8.0`
* `leyesabiertas-keycloak:1.0.8`

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