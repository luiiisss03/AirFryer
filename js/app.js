/* ============================================================
   AirChef · Lógica de la aplicación
   ------------------------------------------------------------
   Vanilla JS (ES6+). Sin dependencias, sin red, sin backend.

    1. Utilidades            8. Modo cocinar (voz, pantalla activa)
    2. Estado                9. Mi semana (comida y cena)
    3. Navegación y tema    10. Lista de la compra y despensa
    4. Tarjetas             11. Progreso y logros
    5. Inicio y listado     12. Aleatoria y "lo que tengo"
    6. Búsqueda difusa      13. Compartir, copia de seguridad, instalar
    7. Ficha de receta      14. Eventos y arranque
   ============================================================ */

/* ══════════════ 1. UTILIDADES ══════════════ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Elimina acentos y pasa a minúsculas para comparar textos. */
const normalize = (str) => String(str)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .trim();

/** Escapa texto antes de insertarlo como HTML. */
const esc = (str) => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Formatea una cantidad usando fracciones legibles (1½ en vez de 1.5). */
function formatQty(value) {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const symbols = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  if (frac === 0) return String(whole);
  if (whole === 0) return symbols[frac];
  return whole + symbols[frac];
}

/** Texto de un ingrediente ya escalado al número de personas. */
function ingredientText(ing, factor = 1) {
  if (ing.q === null || ing.q === undefined) return ing.n;
  const value = ing.q * factor;
  /* En gramos y mililitros las fracciones no aportan nada: "21 g", no "20¾ g".
     Por encima de 1000 se pasa a kilos y litros. */
  let qty;
  if ((ing.u === 'g' || ing.u === 'ml') && value >= 1000) {
    qty = (value / 1000).toLocaleString('es-ES', { maximumFractionDigits: 2 });
    return `${qty} ${ing.u === 'g' ? 'kg' : 'l'} de ${ing.n}`;
  }
  qty = (ing.u === 'g' || ing.u === 'ml') && value >= 10 ? String(Math.round(value)) : formatQty(value);
  if (!ing.u || ing.u === 'ud') return `${qty} ${ing.n}`;
  return `${qty} ${ing.u} de ${ing.n}`;
}

/** Cantidad estructurada { a, u } para poder sumarla en la lista de la compra. */
function ingredientQty(ing, factor = 1) {
  if (ing.q === null || ing.q === undefined) return null;
  return { a: ing.q * factor, u: ing.u || 'ud' };
}

/** Convierte las partes acumuladas de un producto en texto legible. */
function formatParts(item) {
  const parts = (item.parts || []).map(p => {
    let { a, u } = p;
    /* En kilos y litros interesa el decimal exacto (1,3 kg), no la fracción */
    if (u === 'g' && a >= 1000) return `${(a / 1000).toLocaleString('es-ES', { maximumFractionDigits: 2 })} kg`;
    if (u === 'ml' && a >= 1000) return `${(a / 1000).toLocaleString('es-ES', { maximumFractionDigits: 2 })} l`;
    if ((u === 'g' || u === 'ml') && a >= 10) return `${Math.round(a)} ${u}`;
    return `${formatQty(a)}${u === 'ud' ? ' ud' : ' ' + u}`;
  });
  return parts.concat(item.texts || []).join(' + ');
}

const totalTime = (r) => r.prepTime + r.cookTime;
const getRecipe = (id) => RECIPES.find(r => r.id === Number(id)) || null;
const catInfo = (key) => CATEGORIES.find(c => c.key === key) || { label: key, emoji: '🍽️' };
const tagInfo = (key) => TAGS.find(t => t.key === key) || { label: key, emoji: '🏷️' };

/** Temperatura corregida con el ajuste personal del usuario. */
const adjTemp = (recipe) => recipe.temperature + (Number(Store.prefs.get('tempOffset')) || 0);

/**
 * Aplica el mismo ajuste a las temperaturas escritas dentro de un texto.
 * Sin esto, la ficha decía "210 °C (ajustado +10°)" mientras el primer paso
 * seguía diciendo "precalienta a 200 °C": dos cifras distintas en la misma
 * pantalla. Solo se tocan los grados; los minutos se quedan como están.
 */
function adjTempTexto(texto) {
  const offset = Number(Store.prefs.get('tempOffset')) || 0;
  if (!offset) return texto;
  return String(texto).replace(/(\d{2,3})\s*°\s*C/g, (_, grados) => `${Number(grados) + offset} °C`);
}

/** Mensajes flotantes. */
function toast(message, icon = '✅') {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast__ico">${icon}</span><span>${esc(message)}</span>`;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

/** Diálogo de confirmación. Devuelve una promesa con true/false. */
function confirmAction({ title = '¿Seguro?', text = '', icon = '⚠️', ok = 'Sí, continuar' }) {
  return new Promise(resolve => {
    const box = $('#confirmBox');
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    $('#confirmIco').textContent = icon;
    $('#confirmYes').textContent = ok;
    box.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => box.classList.add('is-open'));

    const close = (result) => {
      box.classList.remove('is-open');
      setTimeout(() => { box.hidden = true; }, 200);
      if (!$$('.sheet.is-open').length && $('#cookMode').hidden) document.body.classList.remove('no-scroll');
      $('#confirmYes').removeEventListener('click', onYes);
      $$('[data-confirm-no]', box).forEach(b => b.removeEventListener('click', onNo));
      resolve(result);
    };
    const onYes = () => close(true);
    const onNo  = () => close(false);

    $('#confirmYes').addEventListener('click', onYes);
    $$('[data-confirm-no]', box).forEach(b => b.addEventListener('click', onNo));
  });
}

/**
 * Diálogo de varias opciones. Devuelve la clave elegida, o `null` si el
 * usuario cierra sin elegir (fondo, Cancelar o Escape).
 *
 * Existe porque reutilizar confirmAction() para decisiones de tres caminos
 * convertía "Cancelar" en una acción destructiva: el `false` se interpretaba
 * como "haz la otra cosa". Aquí cerrar no hace absolutamente nada.
 */
function chooseAction({ title, text = '', icon = '🔀', options = [], cancel = 'Cancelar' }) {
  return new Promise(resolve => {
    const box = $('#choiceBox');
    $('#choiceTitle').textContent = title;
    $('#choiceText').textContent = text;
    $('#choiceIco').textContent = icon;
    $('#choiceCancel').textContent = cancel;
    $('#choiceActions').innerHTML = options.map(o =>
      `<button class="btn ${o.tone === 'danger' ? 'btn--danger' : o.tone === 'ghost' ? 'btn--ghost' : 'btn--primary'}"
               data-choice="${esc(o.key)}">${esc(o.label)}</button>`).join('');

    box.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => box.classList.add('is-open'));

    const cerrar = (valor) => {
      box.classList.remove('is-open');
      setTimeout(() => { box.hidden = true; }, 200);
      if (!$$('.sheet.is-open').length && $('#cookMode').hidden && $('#confirmBox').hidden) {
        document.body.classList.remove('no-scroll');
      }
      box.removeEventListener('click', alPulsar);
      document.removeEventListener('keydown', alTeclear);
      resolve(valor);
    };
    const alPulsar = (e) => {
      if (e.target.closest('[data-choice-cancel]')) return cerrar(null);
      const btn = e.target.closest('[data-choice]');
      if (btn) cerrar(btn.dataset.choice);
    };
    const alTeclear = (e) => { if (e.key === 'Escape') cerrar(null); };

    box.addEventListener('click', alPulsar);
    document.addEventListener('keydown', alTeclear);
  });
}

/**
 * Evita que una misma acción se ejecute dos veces por un toque doble.
 *
 * No deshabilita botones ni añade esperas: la interfaz responde igual de
 * rápido. Simplemente ignora la repetición EXACTA de la misma acción sobre
 * el mismo elemento dentro de una ventana muy corta, que es lo que ocurre
 * con un doble toque accidental. Repetir a propósito sigue siendo posible,
 * solo hay que separar los toques.
 */
const ultimasAcciones = new Map();
function accionUnica(clave, ms = 700) {
  const ahora = Date.now();
  const previa = ultimasAcciones.get(clave) || 0;
  if (ahora - previa < ms) return false;
  ultimasAcciones.set(clave, ahora);
  return true;
}

/** Pequeño "pop" al pulsar elementos con feedback. */
function pulse(el) {
  if (!el) return;
  el.classList.remove('is-pulsing');
  void el.offsetWidth;
  el.classList.add('is-pulsing');
}

/* ══════════════ 2. ESTADO ══════════════ */

const DAYS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' }
];

const SLOTS = [
  { key: 'comida', label: 'Comida', emoji: '☀️' },
  { key: 'cena',   label: 'Cena',   emoji: '🌙' }
];

const ACHIEVEMENTS = [
  { key: 'first',    emoji: '🥔', name: 'Primera receta',      desc: 'Cocina tu primera receta',           test: s => s.cooked >= 1 },
  { key: 'cook5',    emoji: '🍗', name: '5 recetas cocinadas', desc: 'Cocina 5 recetas',                   test: s => s.cooked >= 5 },
  { key: 'cook7',    emoji: '🔥', name: '7 recetas cocinadas', desc: 'Cocina 7 recetas',                   test: s => s.cooked >= 7 },
  { key: 'cook25',   emoji: '👨‍🍳', name: '25 recetas',          desc: 'Cocina 25 recetas',                  test: s => s.cooked >= 25 },
  { key: 'fav10',    emoji: '❤️', name: '10 favoritas',        desc: 'Guarda 10 recetas en favoritos',     test: s => s.favs >= 10 },
  { key: 'streak3',  emoji: '📆', name: 'Racha de 3 días',     desc: 'Cocina 3 días seguidos',             test: s => s.streak >= 3 },
  { key: 'streak7',  emoji: '🗓️', name: 'Racha de 7 días',     desc: 'Cocina una semana entera seguida',   test: s => s.streak >= 7 },
  { key: 'explorer', emoji: '🧭', name: 'Explorador',          desc: 'Prueba 5 categorías diferentes',     test: s => s.cats >= 5 },
  { key: 'allcats',  emoji: '🌍', name: 'Sin fronteras',       desc: 'Prueba las 9 categorías',            test: s => s.cats >= 9 },
  { key: 'planner',  emoji: '📅', name: 'Semana planificada',  desc: 'Planifica los 7 días de la semana',  test: s => s.weekDays >= 7 },
  { key: 'planner14',emoji: '🗒️', name: 'Comidas y cenas',     desc: 'Planifica 14 comidas en la semana',  test: s => s.week >= 14 },
  { key: 'shopper',  emoji: '🛒', name: 'Compra organizada',   desc: 'Ten 10 productos en la lista',       test: s => s.shopping >= 10 },
  { key: 'pantry',   emoji: '🏠', name: 'Despensa a punto',    desc: 'Añade 5 productos a tu despensa',    test: s => s.pantry >= 5 },
  { key: 'critic',   emoji: '📝', name: 'Crítico gastronómico',desc: 'Valora o anota 5 recetas',           test: s => s.notes >= 5 },
  { key: 'baker',    emoji: '🧁', name: 'Repostero',           desc: 'Cocina 5 postres',                   test: s => s.byCat.postres >= 5 },
  { key: 'veggie',   emoji: '🥦', name: 'Muy verde',           desc: 'Cocina 5 recetas de verduras',       test: s => s.byCat.verduras >= 5 },
  { key: 'master',   emoji: '🏆', name: 'Maestro de la air fryer', desc: 'Cocina 40 recetas',              test: s => s.cooked >= 40 },
  { key: 'legend',   emoji: '👑', name: 'Leyenda',             desc: 'Cocina 100 recetas',                 test: s => s.cooked >= 100 }
];

/* Pasillos del supermercado para agrupar la lista de la compra */
const AISLES = [
  { key: 'verduras', label: '🥬 Frutas y verduras', words: ['patata', 'boniato', 'cebolla', 'cebolleta', 'cebollino', 'ajo', 'tomate', 'pimiento', 'calabac', 'berenjena', 'brocoli', 'brócoli', 'coliflor', 'zanahoria', 'champi', 'espinaca', 'calabaza', 'judia', 'judía', 'lechuga', 'col ', 'kale', 'esparrago', 'espárrago', 'alcachofa', 'manzana', 'platano', 'plátano', 'limon', 'limón', 'lima', 'pina', 'piña', 'naranja', 'pera', 'arandano', 'arándano', 'aguacate', 'perejil', 'cilantro', 'jalapeno', 'jalapeño', 'guindilla', 'setas', 'puerro', 'apio', 'pepino', 'brotes', 'datil', 'dátil', 'maiz', 'maíz', 'coles de bruselas', 'romero fresco', 'remolacha', 'guisantes', 'edamame', 'eneldo fresco'] },
  { key: 'carne',    label: '🥩 Carnicería',        words: ['pollo', 'pavo', 'ternera', 'cerdo', 'lomo', 'costilla', 'bacon', 'panceta', 'salchich', 'jamon', 'jamón', 'chorizo', 'cordero', 'solomillo', 'secreto', 'carne picada', 'filete', 'contramuslo', 'muslo', 'alita', 'pechuga', 'hamburgues', 'chistorra', 'panceta', 'kofta'] },
  { key: 'pescado',  label: '🐟 Pescadería',        words: ['salmon', 'salmón', 'merluza', 'bacalao', 'gamba', 'langostino', 'calamar', 'atun', 'atún', 'dorada', 'boqueron', 'boquerón', 'tilapia', 'panga', 'marisco', 'pulpo', 'mejillon', 'mejillón', 'sardina', 'trucha', 'lubina', 'anillas'] },
  { key: 'lacteos',  label: '🧀 Lácteos y huevos',  words: ['huevo', 'leche', 'queso', 'mozzarella', 'parmesano', 'nata', 'yogur', 'mantequilla', 'feta', 'cheddar', 'crema agria'] },
  { key: 'panaderia',label: '🥖 Panadería',         words: ['pan', 'barra', 'tortilla de trigo', 'tortillas', 'masa', 'hojaldre', 'oblea', 'pita', 'brioche', 'base de pizza', 'rebanada'] },
  { key: 'despensa', label: '🫙 Despensa',           words: ['aceite', 'sal', 'pimienta', 'pimenton', 'pimentón', 'oregano', 'orégano', 'comino', 'curry', 'canela', 'azucar', 'azúcar', 'harina', 'levadura', 'maicena', 'vinagre', 'soja', 'miel', 'mostaza', 'ketchup', 'kétchup', 'mayonesa', 'salsa', 'tomate frito', 'tomate triturado', 'arroz', 'pasta', 'garbanzo', 'lenteja', 'chocolate', 'cacao', 'vainilla', 'sesamo', 'sésamo', 'almendra', 'nuez', 'nueces', 'avena', 'pan rallado', 'panko', 'copos', 'aceituna', 'conserva', 'especias', 'jengibre', 'tomillo', 'romero', 'hierbas', 'guacamole', 'nachos', 'mirin', 'cornflakes',
    'ajo en polvo', 'cebolla en polvo', 'tomate frito', 'tomate triturado', 'piña en trozos', 'dátiles sin hueso',
    'cúrcuma', 'curcuma', 'azafrán', 'azafran', 'eneldo seco', 'anís', 'anis', 'mermelada', 'vino', 'sidra',
    'alubias', 'lenteja', 'tofu', 'agua con gas', 'almidón', 'almidon', 'mandioca', 'garam masala',
    'worcestershire', 'nuez moscada', 'extracto', 'chocolate', 'impulsor', 'bicarbonato'] }
];

/* Nombres canónicos de la compra: "patatas medianas" y "patatas para freír"
   se convierten en "patatas" para poder sumar cantidades de verdad.
   Se ordena de más largo a más corto para que gane siempre el más específico. */
const CANONICAL = [
  'pan rallado panko', 'pan rallado', 'pan de pita', 'panes de pita', 'pan de hamburguesa', 'panko',
  'tomates cherry', 'tomate triturado', 'tomate frito', 'salsa de tomate', 'tomate',
  'salsa de soja', 'salsa barbacoa', 'salsa picante', 'salsa de yogur',
  'aceite de oliva', 'aceite de girasol', 'aceite de sésamo', 'aceite en espray', 'aceite',
  'azúcar moreno', 'azúcar glas', 'azúcar',
  'harina de garbanzo', 'harina de fuerza', 'harina',
  'levadura química', 'levadura',
  'pimentón ahumado', 'pimentón dulce', 'pimentón picante', 'pimentón',
  'ajo en polvo', 'dientes de ajo', 'ajo',
  'cebolla en polvo', 'cebolla morada', 'cebolleta', 'cebolla',
  'pechuga de pollo', 'pechugas de pollo', 'contramuslos de pollo', 'contramuslo de pollo',
  'muslos de pollo', 'alitas de pollo', 'pollo entero', 'pollo',
  'carne picada', 'solomillo de cerdo', 'lomo de cerdo', 'costillar de cerdo', 'secreto ibérico',
  'chuletas de cordero', 'filetes de ternera', 'ternera', 'cerdo', 'pavo', 'cordero',
  'bacon', 'jamón serrano', 'jamón cocido', 'jamón', 'chorizo', 'salchichas',
  'queso parmesano', 'queso rallado', 'queso crema', 'queso semiduro', 'mozzarella', 'queso feta', 'queso',
  'huevos', 'huevo', 'leche', 'nata', 'yogur griego', 'yogur', 'mantequilla',
  'lomos de salmón', 'salmón', 'lomos de merluza', 'merluza', 'lomos de bacalao', 'bacalao',
  'langostinos', 'gambas', 'atún', 'calamar', 'boquerones', 'dorada', 'tilapia',
  'patatas baby', 'patatas', 'boniato', 'calabacín', 'calabacines', 'berenjena', 'berenjenas',
  'pimiento rojo', 'pimiento verde', 'pimientos de padrón', 'pimiento',
  'brócoli', 'coliflor', 'zanahoria', 'zanahorias', 'champiñones', 'espinacas', 'calabaza',
  'judías verdes', 'coles de bruselas', 'espárragos', 'alcachofas', 'guisantes',
  'garbanzos', 'tofu', 'arroz', 'maicena', 'copos de avena', 'copos de maíz',
  'chocolate negro', 'chocolate', 'pepitas de chocolate', 'cacao', 'miel', 'canela',
  'manzanas', 'manzana', 'plátanos', 'plátano', 'limón', 'lima', 'piña', 'arándanos', 'dátiles',
  'masa de pizza', 'base de pizza', 'masa de hojaldre', 'hojaldre', 'obleas', 'tortillas', 'tortilla de trigo',
  'nueces', 'almendras', 'semillas de sésamo', 'aceitunas', 'perejil', 'cilantro', 'orégano',
  'romero', 'tomillo', 'comino', 'curry', 'jengibre', 'mostaza', 'mayonesa', 'kétchup', 'vinagre',
  'nachos', 'guacamole', 'jalapeños', 'sal', 'pimienta'
].sort((a, b) => b.length - a.length);

/* Cosas que no se compran: no tiene sentido llenar la lista con ellas */
const NO_SE_COMPRA = ['agua', 'agua templada', 'agua con hielo', 'agua caliente', 'hielo'];

/** ¿Merece la pena llevar este ingrediente a la lista de la compra? */
function esComprable(name) {
  const n = normalize(name);
  if (n.includes('agua con gas')) return true;       // esa sí se compra
  return !NO_SE_COMPRA.some(x => n === normalize(x) || n.startsWith(normalize(x) + ' '));
}

/* Singular y plural del mismo producto: en la compra tienen que sumar juntos,
   y en la despensa no pueden salir dos veces. Se aplica al final, cuando el
   nombre ya está reducido. */
const VARIANTES = new Map([
  ['calabacines', 'calabacín'],
  ['manzanas', 'manzana'],
  ['zanahorias', 'zanahoria'],
  ['berenjenas', 'berenjena'],
  ['pechugas de pollo', 'pechuga de pollo'],
  ['contramuslos de pollo', 'contramuslo de pollo'],
  ['huevo', 'huevos']
]);

/** Reduce un ingrediente a su nombre de compra habitual. */
function canonicalName(name) {
  const n = normalize(name);
  for (const term of CANONICAL) {
    if (n.includes(normalize(term))) return VARIANTES.get(normalize(term)) || term;
  }
  const limpio = String(name).trim();
  return VARIANTES.get(normalize(limpio)) || limpio;
}

/** ¿Está este ingrediente en la despensa? Se comprueba también su nombre canónico. */
const inPantry = (name) => Store.pantry.has(name) || Store.pantry.has(canonicalName(name));

/* Ingredientes que se ofrecen en "cocina con lo que tengo" */
const COMMON_INGREDIENTS = [
  { g: 'Proteínas', items: ['pollo', 'ternera', 'cerdo', 'pavo', 'bacon', 'salchichas', 'jamón', 'huevos', 'atún', 'salmón', 'merluza', 'bacalao', 'gambas', 'langostinos', 'tofu', 'garbanzos'] },
  { g: 'Verduras y fruta', items: ['patatas', 'boniato', 'cebolla', 'ajo', 'tomate', 'pimiento', 'calabacín', 'berenjena', 'brócoli', 'coliflor', 'zanahoria', 'champiñones', 'espinacas', 'calabaza', 'manzana', 'plátano', 'limón', 'piña'] },
  { g: 'Despensa y nevera', items: ['queso', 'mozzarella', 'parmesano', 'leche', 'yogur', 'mantequilla', 'nata', 'harina', 'pan rallado', 'panko', 'pan', 'masa de pizza', 'tortillas', 'arroz', 'chocolate', 'miel', 'salsa de soja', 'azúcar'] }
];

const state = {
  view: 'home',
  query: '',
  sort: 'popular',
  filters: { cats: [], tags: [], time: null, diffs: [] },
  current: null,        // receta abierta en la ficha
  servings: 2,
  picking: null,        // { day, slot } pendiente en "Mi semana"
  have: [],             // ingredientes marcados en "lo que tengo"
  cook: { recipe: null, step: 0 },
  timer: { total: 0, left: 0, running: false, id: null, done: false },
  wakeLock: null,
  installPrompt: null
};

/* ══════════════ 3. NAVEGACIÓN Y TEMA ══════════════ */

const VIEWS = ['home', 'recipes', 'week', 'shopping', 'favorites', 'profile'];

/** ¿La URL trae los datos que devuelve Supabase tras confirmar el email? */
const hayTokenEnLaUrl = () => /access_token=|error_description=/.test(location.hash);

/* ── Historial del navegador ──
   Antes se usaba replaceState para todo, así que el botón «atrás» (y el gesto
   de deslizar en el móvil) no volvía a la pantalla anterior: cerraba la
   aplicación. Ahora cada cambio de vista y cada panel abierto dejan su entrada,
   y «atrás» deshace lo último. */

/* Paneles que han dejado una entrada en el historial */
const panelesEnHistorial = new Set();

/* Cuando cerramos un panel a mano, consumimos su entrada con history.back().
   Ese retroceso dispara popstate, pero el cierre YA está hecho: si no se
   marcase, el manejador cerraría además el panel que hubiera debajo. */
let retrocesoProgramado = false;
function retrocederConsumiendo() {
  retrocesoProgramado = true;
  history.back();
  /* Red de seguridad: si por lo que sea no llega el popstate, la marca no
     puede quedarse puesta o se comería el siguiente «atrás» de verdad. */
  setTimeout(() => { retrocesoProgramado = false; }, 400);
}

function navigate(view, { scroll = true, keepHash = false, desdeHistorial = false, replace = false } = {}) {
  if (!VIEWS.includes(view)) view = 'home';
  state.view = view;

  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
  $$('[data-nav]').forEach(b => b.classList.toggle('is-active', b.dataset.nav === view));

  /* Si el hash lleva el token de confirmación, no se toca hasta que Supabase
     lo haya leído: si no, se pierde la sesión recién creada. */
  if (!keepHash && !hayTokenEnLaUrl() && location.hash !== '#' + view) {
    /* Al venir de «atrás» el navegador ya ha cambiado la URL: solo se
       sustituye el estado. En el resto de casos se apila una entrada nueva. */
    if (desdeHistorial || replace) history.replaceState({ afView: view }, '', '#' + view);
    else history.pushState({ afView: view }, '', '#' + view);
  }
  if (scroll) window.scrollTo({ top: 0 });

  if (view === 'home') renderHome();
  if (view === 'recipes') renderRecipes();
  if (view === 'week') renderWeek();
  if (view === 'shopping') { renderShopping(); renderPantry(); }
  if (view === 'favorites') renderFavorites();
  if (view === 'profile') renderProfile();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  Store.prefs.set('theme', theme);
  $$('[data-theme-icon]').forEach(el => el.textContent = theme === 'dark' ? '☀️' : '🌙');
  $$('#themeSeg button').forEach(b => b.classList.toggle('is-active', b.dataset.themeSet === theme));
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#14100D' : '#FF6B2C');
}

function applySound(value) {
  Store.prefs.set('sound', value);
  $$('#soundSeg button').forEach(b => b.classList.toggle('is-active', b.dataset.soundSet === value));
}

function applyVoice(value) {
  Store.prefs.set('voice', value);
  $$('#voiceSeg button').forEach(b => b.classList.toggle('is-active', b.dataset.voiceSet === value));
}

function applyNotify(value) {
  Store.prefs.set('notify', value);
  $$('#notifySeg button').forEach(b => b.classList.toggle('is-active', b.dataset.notifySet === value));
}

function applyTempOffset(value) {
  const offset = Number(value) || 0;
  Store.prefs.set('tempOffset', offset);
  $$('#tempSeg button').forEach(b => b.classList.toggle('is-active', Number(b.dataset.tempSet) === offset));
}

/* ══════════════ 4. TARJETAS Y LISTAS ══════════════ */

function difficultyDots(difficulty) {
  const level = DIFFICULTIES.indexOf(difficulty) + 1;
  return '●'.repeat(level) + '○'.repeat(3 - level);
}

/** ¿Tenemos foto descargada para esta receta? */
const tienePhoto = (id) => typeof PHOTO_CREDITS !== 'undefined' && !!PHOTO_CREDITS[id];

/**
 * Imagen de la receta. Si hay foto, se carga en diferido y, si fallara,
 * el propio emoji queda debajo como respaldo (no se ven imágenes rotas).
 */
function recipePhoto(recipe, { grande = false } = {}) {
  if (!tienePhoto(recipe.id)) return '';
  return `<img class="photo" src="img/${recipe.id}.jpg" alt="${esc(recipe.name)}"
               loading="${grande ? 'eager' : 'lazy'}" decoding="async"
               onerror="this.remove()">`;
}

/** Línea de atribución, obligatoria en las licencias Creative Commons. */
function photoCredit(id) {
  if (!tienePhoto(id)) return '';
  const c = PHOTO_CREDITS[id];
  const texto = `Foto: ${c.autor} · ${c.licencia}`;
  return c.url
    ? `<a class="photo__credit" href="${esc(c.url)}" target="_blank" rel="noopener nofollow">${esc(texto)}</a>`
    : `<span class="photo__credit">${esc(texto)}</span>`;
}

function recipeCard(recipe, variant = '') {
  const fav = Store.favorites.has(recipe.id);
  const note = Store.notes.get(recipe.id);
  return `
  <article class="card ${variant}" data-recipe="${recipe.id}" data-cat="${recipe.category}" tabindex="0" role="button" aria-label="${esc(recipe.name)}">
    <div class="card__art">
      <span class="card__emoji">${recipe.emoji}</span>
      ${recipePhoto(recipe)}
      <span class="card__cat">${catInfo(recipe.category).emoji} ${esc(catInfo(recipe.category).label)}</span>
      ${note.rating ? `<span class="card__rating">${'⭐'.repeat(note.rating)}</span>` : ''}
      <button class="card__fav ${fav ? 'is-on' : ''}" data-fav="${recipe.id}"
              aria-label="${fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}" title="Favorito">
        ${fav ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="card__body">
      <h3 class="card__title">${esc(recipe.name)}</h3>
      <p class="card__desc">${esc(recipe.description)}</p>
      <div class="card__meta">
        <span title="Tiempo total">⏱️ ${totalTime(recipe)} min</span>
        <span title="Temperatura">🌡️ ${adjTemp(recipe)}°</span>
        <span title="Dificultad">⭐ ${esc(recipe.difficulty)}</span>
        <span title="Calorías por persona">🔥 ${recipe.calories} kcal</span>
      </div>
    </div>
  </article>`;
}

function emptyState(icon, title, text, actionLabel = '', actionAttr = '') {
  return `
  <div class="empty">
    <div class="empty__ico">${icon}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${actionLabel ? `<button class="btn btn--primary" ${actionAttr}>${esc(actionLabel)}</button>` : ''}
  </div>`;
}

function skeletons(n) {
  return Array.from({ length: n }, () => `
    <div class="card card--skeleton">
      <div class="sk sk--art"></div>
      <div class="card__body">
        <div class="sk sk--line"></div>
        <div class="sk sk--line sk--short"></div>
        <div class="sk sk--chips"></div>
      </div>
    </div>`).join('');
}

/* ══════════════ 5. INICIO Y LISTADO ══════════════ */

const HOME_CATS = [
  ...CATEGORIES.map(c => ({ ...c, type: 'cat' })),
  { key: 'saludable', label: 'Saludable', emoji: '🥗', type: 'tag' },
  { key: 'rapida',    label: 'Rápido',    emoji: '⚡', type: 'tag' },
  { key: 'economica', label: 'Económico', emoji: '💰', type: 'tag' }
];

function greeting() {
  const h = new Date().getHours();
  const name = (Store.prefs.get('name') || '').trim();
  const quien = name ? ', ' + name : '';
  if (h < 6)  return `Buenas noches${quien} 🌙`;
  if (h < 13) return `Buenos días${quien} ☀️`;
  if (h < 21) return `Buenas tardes${quien} 👋`;
  return `Buenas noches${quien} 🌙`;
}

function renderHome() {
  $('#heroGreet').textContent = greeting();

  const cooked = Store.history.count();
  const favs = Store.favorites.count();
  const streak = Store.history.streak();
  $('#heroStats').innerHTML = `
    <span class="pill">📚 ${RECIPE_COUNT} recetas</span>
    <span class="pill">🍽️ ${cooked} cocinadas</span>
    <span class="pill">❤️ ${favs} favoritas</span>
    ${streak > 0 ? `<span class="pill pill--hot">🔥 Racha de ${streak} ${streak === 1 ? 'día' : 'días'}</span>` : ''}
  `;

  $('#catGrid').innerHTML = HOME_CATS.map(c => {
    const count = c.type === 'cat'
      ? RECIPES.filter(r => r.category === c.key).length
      : RECIPES.filter(r => r.tags.includes(c.key)).length;
    return `
      <button class="cat" data-cat-nav="${c.key}" data-cat-type="${c.type}" data-cat="${c.key}">
        <span class="cat__emoji">${c.emoji}</span>
        <span class="cat__label">${esc(c.label)}</span>
        <span class="cat__count">${count}</span>
      </button>`;
  }).join('');

  const popular = [...RECIPES].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
  $('#popularGrid').innerHTML = popular.map(r => recipeCard(r)).join('');

  const fast = RECIPES.filter(r => totalTime(r) <= 20).sort((a, b) => totalTime(a) - totalTime(b)).slice(0, 12);
  $('#fastRail').innerHTML = fast.map(r => recipeCard(r, 'card--rail')).join('');

  const healthy = RECIPES.filter(r => r.tags.includes('saludable')).sort((a, b) => a.calories - b.calories).slice(0, 12);
  $('#healthyRail').innerHTML = healthy.map(r => recipeCard(r, 'card--rail')).join('');

  const recent = Store.history.recent(12).map(h => getRecipe(h.id)).filter(Boolean);
  $('#recentSection').hidden = recent.length === 0;
  $('#recentRail').innerHTML = recent.map(r => recipeCard(r, 'card--rail')).join('');
}

/** Aplica búsqueda + filtros + orden. */
function filterRecipes() {
  const q = normalize(state.query);
  const f = state.filters;

  const list = RECIPES.filter(r => {
    if (q && !recipeHaystack(r).includes(q)) return false;
    if (f.cats.length && !f.cats.includes(r.category)) return false;
    if (f.tags.length && !f.tags.every(t => r.tags.includes(t))) return false;
    if (f.time && totalTime(r) > f.time) return false;
    if (f.diffs.length && !f.diffs.includes(r.difficulty)) return false;
    return true;
  });

  const sorters = {
    popular: (a, b) => b.popularity - a.popularity,
    fast: (a, b) => totalTime(a) - totalTime(b),
    easy: (a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || b.popularity - a.popularity,
    calories: (a, b) => a.calories - b.calories,
    recent: (a, b) => b.id - a.id,
    rating: (a, b) => (Store.notes.get(b.id).rating || 0) - (Store.notes.get(a.id).rating || 0) || b.popularity - a.popularity,
    az: (a, b) => a.name.localeCompare(b.name, 'es')
  };
  return list.sort(sorters[state.sort] || sorters.popular);
}

/* Cache del texto buscable de cada receta (se calcula una sola vez) */
const haystackCache = new Map();
function recipeHaystack(r) {
  if (!haystackCache.has(r.id)) {
    haystackCache.set(r.id, normalize([
      r.name, r.description, r.category, catInfo(r.category).label,
      r.tags.map(t => tagInfo(t).label).join(' '),
      r.tags.join(' '),
      r.ingredients.map(i => i.n).join(' ')
    ].join(' ')));
  }
  return haystackCache.get(r.id);
}

function activeFilterCount() {
  const f = state.filters;
  return f.cats.length + f.tags.length + f.diffs.length + (f.time ? 1 : 0);
}

function renderRecipes() {
  $('#catChips').innerHTML = `
    <button class="chip ${activeFilterCount() === 0 ? 'is-on' : ''}" data-chip-all>✨ Todas</button>
    ${HOME_CATS.map(c => {
      const on = c.type === 'cat' ? state.filters.cats.includes(c.key) : state.filters.tags.includes(c.key);
      return `<button class="chip ${on ? 'is-on' : ''}" data-chip="${c.key}" data-chip-type="${c.type}">${c.emoji} ${esc(c.label)}</button>`;
    }).join('')}`;

  const chips = [];
  state.filters.cats.forEach(k => chips.push({ type: 'cat', key: k, label: `${catInfo(k).emoji} ${catInfo(k).label}` }));
  state.filters.tags.forEach(k => chips.push({ type: 'tag', key: k, label: `${tagInfo(k).emoji} ${tagInfo(k).label}` }));
  state.filters.diffs.forEach(k => chips.push({ type: 'diff', key: k, label: `⭐ ${k}` }));
  if (state.filters.time) chips.push({ type: 'time', key: state.filters.time, label: `⏱️ Menos de ${state.filters.time} min` });

  $('#activeFilters').innerHTML = chips.length
    ? chips.map(c => `<button class="tagx" data-remove-filter="${c.type}" data-value="${c.key}">${esc(c.label)} <i>✕</i></button>`).join('')
      + `<button class="tagx tagx--clear" data-clear-filters>Limpiar todo</button>`
    : '';

  const badge = $('#filtersBadge');
  const n = activeFilterCount();
  badge.hidden = n === 0;
  badge.textContent = n;

  const list = filterRecipes();
  $('#recipesCount').textContent = list.length === 0
    ? 'Sin resultados'
    : `${list.length} ${list.length === 1 ? 'receta' : 'recetas'}${state.query ? ` para “${state.query}”` : ''}`;

  if (list.length) {
    $('#recipesGrid').innerHTML = list.map(r => recipeCard(r)).join('');
    return;
  }

  /* Sin resultados: proponemos la palabra más parecida antes de rendirnos */
  const suggestion = state.query ? suggestTerm(state.query) : null;
  $('#recipesGrid').innerHTML = `
    <div class="empty">
      <div class="empty__ico">🔎</div>
      <h3>No hemos encontrado ninguna receta.</h3>
      <p>Prueba con otro ingrediente o quita algún filtro.</p>
      ${suggestion ? `<p class="empty__suggest">¿Querías decir <button class="link-btn" data-suggest="${esc(suggestion)}">${esc(suggestion)}</button>?</p>` : ''}
      <button class="btn btn--primary" data-clear-filters data-clear-query>Limpiar búsqueda y filtros</button>
    </div>`;
}

function renderFavorites() {
  const list = Store.favorites.all().map(getRecipe).filter(Boolean);
  $('#favCount').textContent = list.length
    ? `${list.length} ${list.length === 1 ? 'receta guardada' : 'recetas guardadas'}`
    : 'Todavía no has guardado ninguna receta';
  $('#favGrid').innerHTML = list.length
    ? list.map(r => recipeCard(r)).join('')
    : emptyState('🤍', 'Aún no tienes favoritos', 'Pulsa el corazón de cualquier receta para guardarla aquí.', 'Explorar recetas', 'data-nav="recipes"');
}

/* ══════════════ 6. BÚSQUEDA TOLERANTE A ERRATAS ══════════════ */

/** Distancia de Levenshtein con corte temprano. */
function editDistance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/* Vocabulario de búsqueda con su frecuencia: nombres, categorías, etiquetas e ingredientes.
   La frecuencia sirve para desempatar (ante la duda gana la palabra más habitual). */
let vocabulary = null;
function getVocabulary() {
  if (vocabulary) return vocabulary;
  const words = new Map();
  const push = (text, weight = 1) => normalize(text).split(/[^a-z0-9ñ]+/).forEach(w => {
    if (w.length >= 4) words.set(w, (words.get(w) || 0) + weight);
  });
  RECIPES.forEach(r => {
    push(r.name, 3);                       // el nombre pesa más que un ingrediente suelto
    r.ingredients.forEach(i => push(i.n));
  });
  CATEGORIES.forEach(c => push(c.label, 5));
  TAGS.forEach(t => push(t.label, 3));
  vocabulary = [...words.entries()].sort((a, b) => b[1] - a[1]);
  return vocabulary;
}

/** Devuelve la palabra del recetario más parecida a lo que ha escrito el usuario. */
function suggestTerm(query) {
  const q = normalize(query).split(/\s+/).filter(w => w.length >= 4).pop();
  if (!q) return null;
  let best = null;
  let bestScore = null;
  for (const [word, freq] of getVocabulary()) {
    const d = editDistance(q, word, 2);
    if (d > 2) continue;
    /* Menor distancia primero; a igual distancia, la palabra más frecuente */
    if (!bestScore || d < bestScore.d || (d === bestScore.d && freq > bestScore.freq)) {
      best = word;
      bestScore = { d, freq };
    }
  }
  return best;
}

/* ══════════════ 7. FICHA DE RECETA ══════════════ */

/* Elemento que tenía el foco antes de abrir un modal, para devolvérselo al cerrar */
let focusBeforeSheet = null;

function openSheet(id) {
  const sheet = $('#' + id);
  /* Si este panel se estaba cerrando, se anula: si no, su temporizador lo
     ocultaría justo después de abrirlo. */
  clearTimeout(cierresPendientes.get(sheet));
  cierresPendientes.delete(sheet);
  focusBeforeSheet = document.activeElement;
  /* Una entrada en el historial por panel: así «atrás» lo cierra en vez de
     salir de la aplicación. */
  if (!panelesEnHistorial.has(id)) {
    panelesEnHistorial.add(id);
    history.pushState({ afPanel: id }, '');
  }
  sheet.hidden = false;
  document.body.classList.add('no-scroll');

  const mostrar = () => {
    sheet.classList.add('is-open');
    /* El foco entra en el modal: si no, el teclado sigue navegando por detrás */
    const first = sheet.querySelector('[data-close-sheet], button, input, select, textarea');
    if (first) first.focus({ preventScroll: true });
  };
  /* rAF para que la transición arranque bien, y un temporizador de respaldo:
     si la pestaña no está compositando, rAF no llega a ejecutarse nunca y el
     panel se quedaría fuera de la pantalla. Llamarlo dos veces no molesta. */
  requestAnimationFrame(mostrar);
  setTimeout(mostrar, 80);
}

/* Cierres en curso. El panel se oculta 240 ms después de empezar la animación;
   si se vuelve a abrir antes, hay que cancelar ese temporizador o escondería
   el panel recién abierto. */
const cierresPendientes = new Map();

function closeSheet(sheet, { desdeHistorial = false } = {}) {
  if (!sheet) return;
  /* Si este panel dejó una entrada en el historial, se consume al cerrarlo
     para que «atrás» no tenga que pulsarse dos veces. */
  if (panelesEnHistorial.has(sheet.id)) {
    panelesEnHistorial.delete(sheet.id);
    if (!desdeHistorial) retrocederConsumiendo();
  }
  sheet.classList.remove('is-open');
  clearTimeout(cierresPendientes.get(sheet));
  cierresPendientes.set(sheet, setTimeout(() => {
    sheet.hidden = true;
    cierresPendientes.delete(sheet);
  }, 240));
  if (!$$('.sheet.is-open').length && $('#cookMode').hidden && $('#confirmBox').hidden) {
    document.body.classList.remove('no-scroll');
  }
  if (focusBeforeSheet && document.contains(focusBeforeSheet)) {
    focusBeforeSheet.focus({ preventScroll: true });
    focusBeforeSheet = null;
  }
}

/**
 * Cierra un panel cediendo su entrada del historial al que se abre justo
 * después. Encadenar `history.back()` con un `pushState` inmediato no
 * funciona: el retroceso llega más tarde y deshace el panel recién abierto.
 * Traspasando la entrada no hace falta tocar el historial.
 */
function cerrarCediendoHistorial(sheet, idDestino) {
  if (!sheet) return;
  const teniaEntrada = panelesEnHistorial.has(sheet.id);
  closeSheet(sheet, { desdeHistorial: true });   // cierra sin tocar el historial
  if (teniaEntrada) {
    panelesEnHistorial.delete(sheet.id);
    panelesEnHistorial.add(idDestino);           // el nuevo hereda la entrada
  }
}

function openRecipe(id) {
  const recipe = getRecipe(id);
  if (!recipe) return;
  state.current = recipe;
  state.servings = recipe.servings;
  renderRecipeSheet();
  openSheet('recipeSheet');
  $('#recipePanel').scrollTop = 0;
}

function renderRecipeSheet() {
  const r = state.current;
  if (!r) return;
  const factor = state.servings / r.servings;
  const fav = Store.favorites.has(r.id);
  const checked = Store.checks.get(r.id);
  const cookedTimes = Store.history.timesCooked(r.id);
  const note = Store.notes.get(r.id);
  const offset = Number(Store.prefs.get('tempOffset')) || 0;
  const pantryCount = r.ingredients.filter(i => inPantry(i.n)).length;

  $('#recipePanel').innerHTML = `
    <div class="rcp__hero" data-cat="${r.category}">
      <button class="icon-btn icon-btn--float" data-close-sheet aria-label="Volver">←</button>
      <div class="rcp__hero-actions">
        <button class="icon-btn icon-btn--float-plain" data-share-recipe="${r.id}" aria-label="Compartir receta">📤</button>
        <button class="icon-btn icon-btn--float-plain ${fav ? 'is-on' : ''}" data-fav="${r.id}" aria-label="Favorito">${fav ? '❤️' : '🤍'}</button>
      </div>
      <span class="rcp__emoji">${r.emoji}</span>
      ${recipePhoto(r, { grande: true })}
      <span class="rcp__cat">${catInfo(r.category).emoji} ${esc(catInfo(r.category).label)}</span>
      ${photoCredit(r.id)}
    </div>

    <div class="sheet__body rcp__body">
      <h2 class="rcp__title">${esc(r.name)}</h2>
      <p class="rcp__desc">${esc(r.description)}</p>

      <div class="rcp__tags">
        ${r.tags.map(t => `<span class="tag">${tagInfo(t).emoji} ${esc(tagInfo(t).label)}</span>`).join('')}
      </div>

      <div class="rcp__facts">
        <div class="fact"><b>⭐</b><span>${esc(r.difficulty)}</span><small>${difficultyDots(r.difficulty)}</small></div>
        <div class="fact"><b>⏱️</b><span>${totalTime(r)} min</span><small>${r.prepTime} prep · ${r.cookTime} cocción</small></div>
        <div class="fact"><b>🌡️</b><span>${adjTemp(r)} °C</span><small>${offset ? `ajustado ${offset > 0 ? '+' : ''}${offset}°` : 'air fryer'}</small></div>
        <div class="fact"><b>🔥</b><span>${Math.round(r.calories)} kcal</span><small>por persona</small></div>
      </div>

      <div class="rcp__actions">
        <button class="btn btn--primary btn--block" data-cook="${r.id}">▶ EMPEZAR A COCINAR</button>
        <button class="btn btn--ghost" data-add-shopping="${r.id}">🛒 Añadir a la compra</button>
        <button class="btn btn--ghost" data-add-week="${r.id}">📅 Añadir a mi semana</button>
        <button class="btn btn--ghost" data-cooked="${r.id}">✅ Marcar cocinada</button>
      </div>

      <section class="rcp__section">
        <div class="rcp__section-head">
          <h3>🧾 Ingredientes</h3>
          <div class="stepper" role="group" aria-label="Número de personas">
            <button data-servings="-1" aria-label="Menos personas">−</button>
            <span>👥 ${state.servings}</span>
            <button data-servings="1" aria-label="Más personas">＋</button>
          </div>
        </div>
        ${state.servings !== r.servings ? `<p class="rcp__scaled">Cantidades recalculadas para ${state.servings} personas (receta original para ${r.servings}).</p>` : ''}
        ${pantryCount ? `<p class="rcp__pantry">🏠 ${pantryCount} ${pantryCount === 1 ? 'ingrediente ya lo tienes' : 'ingredientes ya los tienes'} en tu despensa: no se añadirán a la compra.</p>` : ''}
        <ul class="ings">
          ${r.ingredients.map((ing, i) => `
            <li>
              <label class="ing ${checked.includes(i) ? 'is-checked' : ''}">
                <input type="checkbox" data-ing="${i}" ${checked.includes(i) ? 'checked' : ''}>
                <span class="ing__box">✓</span>
                <span class="ing__text">${esc(ingredientText(ing, factor))}${inPantry(ing.n) ? ' <i class="ing__pantry" title="En tu despensa">🏠</i>' : ''}</span>
              </label>
            </li>`).join('')}
        </ul>
      </section>

      <section class="rcp__section">
        <h3>👩‍🍳 Instrucciones</h3>
        <ol class="steps">
          ${r.steps.map((s, i) => `
            <li class="step">
              <span class="step__num">${String(i + 1).padStart(2, '0')}</span>
              <div class="step__txt">
                ${esc(adjTempTexto(s.t))}
                ${s.timer ? `<span class="step__timer">⏱️ ${s.timer} min</span>` : ''}
              </div>
            </li>`).join('')}
        </ol>
      </section>

      <section class="rcp__section rcp__tips">
        <h3>💡 Consejos para air fryer</h3>
        <ul>${r.tips.map(t => `<li>${esc(adjTempTexto(t))}</li>`).join('')}</ul>
      </section>

      <section class="rcp__section rcp__notes">
        <h3>📝 Mis notas</h3>
        <div class="rating" role="group" aria-label="Tu valoración">
          ${[1, 2, 3, 4, 5].map(n => `<button data-rate="${n}" class="${note.rating >= n ? 'is-on' : ''}" aria-label="${n} de 5">${note.rating >= n ? '⭐' : '☆'}</button>`).join('')}
          ${note.rating ? `<button class="rating__clear" data-rate="0">Quitar</button>` : ''}
        </div>
        <textarea id="recipeNote" maxlength="400" rows="3"
                  placeholder="Ej.: en mi air fryer, 2 minutos menos y quedan perfectas">${esc(note.text)}</textarea>
        <small class="rcp__note-hint">Se guarda solo, en este dispositivo.</small>
      </section>

      ${cookedTimes ? `<p class="rcp__cooked">🍽️ Has cocinado esta receta ${cookedTimes} ${cookedTimes === 1 ? 'vez' : 'veces'}.</p>` : ''}

      <button class="btn btn--primary btn--block btn--big" data-cook="${r.id}">▶ EMPEZAR A COCINAR</button>
    </div>`;
}

/** Texto plano de una receta, para compartir o copiar. */
function recipeAsText(r, servings = r.servings) {
  const factor = servings / r.servings;
  return [
    `${r.emoji} ${r.name.toUpperCase()}`,
    r.description,
    '',
    `⏱️ ${totalTime(r)} min · 🌡️ ${adjTemp(r)} °C · ⭐ ${r.difficulty} · 👥 ${servings}`,
    '',
    'INGREDIENTES',
    ...r.ingredients.map(i => '· ' + ingredientText(i, factor)),
    '',
    'PASOS',
    ...r.steps.map((s, i) => `${i + 1}. ${adjTempTexto(s.t)}`),
    '',
    'CONSEJOS',
    ...r.tips.map(t => '· ' + t),
    '',
    'Receta de AirChef 🍗'
  ].join('\n');
}

/* ══════════════ 8. MODO COCINAR ══════════════ */

/* Cierre en curso del modo cocinar. Salir y volver a entrar antes de que
   terminara la animación dejaba la pantalla vacía y el scroll bloqueado. */
let cierreCocinaPendiente = null;

function startCooking(id) {
  const recipe = getRecipe(id);
  if (!recipe) return;
  /* Se cancela cualquier cierre a medias antes de montar el nuevo */
  clearTimeout(cierreCocinaPendiente);
  cierreCocinaPendiente = null;
  state.cook = { recipe, step: 0 };
  /* La ficha cede su entrada del historial al modo cocinar */
  cerrarCediendoHistorial($('#recipeSheet'), 'cookMode');
  if (!panelesEnHistorial.has('cookMode')) {
    panelesEnHistorial.add('cookMode');
    history.pushState({ afPanel: 'cookMode' }, '');
  }
  $('#cookMode').hidden = false;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => $('#cookMode').classList.add('is-open'));
  requestWakeLock();
  renderCookStep();
}

function exitCooking({ desdeHistorial = false } = {}) {
  if (panelesEnHistorial.has('cookMode')) {
    panelesEnHistorial.delete('cookMode');
    if (!desdeHistorial) retrocederConsumiendo();
  }
  stopTimer();
  stopSpeaking();
  releaseWakeLock();
  const cm = $('#cookMode');
  cm.classList.remove('is-open');
  clearTimeout(cierreCocinaPendiente);
  cierreCocinaPendiente = setTimeout(() => {
    /* Si mientras tanto se ha vuelto a abrir, no se toca nada */
    if (cm.classList.contains('is-open')) return;
    cm.hidden = true;
    cm.innerHTML = '';
    cierreCocinaPendiente = null;
  }, 240);
  if (!$$('.sheet.is-open').length) document.body.classList.remove('no-scroll');
}

function renderCookStep() {
  const { recipe, step } = state.cook;
  const total = recipe.steps.length;
  const current = recipe.steps[step];
  const isLast = step === total - 1;
  const progress = Math.round(((step + 1) / total) * 100);
  const voiceOn = Store.prefs.get('voice') === 'on';

  stopTimer();
  state.timer = { total: 0, left: (current.timer || 5) * 60, running: false, id: null, done: false };

  $('#cookMode').innerHTML = `
    <header class="cook__head">
      <button class="icon-btn" data-exit-cook aria-label="Salir del modo cocinar">✕</button>
      <div class="cook__title">
        <b>${esc(recipe.name)}</b>
        <small>${adjTemp(recipe)} °C · ${recipe.emoji}</small>
      </div>
      <button class="icon-btn ${voiceOn ? 'is-on' : ''}" id="cookVoice" aria-label="Leer el paso en voz alta">${voiceOn ? '🔊' : '🔇'}</button>
    </header>

    <div class="cook__progress"><span style="width:${progress}%"></span></div>

    <div class="cook__body">
      <div class="cook__texto">
        <p class="cook__count">PASO ${step + 1} DE ${total}</p>
        <p class="cook__step">${esc(adjTempTexto(current.t))}</p>
      </div>

      <div class="timer" id="timerBox">
        <div class="timer__ring" id="timerRing">
          <div class="timer__inner">
            <span class="timer__display" id="timerDisplay">${fmtClock(state.timer.left)}</span>
            <small id="timerHint">Temporizador</small>
          </div>
        </div>

        <div class="timer__set">
          <label for="timerMinutes">Minutos</label>
          <div class="stepper">
            <button data-timer-adjust="-1" aria-label="Un minuto menos">−</button>
            <input type="number" id="timerMinutes" min="1" max="120" step="1" value="${Math.max(1, Math.round(state.timer.left / 60))}" inputmode="numeric">
            <button data-timer-adjust="1" aria-label="Un minuto más">＋</button>
          </div>
        </div>

        <button class="btn btn--primary btn--block" id="timerToggle">▶ INICIAR TEMPORIZADOR</button>

        <div class="timer__quick">
          <button data-timer-add="1">+1 min</button>
          <button data-timer-add="2">+2 min</button>
          <button data-timer-add="5">+5 min</button>
          <button data-timer-reset>↺ Reiniciar</button>
        </div>
      </div>
    </div>

    <footer class="cook__foot">
      <button class="btn btn--ghost" data-cook-step="-1" ${step === 0 ? 'disabled' : ''}>← Anterior</button>
      ${isLast
        ? `<button class="btn btn--primary" data-cook-finish>✅ HE TERMINADO</button>`
        : `<button class="btn btn--primary" data-cook-step="1">Siguiente →</button>`}
    </footer>`;

  if (voiceOn) speak(`Paso ${step + 1} de ${total}. ${adjTempTexto(current.t)}`);
}

function fmtClock(seconds) {
  seconds = Math.max(0, Math.round(seconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function paintTimer() {
  const display = $('#timerDisplay');
  if (!display) return;
  display.textContent = fmtClock(state.timer.left);
  const ring = $('#timerRing');
  if (ring && state.timer.total > 0) {
    const pct = 100 - (state.timer.left / state.timer.total) * 100;
    ring.style.setProperty('--progress', pct + '%');
  }
  const toggle = $('#timerToggle');
  if (toggle) toggle.innerHTML = state.timer.running ? '⏸ PAUSAR' : (state.timer.left <= 0 ? '↺ REINICIAR' : '▶ INICIAR TEMPORIZADOR');
}

function startTimer() {
  unlockAudio();   // el gesto de pulsar "iniciar" es lo que habilita el sonido después
  const input = $('#timerMinutes');
  if (!state.timer.running && state.timer.left <= 0) {
    state.timer.left = Math.max(1, parseInt(input?.value, 10) || 1) * 60;
  }
  if (state.timer.total <= 0 || state.timer.left > state.timer.total) state.timer.total = state.timer.left;
  state.timer.running = true;
  state.timer.done = false;
  $('#timerBox')?.classList.add('is-running');
  $('#timerBox')?.classList.remove('is-done');
  if ($('#timerHint')) $('#timerHint').textContent = 'En marcha…';

  clearInterval(state.timer.id);
  /* Se calcula sobre la hora real: así no se desfasa si el móvil se bloquea */
  const endAt = Date.now() + state.timer.left * 1000;
  state.timer.id = setInterval(() => {
    state.timer.left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (state.timer.left <= 0) finishTimer();
    paintTimer();
  }, 250);
  paintTimer();
}

function pauseTimer() {
  clearInterval(state.timer.id);
  state.timer.running = false;
  $('#timerBox')?.classList.remove('is-running');
  if ($('#timerHint')) $('#timerHint').textContent = 'En pausa';
  paintTimer();
}

function stopTimer() {
  clearInterval(state.timer.id);
  state.timer.running = false;
}

function finishTimer() {
  stopTimer();
  state.timer.done = true;
  $('#timerBox')?.classList.add('is-done');
  $('#timerBox')?.classList.remove('is-running');
  if ($('#timerHint')) $('#timerHint').textContent = '¡Listo!';
  toast('¡Listo! Comprueba tu comida.', '🔔');
  beep();
  notifyTimerDone(state.cook.recipe ? state.cook.recipe.name : 'Tu receta');
  if (Store.prefs.get('voice') === 'on') speak('Listo. Comprueba tu comida.');
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
}

/* Un único contexto de audio, "desbloqueado" con el primer toque del usuario:
   iOS y Chrome móvil no dejan sonar nada que no venga de una interacción. */
let audioCtx = null;
function unlockAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (e) { return null; }
}

/** Aviso sonoro generado con Web Audio, sin archivos externos. */
function beep() {
  if (Store.prefs.get('sound') === 'off') return;
  try {
    const ctx = unlockAudio();
    if (!ctx) return;
    [0, 0.35, 0.7].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.3);
    });
  } catch (e) { /* el navegador puede bloquear el audio sin interacción previa */ }
}

/** Aviso del sistema para cuando el temporizador acaba con la app en segundo plano. */
function notifyTimerDone(recipeName) {
  if (Store.prefs.get('notify') !== 'on') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('¡Listo! 🔔', {
      body: `${recipeName}: comprueba tu comida.`,
      icon: 'icons/icon-192.png',
      tag: 'airfryer-timer',
      renotify: true
    });
  } catch (e) { /* algunos navegadores solo permiten notificaciones desde el service worker */ }
}

/** Pide permiso solo cuando el usuario activa el aviso a propósito. */
async function requestNotifyPermission() {
  if (!('Notification' in window)) {
    toast('Tu navegador no admite avisos del sistema', '⚠️');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    toast('Has bloqueado los avisos en los ajustes del navegador', '⚠️');
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/* ── Voz: lee los pasos en alto mientras cocinas ── */
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 0.98;
    window.speechSynthesis.speak(utter);
  } catch (e) { /* sin soporte de voz */ }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/* ── Pantalla siempre encendida mientras cocinas ── */
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
  } catch (e) { /* el navegador puede denegarlo */ }
}

function releaseWakeLock() {
  if (state.wakeLock) { state.wakeLock.release().catch(() => {}); state.wakeLock = null; }
}

function finishCooking() {
  const recipe = state.cook.recipe;
  /* El botón sigue en pantalla durante la animación de salida: sin esta
     guarda, pulsarlo dos veces registraba la receta dos veces. */
  if (!recipe || !accionUnica('terminar:' + recipe.id, 1500)) return;
  stopTimer();
  Store.history.add(recipe.id);
  Store.checks.clear(recipe.id);
  exitCooking();
  toast(`¡${recipe.name} lista! Registrada en tu historial 🎉`, '🍽️');
  checkAchievements();
  renderHome();
}

/* ══════════════ 9. MI SEMANA ══════════════ */

function renderWeek() {
  const data = Store.week.all();
  $('#weekGrid').innerHTML = DAYS.map(day => {
    const slots = data[day.key] || {};
    return `
      <article class="day ${Object.keys(slots).length ? 'has-recipe' : ''}">
        <header class="day__head"><h3>${day.label}</h3></header>
        ${SLOTS.map(slot => {
          const recipe = getRecipe(slots[slot.key]);
          return `
          <div class="slot">
            <span class="slot__label">${slot.emoji} ${slot.label}</span>
            ${recipe ? `
              <button class="day__recipe" data-recipe="${recipe.id}" data-cat="${recipe.category}">
                <span class="day__emoji">${recipe.emoji}</span>
                <span class="day__info">
                  <b>${esc(recipe.name)}</b>
                  <small>⏱️ ${totalTime(recipe)} min · 🌡️ ${adjTemp(recipe)}° · 🔥 ${recipe.calories} kcal</small>
                </span>
              </button>
              <div class="day__actions">
                <button class="btn btn--ghost btn--sm" data-week-pick="${day.key}" data-slot="${slot.key}">🔄 Cambiar</button>
                <button class="btn btn--ghost btn--sm" data-add-shopping="${recipe.id}">🛒</button>
                <button class="btn btn--ghost btn--sm" data-week-clear="${day.key}" data-slot="${slot.key}">✕</button>
              </div>` : `
              <button class="day__add" data-week-pick="${day.key}" data-slot="${slot.key}">
                <span>＋</span> Añadir receta
              </button>`}
          </div>`;
        }).join('')}
      </article>`;
  }).join('');
}

/** Agrupa las recetas de la semana por temperatura para cocinarlas seguidas. */
function renderBatchPlan() {
  const box = $('#batchPlan');
  const entries = Store.week.entries();
  if (!entries.length) {
    toast('Primero añade recetas a tu semana', 'ℹ️');
    return;
  }
  const groups = {};
  entries.forEach(e => {
    const r = getRecipe(e.id);
    if (!r) return;
    const t = adjTemp(r);
    groups[t] = groups[t] || [];
    if (!groups[t].some(x => x.id === r.id)) groups[t].push(r);
  });

  const ordered = Object.keys(groups).map(Number).sort((a, b) => a - b);
  box.innerHTML = `
    <div class="batch__head">
      <h3>🔥 Orden de cocinado sugerido</h3>
      <button class="icon-btn icon-btn--sm" id="batchClose" aria-label="Cerrar">✕</button>
    </div>
    <p class="batch__intro">Cocina de menor a mayor temperatura: así aprovechas el calor y no esperas entre tandas.</p>
    ${ordered.map((t, i) => `
      <div class="batch__group">
        <span class="batch__temp">${i + 1}. ${t} °C</span>
        <div class="batch__items">
          ${groups[t].map(r => `<button class="batch__item" data-recipe="${r.id}">${r.emoji} ${esc(r.name)} <small>${r.cookTime} min</small></button>`).join('')}
        </div>
      </div>`).join('')}
    <p class="batch__total">Total: ${entries.length} comidas · ${ordered.length} ${ordered.length === 1 ? 'temperatura' : 'temperaturas'} distintas</p>`;
  box.hidden = false;
}

function weekAsText() {
  const data = Store.week.all();
  const lines = ['📅 MI SEMANA EN LA AIR FRYER', ''];
  DAYS.forEach(day => {
    const slots = data[day.key] || {};
    const parts = SLOTS.map(s => {
      const r = getRecipe(slots[s.key]);
      return r ? `  ${s.emoji} ${s.label}: ${r.emoji} ${r.name}` : null;
    }).filter(Boolean);
    if (parts.length) lines.push(day.label.toUpperCase(), ...parts, '');
  });
  lines.push('Plan hecho con AirChef 🍗');
  return lines.join('\n');
}

function openPicker(dayKey, slotKey) {
  state.picking = { day: dayKey, slot: slotKey };
  const day = DAYS.find(d => d.key === dayKey);
  const slot = SLOTS.find(s => s.key === slotKey);
  $('#pickTitle').textContent = `${day ? day.label : ''} · ${slot ? slot.label : ''}`;
  $('#pickSearch').closest('.searchbar').hidden = false;
  $('#pickSearch').value = '';
  renderPickList('');
  openSheet('pickSheet');
  setTimeout(() => $('#pickSearch').focus(), 250);
}

function renderPickList(query) {
  const q = normalize(query);
  const list = RECIPES
    .filter(r => !q || recipeHaystack(r).includes(q))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 60);

  $('#pickList').innerHTML = list.length ? list.map(r => `
    <button class="pickitem" data-pick="${r.id}">
      <span class="pickitem__emoji" data-cat="${r.category}">${r.emoji}</span>
      <span class="pickitem__body">
        <b>${esc(r.name)}</b>
        <small>⏱️ ${totalTime(r)} min · ⭐ ${esc(r.difficulty)} · 🔥 ${r.calories} kcal</small>
      </span>
      <span class="pickitem__go">＋</span>
    </button>`).join('')
    : emptyState('🔎', 'Sin resultados', 'Prueba con otro nombre o ingrediente.');
}

/** Selector de día y momento para "Añadir a mi semana" desde la ficha. */
function openDayChooser(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  $('#pickTitle').textContent = `¿Cuándo cocinas ${recipe.name}?`;
  $('#pickSearch').closest('.searchbar').hidden = true;
  const data = Store.week.all();
  $('#pickList').innerHTML = DAYS.map(day => `
    <div class="daypick">
      <b class="daypick__day">${day.label}</b>
      <div class="daypick__slots">
        ${SLOTS.map(slot => {
          const assigned = getRecipe((data[day.key] || {})[slot.key]);
          return `<button class="daypick__slot" data-choose-day="${day.key}" data-slot="${slot.key}" data-recipe-id="${recipeId}">
            <span>${slot.emoji} ${slot.label}</span>
            <small>${assigned ? esc(assigned.name) : 'Libre'}</small>
          </button>`;
        }).join('')}
      </div>
    </div>`).join('');
  openSheet('pickSheet');
}

/* ══════════════ 10. LISTA DE LA COMPRA Y DESPENSA ══════════════ */

/** Gana siempre la palabra clave más larga: "ajo en polvo" va a despensa, no a verduras. */
function aisleOf(name) {
  const n = normalize(name);
  let best = null;
  let bestLength = 0;
  for (const aisle of AISLES) {
    for (const word of aisle.words) {
      const w = normalize(word);
      if (n.includes(w) && w.length > bestLength) { best = aisle; bestLength = w.length; }
    }
  }
  return best || { key: 'otros', label: '🛒 Otros' };
}

function addRecipeToShopping(id, servingsOverride = null) {
  const r = getRecipe(id);
  if (!r) return;
  const servings = servingsOverride ?? (state.current && state.current.id === r.id ? state.servings : r.servings);
  const factor = servings / r.servings;
  let added = 0;
  let skipped = 0;
  r.ingredients.forEach(ing => {
    if (!esComprable(ing.n)) return;
    if (inPantry(ing.n)) { skipped++; return; }
    Store.shopping.add(canonicalName(ing.n), ingredientQty(ing, factor), r.name);
    added++;
  });
  toast(`${added} ingredientes de ${r.name} añadidos${skipped ? ` · ${skipped} ya los tienes` : ''}`, '🛒');
  updateShopDot();
  if (state.view === 'shopping') renderShopping();
  checkAchievements();
}

function renderShopping() {
  const items = Store.shopping.all();
  const pending = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  $('#shoppingSummary').textContent = items.length
    ? `${pending.length} por comprar · ${done.length} en el carro`
    : 'Tu lista está vacía';

  if (!items.length) {
    $('#shoppingList').innerHTML = emptyState('🛒', 'La lista está vacía',
      'Añade productos a mano o pulsa “Añadir a la compra” en cualquier receta.',
      'Ver recetas', 'data-nav="recipes"');
    updateShopDot();
    return;
  }

  const row = (item) => {
    const qty = formatParts(item);
    return `
    <li class="shop-item ${item.done ? 'is-done' : ''}">
      <label class="ing">
        <input type="checkbox" data-shop-toggle="${item.id}" ${item.done ? 'checked' : ''}>
        <span class="ing__box">✓</span>
        <span class="ing__text">
          <b>${esc(item.name)}</b>
          ${qty ? `<span class="shop-item__qty">${esc(qty)}</span>` : ''}
          ${item.from && item.from.length ? `<small class="shop-item__from">${esc(item.from.join(' · '))}</small>` : ''}
        </span>
      </label>
      <button class="icon-btn icon-btn--sm" data-shop-pantry="${esc(item.name)}" title="Ya lo tengo en casa" aria-label="Mover a la despensa">🏠</button>
      <button class="icon-btn icon-btn--sm" data-shop-remove="${item.id}" aria-label="Eliminar ${esc(item.name)}">🗑️</button>
    </li>`;
  };

  /* Los pendientes se agrupan por pasillo del supermercado */
  const groups = new Map();
  pending.forEach(item => {
    const aisle = aisleOf(item.name);
    if (!groups.has(aisle.key)) groups.set(aisle.key, { label: aisle.label, items: [] });
    groups.get(aisle.key).items.push(item);
  });
  const order = [...AISLES.map(a => a.key), 'otros'];
  const sorted = order.filter(k => groups.has(k)).map(k => groups.get(k));

  $('#shoppingList').innerHTML = `
    ${sorted.map(g => `
      <h3 class="shop-head">${g.label} <span>${g.items.length}</span></h3>
      <ul class="shop-list">${g.items.map(row).join('')}</ul>`).join('')}
    ${done.length ? `<h3 class="shop-head shop-head--muted">✅ En el carro <span>${done.length}</span></h3>
      <ul class="shop-list shop-list--done">${done.map(row).join('')}</ul>` : ''}`;

  updateShopDot();
}

/* ── Mi despensa ──
   El catálogo no es una lista escrita a mano: sale de los ingredientes reales
   de las 250 recetas, así que siempre coincide con lo que la app te pedirá
   comprar. Se calcula una sola vez y se guarda. */
let pantryCatalogCache = null;

function pantryCatalog() {
  if (pantryCatalogCache) return pantryCatalogCache;

  const freq = new Map();
  RECIPES.forEach(r => r.ingredients.forEach(ing => {
    if (!esComprable(ing.n)) return;
    const name = canonicalName(ing.n);
    freq.set(name, (freq.get(name) || 0) + 1);
  }));

  const groups = new Map();
  [...freq.entries()].forEach(([name, count]) => {
    const aisle = aisleOf(name);
    if (!groups.has(aisle.key)) groups.set(aisle.key, { label: aisle.label, items: [] });
    groups.get(aisle.key).items.push({ name, count });
  });

  /* Dentro de cada pasillo, primero lo que sale en más recetas */
  const order = [...AISLES.map(a => a.key), 'otros'];
  pantryCatalogCache = order
    .filter(k => groups.has(k))
    .map(k => {
      const g = groups.get(k);
      g.items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
      return g;
    });
  return pantryCatalogCache;
}

/* Cuántos productos se enseñan de cada pasillo antes de pulsar "ver todos" */
const PANTRY_VISIBLES = 12;
const pantryState = { query: '', expanded: false };

function renderPantry() {
  const box = $('#pantryList');
  if (!box) return;

  const mine = Store.pantry.all();
  const q = normalize(pantryState.query.trim());
  const catalogNames = new Set(pantryCatalog().flatMap(g => g.items.map(i => i.name)));

  /* Lo que el usuario añadió a mano y no está en el catálogo no se pierde */
  const extras = mine.filter(p => !catalogNames.has(p));

  const chip = (name) => {
    const on = Store.pantry.has(name);
    return `<button class="chip chip--sm ${on ? 'is-on' : ''}" data-pantry-toggle="${esc(name)}"
              aria-pressed="${on}">${on ? '✓ ' : ''}${esc(name)}</button>`;
  };

  const groups = pantryCatalog().map(g => {
    let items = g.items;
    if (q) items = items.filter(i => normalize(i.name).includes(q));
    if (!items.length) return '';

    /* Lo ya marcado se enseña siempre, aunque quede fuera del recorte */
    const oculto = (!q && !pantryState.expanded && items.length > PANTRY_VISIBLES)
      ? items.slice(PANTRY_VISIBLES).filter(i => Store.pantry.has(i.name))
      : [];
    const visibles = (q || pantryState.expanded) ? items : items.slice(0, PANTRY_VISIBLES).concat(oculto);
    const restantes = items.length - visibles.length;

    return `
      <div class="pantry__group">
        <h4 class="pantry__aisle">${g.label} <span>${items.length}</span></h4>
        <div class="chips">
          ${visibles.map(i => chip(i.name)).join('')}
          ${restantes > 0 ? `<button class="chip chip--sm chip--more" data-pantry-expand>+${restantes} más</button>` : ''}
        </div>
      </div>`;
  }).join('');

  const nadaEncontrado = q && !groups;
  const nuevo = pantryState.query.trim();

  box.innerHTML = `
    <p class="pantry__count">
      ${mine.length
        ? `🏠 <b>${mine.length}</b> ${mine.length === 1 ? 'producto' : 'productos'} en tu despensa · no se añadirán a la lista`
        : 'Marca lo que sueles tener en casa y dejará de aparecer en la lista de la compra.'}
    </p>

    ${extras.length ? `
      <div class="pantry__group">
        <h4 class="pantry__aisle">✍️ Añadidos por ti <span>${extras.length}</span></h4>
        <div class="chips">${extras.map(chip).join('')}</div>
      </div>` : ''}

    ${groups}

    ${nadaEncontrado ? `
      <div class="pantry__none">
        <p>No hay ningún producto que se llame «${esc(nuevo)}».</p>
        <button class="btn btn--ghost" data-pantry-add="${esc(nuevo)}">＋ Añadirlo igualmente</button>
      </div>` : ''}

    ${mine.length ? `<button class="tagx tagx--clear" id="pantryClear">Vaciar despensa</button>` : ''}`;
}

function updateShopDot() {
  const dot = $('#shopDot');
  if (dot) dot.hidden = Store.shopping.pending() === 0;
}

function shoppingAsText() {
  const items = Store.shopping.all();
  const groups = new Map();
  items.filter(i => !i.done).forEach(item => {
    const aisle = aisleOf(item.name);
    if (!groups.has(aisle.label)) groups.set(aisle.label, []);
    groups.get(aisle.label).push(item);
  });
  const lines = ['🛒 LISTA DE LA COMPRA', ''];
  groups.forEach((list, label) => {
    lines.push(label.toUpperCase());
    list.forEach(i => {
      const qty = formatParts(i);
      lines.push(`· ${i.name}${qty ? ' — ' + qty : ''}`);
    });
    lines.push('');
  });
  const done = items.filter(i => i.done);
  if (done.length) lines.push('YA COMPRADO', ...done.map(i => `· ${i.name}`), '');
  lines.push('Lista hecha con AirChef 🍗');
  return lines.join('\n');
}

/* ══════════════ 11. PROGRESO Y LOGROS ══════════════ */

function progressStats() {
  const history = Store.history.all();
  const byCat = {};
  CATEGORIES.forEach(c => byCat[c.key] = 0);
  history.forEach(h => {
    const r = getRecipe(h.id);
    if (r) byCat[r.category]++;
  });
  return {
    cooked: history.length,
    unique: Store.history.uniqueCount(),
    favs: Store.favorites.count(),
    streak: Store.history.streak(),
    cats: Object.values(byCat).filter(n => n > 0).length,
    byCat,
    week: Store.week.count(),
    weekDays: Store.week.daysUsed(),
    shopping: Store.shopping.count(),
    pantry: Store.pantry.count(),
    notes: Store.notes.count(),
    achievements: Store.achievements.count()
  };
}

function checkAchievements() {
  const s = progressStats();
  ACHIEVEMENTS.forEach(a => {
    if (!Store.achievements.has(a.key) && a.test(s)) {
      Store.achievements.unlock(a.key);
      setTimeout(() => toast(`¡Logro desbloqueado! ${a.emoji} ${a.name}`, '🏆'), 400);
    }
  });
}

function renderProfile() {
  renderMeCard();
  const s = progressStats();
  /* Cada dato lleva a la lista que hay detrás: ver el número sin poder abrirlo
     dejaba al usuario con la pregunta de "¿y cuáles son?". */
  const stat = (emoji, valor, etiqueta, destino, pista) => `
    <button class="stat" ${destino} aria-label="${esc(etiqueta)}: ${esc(String(valor))}. ${esc(pista)}">
      <b>${emoji}</b><span>${valor}</span><small>${esc(etiqueta)}</small>
      <i class="stat__ir">${esc(pista)} →</i>
    </button>`;

  $('#statsGrid').innerHTML = [
    stat('🍽️', s.cooked, 'Recetas cocinadas', 'data-ir="historial"', 'Ver historial'),
    stat('❤️', s.favs, 'Favoritas', 'data-nav="favorites"', 'Ver favoritas'),
    stat('🔥', s.streak, 'Días de racha', 'data-ir="historial"', 'Ver historial'),
    stat('🏆', `${s.achievements}/${ACHIEVEMENTS.length}`, 'Logros', 'data-ir="logros"', 'Ver logros'),
    stat('🧭', `${s.cats}/${CATEGORIES.length}`, 'Categorías probadas', 'data-nav="recipes"', 'Ver recetas'),
    stat('📅', `${s.week}/14`, 'Comidas planificadas', 'data-nav="week"', 'Ver mi semana')
  ].join('');

  $('#achieveMeta').textContent = `${Store.achievements.count()} de ${ACHIEVEMENTS.length}`;
  $('#achievementsGrid').innerHTML = ACHIEVEMENTS.map(a => {
    const on = Store.achievements.has(a.key);
    return `
      <div class="achv ${on ? 'is-on' : ''}">
        <span class="achv__emoji">${on ? a.emoji : '🔒'}</span>
        <b>${esc(a.name)}</b>
        <small>${esc(a.desc)}</small>
      </div>`;
  }).join('');

  const history = Store.history.all().slice(0, 20);
  $('#historyList').innerHTML = history.length ? history.map(h => {
    const r = getRecipe(h.id);
    if (!r) return '';
    return `
      <button class="hist" data-recipe="${r.id}">
        <span class="hist__emoji" data-cat="${r.category}">${r.emoji}</span>
        <span class="hist__body"><b>${esc(r.name)}</b><small>${formatDate(h.at)}</small></span>
        <span class="hist__go">→</span>
      </button>`;
  }).join('') : emptyState('🍽️', 'Todavía no has cocinado nada',
    'Cuando termines una receta en modo cocinar aparecerá aquí.', 'Buscar una receta', 'data-nav="recipes"');

  applyTheme(document.documentElement.dataset.theme);
  applySound(Store.prefs.get('sound'));
  applyVoice(Store.prefs.get('voice'));
  applyNotify(Store.prefs.get('notify'));
  applyTempOffset(Store.prefs.get('tempOffset'));
  refreshInstallButton();
  renderAccount();
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const today = Store.todayKey();
  const yesterday = Store.todayKey(new Date(Date.now() - 86400000));
  const key = Store.todayKey(d);
  const hour = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (key === today) return `Hoy · ${hour}`;
  if (key === yesterday) return `Ayer · ${hour}`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) + ` · ${hour}`;
}

/* ══════════════ 12. ALEATORIA Y "LO QUE TENGO" ══════════════ */

const diceFilters = { time: null, cat: null, diff: null, tag: null };

function renderDiceBody(result = null) {
  const option = (group, value, label) => `
    <button class="chip ${diceFilters[group] === value ? 'is-on' : ''}" data-dice="${group}" data-value="${value === null ? '' : value}">${label}</button>`;

  $('#diceBody').innerHTML = `
    <p class="dice__intro">Ajusta lo que te apetece (o déjalo en blanco) y pulsa el botón.</p>

    <div class="filter-group">
      <h4>⏱️ Tiempo</h4>
      <div class="chips">
        ${option('time', null, 'Cualquiera')}
        ${option('time', 15, 'Menos de 15 min')}
        ${option('time', 30, 'Menos de 30 min')}
        ${option('time', 45, 'Menos de 45 min')}
      </div>
    </div>

    <div class="filter-group">
      <h4>🍽️ Categoría</h4>
      <div class="chips">
        ${option('cat', null, 'Cualquiera')}
        ${CATEGORIES.map(c => option('cat', c.key, `${c.emoji} ${c.label}`)).join('')}
      </div>
    </div>

    <div class="filter-group">
      <h4>⭐ Dificultad</h4>
      <div class="chips">
        ${option('diff', null, 'Cualquiera')}
        ${DIFFICULTIES.map(d => option('diff', d, d)).join('')}
      </div>
    </div>

    <div class="filter-group">
      <h4>🎯 Objetivo</h4>
      <div class="chips">
        ${option('tag', null, 'Cualquiera')}
        ${option('tag', 'saludable', '🥗 Saludable')}
        ${option('tag', 'economica', '💰 Económica')}
        ${option('tag', 'proteina', '💪 Alta en proteína')}
        ${option('tag', 'rapida', '⚡ Rápida')}
      </div>
    </div>

    <div class="dice__result" id="diceResult">
      ${result === null ? '' : result
        ? `<div class="dice__card">
             <span class="dice__emoji" data-cat="${result.category}">${result.emoji}</span>
             <b>${esc(result.name)}</b>
             <small>⏱️ ${totalTime(result)} min · 🌡️ ${adjTemp(result)}° · ⭐ ${esc(result.difficulty)}</small>
             <button class="btn btn--primary" data-recipe="${result.id}" data-dice-open>Ver receta →</button>
           </div>`
        : `<div class="dice__none">😅 Ninguna receta cumple todos esos filtros. Prueba a relajar alguno.</div>`}
    </div>`;
}

function rollDice() {
  const pool = RECIPES.filter(r => {
    if (diceFilters.time && totalTime(r) > diceFilters.time) return false;
    if (diceFilters.cat && r.category !== diceFilters.cat) return false;
    if (diceFilters.diff && r.difficulty !== diceFilters.diff) return false;
    if (diceFilters.tag && !r.tags.includes(diceFilters.tag)) return false;
    return true;
  });
  if (!pool.length) { renderDiceBody(false); return; }
  renderDiceBody(pool[Math.floor(Math.random() * pool.length)]);
}

/* ── Cocina con lo que tengo ── */
function renderHaveBody(results = null) {
  $('#haveBody').innerHTML = `
    <p class="dice__intro">Marca lo que tienes en la nevera. Te diremos qué puedes cocinar y qué te falta.</p>
    ${COMMON_INGREDIENTS.map(group => `
      <div class="filter-group">
        <h4>${esc(group.g)}</h4>
        <div class="chips">
          ${group.items.map(item => `<button class="chip ${state.have.includes(item) ? 'is-on' : ''}" data-have="${esc(item)}">${esc(item)}</button>`).join('')}
        </div>
      </div>`).join('')}
    <div id="haveResult" class="have__result">
      ${results === null ? '' : results.length ? `
        <h4 class="have__title">Con eso puedes hacer:</h4>
        ${results.map(res => `
          <button class="pickitem" data-recipe="${res.recipe.id}" data-have-open>
            <span class="pickitem__emoji" data-cat="${res.recipe.category}">${res.recipe.emoji}</span>
            <span class="pickitem__body">
              <b>${esc(res.recipe.name)}</b>
              <small>${res.missing.length === 0
                ? '✅ Tienes todo lo principal'
                : `Te falta: ${esc(res.missing.join(', '))}`}</small>
            </span>
            <span class="pickitem__go">→</span>
          </button>`).join('')}`
        : `<div class="dice__none">😅 Marca al menos un ingrediente para buscar.</div>`}
    </div>`;
}

/** Busca recetas cuyos ingredientes principales estén cubiertos por la selección. */
function searchByIngredients() {
  if (!state.have.length) { renderHaveBody([]); return; }
  const selected = state.have.map(normalize);
  const allCommon = COMMON_INGREDIENTS.flatMap(g => g.items).map(normalize);

  const results = RECIPES.map(recipe => {
    /* Solo miramos los ingredientes "de peso", no la sal ni las especias */
    const main = recipe.ingredients
      .filter(i => i.q !== null)
      .map(i => ({ raw: i.n, n: normalize(i.n) }))
      .filter(i => allCommon.some(c => i.n.includes(c)));

    if (!main.length) return null;
    const have = main.filter(i => selected.some(s => i.n.includes(s)));
    const missing = main.filter(i => !selected.some(s => i.n.includes(s))).map(i => i.raw);
    if (!have.length) return null;
    return { recipe, have: have.length, missing, ratio: have.length / main.length };
  }).filter(Boolean);

  results.sort((a, b) => a.missing.length - b.missing.length || b.ratio - a.ratio || b.recipe.popularity - a.recipe.popularity);
  renderHaveBody(results.filter(r => r.missing.length <= 3).slice(0, 15));
  $('#haveResult')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ══════════════ 13. FILTROS, COMPARTIR, COPIA E INSTALACIÓN ══════════════ */

function renderFilterSheet() {
  const f = state.filters;
  $('#filterBody').innerHTML = `
    <div class="filter-group">
      <h4>⏱️ Tiempo total</h4>
      <div class="chips">
        <button class="chip ${!f.time ? 'is-on' : ''}" data-filter="time" data-value="">Cualquiera</button>
        <button class="chip ${f.time === 15 ? 'is-on' : ''}" data-filter="time" data-value="15">Menos de 15 min</button>
        <button class="chip ${f.time === 30 ? 'is-on' : ''}" data-filter="time" data-value="30">Menos de 30 min</button>
        <button class="chip ${f.time === 45 ? 'is-on' : ''}" data-filter="time" data-value="45">Menos de 45 min</button>
      </div>
    </div>

    <div class="filter-group">
      <h4>⭐ Dificultad</h4>
      <div class="chips">
        ${DIFFICULTIES.map(d => `<button class="chip ${f.diffs.includes(d) ? 'is-on' : ''}" data-filter="diff" data-value="${d}">${d}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group">
      <h4>🍽️ Tipo de plato</h4>
      <div class="chips">
        ${CATEGORIES.map(c => `<button class="chip ${f.cats.includes(c.key) ? 'is-on' : ''}" data-filter="cat" data-value="${c.key}">${c.emoji} ${c.label}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group">
      <h4>🎯 Objetivo</h4>
      <div class="chips">
        ${TAGS.map(t => `<button class="chip ${f.tags.includes(t.key) ? 'is-on' : ''}" data-filter="tag" data-value="${t.key}">${t.emoji} ${t.label}</button>`).join('')}
      </div>
    </div>

    <p class="filter-count" id="filterCount"></p>`;
  updateFilterCount();
}

function updateFilterCount() {
  const n = filterRecipes().length;
  const el = $('#filterCount');
  if (el) el.textContent = n === 0 ? 'Ninguna receta coincide con estos filtros' : `${n} ${n === 1 ? 'receta coincide' : 'recetas coinciden'}`;
  const apply = $('#filtersApply');
  if (apply) apply.textContent = n ? `Ver ${n} recetas` : 'Ver recetas';
}

function toggleInArray(arr, value) {
  const i = arr.indexOf(value);
  if (i >= 0) arr.splice(i, 1); else arr.push(value);
  return arr;
}

function clearFilters() {
  state.filters = { cats: [], tags: [], time: null, diffs: [] };
}

/** Comparte por el menú nativo del móvil; si no existe, copia al portapapeles. */
async function share(title, text) {
  if (navigator.share) {
    try { await navigator.share({ title, text }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  await copyToClipboard(text);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copiado al portapapeles', '📋');
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); toast('Copiado al portapapeles', '📋'); }
    catch (e2) { toast('Tu navegador no permite copiar', '⚠️'); }
    area.remove();
  }
}

function exportData() {
  const payload = Store.exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `airfryer-copia-${Store.todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Copia de seguridad descargada', '⬇️');
}

async function importData(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('El archivo es demasiado grande', '⚠️'); return; }
  const ok = await confirmAction({
    title: 'Importar copia de seguridad',
    text: 'Se sustituirán tus datos actuales (favoritos, historial, semana, lista y logros) por los del archivo.',
    icon: '⬆️', ok: 'Sí, importar'
  });
  if (!ok) return;
  try {
    const text = await file.text();
    const result = Store.importAll(JSON.parse(text));
    if (!result.ok) { toast(result.error, '⚠️'); return; }
    applyTheme(Store.prefs.get('theme') || 'light');
    applySound(Store.prefs.get('sound') || 'on');
    applyVoice(Store.prefs.get('voice') || 'off');
    applyNotify(Store.prefs.get('notify') || 'off');
    applyTempOffset(Store.prefs.get('tempOffset') || 0);
    navigate(state.view);
    updateShopDot();
    toast('Datos restaurados correctamente', '✅');
  } catch (e) {
    toast('El archivo no es una copia válida de AirChef', '⚠️');
  }
}

function refreshInstallButton() {
  const btn = $('#installBtn');
  if (!btn) return;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (standalone) {
    btn.textContent = '✅ Ya está instalada';
    btn.disabled = true;
  } else if (state.installPrompt) {
    btn.textContent = '📲 Instalar app';
    btn.disabled = false;
  } else {
    btn.textContent = '📲 Cómo instalarla';
    btn.disabled = false;
  }
}

async function installApp() {
  if (state.installPrompt) {
    state.installPrompt.prompt();
    const { outcome } = await state.installPrompt.userChoice;
    state.installPrompt = null;
    refreshInstallButton();
    if (outcome === 'accepted') toast('¡Instalada! Búscala en tu pantalla de inicio', '📲');
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  confirmAction({
    title: 'Instalar en tu móvil',
    icon: '📲',
    ok: 'Entendido',
    text: isIOS
      ? 'En iPhone: pulsa el botón Compartir de Safari (el cuadrado con la flecha) y elige “Añadir a pantalla de inicio”.'
      : 'En Android: abre el menú ⋮ del navegador y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.'
  });
}

/* ══════════════ 14. EVENTOS ══════════════ */

function bindEvents() {

  document.addEventListener('click', (e) => {
    /* — Navegación — */
    const nav = e.target.closest('[data-nav]');
    if (nav) { navigate(nav.dataset.nav); return; }

    const sortNav = e.target.closest('[data-sort-nav]');
    if (sortNav) {
      clearFilters();
      state.query = '';
      $('#mainSearch').value = '';
      state.sort = sortNav.dataset.sortNav;
      $('#sortSelect').value = state.sort;
      navigate('recipes');
      return;
    }
    const tagNav = e.target.closest('[data-tag-nav]');
    if (tagNav) { clearFilters(); state.filters.tags = [tagNav.dataset.tagNav]; navigate('recipes'); return; }

    const catNav = e.target.closest('[data-cat-nav]');
    if (catNav) {
      clearFilters();
      state.query = '';
      $('#mainSearch').value = '';
      if (catNav.dataset.catType === 'cat') state.filters.cats = [catNav.dataset.catNav];
      else state.filters.tags = [catNav.dataset.catNav];
      navigate('recipes');
      return;
    }

    /* — Sugerencia del buscador — */
    const suggest = e.target.closest('[data-suggest]');
    if (suggest) {
      state.query = suggest.dataset.suggest;
      $('#mainSearch').value = state.query;
      $('#mainSearchClear').hidden = false;
      renderRecipes();
      return;
    }

    /* — Favoritos — */
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.stopPropagation();
      const id = Number(fav.dataset.fav);
      const added = Store.favorites.toggle(id);
      pulse(fav);
      toast(added ? 'Guardada en favoritos ❤️' : 'Quitada de favoritos', added ? '❤️' : '🤍');
      refreshFavButtons(id);
      if (state.view === 'favorites') renderFavorites();
      if (state.view === 'home') renderHome();
      checkAchievements();
      return;
    }

    /* — Abrir receta — */
    const card = e.target.closest('[data-recipe]');
    if (card) {
      /* Al saltar de un panel a la ficha, la entrada del historial se traspasa */
      if (card.hasAttribute('data-dice-open')) cerrarCediendoHistorial($('#diceSheet'), 'recipeSheet');
      if (card.hasAttribute('data-have-open')) cerrarCediendoHistorial($('#haveSheet'), 'recipeSheet');
      openRecipe(card.dataset.recipe);
      return;
    }

    if (e.target.closest('[data-close-sheet]')) { closeSheet(e.target.closest('.sheet')); return; }

    /* — Ficha: personas, acciones, valoración — */
    const serv = e.target.closest('[data-servings]');
    if (serv) {
      state.servings = Math.min(12, Math.max(1, state.servings + Number(serv.dataset.servings)));
      renderRecipeSheet();
      return;
    }

    const rate = e.target.closest('[data-rate]');
    if (rate && state.current) {
      Store.notes.set(state.current.id, { rating: Number(rate.dataset.rate) });
      renderRecipeSheet();
      toast(Number(rate.dataset.rate) ? '¡Valoración guardada!' : 'Valoración eliminada', '⭐');
      checkAchievements();
      return;
    }

    const cookBtn = e.target.closest('[data-cook]');
    if (cookBtn) { startCooking(cookBtn.dataset.cook); return; }

    const addShop = e.target.closest('[data-add-shopping]');
    if (addShop) {
      /* Sin esto, un toque doble sumaba las cantidades otra vez y salías
         del súper con el triple de comida. */
      if (!accionUnica('compra:' + addShop.dataset.addShopping)) return;
      addRecipeToShopping(addShop.dataset.addShopping);
      pulse(addShop);
      return;
    }

    const addWeek = e.target.closest('[data-add-week]');
    if (addWeek) {
      cerrarCediendoHistorial($('#recipeSheet'), 'pickSheet');
      setTimeout(() => openDayChooser(Number(addWeek.dataset.addWeek)), 200);
      return;
    }

    const cooked = e.target.closest('[data-cooked]');
    if (cooked) {
      if (!accionUnica('cocinada:' + cooked.dataset.cooked)) return;
      Store.history.add(cooked.dataset.cooked);
      toast('Receta registrada como cocinada 🎉', '🍽️');
      checkAchievements();
      renderRecipeSheet();
      return;
    }

    const shareRecipe = e.target.closest('[data-share-recipe]');
    if (shareRecipe) {
      const r = getRecipe(shareRecipe.dataset.shareRecipe);
      if (r) share(r.name, recipeAsText(r, state.servings));
      return;
    }

    /* — Modo cocinar — */
    if (e.target.closest('[data-exit-cook]')) { exitCooking(); return; }

    if (e.target.closest('#cookVoice')) {
      const next = Store.prefs.get('voice') === 'on' ? 'off' : 'on';
      applyVoice(next);
      const btn = $('#cookVoice');
      btn.textContent = next === 'on' ? '🔊' : '🔇';
      btn.classList.toggle('is-on', next === 'on');
      if (next === 'on') speak(adjTempTexto(state.cook.recipe.steps[state.cook.step].t));
      else stopSpeaking();
      return;
    }

    const cookStep = e.target.closest('[data-cook-step]');
    if (cookStep) {
      const next = state.cook.step + Number(cookStep.dataset.cookStep);
      if (next >= 0 && next < state.cook.recipe.steps.length) {
        state.cook.step = next;
        renderCookStep();
      }
      return;
    }
    if (e.target.closest('[data-cook-finish]')) { finishCooking(); return; }

    /* — Temporizador — */
    if (e.target.closest('#timerToggle')) {
      if (state.timer.running) pauseTimer(); else startTimer();
      return;
    }
    const adjust = e.target.closest('[data-timer-adjust]');
    if (adjust) {
      const input = $('#timerMinutes');
      const value = Math.min(120, Math.max(1, (parseInt(input.value, 10) || 1) + Number(adjust.dataset.timerAdjust)));
      input.value = value;
      if (!state.timer.running) {
        state.timer.left = value * 60;
        state.timer.total = value * 60;
        $('#timerBox')?.classList.remove('is-done');
        paintTimer();
      }
      return;
    }
    const addMin = e.target.closest('[data-timer-add]');
    if (addMin) {
      const extra = Number(addMin.dataset.timerAdd) * 60;
      state.timer.left = Math.min(120 * 60, state.timer.left + extra);
      state.timer.total = Math.max(state.timer.total, state.timer.left);
      $('#timerBox')?.classList.remove('is-done');
      $('#timerMinutes').value = Math.max(1, Math.round(state.timer.left / 60));
      if (state.timer.running) startTimer();   // recalcula la hora de fin
      paintTimer();
      toast(`+${addMin.dataset.timerAdd} min añadidos`, '⏱️');
      return;
    }
    if (e.target.closest('[data-timer-reset]')) {
      stopTimer();
      const minutes = Math.max(1, parseInt($('#timerMinutes').value, 10) || 1);
      state.timer = { total: minutes * 60, left: minutes * 60, running: false, id: null, done: false };
      $('#timerBox')?.classList.remove('is-done', 'is-running');
      if ($('#timerHint')) $('#timerHint').textContent = 'Temporizador';
      paintTimer();
      return;
    }

    /* — Chips y filtros — */
    if (e.target.closest('[data-chip-all]')) { clearFilters(); renderRecipes(); return; }
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      if (chip.dataset.chipType === 'cat') toggleInArray(state.filters.cats, chip.dataset.chip);
      else toggleInArray(state.filters.tags, chip.dataset.chip);
      renderRecipes();
      return;
    }

    const removeFilter = e.target.closest('[data-remove-filter]');
    if (removeFilter) {
      const { removeFilter: type, value } = removeFilter.dataset;
      if (type === 'cat') toggleInArray(state.filters.cats, value);
      if (type === 'tag') toggleInArray(state.filters.tags, value);
      if (type === 'diff') toggleInArray(state.filters.diffs, value);
      if (type === 'time') state.filters.time = null;
      renderRecipes();
      return;
    }
    if (e.target.closest('[data-clear-filters]')) {
      clearFilters();
      if (e.target.closest('[data-clear-query]')) {
        state.query = '';
        $('#mainSearch').value = '';
        $('#mainSearchClear').hidden = true;
      }
      renderRecipes();
      return;
    }

    if (e.target.closest('#filtersBtn')) { renderFilterSheet(); openSheet('filterSheet'); return; }
    const filterChip = e.target.closest('[data-filter]');
    if (filterChip) {
      const { filter, value } = filterChip.dataset;
      if (filter === 'time') state.filters.time = value ? Number(value) : null;
      if (filter === 'diff') toggleInArray(state.filters.diffs, value);
      if (filter === 'cat') toggleInArray(state.filters.cats, value);
      if (filter === 'tag') toggleInArray(state.filters.tags, value);
      renderFilterSheet();
      return;
    }
    if (e.target.closest('#filtersReset')) { clearFilters(); renderFilterSheet(); return; }
    if (e.target.closest('#filtersApply')) { closeSheet($('#filterSheet')); navigate('recipes'); return; }

    /* — Receta aleatoria — */
    if (e.target.closest('#diceBtn')) { renderDiceBody(); openSheet('diceSheet'); return; }
    const diceChip = e.target.closest('[data-dice]');
    if (diceChip) {
      const group = diceChip.dataset.dice;
      const raw = diceChip.dataset.value;
      let value = raw === '' ? null : raw;
      if (group === 'time' && value !== null) value = Number(value);
      diceFilters[group] = value;
      renderDiceBody();
      return;
    }
    if (e.target.closest('#diceRoll')) { rollDice(); return; }

    /* — Cocina con lo que tengo — */
    if (e.target.closest('#haveBtn')) { renderHaveBody(); openSheet('haveSheet'); return; }
    const haveChip = e.target.closest('[data-have]');
    if (haveChip) { toggleInArray(state.have, haveChip.dataset.have); renderHaveBody(); return; }
    if (e.target.closest('#haveReset')) { state.have = []; renderHaveBody(); return; }
    if (e.target.closest('#haveSearch')) { searchByIngredients(); return; }

    /* — Mi semana — */
    const pickDay = e.target.closest('[data-week-pick]');
    if (pickDay) { openPicker(pickDay.dataset.weekPick, pickDay.dataset.slot); return; }

    const pickRecipe = e.target.closest('[data-pick]');
    if (pickRecipe && state.picking) {
      Store.week.set(state.picking.day, state.picking.slot, pickRecipe.dataset.pick);
      const day = DAYS.find(d => d.key === state.picking.day);
      const slot = SLOTS.find(s => s.key === state.picking.slot);
      closeSheet($('#pickSheet'));
      toast(`Guardada para el ${day ? day.label.toLowerCase() : 'día'} (${slot ? slot.label.toLowerCase() : ''}) 📅`, '📅');
      renderWeek();
      checkAchievements();
      return;
    }

    const clearSlot = e.target.closest('[data-week-clear]');
    if (clearSlot) {
      Store.week.clearSlot(clearSlot.dataset.weekClear, clearSlot.dataset.slot);
      renderWeek();
      toast('Quitada del plan', '🗑️');
      return;
    }

    const chooseDay = e.target.closest('[data-choose-day]');
    if (chooseDay) {
      Store.week.set(chooseDay.dataset.chooseDay, chooseDay.dataset.slot, chooseDay.dataset.recipeId);
      closeSheet($('#pickSheet'));
      const day = DAYS.find(d => d.key === chooseDay.dataset.chooseDay);
      toast(`Guardada para el ${day ? day.label.toLowerCase() : 'día'} 📅`, '📅');
      if (state.view === 'week') renderWeek();
      checkAchievements();
      return;
    }

    if (e.target.closest('#batchClose')) { $('#batchPlan').hidden = true; return; }

    /* — Lista de la compra — */
    const shopRemove = e.target.closest('[data-shop-remove]');
    if (shopRemove) { Store.shopping.remove(shopRemove.dataset.shopRemove); renderShopping(); return; }

    const toPantry = e.target.closest('[data-shop-pantry]');
    if (toPantry) {
      const name = toPantry.dataset.shopPantry;
      Store.pantry.add(name);
      const item = Store.shopping.all().find(i => i.name === name);
      if (item) Store.shopping.remove(item.id);
      renderShopping();
      renderPantry();
      toast(`“${name}” guardado en tu despensa 🏠`, '🏠');
      checkAchievements();
      return;
    }

    /* — Bienvenida — */
    if (e.target.closest('#welcomeSkip')) {
      /* Elección voluntaria de usar la aplicación sin cuenta: se respeta
         mientras no cierre la aplicación. */
      try { sessionStorage.setItem(SIN_CUENTA, '1'); } catch (err) {}
      cerrarBienvenida();
      return;
    }
    /* El formulario se abre ENCIMA de la pantalla de entrada. Si se cancela,
       se vuelve a ella en lugar de colarse en la aplicación sin haber entrado. */
    if (e.target.closest('#welcomeSignup')) {
      openAuth({ sobreBienvenida: true });
      authModo = 'registro';
      paintAuth();
      return;
    }
    if (e.target.closest('#welcomeLogin')) {
      openAuth({ sobreBienvenida: true });
      return;
    }

    /* — Datos del perfil que llevan a su lista — */
    const ir = e.target.closest('[data-ir]');
    if (ir) {
      const destinos = { historial: '#historyList', logros: '#achievementsGrid' };
      const sec = $(destinos[ir.dataset.ir]);
      if (sec) {
        const titulo = sec.closest('.section') || sec;
        titulo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        titulo.classList.add('is-destacada');
        setTimeout(() => titulo.classList.remove('is-destacada'), 1400);
      }
      return;
    }

    /* — Tu perfil: nombre y avatar — */
    if (e.target.closest('#meEdit')) { openMeSheet(); return; }

    const av = e.target.closest('[data-av]');
    if (av) {
      meDraft.avatar = av.dataset.av;
      const name = $('#meName');
      if (name) meDraft.name = name.value;   // no perder lo escrito al repintar
      renderMeBody();
      return;
    }

    const avc = e.target.closest('[data-avcolor]');
    if (avc) {
      meDraft.color = avc.dataset.avcolor;
      const name = $('#meName');
      if (name) meDraft.name = name.value;
      renderMeBody();
      return;
    }

    if (e.target.closest('#meSave')) { saveMeSheet(); return; }

    /* Marcar o desmarcar un producto de la despensa */
    const pantryToggle = e.target.closest('[data-pantry-toggle]');
    if (pantryToggle) {
      const name = pantryToggle.dataset.pantryToggle;
      const tenia = Store.pantry.has(name);
      tenia ? Store.pantry.remove(name) : Store.pantry.add(name);
      renderPantry();
      renderShopping();          // lo de la despensa deja de pedirse en la compra
      if (!tenia) checkAchievements();
      return;
    }

    if (e.target.closest('[data-pantry-expand]')) {
      pantryState.expanded = true;
      renderPantry();
      return;
    }

    const pantryAdd = e.target.closest('[data-pantry-add]');
    if (pantryAdd) {
      const name = pantryAdd.dataset.pantryAdd;
      Store.pantry.add(name);
      pantryState.query = '';
      $('#pantrySearch').value = '';
      $('#pantrySearchClear').hidden = true;
      renderPantry();
      renderShopping();
      toast(`“${name}” guardado en tu despensa`, '🏠');
      checkAchievements();
      return;
    }

    if (e.target.closest('#pantryClear')) {
      Store.pantry.clear();
      renderPantry();
      toast('Despensa vaciada', '🏠');
      return;
    }
  });

  /* — Checkboxes — */
  document.addEventListener('change', (e) => {
    const ing = e.target.closest('[data-ing]');
    if (ing && state.current) {
      Store.checks.toggle(state.current.id, Number(ing.dataset.ing));
      ing.closest('.ing').classList.toggle('is-checked', ing.checked);
      return;
    }
    const shop = e.target.closest('[data-shop-toggle]');
    if (shop) { Store.shopping.toggle(shop.dataset.shopToggle); renderShopping(); return; }

    if (e.target.id === 'timerMinutes') {
      e.target.value = Math.min(120, Math.max(1, parseInt(e.target.value, 10) || 1));
      return;
    }
    if (e.target.id === 'importFile') { importData(e.target.files[0]); e.target.value = ''; }
  });

  /* — Entradas de texto — */
  let noteTimer = null;
  document.addEventListener('input', (e) => {
    /* Minutos del temporizador escritos a mano */
    if (e.target.id === 'timerMinutes' && !state.timer.running) {
      const minutes = Math.min(120, Math.max(1, parseInt(e.target.value, 10) || 1));
      state.timer.left = minutes * 60;
      state.timer.total = minutes * 60;
      state.timer.done = false;
      $('#timerBox')?.classList.remove('is-done');
      paintTimer();
      return;
    }
    /* Nota personal de la receta (se guarda medio segundo después de teclear) */
    if (e.target.id === 'recipeNote' && state.current) {
      const id = state.current.id;
      const value = e.target.value.slice(0, 400);
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { Store.notes.set(id, { text: value }); checkAchievements(); }, 500);
    }
  });

  /* — Buscadores — */
  const wireSearch = (inputId, clearId, onInput) => {
    const input = $('#' + inputId);
    const clear = $('#' + clearId);
    input.addEventListener('input', () => {
      if (clear) clear.hidden = !input.value;
      onInput(input.value);
    });
    if (clear) clear.addEventListener('click', () => {
      input.value = '';
      clear.hidden = true;
      onInput('');
      input.focus();
    });
  };

  wireSearch('heroSearch', 'heroSearchClear', (value) => {
    state.query = value;
    const main = $('#mainSearch');
    main.value = value;
    $('#mainSearchClear').hidden = !value;
    if (value.trim().length >= 1 && state.view !== 'recipes') {
      /* Al saltar a Recetas, el campo del inicio se oculta y perdería el foco
         (en el móvil se cerraría el teclado tras la primera letra):
         le pasamos el testigo al buscador de esta vista, con el cursor al final. */
      navigate('recipes', { scroll: false });
      main.focus({ preventScroll: true });
      main.setSelectionRange(value.length, value.length);
    } else if (state.view === 'recipes') {
      renderRecipes();
    }
  });

  wireSearch('mainSearch', 'mainSearchClear', (value) => {
    state.query = value;
    $('#heroSearch').value = value;
    $('#heroSearchClear').hidden = !value;
    renderRecipes();
  });

  $('#pickSearch').addEventListener('input', (e) => renderPickList(e.target.value));

  $('#sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderRecipes(); });

  /* — Preferencias — */
  $('#themeToggle').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  $('#themeSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-set]');
    if (btn) applyTheme(btn.dataset.themeSet);
  });
  $('#soundSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sound-set]');
    if (btn) { applySound(btn.dataset.soundSet); if (btn.dataset.soundSet === 'on') beep(); }
  });
  $('#notifySeg').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-notify-set]');
    if (!btn) return;
    if (btn.dataset.notifySet === 'on') {
      const ok = await requestNotifyPermission();
      if (!ok) { applyNotify('off'); return; }
      applyNotify('on');
      toast('Te avisaremos aunque cambies de aplicación', '🔔');
    } else {
      applyNotify('off');
    }
  });
  $('#voiceSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-voice-set]');
    if (!btn) return;
    applyVoice(btn.dataset.voiceSet);
    if (btn.dataset.voiceSet === 'on') speak('Perfecto, te leeré los pasos mientras cocinas.');
    else stopSpeaking();
  });
  $('#tempSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-temp-set]');
    if (!btn) return;
    applyTempOffset(btn.dataset.tempSet);
    const offset = Number(btn.dataset.tempSet);
    toast(offset ? `Todas las recetas se mostrarán ${offset > 0 ? '+' : ''}${offset} °C` : 'Temperaturas sin ajuste', '🌡️');
  });

  $('#creditsBtn').addEventListener('click', () => {
    const ids = typeof PHOTO_CREDITS !== 'undefined' ? Object.keys(PHOTO_CREDITS) : [];
    $('#creditsBody').innerHTML = ids.length ? `
      <p class="dice__intro">
        Las fotos proceden de <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>,
        con licencia libre para uso comercial. Se acredita igualmente a cada fotógrafo.
      </p>
      <ul class="credits">
        ${ids.map(id => {
          const r = getRecipe(id), c = PHOTO_CREDITS[id];
          return `<li>
            <b>${esc(r ? r.name : 'Receta ' + id)}</b>
            <small>${esc(c.autor)} · ${esc(c.licencia)}</small>
            ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener nofollow">Ver original ↗</a>` : ''}
          </li>`;
        }).join('')}
      </ul>`
      : emptyState('📷', 'Todavía no hay fotos', 'Las recetas se muestran con su ilustración.');
    openSheet('creditsSheet');
  });

  $('#installBtn').addEventListener('click', installApp);
  $('#exportData').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());

  /* — Cuenta y sincronización — */
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#cloudIn')) { openAuth(); return; }

    if (e.target.closest('#cloudOut')) {
      const ok = await confirmAction({
        title: 'Cerrar sesión',
        text: 'Tus datos seguirán guardados en tu cuenta y en este dispositivo.',
        icon: '👋', ok: 'Cerrar sesión'
      });
      if (!ok) return;
      await Cloud.salir();
      toast('Sesión cerrada', '👋');
      refrescarTodo();
      /* Sin sesión, lo primero vuelve a ser la pantalla de entrada */
      try { sessionStorage.removeItem(SIN_CUENTA); } catch (err) {}
      mostrarBienvenida();
      return;
    }

    const tab = e.target.closest('[data-auth-tab]');
    if (tab) { authModo = tab.dataset.authTab; paintAuth(); return; }
  });

  /* Formulario de la cuenta */
  $('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#authEmail').value.trim();
    const password = $('#authPassword').value;
    if (!email) { authMensaje('Escribe tu email.'); return; }
    if (password.length < 6) { authMensaje('La contraseña debe tener al menos 6 caracteres.'); return; }

    authMensaje();
    authCargando(true, authModo === 'entrar' ? 'Entrando…' : 'Creando cuenta…');
    const res = authModo === 'entrar'
      ? await Cloud.entrar(email, password)
      : await Cloud.registrar(email, password);
    authCargando(false);

    if (!res.ok) { authMensaje(res.error); return; }

    if (res.pendienteConfirmacion) {
      authMensaje('', 'Te hemos enviado un correo para confirmar la cuenta. Ábrelo y vuelve aquí.');
      return;
    }

    closeSheet($('#authSheet'));
    $('#authPassword').value = '';
    /* Ya hay sesión: la pantalla de entrada deja de tener sentido */
    ocultarBienvenida();
    toast(authModo === 'entrar' ? '¡Hola de nuevo!' : '¡Cuenta creada!', '☁️');
    if (res.conflicto) await resolverConflicto(res.conflicto);
    else refrescarTodo();
    navigate('home', { replace: true });
  });

  /* Enlace mágico, para no tener que recordar contraseña */
  $('#authMagic').addEventListener('click', async () => {
    const email = $('#authEmail').value.trim();
    if (!email) { authMensaje('Escribe tu email arriba y vuelve a pulsar.'); return; }
    const btn = $('#authMagic');
    btn.disabled = true; btn.textContent = 'Enviando…';
    const res = await Cloud.entrarConEnlace(email);
    btn.disabled = false; btn.textContent = '✉️ Enviarme un enlace para entrar sin contraseña';
    if (res.ok) authMensaje('', 'Enlace enviado. Revisa tu correo y ábrelo en este dispositivo.');
    else authMensaje(res.error);
  });

  /* — Semana — */
  $('#weekClear').addEventListener('click', async () => {
    if (!Store.week.count()) { toast('La semana ya está vacía', 'ℹ️'); return; }
    const ok = await confirmAction({
      title: 'Vaciar la semana',
      text: 'Se eliminarán todas las recetas asignadas a los días. Esta acción no se puede deshacer.',
      icon: '📅', ok: 'Sí, vaciar'
    });
    if (ok) { Store.week.clear(); renderWeek(); $('#batchPlan').hidden = true; toast('Semana vaciada', '🗑️'); }
  });

  $('#weekSurprise').addEventListener('click', () => {
    const pool = [...RECIPES].sort(() => Math.random() - 0.5);
    let i = 0;
    DAYS.forEach(day => SLOTS.forEach(slot => Store.week.set(day.key, slot.key, pool[i++ % pool.length].id)));
    renderWeek();
    toast('¡Semana completa generada! 🎲', '🎲');
    checkAchievements();
  });

  $('#weekToShopping').addEventListener('click', () => {
    const entries = Store.week.entries();
    if (!entries.length) { toast('Primero añade recetas a tu semana', 'ℹ️'); return; }
    if (!accionUnica('semana-a-compra')) return;
    let skipped = 0;
    entries.forEach(entry => {
      const r = getRecipe(entry.id);
      if (!r) return;
      r.ingredients.forEach(ing => {
        if (!esComprable(ing.n)) return;
        if (inPantry(ing.n)) { skipped++; return; }
        Store.shopping.add(canonicalName(ing.n), ingredientQty(ing, 1), r.name);
      });
    });
    toast(`Ingredientes de ${entries.length} comidas añadidos${skipped ? ` · ${skipped} ya los tienes` : ''}`, '🛒');
    updateShopDot();
    checkAchievements();
  });

  $('#weekBatch').addEventListener('click', renderBatchPlan);
  $('#weekShare').addEventListener('click', () => {
    if (!Store.week.count()) { toast('Tu semana está vacía', 'ℹ️'); return; }
    share('Mi semana en la air fryer', weekAsText());
  });

  /* — Compra y despensa — */
  $('#addItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#addItemName').value.trim();
    const qty = $('#addItemQty').value.trim();
    if (!name) { toast('Escribe el nombre del producto', '✏️'); $('#addItemName').focus(); return; }
    Store.shopping.add(name, qty || null);
    $('#addItemName').value = '';
    $('#addItemQty').value = '';
    $('#addItemName').focus();
    renderShopping();
    toast('Producto añadido', '🛒');
    checkAchievements();
  });

  /* El buscador de la despensa filtra el catálogo; no añade nada por sí solo */
  $('#pantrySearch').addEventListener('input', (e) => {
    pantryState.query = e.target.value;
    $('#pantrySearchClear').hidden = !e.target.value;
    renderPantry();
  });
  $('#pantrySearchClear').addEventListener('click', () => {
    pantryState.query = '';
    $('#pantrySearch').value = '';
    $('#pantrySearchClear').hidden = true;
    renderPantry();
    $('#pantrySearch').focus();
  });

  $('#shopClearDone').addEventListener('click', () => {
    const done = Store.shopping.all().filter(i => i.done).length;
    if (!done) { toast('No hay productos marcados', 'ℹ️'); return; }
    Store.shopping.clearDone();
    renderShopping();
    toast(`${done} productos retirados`, '✅');
  });

  $('#shopClearAll').addEventListener('click', async () => {
    if (!Store.shopping.count()) { toast('La lista ya está vacía', 'ℹ️'); return; }
    const ok = await confirmAction({
      title: 'Borrar toda la lista',
      text: 'Se eliminarán todos los productos de tu lista de la compra.',
      icon: '🛒', ok: 'Sí, borrar'
    });
    if (ok) { Store.shopping.clear(); renderShopping(); toast('Lista vaciada', '🗑️'); }
  });

  $('#shopCopy').addEventListener('click', () => {
    if (!Store.shopping.count()) { toast('La lista está vacía', 'ℹ️'); return; }
    copyToClipboard(shoppingAsText());
  });

  $('#shopShare').addEventListener('click', () => {
    if (!Store.shopping.count()) { toast('La lista está vacía', 'ℹ️'); return; }
    share('Lista de la compra', shoppingAsText());
  });

  /* — Borrado total —
     Con sesión iniciada hay dos copias, así que hay que preguntar cuál se
     borra: antes se borraba la local y la subida automática se llevaba por
     delante la de la nube unos segundos después, sin avisar. */
  $('#wipeData').addEventListener('click', async () => {
    const conectado = Cloud.estado().estado === 'conectado';
    const queSeBorra = 'Se eliminarán favoritos, historial, logros, notas, despensa, ' +
                       'plan semanal, lista de la compra y tu perfil (nombre y avatar). ' +
                       'Las recetas y los ajustes de la aplicación no se tocan.';
    let tambienLaNube = false;

    if (conectado) {
      const eleccion = await chooseAction({
        title: 'Borrar mis datos',
        icon: '🗑️',
        text: `${queSeBorra}\n\nTienes la sesión iniciada: elige qué copia quieres borrar.`,
        options: [
          { key: 'local', label: '📱 Solo en este dispositivo', tone: 'ghost' },
          { key: 'todo', label: '🗑️ En este dispositivo y en mi cuenta', tone: 'danger' }
        ],
        cancel: 'Cancelar (no borrar nada)'
      });
      if (!eleccion) return;
      tambienLaNube = eleccion === 'todo';
    } else {
      const ok = await confirmAction({
        title: 'Borrar todos mis datos',
        text: queSeBorra + ' No se puede deshacer.',
        icon: '🗑️', ok: 'Sí, borrar todo'
      });
      if (!ok) return;
    }

    /* Se vacía en local sin disparar la subida automática */
    Store.wipeUserData();

    if (tambienLaNube) {
      const res = await Cloud.subir({ forzar: true });   // sube el vacío a propósito
      toast(res.ok ? 'Datos borrados aquí y en tu cuenta' : 'Borrado aquí, pero la cuenta no se ha podido actualizar',
            res.ok ? '🗑️' : '⚠️');
    } else if (conectado) {
      toast('Borrado solo en este dispositivo. Tu cuenta conserva la copia', '📱');
    }

    clearFilters();
    state.query = '';
    state.have = [];
    $('#mainSearch').value = '';
    $('#heroSearch').value = '';
    /* Se reaplican los ajustes que wipeUserData ha conservado, no valores
       fijos: si se forzaran aquí, volverían a escribirse y la subida
       automática acabaría llevando el vacío a la nube igualmente. */
    applyTheme(Store.prefs.get('theme'));
    applySound(Store.prefs.get('sound'));
    applyVoice(Store.prefs.get('voice'));
    applyNotify(Store.prefs.get('notify'));
    applyTempOffset(Store.prefs.get('tempOffset'));
    renderProfile();
    renderShopping();
    renderPantry();
    updateShopDot();
    if (!conectado) toast('Todos tus datos han sido borrados', '🗑️');
  });

  /* — Teclado — */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      /* Los diálogos se cierran solos con su propio manejador */
      if (!$('#confirmBox').hidden || !$('#choiceBox').hidden) return;
      if (!$('#cookMode').hidden) { exitCooking(); return; }
      const open = $$('.sheet.is-open').pop();
      if (open) closeSheet(open);
      return;
    }
    if (!$('#cookMode').hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = state.cook.step + delta;
      if (next >= 0 && next < state.cook.recipe.steps.length) { state.cook.step = next; renderCookStep(); }
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.matches('.card')) {
      e.preventDefault();
      openRecipe(document.activeElement.dataset.recipe);
    }
  });

  /* — Botón «atrás» —
     El orden importa: primero se deshace lo que esté por encima (modo cocinar
     o panel abierto) y solo cuando no queda nada encima se cambia de vista.
     Así el gesto de volver atrás del móvil hace lo que se espera en vez de
     cerrar la aplicación. */
  window.addEventListener('popstate', () => {
    if (hayTokenEnLaUrl()) return;   // no es navegación, es la vuelta del correo

    /* Este retroceso lo hemos provocado nosotros al cerrar un panel: el cierre
       ya está hecho y no hay que tocar lo que haya debajo. */
    if (retrocesoProgramado) { retrocesoProgramado = false; return; }

    /* Los diálogos se cierran solos con su propio manejador */
    if (!$('#confirmBox').hidden || !$('#choiceBox').hidden) return;

    if (!$('#cookMode').hidden) { exitCooking({ desdeHistorial: true }); return; }

    const panelAbierto = $$('.sheet.is-open').pop();
    if (panelAbierto) { closeSheet(panelAbierto, { desdeHistorial: true }); return; }

    const view = location.hash.replace('#', '') || 'home';
    if (VIEWS.includes(view) && view !== state.view) navigate(view, { desdeHistorial: true, scroll: false });
  });

  /* Cambiar el hash a mano (o abrir un acceso directo del manifest con la
     aplicación ya abierta) no siempre dispara popstate. Si popstate ya lo
     ha atendido, aquí la vista coincidirá y no se hará nada. */
  window.addEventListener('hashchange', () => {
    if (hayTokenEnLaUrl()) return;
    const view = location.hash.replace('#', '');
    if (VIEWS.includes(view) && view !== state.view) navigate(view, { desdeHistorial: true, scroll: false });
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.installPrompt = e;
    refreshInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    state.installPrompt = null;
    refreshInstallButton();
    toast('¡AirChef instalada en tu dispositivo! 📲', '📲');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !$('#cookMode').hidden) requestWakeLock();
  });

  /* El navegador ha rechazado guardar (almacenamiento lleno o bloqueado).
     Se avisa una sola vez para no atosigar. */
  let avisadoAlmacenamiento = false;
  window.addEventListener('airfryer:storagefull', () => {
    if (avisadoAlmacenamiento) return;
    avisadoAlmacenamiento = true;
    toast('No se ha podido guardar: el almacenamiento del navegador está lleno', '⚠️');
  });
}

/* ══════════════ 15. CUENTA Y SINCRONIZACIÓN ══════════════ */

/** Tarjeta de cuenta dentro de "Mi progreso". Cambia según el estado. */
/* ══════════════ BIENVENIDA ══════════════
   Solo la primera vez, y sin encerrar a nadie: se puede entrar sin cuenta.
   Obligar al login dejaría la aplicación inservible sin conexión, que es
   justo donde más se usa. */

/**
 * ¿Hay una sesión guardada en este navegador?
 *
 * Se mira directamente el almacenamiento de Supabase porque hace falta
 * saberlo **sin esperar a la red**: si se espera, la aplicación se ve un
 * instante y la bienvenida aparece encima después, que era justo el
 * parpadeo que se veía al abrir.
 */
function hayIndicioDeSesion() {
  try {
    return Object.keys(localStorage).some(k => k.startsWith('sb-') && k.includes('auth-token'));
  } catch (e) { return false; }
}

/** ¿Es la primera vez que se abre? Se decide sin consultar a la nube. */
function esPrimerUso() {
  return !Store.prefs.get('welcomed') && !Store.hasData() && !hayIndicioDeSesion();
}

/* Quien elige entrar sin cuenta no vuelve a ver la pantalla mientras siga
   con la aplicación abierta. Al cerrarla y volver, se le pregunta otra vez. */
const SIN_CUENTA = 'airfryer:sinCuentaEstaSesion';
const eligioSinCuenta = () => {
  try { return !!sessionStorage.getItem(SIN_CUENTA); } catch (e) { return false; }
};

/**
 * Primero se mira si hay sesión: si la hay se va directo al inicio, y si no,
 * lo primero que se ve es la pantalla de entrada.
 * Todo se decide sin esperar a la red, mirando si Supabase tiene una sesión
 * guardada en este navegador.
 */
function hayQuePedirEntrar() {
  if (!Cloud.configurado()) return false;   // sin cuenta configurada no aplica
  if (hayIndicioDeSesion()) return false;   // ya está dentro: al inicio
  return !eligioSinCuenta();
}

function mostrarBienvenida() {
  if (!hayQuePedirEntrar()) return;
  if (Cloud.estado().estado === 'conectado') return;

  const el = $('#welcome');
  if (!el) return;
  if (!Cloud.configurado()) {
    $('#welcomeSignup').hidden = true;
    $('#welcomeLogin').hidden = true;
    $('#welcomeSkip').textContent = 'Empezar a cocinar →';
  }

  /* Quien ya ha usado la aplicación no necesita que le den la bienvenida
     otra vez: lo que quiere es entrar. */
  if (!esPrimerUso()) {
    $('#welcomeTitulo').innerHTML = 'Entra en <span>AirChef</span>';
    $('#welcomeSub').textContent = 'Entra con tu cuenta para tener tus recetas y tu progreso en todos tus dispositivos.';
    $('#welcomeLogin').textContent = 'Entrar';
    $('#welcomeSignup').textContent = 'Crear una cuenta';
    $('#welcomePuntos').hidden = true;
    /* El botón principal pasa a ser "Entrar" */
    $('#welcomeLogin').classList.add('btn--primary');
    $('#welcomeLogin').classList.remove('btn--ghost');
    $('#welcomeSignup').classList.add('btn--ghost');
    $('#welcomeSignup').classList.remove('btn--primary');
    $('#welcomeLogin').style.order = '-1';        // "Entrar" arriba del todo
  }
  el.hidden = false;
  /* rAF más temporizador de respaldo: si la pestaña no está componiendo,
     rAF no llega a ejecutarse y el panel se quedaría invisible. */
  const mostrar = () => el.classList.add('is-in');
  requestAnimationFrame(mostrar);
  setTimeout(mostrar, 80);
}

function cerrarBienvenida() {
  const el = $('#welcome');
  if (!el || el.hidden) return;
  Store.prefs.set('welcomed', true);
  el.classList.remove('is-in');
  setTimeout(() => { el.hidden = true; }, 320);
}

/** Retirada inmediata, sin animación: se usa cuando resulta que sí hay sesión. */
function ocultarBienvenida() {
  const el = $('#welcome');
  if (!el || el.hidden) return;
  el.classList.remove('is-in');
  el.hidden = true;
  Store.prefs.set('welcomed', true);
}

/* ══════════════ TU PERFIL: NOMBRE Y AVATAR ══════════════ */

const AVATARES = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🍗', '🥑', '🌶️', '🍕', '🧁', '🥕', '🐔', '🔥', '🥇'];

const COLORES_AVATAR = [
  { key: 'naranja',  label: 'Naranja',  color: '#FF6B2C' },
  { key: 'verde',    label: 'Verde',    color: '#2FA36B' },
  { key: 'azul',     label: 'Azul',     color: '#3C7DD9' },
  { key: 'morado',   label: 'Morado',   color: '#8557D3' },
  { key: 'rosa',     label: 'Rosa',     color: '#DB4C8C' },
  { key: 'ocre',     label: 'Ocre',     color: '#B8860B' }
];

const colorAvatar = (key) =>
  (COLORES_AVATAR.find(c => c.key === key) || COLORES_AVATAR[0]).color;

const miPerfil = () => ({
  name: Store.prefs.get('name') || '',
  avatar: Store.prefs.get('avatar') || '🧑‍🍳',
  color: colorAvatar(Store.prefs.get('avatarColor'))
});

/** El avatar se dibuja igual en la cabecera, en la barra y en la bienvenida. */
function avatarHTML(size = 'md') {
  const { avatar, color } = miPerfil();
  return `<span class="avatar avatar--${size}" style="--av: ${color}">${avatar}</span>`;
}

function renderMeCard() {
  const box = $('#meCard');
  if (!box) return;
  const { name } = miPerfil();
  const s = Cloud.estado();

  box.innerHTML = `
    ${avatarHTML('lg')}
    <div class="me__txt">
      <h1 class="me__name">${name ? esc(name) : 'Mi progreso'}</h1>
      <p class="me__sub">${s.estado === 'conectado'
        ? '☁️ Guardado en tu cuenta'
        : '📱 Solo en este dispositivo'}</p>
    </div>
    <button class="btn btn--ghost btn--sm" id="meEdit">✏️ Editar</button>`;

  /* El mismo avatar, en la pestaña del móvil */
  const tab = $('.tabbar__btn[data-nav="profile"] span');
  if (tab) tab.textContent = miPerfil().avatar;
}

/* Lo que se está editando en el modal, sin tocar aún lo guardado */
let meDraft = null;

function renderMeBody() {
  const d = meDraft;
  $('#meBody').innerHTML = `
    <div class="me__preview">
      <span class="avatar avatar--lg" style="--av: ${colorAvatar(d.color)}">${d.avatar}</span>
      <b>${d.name ? esc(d.name) : 'Sin nombre'}</b>
    </div>

    <div class="filter-group">
      <h4>Tu nombre</h4>
      <input type="text" id="meName" class="textfield" maxlength="24" value="${esc(d.name)}"
             placeholder="¿Cómo te llamamos?" autocomplete="off" aria-label="Tu nombre">
      <p class="textfield__hint">Se usa para saludarte en el inicio. Puedes dejarlo vacío.</p>
    </div>

    <div class="filter-group">
      <h4>Tu avatar</h4>
      <div class="chips">
        ${AVATARES.map(a => `
          <button class="avpick ${a === d.avatar ? 'is-on' : ''}" data-av="${a}"
                  aria-label="Avatar ${a}" aria-pressed="${a === d.avatar}">${a}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group">
      <h4>Color</h4>
      <div class="chips">
        ${COLORES_AVATAR.map(c => `
          <button class="avcolor ${c.key === d.color ? 'is-on' : ''}" data-avcolor="${c.key}"
                  style="--av: ${c.color}" aria-label="${c.label}" aria-pressed="${c.key === d.color}"></button>`).join('')}
      </div>
    </div>`;
}

function openMeSheet() {
  meDraft = {
    name: Store.prefs.get('name') || '',
    avatar: Store.prefs.get('avatar') || '🧑‍🍳',
    color: Store.prefs.get('avatarColor') || 'naranja'
  };
  renderMeBody();
  openSheet('meSheet');
}

function saveMeSheet() {
  const input = $('#meName');
  const name = (input ? input.value : meDraft.name).trim().slice(0, 24);
  Store.prefs.set('name', name);
  Store.prefs.set('avatar', meDraft.avatar);
  Store.prefs.set('avatarColor', meDraft.color);
  closeSheet($('#meSheet'));
  renderMeCard();
  renderHome();
  toast(name ? `¡Hecho, ${name}!` : 'Perfil actualizado', meDraft.avatar);
}

/**
 * Texto del estado de sincronización.
 *
 * Ya no hay botones de "Sincronizar" ni "Traer de la nube": teniendo base de
 * datos, eso debe ocurrir solo. Lo único que hace falta es que se vea qué
 * está pasando.
 */
function estadoSync(s) {
  if (!navigator.onLine) return '📴 Sin conexión · se guardará al volver';
  if (s.subiendo) return '⏳ Guardando…';
  if (s.conflictoPendiente) return '⚠️ Hay que decidir qué copia conservar';
  if (s.ultimaSync) return '✅ Guardado ' + formatDate(s.ultimaSync).toLowerCase();
  return '✅ Tus datos se guardan solos';
}

function renderAccount() {
  const caja = $('#accountCard');
  if (!caja) return;
  const s = Cloud.estado();

  if (!s.configurado) {
    caja.innerHTML = `
      <div class="account__card account__card--off">
        <span class="account__icon">📱</span>
        <div class="account__txt">
          <b>Tus datos están solo en este dispositivo</b>
          <small>Para tenerlos también en el móvil, configura tu cuenta gratuita
                 siguiendo los pasos del archivo <code>README.md</code>.</small>
        </div>
      </div>`;
    return;
  }

  if (s.estado === 'conectado') {
    caja.innerHTML = `
      <div class="account__card account__card--on">
        <span class="account__icon">☁️</span>
        <div class="account__txt">
          <b>${esc(s.email || 'Sesión iniciada')}</b>
          <small class="account__estado">${estadoSync(s)}</small>
        </div>
        <div class="account__actions">
          <button class="btn btn--danger-ghost btn--sm" id="cloudOut">Cerrar sesión</button>
        </div>
      </div>`;
    return;
  }

  if (s.estado === 'error') {
    caja.innerHTML = `
      <div class="account__card account__card--off">
        <span class="account__icon">⚠️</span>
        <div class="account__txt">
          <b>No se ha podido conectar</b>
          <small>Revisa las claves de <code>js/supabase-config.js</code> o tu conexión.
                 Mientras tanto, todo se guarda en este dispositivo.</small>
        </div>
      </div>`;
    return;
  }

  caja.innerHTML = `
    <div class="account__card">
      <span class="account__icon">☁️</span>
      <div class="account__txt">
        <b>Sincroniza tus datos</b>
        <small>Entra con tu cuenta y ten las mismas recetas, semana y progreso
               en el ordenador y en el móvil.</small>
      </div>
      <div class="account__actions">
        <button class="btn btn--primary btn--sm" id="cloudIn">Iniciar sesión</button>
      </div>
    </div>`;
}

/* Estado del formulario de la cuenta: 'entrar' o 'crear' */
let authModo = 'entrar';

function openAuth({ sobreBienvenida = false } = {}) {
  authModo = 'entrar';
  paintAuth();
  /* Sobre la pantalla de entrada hace falta más altura de apilado que ella */
  $('#authSheet').classList.toggle('sheet--sobre-bienvenida', sobreBienvenida);
  openSheet('authSheet');
}

function paintAuth() {
  $$('#authTabs button').forEach(b => b.classList.toggle('is-active', b.dataset.authTab === authModo));
  $('#authSubmit').textContent = authModo === 'entrar' ? 'Entrar' : 'Crear mi cuenta';
  $('#authPassword').setAttribute('autocomplete', authModo === 'entrar' ? 'current-password' : 'new-password');
  $('#authIntro').textContent = authModo === 'entrar'
    ? 'Entra para recuperar tus recetas, tu semana y tu progreso en este dispositivo.'
    : 'Crea una cuenta y lo que ya tienes guardado aquí se subirá tal cual.';
  authMensaje();
}

function authMensaje(error = '', ok = '') {
  const e = $('#authError'), o = $('#authOk');
  e.hidden = !error; e.textContent = error;
  o.hidden = !ok; o.textContent = ok;
}

function authCargando(cargando, texto = '') {
  const btn = $('#authSubmit');
  btn.disabled = cargando;
  btn.textContent = cargando ? (texto || 'Un momento…')
    : (authModo === 'entrar' ? 'Entrar' : 'Crear mi cuenta');
}

/**
 * Cuando hay datos en el dispositivo y en la nube, decide el usuario.
 * Las dos opciones son destructivas, así que ninguna puede ser la de por
 * defecto: cerrar el diálogo deja las dos copias intactas.
 */
async function resolverConflicto(info) {
  const cuando = (t) => t ? formatDate(t).toLowerCase() : 'fecha desconocida';
  const masNuevo = info.nubeFecha > info.localFecha ? 'en tu cuenta' : 'en este dispositivo';

  const eleccion = await chooseAction({
    title: '¿Qué datos conservamos?',
    icon: '🔀',
    text: `Hay datos guardados en los dos sitios y solo puede quedar uno.\n` +
          `· En tu cuenta: ${cuando(info.nubeFecha)}\n` +
          `· En este dispositivo: ${cuando(info.localFecha)}\n` +
          `Los más recientes están ${masNuevo}.`,
    options: [
      { key: 'bajar', label: '⬇️ Quedarme con los de mi cuenta' },
      { key: 'subir', label: '⬆️ Quedarme con los de este dispositivo', tone: 'ghost' }
    ],
    cancel: 'Ahora no (no cambiar nada)'
  });

  if (eleccion === 'bajar') {
    const res = await Cloud.bajar();
    if (res.ok) { refrescarTodo(); toast('Datos recuperados de tu cuenta', '☁️'); }
    else toast(res.error || 'No se han podido traer los datos', '⚠️');
    return;
  }
  if (eleccion === 'subir') {
    /* El usuario ha pedido que su versión sustituya a la de la nube */
    const res = await Cloud.subir({ forzar: true });
    toast(res.ok ? 'Se han subido los datos de este dispositivo' : (res.error || 'No se han podido subir'),
          res.ok ? '☁️' : '⚠️');
    return;
  }
  /* Sin elección: no se toca nada, ni aquí ni en la nube */
  toast('No se ha cambiado nada. Puedes decidirlo desde tu perfil', 'ℹ️');
}

/** Repinta la vista actual tras un cambio grande de datos. */
function refrescarTodo() {
  applyTheme(Store.prefs.get('theme') || 'light');
  applySound(Store.prefs.get('sound') || 'on');
  applyVoice(Store.prefs.get('voice') || 'off');
  applyNotify(Store.prefs.get('notify') || 'off');
  applyTempOffset(Store.prefs.get('tempOffset') || 0);
  navigate(state.view, { replace: true });   // repintar no es navegar
  updateShopDot();
}

/** En pantallas estrechas el texto largo del buscador se cortaba a media frase. */
function adaptPlaceholders() {
  const corto = window.innerWidth <= 620;
  const texto = corto ? 'Busca receta o ingrediente…' : 'Busca una receta, ingrediente o plato…';
  ['heroSearch', 'mainSearch'].forEach(id => {
    const el = $('#' + id);
    if (el) el.placeholder = texto;
  });
  const item = $('#addItemName');
  if (item) item.placeholder = corto ? 'Añadir producto…' : 'Añadir producto…';
}

/** Sincroniza todos los botones de favorito de una receta tras un cambio. */
function refreshFavButtons(id) {
  const on = Store.favorites.has(id);
  $$(`[data-fav="${id}"]`).forEach(btn => {
    btn.classList.toggle('is-on', on);
    btn.textContent = on ? '❤️' : '🤍';
    btn.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Añadir a favoritos');
  });
}

/* ══════════════ ARRANQUE ══════════════ */

/**
 * Última red de seguridad: si el arranque revienta, se quita el splash y se
 * ofrece una salida. Antes, cualquier excepción en init() dejaba la pantalla
 * de carga puesta para siempre y sin forma de borrar los datos culpables.
 */
function rescate(error) {
  console.error('AirChef no ha podido arrancar:', error);
  try {
    const splash = $('#splash');
    if (splash) splash.remove();
    document.body.classList.remove('no-scroll');
    const caja = $('#rescue');
    if (!caja) { location.reload(); return; }
    const detalle = $('#rescueError');
    if (detalle) detalle.textContent = (error && (error.stack || error.message)) || String(error);
    caja.hidden = false;

    $('#rescueReload').addEventListener('click', () => location.reload());
    $('#rescueRepair').addEventListener('click', () => {
      try { Store.wipe(); } catch (e) { /* si ni eso funciona, se limpia a lo bruto */ }
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('airfryer:'))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) {}
      location.reload();
    });
  } catch (e) {
    /* Si hasta el rescate falla, al menos que no quede una pantalla muerta */
    document.documentElement.innerHTML =
      '<body style="font-family:sans-serif;padding:32px;text-align:center">' +
      '<h1>AirChef</h1><p>No se ha podido abrir la aplicación.</p>' +
      '<p><a href="?reset=1">Reiniciar</a></p></body>';
  }
}

/* Permite reparar desde la URL aunque la pantalla no llegue a pintarse */
if (typeof location !== 'undefined' && /[?&]reset=1/.test(location.search)) {
  try {
    Object.keys(localStorage).filter(k => k.startsWith('airfryer:')).forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  history.replaceState(null, '', location.pathname);
}

function init() {
  applyTheme(Store.prefs.get('theme') || 'light');
  applySound(Store.prefs.get('sound') || 'on');
  applyVoice(Store.prefs.get('voice') || 'off');
  applyNotify(Store.prefs.get('notify') || 'off');
  applyTempOffset(Store.prefs.get('tempOffset') || 0);

  $('#popularGrid').innerHTML = skeletons(8);
  $('#recipesGrid').innerHTML = skeletons(8);

  bindEvents();

  /* Al volver del correo de confirmación, la URL trae #access_token=...
     Se respeta el hash hasta que la capa de nube lo procese. */
  const hashDelCorreo = hayTokenEnLaUrl() ? location.hash : '';
  const vieneDelCorreo = !!hashDelCorreo;
  const initial = vieneDelCorreo ? 'home' : location.hash.replace('#', '');
  /* La primera vista sustituye la entrada actual: si apilara una nueva, el
     primer «atrás» se quedaría dentro de la aplicación sin poder salir. */
  navigate(VIEWS.includes(initial) ? initial : 'home', { scroll: false, keepHash: vieneDelCorreo, replace: true });

  renderRecipes();
  renderPantry();
  updateShopDot();
  checkAchievements();
  adaptPlaceholders();
  window.addEventListener('resize', adaptPlaceholders);

  clearTimeout(window.__airfryerGuard);   // el arranque ha llegado hasta aquí

  /* La bienvenida se monta AHORA, todavía por debajo del splash (z-index 200
     contra 120). Así, al desvanecerse el splash, ya está puesta y no se ve un
     instante la aplicación antes de que aparezca. */
  mostrarBienvenida();

  setTimeout(() => {
    const splash = $('#splash');
    if (!splash) return;
    splash.classList.add('is-out');
    setTimeout(() => splash.remove(), 500);
  }, 650);


  registerServiceWorker();

  /* Cuenta en la nube: opcional. Si no hay claves, no hace nada. */
  /* Un conflicto detectado al arrancar deja la subida automática en pausa:
     hay que preguntar, o el usuario se quedaría sin sincronizar sin saberlo. */
  let resolviendoConflicto = false;
  Cloud.alCambiar(() => {
    if (state.view === 'profile') renderAccount();
    const info = Cloud.conflictoInicial && Cloud.conflictoInicial();
    if (info && !resolviendoConflicto) {
      resolviendoConflicto = true;
      Cloud.olvidarConflictoInicial();
      Promise.resolve(resolverConflicto(info)).finally(() => { resolviendoConflicto = false; });
    }
  });
  Cloud.init().then(() => {
    const s = Cloud.estado();
    /* Si resulta que sí había sesión, la bienvenida sobra: se retira sin más */
    if (s.estado === 'conectado') { ocultarBienvenida(); return seguirTrasCorreo(); }

    /* Y al revés: había rastro de sesión pero ya no vale (caducada o cerrada
       desde otro sitio). Entonces sí hay que pedir entrar. */
    if (s.estado === 'sin-sesion' && !vieneDelCorreo) mostrarBienvenida();
    return seguirTrasCorreo();
  }).catch(err => {
    /* La nube es opcional: si falla, la aplicación local debe seguir viva */
    console.warn('La sincronización no ha podido arrancar:', err);
  });

  function seguirTrasCorreo() {

    if (!vieneDelCorreo) return;
    /* Se lee la copia guardada al arrancar: Supabase ya ha borrado el hash real. */
    const error = /error_description=([^&]*)/.exec(hashDelCorreo);
    history.replaceState(null, '', location.pathname + location.search + '#home');
    if (error) {
      const motivo = Cloud.traducir(decodeURIComponent(error[1].replace(/\+/g, ' ')));
      console.warn('[cuenta] el enlace del correo no ha servido:', motivo);
      toast(motivo, '⚠️');
      return;
    }
    if (Cloud.estado().estado === 'conectado') {
      console.info('[cuenta] sesión iniciada desde el enlace del correo');
      toast('¡Cuenta confirmada! Ya estás dentro 🎉', '☁️');
      refrescarTodo();
      navigate('home', { replace: true });
    }
  }

  console.log(`🍗 AirChef · ${RECIPE_COUNT} recetas cargadas · almacenamiento ${Store.isAvailable() ? 'activo' : 'no disponible'}`);
}

/** Permite usar la aplicación sin conexión. Solo funciona sobre http(s). */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(vigilarActualizaciones)
      .catch(err => console.warn('No se ha podido activar el modo sin conexión:', err.message));
  });
}

/**
 * Avisa cuando hay una versión nueva instalada.
 *
 * Al publicar cambios, la copia guardada se sirve primero y la nueva se
 * descarga por detrás: sin este aviso el usuario seguía viendo la versión
 * anterior sin saber que había otra lista, a veces durante días.
 */
function vigilarActualizaciones(reg) {
  if (!reg) return;

  const proponerRecarga = () => {
    /* Recargar en mitad de una receta sería muy molesto */
    if (!$('#cookMode').hidden) return;
    if ($('#avisoVersion')) return;
    const aviso = document.createElement('div');
    aviso.className = 'update-bar';
    aviso.id = 'avisoVersion';
    aviso.innerHTML = `
      <span>Hay una versión nueva de AirChef</span>
      <button class="btn btn--primary btn--sm" id="recargarVersion">Actualizar</button>
      <button class="icon-btn icon-btn--sm" id="cerrarAvisoVersion" aria-label="Ahora no">✕</button>`;
    document.body.appendChild(aviso);
    requestAnimationFrame(() => aviso.classList.add('is-in'));
    $('#recargarVersion').addEventListener('click', () => {
      const esperando = reg.waiting;
      if (!esperando) { location.reload(); return; }
      /* Se pide el relevo y se recarga cuando la versión nueva toma el mando */
      let recargado = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargado) return;
        recargado = true;
        location.reload();
      });
      esperando.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => { if (!recargado) { recargado = true; location.reload(); } }, 2000);
    });
    $('#cerrarAvisoVersion').addEventListener('click', () => aviso.remove());
  };

  /* Ya había una versión esperando cuando abrimos */
  if (reg.waiting && navigator.serviceWorker.controller) proponerRecarga();

  reg.addEventListener('updatefound', () => {
    const nuevo = reg.installing;
    if (!nuevo) return;
    nuevo.addEventListener('statechange', () => {
      /* "installed" con un controlador ya presente = actualización, no primera visita */
      if (nuevo.state === 'installed' && navigator.serviceWorker.controller) proponerRecarga();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try { init(); }
  catch (e) { rescate(e); }
});
