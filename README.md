# 🍗 AirFryer

Aplicación web de recetas para freidora de aire. **250 recetas** que funcionan enteras en el navegador,
sin conexión y sin cuenta: todo se guarda en `localStorage`.

Opcionalmente puedes activar una **cuenta con Supabase** para tener los mismos datos en el móvil y en
el ordenador. Si no la configuras, la app no toca la red para nada.

## Cómo usarla

Abre `index.html` en el navegador. Nada más.

Para probarla con el modo sin conexión activado (el *service worker* solo funciona sobre `http`/`https`,
nunca sobre `file://`), levanta un servidor estático en la carpeta del proyecto:

```bash
python -m http.server 5599
```

Y entra en `http://localhost:5599`.

## Llevarla al móvil (gratis)

Tres caminos, de más rápido a más cómodo:

1. **Misma wifi.** Levanta el servidor con `python -m http.server 5599 --bind 0.0.0.0`, mira tu IP local
   (`ipconfig`) y abre `http://TU-IP:5599` desde el móvil. Solo funciona con el ordenador encendido.
2. **GitHub Pages** (gratis y permanente). Sube la carpeta a un repositorio, entra en *Settings →
   Pages*, elige la rama `main` y la carpeta `/root`. En un par de minutos tendrás una URL `https://…`
   que funciona desde cualquier sitio.
3. **Netlify Drop** (gratis, sin cuenta técnica). Arrastra la carpeta a `app.netlify.com/drop` y te da
   una URL `https://…` al instante.

Con una URL `https://` (opciones 2 y 3), desde el móvil: **Menú del navegador → “Añadir a pantalla de
inicio”** (o el botón *Instalar app* de la pantalla *Mi progreso*). Queda como una app instalada, a
pantalla completa, con su icono y funcionando sin conexión.

## Cuenta y sincronización (opcional)

Por defecto los datos viven solo en el navegador de cada dispositivo. Si quieres tener las mismas
recetas, semana y progreso en el ordenador y en el móvil, puedes activar una cuenta con **Supabase**
(plan gratuito, sin tarjeta):

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. **SQL Editor → New query**, pega el contenido de `supabase.sql` y pulsa *Run*. Eso crea la tabla y
   las reglas de seguridad que impiden que un usuario vea los datos de otro.
3. **Settings → API**, copia *Project URL* y la clave *anon public*.
4. Pégalas en `js/supabase-config.js`.
5. Recarga la app: en **Mi progreso** aparecerá el botón *Iniciar sesión*.

Si además quieres entrar sin confirmar el correo cada vez, en **Authentication → Providers → Email**
puedes desactivar *Confirm email* (para uso personal es cómodo; en algo público, no lo hagas).

**Cómo se comporta:**

- Al **crear la cuenta**, lo que ya tuvieras guardado en ese dispositivo se sube tal cual.
- Al **entrar en otro dispositivo**, se bajan tus datos automáticamente.
- Si hay datos **en los dos sitios**, la app te pregunta cuál conservar en vez de decidir por su cuenta.
- Cada cambio se sube solo unos segundos después, y también al cerrar la pestaña.
- **Sin conexión sigue funcionando todo**: se guarda en local y se sube cuando vuelvas a tener red.

Sobre la clave `anon`: es pública por diseño, va en el navegador y no es un secreto. Quien protege los
datos son las políticas RLS de `supabase.sql`. La que **nunca** debe salir del servidor es la
`service_role`.

## Fotos de las recetas

**Las 250 recetas tienen foto** en `img/<id>.jpg` (560×420, ~38 KB cada una). El sistema mantiene el
respaldo: si una imagen no cargara, debajo sigue estando el emoji. Nunca se ve una imagen rota.

Proceden de [Pexels](https://pexels.com) (licencia libre, uso comercial permitido y sin atribución
obligatoria; se acredita igualmente al fotógrafo). Los créditos están en `js/photo-credits.js` y se
muestran bajo la foto en la ficha y en **Mi progreso → Ver créditos**.

Para regenerarlas hace falta una clave gratuita de Pexels; el descargador respeta su límite de 200
peticiones por hora.

**Para cambiar una foto** que no te guste: sustituye `img/<id>.jpg` por la tuya (proporción 4:3) y borra
esa entrada de `js/photo-credits.js` si la imagen es propia.

## Estructura

```
index.html          Estructura de todas las pantallas
manifest.json       Metadatos para instalarla como app en el móvil
sw.js               Service worker: cachea la app para usarla sin conexión
icons/              Iconos PNG de la app (Android, iOS y maskable)
img/                Una foto por receta (img/<id>.jpg)
supabase.sql        Tabla y reglas de seguridad para la sincronización
css/
  styles.css        Tokens de diseño, tema claro/oscuro y todos los componentes
js/
  recipes.js        Los datos: categorías, etiquetas y las 250 recetas
  storage.js        Única capa de acceso a localStorage (con caché de lectura)
  supabase-config.js  Tus claves de Supabase (vacío = todo en local)
  cloud.js          Cuenta y sincronización (opcional)
  photo-credits.js  Autoría y licencia de cada foto (generado)
  app.js            Lógica: navegación, filtros, ficha, modo cocinar, logros…
```

Los iconos se regeneran con Pillow (`pip install pillow`) a partir del emoji 🍗; el script está en el
historial del proyecto y basta con volver a ejecutarlo si cambias el diseño.

## Qué se puede hacer

| Función | Dónde |
|---|---|
| Buscar por nombre, ingrediente, categoría o etiqueta, con tolerancia a erratas | Buscador de Inicio y de Recetas |
| Filtrar por tiempo, dificultad, tipo y objetivo | Botón **Filtros** en Recetas |
| Ordenar por popularidad, tiempo, dificultad, calorías, novedad o tu valoración | Selector en Recetas |
| Guardar favoritos | Corazón de cada tarjeta o de la ficha |
| Escalar cantidades | `− 👥 4 +` dentro de la ficha |
| Valorar con estrellas y guardar notas propias | 📝 Mis notas, en la ficha |
| Cocinar paso a paso, con temporizador, voz y pantalla siempre encendida | **▶ Empezar a cocinar** |
| Aviso del sistema al acabar el temporizador aunque cambies de app | Mi progreso → Preferencias |
| Planificar comida y cena de cada día | 📅 Mi semana |
| Ver el orden de cocinado por temperatura | 🔥 Orden de cocinado, en Mi semana |
| Lista de la compra agrupada por pasillo, sumando cantidades | 🛒 Lista de la compra |
| Marcar lo que ya tienes en casa | 🏠 Mi despensa |
| Compartir receta, lista o semana | Botones 📤 |
| Copia de seguridad en archivo | Mi progreso → Copia de seguridad |
| Historial, racha y 18 logros | 👨‍🍳 Mi progreso |
| Receta aleatoria con filtros | 🎲 **No sé qué cocinar** |
| Buscar recetas con lo que tienes en la nevera | 🧺 **Cocina con lo que tengo** |
| Ajustar la temperatura de todas las recetas | Mi progreso → Preferencias |
| Modo claro / oscuro | Botón de la cabecera o Preferencias |
| Cuenta para tener los datos en varios dispositivos | 👨‍🍳 Mi progreso → Iniciar sesión |

## Añadir una receta nueva

Añade un objeto al array `RECIPES` de `js/recipes.js`. El esquema está documentado en la cabecera de
ese archivo:

```js
{
  id: 251,                      // único
  name: 'Nombre de la receta',
  emoji: '🍤',                  // ilustración de la tarjeta
  category: 'pescado',          // clave de CATEGORIES
  description: 'Frase corta.',
  prepTime: 10, cookTime: 12,   // minutos
  temperature: 190,             // °C
  difficulty: 'Fácil',          // Fácil | Media | Difícil
  servings: 2, calories: 260,
  popularity: 70,               // 0-100, ordena "Más populares"
  ingredients: [
    { q: 400, u: 'g', n: 'gambas' },       // q se multiplica al escalar
    { q: null, u: '', n: 'Sal al gusto' }  // q null = no escalable
  ],
  steps: [
    { t: 'Precalienta a 190 °C.', timer: 3 }  // timer opcional, en minutos
  ],
  tips: ['Consejo específico de air fryer.'],
  tags: ['rapida', 'proteina']  // claves de TAGS
}
```

No hace falta tocar nada más: categorías, contadores, filtros y buscador se actualizan solos.

Si añades ingredientes nuevos, échale un ojo a la lista `CANONICAL` de `js/app.js`: es la que agrupa
nombres parecidos ("patatas medianas" y "patatas para freír" → `patatas`) para poder **sumar
cantidades** en la lista de la compra.

## Datos guardados en el navegador

Todas las claves usan el prefijo `airfryer:` — `favorites`, `history`, `week`, `shopping`, `pantry`,
`notes`, `prefs`, `achievements` y `checks`. Se pueden exportar a un archivo, restaurar desde él y
borrar de una vez desde **Mi progreso**.

Si el navegador bloquea `localStorage` (modo incógnito estricto), la aplicación sigue funcionando en
memoria durante la sesión y avisa por consola.

## Publicar cambios

El service worker usa la estrategia *servir-y-refrescar*: abre al instante desde la copia local y baja
la versión nueva por detrás, así que **la app se actualiza sola en la siguiente apertura**, subas los
archivos como los subas.

Si quieres que la actualización sea inmediata en vez de en la segunda apertura, sube `CACHE_VERSION`
en `sw.js` (va por `airfryer-v11`). El script `deploy.sh` / `subir.bat` lo hace solo.

## Diseño responsive

Un único CSS sirve para todo, con tres cortes:

- **≥ 900 px** — menú superior, rejilla de hasta 4 columnas, modales centrados.
- **< 900 px** — barra inferior fija, tarjetas más compactas, modales a pantalla completa desde abajo.
- **< 620 px** — cabecera y portada compactas, barras de acciones en dos columnas, chips de categoría
  en una fila deslizable y textos de marcador de posición acortados.
- **< 380 px** — dos tarjetas por fila y tipografías ajustadas para iPhone SE y similares.
