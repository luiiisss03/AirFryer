/* ============================================================
   AirChef · Capa de persistencia (localStorage)
   ------------------------------------------------------------
   Único punto de acceso al almacenamiento del navegador.
   Toda lectura/escritura pasa por aquí para evitar duplicar
   claves y parseos por la aplicación.

   Modelos guardados
   -----------------
   favorites    [12, 4, 33]
   history      [{ id, at, day }]
   week         { lun: { comida: 12, cena: 30 } }
   shopping     [{ id, name, parts:[{a,u}], texts:[], from:[], done }]
   pantry       ['sal', 'aceite de oliva']
   notes        { 12: { rating: 4, text: '2 minutos menos' } }
   prefs        { theme, sound, voice, tempOffset }
   achievements ['first', 'cook5']
   checks       { 12: [0, 3] }
   ============================================================ */

const Store = (() => {
  const PREFIX = 'airfryer:';

  const KEYS = {
    favorites: PREFIX + 'favorites',
    history: PREFIX + 'history',
    week: PREFIX + 'week',
    shopping: PREFIX + 'shopping',
    pantry: PREFIX + 'pantry',
    notes: PREFIX + 'notes',
    prefs: PREFIX + 'prefs',
    achievements: PREFIX + 'achievements',
    checks: PREFIX + 'checks'
  };

  const DEFAULTS = {
    favorites: [],
    history: [],
    week: {},
    shopping: [],
    pantry: [],
    notes: {},
    prefs: {
      theme: 'light', sound: 'on', voice: 'off', notify: 'off', tempOffset: 0,
      /* Perfil: viajan con el resto de datos, así que el avatar y el nombre
         aparecen igual en el móvil y en el ordenador. */
      name: '', avatar: '🧑‍🍳', avatarColor: 'naranja'
    },
    achievements: [],
    checks: {}
  };

  /* ─────────────── Validación de la forma de los datos ───────────────
     Que un texto sea JSON válido no significa que sirva: un objeto donde se
     espera una lista rompía la aplicación entera al arrancar. Cada clave
     declara aquí qué forma admite y cómo se limpia su contenido.
     Lo usan tanto la lectura como la importación (archivo y nube). */

  const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  /* Number() convierte demasiadas cosas en 0: null, '', [] y [0] valen todos
     cero. Si no se filtran, un hueco vacío acaba apuntando a la receta 0.
     Solo se admiten números y cadenas numéricas. */
  const esNum = (v) => (typeof v === 'number' || typeof v === 'string') &&
                       String(v).trim() !== '' && Number.isFinite(Number(v));
  /* Identificador de receta: entero positivo dentro de un rango razonable */
  const esId = (v) => esNum(v) && Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) < 1e6;
  /* Posición de un ingrediente dentro de su receta */
  const esIndice = (v) => esNum(v) && Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) < 1000;

  /* Un producto de la despensa vacío o de una sola letra casaba con cualquier
     ingrediente y dejaba la lista de la compra en blanco. */
  const PANTRY_MIN = 2;

  const SHAPES = {
    favorites: {
      tipo: 'lista',
      limpia: (v) => [...new Set(v.filter(esId).map(Number))]
    },
    history: {
      tipo: 'lista',
      limpia: (v) => v.filter(e => esObjeto(e) && esId(e.id)).map(e => ({
        id: Number(e.id),
        at: esNum(e.at) ? Number(e.at) : Date.now(),
        day: typeof e.day === 'string' && e.day ? e.day : todayKey(new Date(esNum(e.at) ? Number(e.at) : Date.now()))
      }))
    },
    week: {
      tipo: 'mapa',
      limpia: (v) => {
        const out = {};
        Object.entries(v).forEach(([day, valor]) => {
          if (esId(valor)) { out[day] = { comida: Number(valor) }; return; }   // formato antiguo
          if (!esObjeto(valor)) return;
          const slots = {};
          /* Literal a propósito: SLOTS se declara más abajo y no conviene
             que la validación dependa del orden del archivo. */
          ['comida', 'cena'].forEach(s => { if (esId(valor[s])) slots[s] = Number(valor[s]); });
          if (Object.keys(slots).length) out[day] = slots;
        });
        return out;
      }
    },
    shopping: {
      tipo: 'lista',
      limpia: (v) => v.filter(i => esObjeto(i) && typeof i.name === 'string' && i.name.trim()).map(i => {
        const item = {
          id: typeof i.id === 'string' && i.id ? i.id : uid(),
          name: i.name.trim(),
          texts: Array.isArray(i.texts) ? i.texts.filter(t => typeof t === 'string') : [],
          from: Array.isArray(i.from) ? i.from.filter(f => typeof f === 'string')
                  : (typeof i.from === 'string' && i.from ? [i.from] : []),
          done: !!i.done
        };
        /* Si no trae `parts` se deja sin poner a propósito: así shopping.all()
           reconoce el formato antiguo y migra la cantidad de `qty`. */
        if (Array.isArray(i.parts)) {
          item.parts = i.parts.filter(p => esObjeto(p) && esNum(p.a))
            .map(p => ({ a: Number(p.a), u: typeof p.u === 'string' && p.u ? p.u : 'ud' }));
        } else if (typeof i.qty === 'string') {
          item.qty = i.qty;
        } else {
          item.parts = [];
        }
        return item;
      })
    },
    pantry: {
      tipo: 'lista',
      limpia: (v) => [...new Set(
        v.filter(p => typeof p === 'string' && p.trim().length >= PANTRY_MIN).map(p => p.trim())
      )]
    },
    notes: {
      tipo: 'mapa',
      limpia: (v) => {
        const out = {};
        Object.entries(v).forEach(([id, n]) => {
          if (!esObjeto(n)) return;
          const rating = esNum(n.rating) ? Math.min(5, Math.max(0, Math.round(Number(n.rating)))) : 0;
          const text = typeof n.text === 'string' ? n.text.slice(0, 400) : '';
          if (rating || text) out[id] = { rating, text };
        });
        return out;
      }
    },
    prefs: {
      tipo: 'mapa',
      limpia: (v) => {
        const out = {};
        Object.entries(v).forEach(([k, valor]) => {
          if (valor === null || typeof valor === 'object') return;   // nunca objetos sueltos
          out[k] = valor;
        });
        /* Los que se pintan en pantalla tienen que ser texto sí o sí */
        ['name', 'avatar', 'avatarColor', 'theme', 'sound', 'voice', 'notify'].forEach(k => {
          if (k in out) out[k] = String(out[k]);
        });
        if ('tempOffset' in out) out.tempOffset = esNum(out.tempOffset) ? Number(out.tempOffset) : 0;
        if ('name' in out) out.name = out.name.slice(0, 24);
        return out;
      }
    },
    achievements: {
      tipo: 'lista',
      limpia: (v) => [...new Set(v.filter(k => typeof k === 'string' && k))]
    },
    checks: {
      tipo: 'mapa',
      limpia: (v) => {
        const out = {};
        Object.entries(v).forEach(([id, lista]) => {
          if (!Array.isArray(lista)) return;
          const nums = [...new Set(lista.filter(esIndice).map(Number))];
          if (nums.length) out[id] = nums;
        });
        return out;
      }
    }
  };

  /**
   * Devuelve el valor saneado, o `null` si la forma no es recuperable.
   * `nombre` es la clave corta ('favorites', 'week'…).
   */
  function sanear(nombre, valor) {
    const shape = SHAPES[nombre];
    if (!shape) return null;
    const formaOk = shape.tipo === 'lista' ? Array.isArray(valor) : esObjeto(valor);
    if (!formaOk) return null;
    try {
      return shape.limpia(valor);
    } catch (e) {
      console.warn('No se ha podido limpiar', nombre, e);
      return null;
    }
  }

  /* De 'airfryer:favorites' a 'favorites' */
  const nombreDeClave = (key) => String(key).slice(PREFIX.length);

  let available = true;
  try {
    const probe = PREFIX + 'probe';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch (e) {
    available = false;
    console.warn('localStorage no disponible: los datos no se guardarán entre sesiones.');
  }

  /* ─────────────── Dónde vive cada cosa ───────────────
     La copia buena de los datos de la cuenta está en la nube. Aquí NO se
     guardan en el navegador: solo se mantienen en memoria mientras la
     aplicación está abierta, se llenan al entrar y se suben al cambiar.

     En el navegador quedan únicamente los ajustes de este aparato (tema,
     sonido, voz, avisos y corrección de temperatura), que no son datos de
     la cuenta y deben respetarse aunque entre otra persona. */

  const CLAVES_DE_CUENTA = new Set([
    'favorites', 'history', 'week', 'shopping', 'pantry', 'notes', 'achievements', 'checks'
  ]);

  /* Dentro de las preferencias, esto pertenece a la persona, no al aparato */
  const PREFS_DE_CUENTA = ['name', 'avatar', 'avatarColor'];

  /* Almacén en memoria: aquí viven los datos de la cuenta */
  const memory = {};

  /* Versiones anteriores guardaban los datos de la cuenta en el navegador.
     Ya no se usan y no deben quedarse ahí ocupando sitio: la copia buena
     está en la nube. Se limpian una sola vez. */
  try {
    if (typeof localStorage !== 'undefined') {
      CLAVES_DE_CUENTA.forEach(n => localStorage.removeItem(PREFIX + n));
      localStorage.removeItem(PREFIX + 'syncBase');
      localStorage.removeItem(PREFIX + 'updatedAt');
    }
  } catch (e) { /* si no se puede, tampoco pasa nada */ }

  /* Caché de lectura. Pintar 180 tarjetas consultaba localStorage cientos de
     veces y cada lectura implica un JSON.parse. Se invalida al escribir. */
  const cache = new Map();

  function read(key, fallback) {
    if (cache.has(key)) return cache.get(key);
    const nombre = nombreDeClave(key);
    let value;

    /* Los datos de la cuenta nunca se leen del navegador */
    if (CLAVES_DE_CUENTA.has(nombre) || !available) {
      value = key in memory ? memory[key] : clone(fallback);
    } else {
      try {
        const raw = localStorage.getItem(key);
        value = raw === null ? clone(fallback) : JSON.parse(raw);
        if (value === null || value === undefined) value = clone(fallback);
      } catch (e) {
        console.warn('Dato corrupto en', key, '— se restaura el valor por defecto.');
        value = clone(fallback);
      }
      /* Las preferencias son mitad y mitad: del navegador solo valen los
         ajustes del aparato. El perfil (nombre y avatar) es de la cuenta y
         viene de la nube, así que se descarta lo que hubieran dejado ahí
         las versiones anteriores. */
      if (nombre === 'prefs' && esObjeto(value)) {
        const delAparato = {};
        Object.entries(value).forEach(([k, v]) => {
          if (!PREFS_DE_CUENTA.includes(k)) delAparato[k] = v;
        });
        value = Object.assign({}, delAparato, memory[key] || {});
      }
    }

    /* El JSON puede ser válido y aun así tener la forma equivocada (un objeto
       donde se espera una lista). Antes eso reventaba el arranque entero. */
    const limpio = sanear(nombreDeClave(key), value);
    if (limpio === null) {
      console.warn('Formato inesperado en', key, '— se restaura el valor por defecto.');
      value = clone(fallback);
      /* Se reescribe para que el dato inservible no vuelva a leerse nunca */
      if (available) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
    } else {
      value = limpio;
    }

    cache.set(key, value);
    return value;
  }

  function write(key, value) {
    cache.set(key, value);
    const nombre = nombreDeClave(key);
    marcaDeTiempo = Date.now();

    if (CLAVES_DE_CUENTA.has(nombre) || !available) {
      /* Dato de la cuenta: se queda en memoria y la nube se encarga del resto */
      memory[key] = value;
    } else if (nombre === 'prefs' && esObjeto(value)) {
      /* Se separa: el perfil va con la cuenta, los ajustes con el aparato */
      const delAparato = {}, deLaCuenta = {};
      Object.entries(value).forEach(([k, v]) => {
        (PREFS_DE_CUENTA.includes(k) ? deLaCuenta : delAparato)[k] = v;
      });
      memory[key] = deLaCuenta;
      /* Se fusiona con lo que ya hubiera: cuando llegan datos de la nube no
         vienen los ajustes de este aparato y no deben perderse. */
      let previo = {};
      if (available) {
        try { previo = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) {}
      }
      const ajustes = Object.assign({}, previo, delAparato);
      guardarEnNavegador(key, ajustes);
      /* En la caché van las dos mitades juntas: si solo se guardara lo que
         acaba de llegar, una bajada de la nube dejaría la aplicación sin el
         tema ni la corrección de temperatura hasta recargar. */
      cache.set(key, Object.assign({}, ajustes, deLaCuenta));
    } else {
      guardarEnNavegador(key, value);
    }
    /* Aviso para que la capa de nube sepa que hay algo que subir */
    if (!silent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('airfryer:datachange', { detail: { key } }));
    }
    return value;
  }

  /* Escritura en el navegador, solo para lo que es de este aparato */
  function guardarEnNavegador(key, value) {
    if (!available) { memory[key] = value; return; }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('No se ha podido guardar en', key, e);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airfryer:storagefull', { detail: { key } }));
      }
    }
  }

  /* Cuándo se tocó algo por última vez (antes vivía en localStorage) */
  let marcaDeTiempo = 0;

  /* Durante una importación no interesa disparar un aviso por cada clave */
  let silent = false;

  /* Si otra pestaña cambia los datos, esa copia sí hay que descartarla */
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === null) cache.clear();
      else if (e.key.startsWith(PREFIX)) cache.delete(e.key);
    });
  }

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const norm = (str) => String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  function todayKey(date = new Date()) {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  const uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ─────────────── Favoritos ─────────────── */
  const favorites = {
    all: () => read(KEYS.favorites, DEFAULTS.favorites),
    has: (id) => favorites.all().includes(Number(id)),
    toggle(id) {
      id = Number(id);
      const list = favorites.all();
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.unshift(id);
      write(KEYS.favorites, list);
      return i < 0; // true = se ha añadido
    },
    count: () => favorites.all().length
  };

  /* ─────────────── Historial de cocinadas ─────────────── */
  const history = {
    all: () => read(KEYS.history, DEFAULTS.history),
    /* Registra una receta cocinada. Guarda como máximo 200 entradas. */
    add(id) {
      const list = history.all();
      list.unshift({ id: Number(id), at: Date.now(), day: todayKey() });
      write(KEYS.history, list.slice(0, 200));
      return list.length;
    },
    count: () => history.all().length,
    uniqueCount: () => new Set(history.all().map(h => h.id)).size,
    timesCooked: (id) => history.all().filter(h => h.id === Number(id)).length,
    recent(limit = 10) {
      const seen = new Set();
      const out = [];
      for (const entry of history.all()) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        out.push(entry);
        if (out.length >= limit) break;
      }
      return out;
    },
    /* Racha de días consecutivos cocinando (hoy o ayer la mantienen viva) */
    streak() {
      const days = [...new Set(history.all().map(h => h.day))].sort().reverse();
      if (!days.length) return 0;
      const oneDay = 86400000;
      const today = todayKey();
      const yesterday = todayKey(new Date(Date.now() - oneDay));
      if (days[0] !== today && days[0] !== yesterday) return 0;

      let streak = 1;
      let cursor = new Date(days[0]);
      for (let i = 1; i < days.length; i++) {
        const expected = todayKey(new Date(cursor.getTime() - oneDay));
        if (days[i] === expected) { streak++; cursor = new Date(expected); }
        else break;
      }
      return streak;
    }
  };

  /* ─────────────── Plan semanal (comida y cena) ─────────────── */
  const SLOTS = ['comida', 'cena'];

  const week = {
    /* Lee migrando el formato antiguo { lun: 12 } al nuevo { lun: { comida: 12 } } */
    all() {
      const raw = read(KEYS.week, DEFAULTS.week);
      const out = {};
      Object.entries(raw).forEach(([day, value]) => {
        if (value === null || value === undefined) return;
        if (typeof value === 'number' || typeof value === 'string') out[day] = { comida: Number(value) };
        else out[day] = value;
      });
      return out;
    },
    get(day, slot) {
      const d = week.all()[day];
      return d && d[slot] != null ? Number(d[slot]) : null;
    },
    set(day, slot, recipeId) {
      const data = week.all();
      data[day] = data[day] || {};
      data[day][slot] = Number(recipeId);
      return write(KEYS.week, data);
    },
    clearSlot(day, slot) {
      const data = week.all();
      if (data[day]) {
        delete data[day][slot];
        if (!Object.keys(data[day]).length) delete data[day];
      }
      return write(KEYS.week, data);
    },
    clear: () => write(KEYS.week, {}),
    /* [{ day, slot, id }] con todo lo planificado */
    entries() {
      const data = week.all();
      const out = [];
      Object.entries(data).forEach(([day, slots]) => {
        SLOTS.forEach(slot => { if (slots[slot] != null) out.push({ day, slot, id: Number(slots[slot]) }); });
      });
      return out;
    },
    count: () => week.entries().length,
    daysUsed: () => new Set(week.entries().map(e => e.day)).size
  };

  /* ─────────────── Lista de la compra ─────────────── */
  const shopping = {
    /* Migra items antiguos { qty: '600 g' } al nuevo formato con partes */
    all() {
      const raw = read(KEYS.shopping, DEFAULTS.shopping);
      let migrated = false;
      const list = raw.map(item => {
        if (item.parts) return item;
        migrated = true;
        const parts = [];
        const texts = [];
        String(item.qty || '').split('+').map(s => s.trim()).filter(Boolean).forEach(chunk => {
          const m = chunk.match(/^([\d.,]+)\s*(\S+)?$/);
          if (m) parts.push({ a: parseFloat(m[1].replace(',', '.')), u: m[2] || 'ud' });
          else texts.push(chunk);
        });
        return {
          id: item.id || uid(), name: item.name, parts, texts,
          /* `from` puede venir ya como lista (saneada al leer) o como el
             texto suelto del formato antiguo. Envolver una lista otra vez
             producía [[]] y dejaba una procedencia vacía en la pantalla. */
          from: Array.isArray(item.from) ? item.from : (item.from ? [item.from] : []),
          done: !!item.done
        };
      });
      if (migrated) write(KEYS.shopping, list);
      return list;
    },
    /* qty admite { a, u }, una cadena o null. Suma cantidades de la misma unidad. */
    add(name, qty = null, from = null) {
      name = String(name).trim();
      if (!name) return null;
      const list = shopping.all();
      const key = norm(name);
      let item = list.find(i => norm(i.name) === key);

      if (!item) {
        item = { id: uid(), name, parts: [], texts: [], from: [], done: false };
        list.push(item);
      }
      item.done = false;

      let part = null;
      let freeText = '';
      if (qty && typeof qty === 'object' && typeof qty.a === 'number' && !isNaN(qty.a)) {
        part = { a: qty.a, u: qty.u || 'ud' };
      } else if (typeof qty === 'string' && qty.trim()) {
        const m = qty.trim().match(/^([\d.,]+)\s*(.*)$/);
        if (m) part = { a: parseFloat(m[1].replace(',', '.')), u: (m[2] || 'ud').trim() || 'ud' };
        else freeText = qty.trim();
      }

      if (part) {
        const same = item.parts.find(p => p.u === part.u);
        if (same) same.a += part.a;
        else item.parts.push(part);
      } else if (freeText && !item.texts.includes(freeText)) {
        item.texts.push(freeText);
      }

      if (from && !item.from.includes(from)) item.from.push(from);
      write(KEYS.shopping, list);
      return item;
    },
    toggle(id) {
      const list = shopping.all();
      const item = list.find(i => i.id === id);
      if (item) item.done = !item.done;
      return write(KEYS.shopping, list);
    },
    remove(id) {
      return write(KEYS.shopping, shopping.all().filter(i => i.id !== id));
    },
    clearDone: () => write(KEYS.shopping, shopping.all().filter(i => !i.done)),
    clear: () => write(KEYS.shopping, []),
    count: () => shopping.all().length,
    pending: () => shopping.all().filter(i => !i.done).length
  };

  /* ─────────────── Despensa ("esto ya lo tengo") ─────────────── */
  const pantry = {
    all: () => read(KEYS.pantry, DEFAULTS.pantry),
    /* Coincide si el nombre del ingrediente contiene el término de la despensa.
       Se ignoran los términos demasiado cortos: uno vacío casaba con
       cualquier ingrediente y vaciaba la lista de la compra entera. */
    has(name) {
      const n = norm(name);
      return pantry.all().some(p => {
        const t = norm(p);
        return t.length >= PANTRY_MIN && n.includes(t);
      });
    },
    add(name) {
      name = String(name).trim();
      if (!name) return null;
      const list = pantry.all();
      if (list.some(p => norm(p) === norm(name))) return list;
      list.push(name);
      return write(KEYS.pantry, list.sort((a, b) => a.localeCompare(b, 'es')));
    },
    remove(name) {
      return write(KEYS.pantry, pantry.all().filter(p => norm(p) !== norm(name)));
    },
    clear: () => write(KEYS.pantry, []),
    count: () => pantry.all().length
  };

  /* ─────────────── Notas y valoración por receta ─────────────── */
  const notes = {
    all: () => read(KEYS.notes, DEFAULTS.notes),
    get: (id) => notes.all()[id] || { rating: 0, text: '' },
    set(id, patch) {
      const data = notes.all();
      data[id] = Object.assign({ rating: 0, text: '' }, data[id], patch);
      if (!data[id].rating && !data[id].text) delete data[id];
      return write(KEYS.notes, data);
    },
    count: () => Object.keys(notes.all()).length
  };

  /* ─────────────── Preferencias ─────────────── */
  const prefs = {
    all: () => Object.assign({}, DEFAULTS.prefs, read(KEYS.prefs, DEFAULTS.prefs)),
    get: (key) => prefs.all()[key],
    set(key, value) {
      const data = prefs.all();
      /* Reaplicar el mismo valor no es un cambio: si se escribiera igualmente,
         cada arranque avisaría de "datos modificados" y dispararía una subida
         a la nube que no hace falta. */
      if (data[key] === value) return data;
      data[key] = value;
      return write(KEYS.prefs, data);
    }
  };

  /* ─────────────── Logros ─────────────── */
  const achievements = {
    all: () => read(KEYS.achievements, DEFAULTS.achievements),
    has: (key) => achievements.all().includes(key),
    unlock(key) {
      const list = achievements.all();
      if (list.includes(key)) return false;
      list.push(key);
      write(KEYS.achievements, list);
      return true;
    },
    count: () => achievements.all().length
  };

  /* ─────────────── Ingredientes marcados por receta ─────────────── */
  const checks = {
    all: () => read(KEYS.checks, DEFAULTS.checks),
    get: (recipeId) => checks.all()[recipeId] || [],
    toggle(recipeId, index) {
      const data = checks.all();
      const list = new Set(data[recipeId] || []);
      if (list.has(index)) list.delete(index); else list.add(index);
      data[recipeId] = [...list];
      write(KEYS.checks, data);
      return data[recipeId];
    },
    clear(recipeId) {
      const data = checks.all();
      delete data[recipeId];
      return write(KEYS.checks, data);
    }
  };

  /* Solo la parte de las preferencias que pertenece a la persona */
  function soloPerfil() {
    const todas = prefs.all();
    const out = {};
    PREFS_DE_CUENTA.forEach(k => { if (k in todas) out[k] = todas[k]; });
    return out;
  }

  /* ─────────────── Copia de seguridad ─────────────── */
  function exportAll() {
    return {
      app: 'airfryer',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        favorites: favorites.all(),
        history: history.all(),
        week: week.all(),
        shopping: shopping.all(),
        pantry: pantry.all(),
        notes: notes.all(),
        /* Solo el perfil: los ajustes de este aparato (tema, sonido, voz,
           avisos y temperatura) no viajan, o un móvil le cambiaría el tema
           al ordenador. */
        prefs: soloPerfil(),
        achievements: achievements.all(),
        checks: checks.all()
      }
    };
  }

  /**
   * Importa una copia de seguridad (archivo o nube). Devuelve { ok, error }.
   *
   * Cada clave se valida por separado ANTES de guardarla. Las que no tienen
   * la forma esperada se descartan y se informa de ellas, en lugar de
   * rechazar el archivo entero: si una sola clave viene corrupta, sigue
   * mereciendo la pena recuperar todo lo demás.
   */
  function importAll(payload) {
    try {
      const data = payload && payload.data ? payload.data : payload;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { ok: false, error: 'El archivo no tiene el formato esperado.' };
      }

      /* Primero se valida TODO; no se escribe nada hasta saber qué es válido */
      const validos = {};
      const descartados = [];
      Object.keys(KEYS).forEach(name => {
        if (data[name] === undefined) return;
        const limpio = sanear(name, data[name]);
        if (limpio === null) descartados.push(name);
        else validos[name] = limpio;
      });

      const nombres = Object.keys(validos);
      if (!nombres.length) {
        return descartados.length
          ? { ok: false, error: 'Los datos están dañados y no se han podido recuperar.' }
          : { ok: false, error: 'El archivo no contiene datos de AirChef.' };
      }

      cache.clear();
      silent = true;
      nombres.forEach(name => write(KEYS[name], validos[name]));
      silent = false;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airfryer:dataimported'));
      }
      if (descartados.length) console.warn('Datos descartados por formato inválido:', descartados);
      return { ok: true, imported: nombres.length, descartados };
    } catch (e) {
      silent = false;   // si algo falla a media importación, no dejar el aviso mudo
      return { ok: false, error: 'No se ha podido leer el archivo.' };
    }
  }

  /* ─────────────── Fusión entre dispositivos ───────────────
     Subir reemplazando el documento entero hacía que el último aparato en
     escribir borrase el trabajo del otro. Aquí se comparan tres versiones:

       base    lo último que este dispositivo sincronizó
       local   lo que hay aquí ahora
       remoto  lo que hay en la nube en este momento

     Del lado local solo se aplican sus CAMBIOS respecto a la base (lo que
     ha añadido y lo que ha borrado), sobre lo que haya en la nube. Así los
     cambios de los dos dispositivos conviven. */

  /** Lista de valores simples: se respetan altas y bajas de cada lado. */
  function fusionarLista(base, local, remoto) {
    const b = new Set(base || []), l = new Set(local || []);
    const anadidos = [...l].filter(x => !b.has(x));
    const borrados = [...b].filter(x => !l.has(x));
    const out = (remoto || []).filter(x => !borrados.includes(x));
    anadidos.forEach(x => { if (!out.includes(x)) out.unshift(x); });
    return out;
  }

  /** Mapa clave → valor: gana el lado que lo haya tocado desde la base. */
  function fusionarMapa(base, local, remoto) {
    base = base || {}; local = local || {};
    const out = Object.assign({}, remoto || {});
    new Set([...Object.keys(base), ...Object.keys(local)]).forEach(k => {
      if (JSON.stringify(base[k]) === JSON.stringify(local[k])) return;  // aquí no se tocó
      if (local[k] === undefined) delete out[k];                          // borrado aquí
      else out[k] = local[k];                                             // cambiado aquí
    });
    return out;
  }

  /** El historial solo crece: se unen las dos listas sin repetir. */
  function fusionarHistorial(local, remoto) {
    const vistos = new Set();
    return [...(local || []), ...(remoto || [])]
      .filter(e => {
        const k = e.id + '|' + e.at;
        if (vistos.has(k)) return false;
        vistos.add(k);
        return true;
      })
      .sort((a, b) => b.at - a.at)
      .slice(0, 200);
  }

  /** Une productos repetidos que vengan de los dos lados con distinto id. */
  function consolidarCompra(lista) {
    const porNombre = new Map();
    lista.forEach(item => {
      const k = norm(item.name);
      const ya = porNombre.get(k);
      if (!ya) { porNombre.set(k, item); return; }
      (item.parts || []).forEach(p => {
        const igual = (ya.parts || []).find(x => x.u === p.u);
        if (igual) igual.a += p.a; else (ya.parts = ya.parts || []).push({ a: p.a, u: p.u });
      });
      (item.texts || []).forEach(t => { if (!ya.texts.includes(t)) ya.texts.push(t); });
      (item.from || []).forEach(f => { if (!ya.from.includes(f)) ya.from.push(f); });
      ya.done = ya.done && item.done;      // si en un sitio falta por comprar, falta
    });
    return [...porNombre.values()];
  }

  /** Lista de objetos con id propio (la compra). */
  function fusionarCompra(base, local, remoto) {
    const porId = (arr) => new Map((arr || []).map(i => [i.id, i]));
    const b = porId(base), l = porId(local);
    const out = porId(remoto);
    new Set([...b.keys(), ...l.keys()]).forEach(id => {
      if (JSON.stringify(b.get(id)) === JSON.stringify(l.get(id))) return;
      if (!l.has(id)) out.delete(id);
      else out.set(id, l.get(id));
    });
    return consolidarCompra([...out.values()]);
  }

  /**
   * Fusiona los tres documentos completos. Recibe y devuelve el objeto
   * `data` (el interior de lo que produce exportAll).
   */
  function merge3(base, local, remoto) {
    base = base || {}; local = local || {}; remoto = remoto || {};
    return {
      favorites: fusionarLista(base.favorites, local.favorites, remoto.favorites),
      pantry: fusionarLista(base.pantry, local.pantry, remoto.pantry),
      achievements: fusionarLista(base.achievements, local.achievements, remoto.achievements),
      history: fusionarHistorial(local.history, remoto.history),
      shopping: fusionarCompra(base.shopping, local.shopping, remoto.shopping),
      week: fusionarMapa(base.week, local.week, remoto.week),
      notes: fusionarMapa(base.notes, local.notes, remoto.notes),
      checks: fusionarMapa(base.checks, local.checks, remoto.checks),
      /* Las preferencias son de este aparato: manda lo local salvo lo que
         aquí no se haya tocado nunca. */
      prefs: fusionarMapa(base.prefs, local.prefs, remoto.prefs)
    };
  }

  /* Copia de la última versión sincronizada, para poder comparar */
  /* La última versión bajada de la nube, para poder fusionar si otro
     dispositivo escribe mientras tanto. Vive en memoria: no tiene sentido
     guardarla en el navegador si los datos tampoco se guardan. */
  let base = null;
  const syncBase = {
    get: () => base,
    set: (datos) => { base = datos ? clone(datos) : null; },
    clear: () => { base = null; }
  };

  function wipe() {
    syncBase.clear();
    Object.values(KEYS).forEach(k => {
      if (available) localStorage.removeItem(k);
      delete memory[k];
      cache.delete(k);
    });
  }

  /* Ajustes que son del aparato, no de la persona: sobreviven a un cambio
     de cuenta. El nombre y el avatar sí son personales y se van. */
  const PREFS_DEL_DISPOSITIVO = ['theme', 'sound', 'voice', 'notify', 'tempOffset'];

  /**
   * Borra lo que pertenece al usuario (favoritos, historial, semana, compra,
   * despensa, notas, logros y perfil) conservando los ajustes del dispositivo.
   * No dispara el aviso de cambio, así que por sí solo no sube nada a la nube.
   */
  function wipeUserData() {
    /* Los datos de la cuenta solo viven en memoria: basta con vaciarla.
       Los ajustes del aparato, que están en el navegador, no se tocan. */
    Object.values(KEYS).forEach(k => { delete memory[k]; cache.delete(k); });
    marcaDeTiempo = 0;
  }

  /* Quién fue el último usuario con sesión en este navegador. Sirve para no
     mezclar los datos de una persona con la cuenta de otra. */
  const LAST_USER = PREFIX + 'lastUser';
  const lastUser = {
    get: () => { try { return available ? localStorage.getItem(LAST_USER) : (memory[LAST_USER] || null); } catch (e) { return null; } },
    set: (id) => {
      try {
        if (!available) { memory[LAST_USER] = id || ''; return; }
        if (id) localStorage.setItem(LAST_USER, id); else localStorage.removeItem(LAST_USER);
      } catch (e) {}
    }
  };

  /* Marca de tiempo de la última modificación local (para comparar con la nube) */
  function lastModified() {
    return marcaDeTiempo;
  }

  /* ¿Hay algo guardado que merezca la pena sincronizar? */
  function hasData() {
    return favorites.count() > 0 || history.count() > 0 || shopping.count() > 0 ||
           week.count() > 0 || pantry.count() > 0 || notes.count() > 0 ||
           achievements.count() > 0;
  }

  return {
    favorites, history, week, shopping, pantry, notes, prefs, achievements, checks,
    SLOTS, exportAll, importAll, wipe, wipeUserData, lastUser, todayKey, lastModified, hasData,
    merge3, syncBase,
    isAvailable: () => available
  };
})();
