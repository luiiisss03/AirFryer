/* ============================================================
   AirChef · Cuenta y sincronización (Supabase)
   ------------------------------------------------------------
   Capa opcional. Si no hay claves configuradas en
   js/supabase-config.js, todo esto queda desactivado y la
   aplicación sigue funcionando en local exactamente igual.

   Qué hace:
     · Registro e inicio de sesión (contraseña o enlace mágico)
     · Guarda TODOS tus datos en una fila por usuario
     · Los baja al entrar en otro dispositivo
     · Sube los cambios automáticamente, con retardo

   Modelo en la base de datos (ver supabase.sql):
     airfryer_data(user_id uuid PK, data jsonb, updated_at timestamptz)
   ============================================================ */

const Cloud = (() => {
  const TABLA = 'airfryer_data';
  const RETARDO_SUBIDA = 1200;   // ms de espera tras el último cambio (agrupa ráfagas)

  let client = null;
  let user = null;
  let estado = 'desactivado';    // desactivado | sin-sesion | conectado | error
  let ultimaSync = null;
  let subiendo = false;
  /* Si hay un conflicto que el usuario no ha resuelto, la subida automática
     queda en pausa: si no, a los pocos segundos machacaría la copia de la
     nube que precisamente estaba dudando si conservar. */
  let conflictoSinResolver = false;
  /* Conflicto detectado al arrancar con sesión, a la espera de que el usuario decida */
  let conflictoInicial = null;
  let temporizador = null;
  const oyentes = [];

  /* ─────────────── Utilidades ─────────────── */

  const configurado = () => {
    const c = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
    return !!(c && c.url && c.anonKey &&
              c.url.startsWith('http') && !c.url.includes('TU-'));
  };

  const avisar = () => oyentes.forEach(fn => {
    try { fn(estadoActual()); } catch (e) { console.warn(e); }
  });

  const estadoActual = () => ({
    configurado: configurado(),
    estado,
    email: user ? user.email : null,
    ultimaSync,
    subiendo,
    conflictoPendiente: conflictoSinResolver
  });

  /** Traduce los errores de Supabase a algo legible en español. */
  function traducir(error) {
    const m = String(error && error.message || error || '').toLowerCase();
    if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (m.includes('user already registered')) return 'Ya existe una cuenta con ese email. Inicia sesión.';
    if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Ese email no parece válido.';
    if (m.includes('email not confirmed')) return 'Confirma tu email desde el correo que te hemos enviado.';
    if (m.includes('is invalid or has expired')) return 'Ese enlace ya ha caducado. Pide uno nuevo desde tu perfil.';
    if (m.includes('otp_expired') || m.includes('access_denied')) return 'El enlace del correo ya no vale. Vuelve a intentarlo.';
    if (m.includes('for security purposes') || m.includes('rate limit')) return 'Demasiados intentos. Espera un minuto.';
    if (m.includes('failed to fetch') || m.includes('networkerror')) return 'Sin conexión con el servidor.';
    if (m.includes('relation') && m.includes('does not exist')) return 'Falta crear la tabla: ejecuta supabase.sql en tu proyecto.';
    return error && error.message ? error.message : 'Ha ocurrido un error inesperado.';
  }

  /**
   * ¿Los datos que hay en este dispositivo son de otra persona?
   * Si el usuario que entra no es el último que usó este navegador, se
   * vacía lo local antes de sincronizar. Sin esto, los favoritos o la
   * lista de la compra de alguien podían terminar subidos a la cuenta
   * de otro. Devuelve true si ha habido limpieza.
   */
  function comprobarCambioDeUsuario(u) {
    if (!u || !u.id) return false;
    const anterior = Store.lastUser.get();
    if (anterior && anterior !== u.id) {
      Store.wipeUserData();
      Store.lastUser.set(u.id);
      console.info('[cuenta] este dispositivo era de otra sesión: se han vaciado los datos locales');
      return true;
    }
    Store.lastUser.set(u.id);
    return false;
  }

  /* ─────────────── Arranque ─────────────── */

  async function init() {
    if (!configurado()) { estado = 'desactivado'; avisar(); return; }
    if (typeof window.supabase === 'undefined') {
      estado = 'error';
      console.warn('No se ha podido cargar la librería de Supabase (¿sin conexión?).');
      avisar();
      return;
    }
    try {
      client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      const { data } = await client.auth.getSession();
      user = data && data.session ? data.session.user : null;
      if (user) comprobarCambioDeUsuario(user);
      estado = user ? 'conectado' : 'sin-sesion';
      avisar();

      client.auth.onAuthStateChange((_evento, sesion) => {
        const nuevo = sesion ? sesion.user : null;
        /* Solo cuando aparece un usuario donde no lo había (p. ej. al volver
           del enlace del correo) hay que comprobar de quién es este aparato */
        if (nuevo && (!user || user.id !== nuevo.id)) comprobarCambioDeUsuario(nuevo);
        user = nuevo;
        estado = user ? 'conectado' : 'sin-sesion';
        avisar();
      });

      /* Al abrir con la sesión ya iniciada también puede haber conflicto. Antes
         su resultado se descartaba; ahora se guarda para que la interfaz pueda
         preguntar. Si no, la subida automática quedaría en pausa sin que el
         usuario supiera por qué sus cambios dejan de guardarse. */
      if (user) {
        sincronizarAlEntrar().then(c => { if (c) { conflictoInicial = c; avisar(); } });
      }
      escucharCambios();
    } catch (e) {
      estado = 'error';
      console.warn('Supabase no ha podido arrancar:', e);
      avisar();
    }
  }

  /* Sube los cambios locales pasados unos segundos desde el último */
  /* Un cambio llegado mientras se estaba subiendo. Antes se descartaba y no
     se volvía a intentar, así que ese cambio no llegaba a la nube hasta el
     siguiente. Ahora se recuerda y se sube al terminar. */
  let subidaPendiente = false;

  function programarSubida(retardo = RETARDO_SUBIDA) {
    if (!user || conflictoSinResolver) return;
    if (subiendo) { subidaPendiente = true; return; }
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      temporizador = null;
      subir().catch(() => {});
    }, retardo);
  }

  function escucharCambios() {
    window.addEventListener('airfryer:datachange', () => programarSubida());

    /* Guardar al salir: `visibilitychange` salta antes que `pagehide` y la
       página todavía está viva, así que la petición llega a tiempo. En
       `pagehide` muchas veces ya no daba tiempo. */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') return;
      if (user && temporizador && !conflictoSinResolver) {
        clearTimeout(temporizador);
        temporizador = null;
        subir().catch(() => {});
      }
    });
    window.addEventListener('pagehide', () => {
      if (user && temporizador && !conflictoSinResolver) { clearTimeout(temporizador); subir().catch(() => {}); }
    });
  }

  /* ─────────────── Sesión ─────────────── */

  /**
   * A dónde vuelve el usuario tras pulsar el enlace del correo.
   *
   * Se usa la dirección pública de `supabase-config.js`, no la actual: el
   * correo se abre casi siempre en el móvil, y un enlace a `localhost`
   * apuntaría al ordenador de quien lo pidió y no cargaría nada.
   * Sin `#`: Supabase añade ahí su propio fragmento con el token, y la
   * aplicación deja la dirección en `#home` en cuanto lo procesa.
   */
  const volverAqui = () => {
    const c = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
    if (c && c.siteUrl) return String(c.siteUrl).replace(/#.*$/, '');
    return window.location.href.split('#')[0];
  };

  async function registrar(email, password) {
    if (!client) return { ok: false, error: 'La sincronización no está configurada.' };
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { emailRedirectTo: volverAqui() }
    });
    if (error) return { ok: false, error: traducir(error) };
    /* Si el proyecto exige confirmar el email, todavía no hay sesión */
    if (!data.session) {
      return { ok: true, pendienteConfirmacion: true };
    }
    user = data.user;
    const cambioDeUsuario = comprobarCambioDeUsuario(user);
    estado = 'conectado';
    avisar();
    await subir();          // la cuenta es nueva: lo que hay en local manda
    return { ok: true, cambioDeUsuario };
  }

  async function entrar(email, password) {
    if (!client) return { ok: false, error: 'La sincronización no está configurada.' };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: traducir(error) };
    user = data.user;
    /* Si este navegador lo usaba otra persona, sus datos se van antes de nada */
    const cambioDeUsuario = comprobarCambioDeUsuario(user);
    estado = 'conectado';
    avisar();
    return { ok: true, cambioDeUsuario, conflicto: await sincronizarAlEntrar() };
  }

  async function entrarConEnlace(email) {
    if (!client) return { ok: false, error: 'La sincronización no está configurada.' };
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: volverAqui() }
    });
    if (error) return { ok: false, error: traducir(error) };
    return { ok: true };
  }

  /**
   * Cierra la sesión. Sube lo pendiente y DESPUÉS vacía los datos de este
   * dispositivo: si no, la siguiente persona que entrara en este navegador
   * encontraría los datos de la anterior y podría acabar subiéndolos a su
   * propia cuenta. Los ajustes del aparato (tema, sonido…) se conservan.
   */
  async function salir() {
    if (!client) return;
    clearTimeout(temporizador);
    temporizador = null;
    let subido = false;
    if (user) {
      try { const r = await subir(); subido = !!(r && r.ok); }
      catch (e) { /* mejor no bloquear la salida */ }
    }
    await client.auth.signOut();
    user = null;
    estado = 'sin-sesion';
    /* Primero se anula el usuario: así el aviso de cambio de datos no sube nada */
    Store.wipeUserData();
    Store.lastUser.set(null);
    avisar();
    return { subido };
  }

  /* ─────────────── Sincronización ─────────────── */

  /** Baja la fila del usuario. Devuelve null si aún no tiene nada guardado. */
  async function leerNube() {
    const { data, error } = await client
      .from(TABLA)
      .select('data, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  /**
   * Sube los datos de este dispositivo.
   *
   * Antes de escribir comprueba si otro aparato ha tocado la nube desde la
   * última vez que sincronizamos. Si es así, fusiona en lugar de reemplazar:
   * de lo contrario el último en subir borraba el trabajo del otro.
   *
   * `forzar` salta la fusión, para cuando el usuario ha pedido expresamente
   * que su versión sustituya a la de la nube.
   */
  async function subir({ forzar = false } = {}) {
    if (!client || !user || subiendo) return { ok: false };
    conflictoSinResolver = false;   // subir a propósito ya es una decisión
    subiendo = true; avisar();
    try {
      let payload = Store.exportAll();
      let fusionado = false;

      if (!forzar) {
        const fila = await leerNube();
        const base = Store.syncBase.get();
        const remoto = fila && fila.data && fila.data.data ? fila.data.data : null;
        const selloRemoto = fila ? fila.updated_at : null;

        /* Si el sello de la nube no es el que dejamos nosotros, ha escrito otro */
        if (remoto && base && base.sello !== selloRemoto) {
          const fusion = Store.merge3(base.data, payload.data, remoto);
          Store.importAll(fusion);          // el resultado se aplica también aquí
          payload = Store.exportAll();
          fusionado = true;
          console.info('[nube] cambios de otro dispositivo fusionados con los de aquí');
        }
      }

      /* El disparador de la tabla reescribe updated_at, así que hay que leer
         el valor que ha quedado de verdad para poder compararlo la próxima vez. */
      const { data: guardada, error } = await client.from(TABLA).upsert({
        user_id: user.id,
        data: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).select('updated_at').maybeSingle();
      if (error) throw error;

      Store.syncBase.set({ sello: guardada ? guardada.updated_at : null, data: payload.data });
      ultimaSync = Date.now();
      return { ok: true, fusionado };
    } catch (e) {
      console.warn('No se ha podido subir:', e);
      return { ok: false, error: traducir(e) };
    } finally {
      subiendo = false; avisar();
      /* Si mientras subíamos llegó otro cambio, se sube ahora */
      if (subidaPendiente) { subidaPendiente = false; programarSubida(600); }
    }
  }

  async function bajar() {
    if (!client || !user) return { ok: false };
    conflictoSinResolver = false;   // bajar a propósito también lo resuelve
    subiendo = true; avisar();
    try {
      const fila = await leerNube();
      if (!fila || !fila.data) return { ok: true, vacio: true };
      const res = Store.importAll(fila.data);
      if (!res.ok) return { ok: false, error: res.error };
      /* Lo que acabamos de bajar pasa a ser la base con la que comparar */
      Store.syncBase.set({ sello: fila.updated_at, data: fila.data.data || fila.data });
      ultimaSync = Date.now();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: traducir(e) };
    } finally {
      subiendo = false; avisar();
    }
  }

  /**
   * Al iniciar sesión hay que decidir qué versión vale.
   * Devuelve un objeto de conflicto si hay datos en los dos sitios,
   * para que sea el usuario quien elija. Si no, resuelve solo.
   */
  async function sincronizarAlEntrar() {
    try {
      const fila = await leerNube();
      const hayNube = !!(fila && fila.data && fila.data.data);
      const hayLocal = Store.hasData();

      if (!hayNube && hayLocal) { await subir(); return null; }
      if (hayNube && !hayLocal) { await bajar(); return null; }
      if (!hayNube && !hayLocal) { await subir(); return null; }

      /* Hay datos en ambos lados: que decida el usuario. Hasta entonces no
         se sube nada solo, para no destruir la copia de la nube. */
      conflictoSinResolver = true;
      return {
        nubeFecha: fila.updated_at ? new Date(fila.updated_at).getTime() : 0,
        localFecha: Store.lastModified()
      };
    } catch (e) {
      console.warn('Sincronización inicial fallida:', e);
      return null;
    }
  }

  /* ─────────────── API pública ─────────────── */

  return {
    init,
    estado: estadoActual,
    configurado,
    registrar, entrar, entrarConEnlace, salir, traducir,
    conflictoInicial: () => conflictoInicial,
    olvidarConflictoInicial: () => { conflictoInicial = null; },
    subir, bajar,
    alCambiar: (fn) => { oyentes.push(fn); fn(estadoActual()); }
  };
})();
