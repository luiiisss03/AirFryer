# Estado del proyecto AirChef

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

## 🔀 Fase 2: sincronización que no pierde datos

**Antes**: subir reemplazaba el documento entero, así que el último dispositivo
en escribir borraba el trabajo del otro. Sin aviso.

**Ahora** se comparan tres versiones y solo se aplican los *cambios* locales:

| | |
|---|---|
| `base` | lo último que este aparato sincronizó (`airfryer:syncBase`) |
| `local` | lo que hay aquí ahora |
| `remoto` | lo que hay en la nube en este instante |

`Store.merge3(base, local, remoto)` fusiona colección por colección: listas por
altas y bajas, mapas por clave (gana quien la tocó), historial por unión sin
repetir, y la compra por id de producto más una consolidación por nombre (el
mismo producto añadido en dos sitios se suma en vez de duplicarse).

`Cloud.subir()` lee el sello `updated_at` antes de escribir: si no es el que
dejamos nosotros, ha escrito otro dispositivo y fusiona. `subir({forzar:true})`
salta la fusión, y se usa solo cuando el usuario pide expresamente reemplazar
(resolver un conflicto o borrar también la cuenta).

**Importante**: el disparador `airfryer_touch()` de la tabla reescribe
`updated_at`, así que tras el `upsert` hay que leer el valor real con
`.select('updated_at')`. Si se guardase el sello enviado en vez del real, la
detección de cambios ajenos dejaría de funcionar.

### Resto de la fase 2

- **Ajuste de temperatura en el texto** (`adjTempTexto`): la ficha decía 210 °C
  y el paso 200 °C. Se aplica en ficha, modo cocinar, voz, consejos y al
  compartir. Solo toca los grados, nunca los minutos.
- **Aviso de versión nueva**: `sw.js` ya **no** llama a `skipWaiting()` en la
  instalación (mezclaba HTML viejo con scripts nuevos). La versión nueva espera,
  la aplicación muestra una barra «Hay una versión nueva», y al aceptar se manda
  `SKIP_WAITING` y se recarga con `controllerchange`. No aparece durante el modo
  cocinar.
- **Subida pendiente**: un cambio llegado mientras se subía se recordaba y se
  perdía hasta el siguiente. Ahora se reintenta al terminar.
- **Guardar al salir**: se usa `visibilitychange` (la página aún está viva)
  además de `pagehide`, donde muchas veces ya no daba tiempo.
- **Almacenamiento lleno**: `write()` lanza `airfryer:storagefull` y la interfaz
  avisa una sola vez. Antes solo se veía en la consola.
- **Textos largos**: `overflow-wrap: anywhere` en compra, tarjetas y perfil. Un
  nombre de 200 caracteres sin espacios desplazaba la página entera.
- **Móvil en horizontal**: el modo cocinar pasa a dos columnas por debajo de
  500 px de alto. Antes el temporizador quedaba fuera de la pantalla.

---

## 🏷️ Nombre y logotipo

La aplicación se llama **AirChef** (antes AirFryer). Al renombrar hay dos cosas
que **no** se tocaron a propósito:

- Las claves de `localStorage` siguen con el prefijo `airfryer:` y la tabla de
  Supabase sigue siendo `airfryer_data`. Cambiarlas dejaría sin datos a quien ya
  tenga la aplicación instalada. Lo mismo con los eventos internos
  (`airfryer:datachange`).
- La dirección pública sigue siendo `https://luiiisss03.github.io/AirFryer/`
  porque el repositorio se llama así. Si algún día se renombra el repositorio,
  hay que cambiar `SUPABASE_CONFIG.siteUrl` **y** las URL de Supabase.

Ojo con los reemplazos automáticos: la marca de la cabecera va partida en dos
etiquetas (`Air<b>Chef</b>`) y un buscar/reemplazar de «AirFryer» no la alcanza.
Y «air fryer» en minúsculas es el electrodoméstico, no la marca: no se toca.

### El logotipo

`img/logo.svg` es la única fuente: una freidora con gorro de chef y dos arcos de
aire caliente. Se usa en el favicon, el splash, la cabecera, la pantalla de
entrada y el modal de la cuenta.

Los iconos de la PWA se generan con `tools/generar-iconos.py` (necesita Pillow),
que **redibuja** el mismo diseño y produce los cuatro PNG de `icons/`:

```bash
python tools/generar-iconos.py
```

El `icon-maskable` lleva el dibujo más pequeño (58 % del lienzo) porque Android
puede recortarlo en círculo.

**Si algún día se quiere usar un logotipo distinto**: basta con sustituir
`img/logo.svg` y volver a lanzar el script; si el nuevo es un PNG, hay que
cambiar las cinco referencias de `index.html` y regenerar los iconos a mano.

---

## ✨ Movimiento e interacción

- **Los `:hover` van dentro de `@media (hover: hover)`.** Sin eso, en el móvil
  el efecto se quedaba **pegado** tras tocar (una tarjeta se elevaba y ya no
  bajaba). Si se añade una regla `:hover` nueva, hay que envolverla igual.
- **El dedo necesita su propia respuesta.** Había 37 reglas `:hover` y solo 4
  `:active`, así que en el móvil casi nada acusaba el toque y la aplicación
  parecía lenta aunque respondiera al instante. Hay un bloque «respuesta al
  toque» con `:active` para todo lo pulsable.
- **`-webkit-tap-highlight-color: transparent`**: el recuadro gris del navegador
  chocaba con las esquinas redondeadas.
- **`overscroll-behavior: contain`** en paneles y carruseles: al llegar al final
  de una lista, el gesto arrastraba la página de detrás.
- **`scroll-padding-top`**: la barra superior es fija y tapaba el título de la
  sección al saltar a ella desde los datos del perfil.
- **Entrada escalonada**: cada tarjeta lleva `style="--i:N"` y retrasa su
  aparición 35 ms. El índice se limita a 11 para que una lista de 250 no tarde
  nueve segundos en terminar de entrar (tope real: 0,385 s).
- **Marca deslizante en la barra inferior**: es el `::before` de `.tabbar`,
  movido con las variables `--tab` (índice activo) y `--tabs` (cuántas hay),
  que pone `navigate()`.
- **Las vistas entran por el lado del que vienen** (`data-dir="avanza|vuelve"`),
  comparando la posición en `VIEWS`. Hay que quitar y volver a poner el
  atributo (`void v.offsetWidth`) o la animación no se reinicia.

Todo esto lo sigue anulando el bloque `prefers-reduced-motion` que ya existía.

---

## ☁️ La nube es la única fuente de datos

Hasta aquí convivían dos almacenes —el navegador y la nube— y por eso aparecía
un diálogo preguntando con cuál quedarse. Ya no: **los datos de la cuenta no se
guardan en el navegador**.

| Dónde vive | Qué |
|---|---|
| **Nube** (Supabase) | Favoritos, historial, semana, compra, despensa, notas, logros, ingredientes marcados y perfil (nombre y avatar) |
| **Memoria** | Copia de trabajo mientras la aplicación está abierta. Se llena al entrar y se sube al cambiar |
| **Navegador** | Solo los ajustes de este aparato: tema, sonido, voz, avisos y corrección de temperatura. Y `airfryer:visto`, una marca para el texto de bienvenida |

En `storage.js` esto lo deciden `CLAVES_DE_CUENTA` y `PREFS_DE_CUENTA`. Detalles
que costó afinar y conviene no deshacer:

- **Los ajustes del aparato NO viajan a la nube** (`soloPerfil()` en `exportAll`).
  Si viajaran, el móvil le cambiaría el tema al ordenador.
- **Al escribir preferencias se fusiona con lo que ya había** en el navegador:
  cuando llegan datos de la nube no vienen los ajustes del aparato, y sin la
  fusión se borrarían el tema y la corrección de temperatura.
- **La caché guarda las dos mitades juntas.** Si solo guardara lo recién
  llegado, una bajada de la nube dejaría la aplicación sin tema hasta recargar.
- Al arrancar se **limpian** las claves de cuenta que dejaran versiones
  anteriores en el navegador.
- `syncBase` (la base para fusionar entre dispositivos) vive **en memoria**: no
  tiene sentido guardarla si los datos tampoco se guardan.

### Decir la verdad sobre el estado de los datos

Al pasar a la nube apareció un efecto feo: durante la carga la aplicación decía
«Aún no tienes favoritos» y luego se llenaba de golpe. Ahora hay **cuatro
estados** y cada vista los distingue con `bloqueDeEstado()`:

| Estado | Qué se ve |
|---|---|
| Cargando | «Trayendo tus favoritos…» con esqueletos |
| Error | «No hemos podido traer tus datos» + botón *Reintentar* |
| Vacío de verdad | «Aún no tienes favoritos» |
| Con datos | La lista |

Además: **reintentos automáticos** al fallar una subida (3 s, 8 s, 20 s, 60 s),
que se adelantan al recuperar la conexión; y una **barra de estado** abajo
(`.netbar`) que avisa de que no hay red. Va abajo a propósito: arriba tapaba la
cabecera.

**Consecuencia asumida**: sin conexión la aplicación no muestra los datos de la
cuenta. Las 250 recetas sí, porque van en el código. Es el precio de tener una
sola fórmula, y fue una decisión explícita.

---

## 🚪 Entrada a la aplicación

Al abrir se comprueba **primero** si hay sesión, y se decide sin esperar a la
red (`hayIndicioDeSesion()` busca la clave `sb-…auth-token` de Supabase en
localStorage):

- **Con sesión** → directo al inicio. La pantalla de entrada no aparece ni un
  instante.
- **Sin sesión** → pantalla de entrada. Si ya había usado la aplicación, el
  texto cambia a «Entra en AirChef» y el botón principal pasa a ser *Entrar*.
- **Rastro de sesión pero inválida** (caducada o cerrada desde otro sitio):
  `Cloud.init()` lo detecta y entonces sí se pide entrar.
- **No hay forma de entrar sin cuenta**: los datos viven en la nube, así que
  sin sesión no habría nada que enseñar.
- El formulario se abre **por encima** de la pantalla de entrada
  (`.sheet--sobre-bienvenida`, z-index 125 contra 120). Si se cancela, se
  vuelve a ella; no se cuela nadie en la aplicación sin haber decidido.
- Al **cerrar sesión** se vuelve a la pantalla de entrada.

### Dirección de los correos

`SUPABASE_CONFIG.siteUrl` fija a dónde llevan los enlaces de confirmación y de
entrada sin contraseña: **`https://luiiisss03.github.io/AirFryer/`**.

Se usa esa y no la dirección desde la que se abrió la aplicación **a propósito**:
el correo se abre casi siempre en el móvil, y un enlace a `localhost` apuntaría
al ordenador de quien lo pidió. Va sin `#`, porque Supabase añade ahí su propio
fragmento con el token; la aplicación deja la dirección en `#home` en cuanto lo
procesa.

**Hay que darla de alta en Supabase** → Authentication → URL Configuration:
Site URL `https://luiiisss03.github.io/AirFryer/` y en Redirect URLs
`https://luiiisss03.github.io/AirFryer/**`.

---

## 👀 Revisión externa (informático) — corregido

- **Parpadeo al abrir**: se veía el splash, luego la aplicación un instante y
  después la bienvenida encima. La causa era esperar a `Cloud.init()` (red) para
  decidir si mostrarla. Ahora se decide **de forma síncrona** con
  `esPrimerUso()`, que mira las preferencias, si hay datos y si existe una clave
  `sb-…auth-token` en localStorage (`hayIndicioDeSesion()`). La bienvenida se
  monta **antes** de que el splash se retire, por debajo de él (z-index 120
  contra 200), así que la aplicación nunca llega a verse. Si luego resulta que
  sí había sesión, se retira con `ocultarBienvenida()`.
  **No mover `mostrarBienvenida()` después del temporizador del splash.**
- **Login**: es propio (HTML y CSS de la aplicación) sobre el SDK `supabase-js`.
  No se usa Supabase Auth UI.
- **Sin botones de sincronizar**: teniendo base de datos, guardar y traer debe
  ocurrir solo. Se quitaron «Sincronizar» y «Traer de la nube»; queda el estado
  (`estadoSync()`: sin conexión / guardando / conflicto / guardado) y «Cerrar
  sesión». El retardo de subida bajó de 4 s a 1,2 s para que marcar un favorito
  se guarde casi al instante.
- **Datos del perfil pulsables**: las seis tarjetas son botones que llevan a su
  lista (favoritas → su vista; cocinadas y racha → historial; logros → su
  sección; categorías → recetas; planificadas → semana).

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

- **Site URL**: la dirección pública (`https://luiiisss03.github.io/AirFryer/`).
- **Redirect URLs**: añadir `http://127.0.0.1:5599/**` para probar en local
  y `https://luiiisss03.github.io/AirFryer/**` para el móvil.

Si no se hace, Supabase usa su valor por defecto `http://localhost:3000` y el
enlace del correo lleva a una página que no existe (la cuenta **sí** queda
confirmada; solo falla el destino).

---

## 🚀 Publicar cambios

```bash
./deploy.sh "mensaje"
```

O doble clic en `subir.bat`. Sube `CACHE_VERSION` de `sw.js` automáticamente,
hace commit y push. Va por `airchef-v3`.

El repositorio local está iniciado pero **sin commit inicial ni remoto**: falta
configurar la identidad de git y crear el repositorio en GitHub (pasos en el
`README.md`).
