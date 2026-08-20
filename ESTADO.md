# Estado del proyecto AirFryer

> Documento de continuidad. Si retomas el proyecto (tú o una sesión nueva de
> Claude), empieza leyendo esto y luego el `README.md`.
>
> Última actualización: 20 de agosto de 2026.

---

## ✅ Qué está terminado

| Área | Estado |
|---|---|
| **Recetas** | 250, todas con ingredientes escalables, pasos cronometrados, consejos y etiquetas |
| **Fotos** | **250 de 250**, todas revisadas a ojo una a una |
| **App completa** | Buscador con erratas, filtros, orden, favoritos, escalado, notas y estrellas |
| **Modo cocinar** | Paso a paso, temporizador, voz, pantalla siempre encendida, aviso del sistema |
| **Mi semana** | Comida y cena por día, orden de cocinado por temperatura, compartir |
| **Compra** | Agrupada por pasillo, suma cantidades reales, despensa ("ya lo tengo") |
| **Progreso** | Historial, racha, 18 logros, copia de seguridad en archivo |
| **Móvil** | Responsive con 4 cortes; verificado a 375 px vista por vista |
| **Sin conexión** | Service worker con estrategia *servir-y-refrescar*: se actualiza solo |
| **Cuenta (Supabase)** | Terminado: tabla creada y RLS verificado. Listo para registrarse |

---

## ⚠️ Lo que falta

Nada bloqueante. Queda publicar en GitHub Pages: el repositorio local está
iniciado pero sin commit inicial ni remoto (pasos en el `README.md`).

Nota histórica: la tabla de Supabase hubo que crearla a mano porque su API **no
permite DDL** (comprobado: `/pg/query` y `rpc/exec_sql` dan 404 y la Management
API rechaza la `service_role`). Si algún día hay que recrearla, es pegar
`supabase.sql` en el SQL Editor.

---

## 🔑 Configuración actual

- **Supabase**: `js/supabase-config.js` (URL del proyecto + clave `anon`).
  La seguridad depende de las políticas RLS que crea `supabase.sql`.
- **Pexels**: la clave **no** está en el repositorio. Solo hace falta para
  volver a descargar fotos; se pasa por variable de entorno al script.

---

## 📸 Sobre las fotos (decisiones tomadas)

Origen: **Pexels** (licencia libre, uso comercial, sin atribución obligatoria;
se acredita igualmente al fotógrafo). Créditos en `js/photo-credits.js`.

Se descargaron las 250 y se revisaron **una a una** con hojas de contacto, en
dos rondas:

1. **Primera ronda: 75 incorrectas (30 %)**. Tres patrones: ingredientes crudos
   en vez del plato hecho, términos ambiguos en inglés (*cordon bleu* devuelve
   un pájaro; *torrijas* devolvía churros) y platos de alta cocina irreconocibles.
2. Se reescribieron esos 75 términos forzando el plato terminado
   ("cooked", "plate", "baked"). **51 quedaron arregladas.**
3. Para las 25 restantes se cambió de método: **bajar 6-7 candidatos por receta
   y elegir a ojo** con hojas de contacto, en vez de fiarse del primer resultado.
   Así se completaron las 250.

**Método recomendado si hay que rehacer fotos:** descargar varios candidatos y
elegirlos mirándolos (`candidatos.py` + hoja de contacto). Fiarse del primer
resultado de una búsqueda falla en torno al 30 % de las veces.

**Para cambiar cualquier foto**: sustituye `img/<id>.jpg` por la tuya (4:3) y,
si es propia, borra su entrada de `js/photo-credits.js`.

---

## 🐛 Fallos ya corregidos (no volver a introducirlos)

- **`[hidden]` sin `!important`**: reglas como `.sheet { display: flex }` ganaban
  al atributo `hidden` y dejaban modales invisibles capturando todos los clics.
- **`vh` en móvil**: el pie de los modales caía bajo la barra del navegador.
  Se usa `dvh` con `vh` de reserva.
- **`requestAnimationFrame` para abrir modales**: no se ejecuta si la pestaña no
  compone y el panel se quedaba fuera de pantalla. Hay un `setTimeout` de respaldo.
- **Buscador del inicio**: al saltar a Recetas se perdía el foco tras la primera
  letra (en móvil se cerraba el teclado). Ahora pasa el foco al otro campo.
- **Lecturas de `localStorage`**: 540 por repintado. Hay caché en `storage.js`.
- **Pexels responde 403** si la petición no lleva `User-Agent`.
- **El router borraba el token del correo**: al confirmar el email se vuelve con
  `#access_token=...`, y `navigate()` lo sustituía por `#home` antes de que
  Supabase pudiera leerlo. Ahora `hayTokenEnLaUrl()` respeta ese hash.
- **Supabase limpia el hash él solo** (`detectSessionInUrl`), así que para leer
  el `error_description` hay que **guardar una copia del hash al arrancar**.
- **La barra inferior del móvil no llevaba «Perfil»**: tenía cinco pestañas y
  faltaba `profile`, así que en el móvil no había forma de llegar a la cuenta
  ni al login. Si se añade una vista nueva, hay que darla de alta en los **dos**
  menús (`.topnav` y `.tabbar`).
- Los botones de la barra inferior no tenían `aria-label`; ahora sí.
- **Clases CSS repetidas**: `.field` ya existía para los campos del login (es un
  `label`). El input del perfil se llama `.textfield`. Antes de crear una clase,
  comprobar que el nombre está libre.
- **Objetivos táctiles pequeños**: chips y botones `--sm` medían 30-35 px. En
  móvil tienen un mínimo (44 px los sueltos, 40 px los segmentados).
- **Singular y plural del mismo producto** («huevo»/«huevos», «pechuga de
  pollo»/«pechugas de pollo») salían dos veces y no sumaban cantidades. Se
  unifican en la tabla `VARIANTES` de `app.js`.
- **`localStorage.clear()` desde la consola no vacía la caché de `storage.js`**:
  para probar de cero hay que recargar la página, si no las lecturas siguen
  devolviendo lo anterior y las pruebas engañan.
- El service worker no precacheaba `photo-credits.js`, `cloud.js` ni
  `supabase-config.js`. Si se añade un script al HTML, hay que añadirlo a
  `ASSETS` en `sw.js`.

---

## 🛡️ Correcciones de la fase 1 (auditoría)

Once errores de prioridad 1. Detalles que conviene no deshacer:

- **Validación de datos (`SHAPES` en `storage.js`)**: cada clave declara su forma
  y cómo se limpia. Lo usan `read()` y `importAll()`. Que un JSON parsee no
  significa que sirva: un objeto donde se esperaba una lista dejaba la
  aplicación muerta en el splash. `importAll()` valida **antes** de escribir e
  importa solo las claves válidas en vez de rechazar el archivo entero.
- **`esNum()` descarta `null` y `''` a propósito**: `Number(null)` es 0, y sin
  esa comprobación un día vacío del plan semanal apuntaba a la receta 0.
- **Pantalla de rescate (`#rescue`)**: `init()` va dentro de un `try/catch` y hay
  un guardián de 8 s en el HTML por si algún script no llega a cargar. También
  se puede reparar abriendo la aplicación con `?reset=1`.
- **El service worker no cachea Supabase**: hay una lista blanca de orígenes
  (`sePuedeGuardar`). Sus respuestas llevan datos personales y servirlas de
  caché rompía la sincronización. Si se añade un servicio externo, hay que
  decidir explícitamente si entra en esa lista.
- **`Store.wipeUserData()`** borra lo de la persona y conserva los ajustes del
  aparato (tema, sonido, voz, avisos, temperatura). Se usa al cerrar sesión y
  al cambiar de usuario (`Store.lastUser`).
- **`chooseAction()`**: diálogo de varias opciones donde cerrar NO hace nada.
  Se usa en el conflicto de sincronización y en el borrado de datos. No volver
  a usar `confirmAction()` para decisiones de tres caminos: convertía
  "Cancelar" en una acción destructiva.
- **`conflictoSinResolver` en `cloud.js`**: mientras haya un conflicto sin
  decidir, la subida automática queda en pausa. Si no, a los 4 s machacaba la
  copia de la nube que el usuario estaba dudando si conservar.
- **`prefs.set()` no escribe si el valor no cambia**: reaplicar los mismos
  ajustes al arrancar disparaba avisos de cambio y subidas innecesarias.
- **Carreras de cierre**: `closeSheet` y `exitCooking` guardan el id de su
  `setTimeout` y lo cancelan al reabrir. Si se añade otro panel con animación
  de cierre, hay que hacer lo mismo.
- **`accionUnica(clave, ms)`**: ignora la repetición exacta de una acción en una
  ventana corta. No deshabilita botones. Protege la compra, "marcar cocinada",
  "he terminado" y "añadir la semana a la compra".
### Corregido en la revisión de regresión (fase 1.5)

- **`Number()` convierte demasiado en 0**: `null`, `''`, `[]` y `[0]` valen todos
  cero. Los identificadores pasan por `esId()` (entero positivo) y los índices
  de ingredientes por `esIndice()`. Sin eso se colaban favoritos con id 0.
- **`from` envuelto dos veces**: el saneado dejaba `from: []` y la migración del
  formato antiguo lo convertía en `[[]]`. `shopping.all()` ya comprueba si es
  lista antes de envolverlo.
- **Cerrar un panel apilado cerraba también el de debajo**: el `history.back()`
  del cierre disparaba un `popstate` que cerraba el siguiente panel abierto y
  además dejaba una entrada zombi. Se marca con `retrocederConsumiendo()` y el
  manejador de `popstate` ignora ese retroceso.
- **Conflicto al arrancar en silencio**: `sincronizarAlEntrar()` se llama también
  al abrir con sesión, pero su resultado se descartaba. Con la pausa de subida
  añadida en la fase 1, eso dejaba al usuario sin sincronizar sin avisar. Ahora
  se guarda en `Cloud.conflictoInicial()` y la interfaz pregunta.
- **Los service workers están deshabilitados en el navegador de previsualización**
  (comprobado: falla incluso un `sw.js` de una línea). Para probar la PWA hay
  que usar Chrome de verdad.

- **Historial (`panelesEnHistorial`)**: cada vista y cada panel dejan su entrada,
  así que «atrás» cierra el panel antes de cambiar de vista. **No encadenar
  `history.back()` con un `pushState` inmediato**: el retroceso llega más tarde
  y deshace lo recién abierto. Para saltar de un panel a otro se usa
  `cerrarCediendoHistorial(panel, idDestino)`.

---

## 🧑‍🍳 Perfil y bienvenida

- **Perfil**: nombre y avatar (emoji + color) en `prefs`, así que se sincronizan
  con el resto de datos. El avatar aparece en la cabecera de Mi progreso y en la
  pestaña «Perfil» del móvil; el nombre, en el saludo del inicio.
- **Bienvenida**: solo la primera vez (`prefs.welcomed`), con *Crear cuenta*,
  *Ya tengo cuenta* y *Seguir sin cuenta*. **Es un muro blando a propósito**:
  obligar a iniciar sesión dejaría la aplicación inservible sin conexión y
  también si el proyecto gratuito de Supabase se pausa por inactividad (ocurre a
  los ~7 días sin uso). Si algún día se quiere obligar, es quitar el botón de
  *Seguir sin cuenta* y no dejar cerrar el panel.

---

## 🏠 Cómo funciona la despensa

El catálogo **no está escrito a mano**: `pantryCatalog()` lo saca de los
ingredientes reales de las 250 recetas, los reduce con `canonicalName()`, filtra
los que no se compran y los agrupa por pasillo con `aisleOf()`. Salen 212
productos en 7 pasillos. Se muestran los 12 más frecuentes de cada pasillo y el
resto se despliega o se encuentra con el buscador.

Ventaja: lo que marcas siempre coincide con lo que la app te pediría comprar. Si
se añaden recetas, el catálogo crece solo.

---

## 📧 Enlaces de los correos (registro y enlace mágico)

`signUp` y `signInWithOtp` mandan `emailRedirectTo` con la URL de la app. Para
que Supabase la acepte hay que declararla en **Authentication → URL
Configuration**:

- **Site URL**: la dirección pública (`https://TU-USUARIO.github.io/comidas-airfryer/`).
- **Redirect URLs**: añadir `http://127.0.0.1:5599/**` para probar en local
  y `https://TU-USUARIO.github.io/**` para el móvil.

Si no se hace, Supabase usa su valor por defecto `http://localhost:3000` y el
enlace del correo lleva a una página que no existe (la cuenta **sí** queda
confirmada; solo falla el destino).

---

## 🚀 Publicar cambios

```bash
./deploy.sh "mensaje"
```

O doble clic en `subir.bat`. Sube `CACHE_VERSION` de `sw.js` automáticamente,
hace commit y push. Va por `airfryer-v13`.

El repositorio local está iniciado pero **sin commit inicial ni remoto**: falta
configurar la identidad de git y crear el repositorio en GitHub (pasos en el
`README.md`).
