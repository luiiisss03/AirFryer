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
  /* Mientras se traen los datos de la cuenta no hay nada que enseñar todavía */
  let cargando = false;
  let errorAlCargar = null;
  /* Cambios hechos que todavía no han llegado a la nube */
  let sinGuardar = false;
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
    cargando,
    errorAlCargar,
    sinGuardar,
    enLinea: typeof navigator === 'undefined' ? true : navigator.onLine
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
      /* Por si quedara algo en memoria de la sesión anterior */
      Store.wipeUserData();
      Store.lastUser.set(u.id);
      console.info('[cuenta] ha entrado otro usuario: memoria vaciada');
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
        cargando = true; avisar();
        sincronizarAlEntrar()
          .then(r => { if (!r.ok) errorAlCargar = r.error; })
          .finally(() => { cargando = false; avisar(); });
      }
      escucharCambios();
    } catch (e) {
      estado = 'error';
      console.warn('Supabase no ha podido arrancar:', e);
      avisar();
    }
  }

  /* Un cambio llegado mientras se estaba subiendo. Antes se descartaba y no
     se volvía a intentar, así que ese cambio no llegaba a la nube hasta el
     siguiente. Ahora se recuerda y se sube al terminar. */
  let subidaPendiente = false;

  /* Reintentos cuando la subida falla. Sin esto, marcar un favorito con mala
     cobertura se perdía en silencio: el usuario creía haberlo guardado. */
  const ESPERAS = [3000, 8000, 20000, 60000];
  let intentoFallido = 0;

  function programarSubida(retardo = RETARDO_SUBIDA) {
    if (!user) return;
    if (subiendo) { subidaPendiente = true; return; }
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      temporizador = null;
      subir().catch(() => {});
    }, retardo);
  }

  /** Tras un intento fallido, se vuelve a probar cada vez más espaciado. */
  function reintentarMasTarde() {
    const espera = ESPERAS[Math.min(intentoFallido, ESPERAS.length - 1)];
    intentoFallido++;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { temporizador = null; subir().catch(() => {}); }, espera);
  }

  function escucharCambios() {
    window.addEventListener('airfryer:datachange', () => { sinGuardar = true; avisar(); programarSubida(); });

    /* Al recuperar la conexión, no esperar al siguiente reintento */
    window.addEventListener('online', () => {
      avisar();
      if (user && sinGuardar) programarSubida(400);
    });
    window.addEventListener('offline', avisar);

    /* Guardar al salir: `visibilitychange` salta antes que `pagehide` y la
       página todavía está viva, así que la petición llega a tiempo. En
       `pagehide` muchas veces ya no daba tiempo. */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') return;
      if (user && temporizador) {
        clearTimeout(temporizador);
        temporizador = null;
        subir().catch(() => {});
      }
    });
    window.addEventListener('pagehide', () => {
      if (user && temporizador) { clearTimeout(temporizador); subir().catch(() => {}); }
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
    comprobarCambioDeUsuario(user);
    estado = 'conectado';
    avisar();
    await sincronizarAlEntrar();   // cuenta nueva: deja la fila creada
    return { ok: true };
  }

  async function entrar(email, password) {
    if (!client) return { ok: false, error: 'La sincronización no está configurada.' };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: traducir(error) };
    user = data.user;
    comprobarCambioDeUsuario(user);
    estado = 'conectado';
    avisar();
    /* Lo primero es traerse los datos de la cuenta: en el navegador no hay nada */
    const traidos = await sincronizarAlEntrar();
    return { ok: true, datos: traidos };
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
      sinGuardar = false;
      intentoFallido = 0;
      return { ok: true, fusionado };
    } catch (e) {
      console.warn('No se ha podido subir:', e);
      /* Se vuelve a intentar solo: el cambio no puede quedarse en el aire */
      reintentarMasTarde();
      return { ok: false, error: traducir(e) };
    } finally {
      subiendo = false; avisar();
      /* Si mientras subíamos llegó otro cambio, se sube ahora */
      if (subidaPendiente) { subidaPendiente = false; programarSubida(600); }
    }
  }

  async function bajar() {
    if (!client || !user) return { ok: false };
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
   * Al entrar se traen los datos de la cuenta. Ya no hay nada que decidir:
   * la copia buena es siempre la de la nube, porque en el navegador no se
   * guarda nada. Antes había dos almacenes compitiendo y por eso aparecía
   * aquel diálogo preguntando con cuál quedarse.
   *
   * Devuelve { ok } o { ok:false, error } para que la interfaz avise.
   */
  async function sincronizarAlEntrar() {
    try {
      const fila = await leerNube();
      if (!fila || !fila.data) {
        /* Cuenta recién creada: se deja la fila hecha y vacía */
        Store.wipeUserData();
        await subir({ forzar: true });
        return { ok: true, vacio: true };
      }
      const res = Store.importAll(fila.data);
      if (!res.ok) return { ok: false, error: res.error };
      Store.syncBase.set({ sello: fila.updated_at, data: fila.data.data || fila.data });
      ultimaSync = Date.now();
      avisar();
      return { ok: true };
    } catch (e) {
      console.warn('No se han podido traer los datos:', e);
      return { ok: false, error: traducir(e) };
    }
  }

  /** Vuelve a intentar traer los datos de la cuenta (botón "Reintentar"). */
  async function recargarDatos() {
    if (!user) return { ok: false };
    errorAlCargar = null;
    cargando = true; avisar();
    const r = await sincronizarAlEntrar();
    if (!r.ok) errorAlCargar = r.error;
    cargando = false; avisar();
    return r;
  }

  /* ─────────────── API pública ─────────────── */

  return {
    init,
    estado: estadoActual,
    configurado,
    registrar, entrar, entrarConEnlace, salir, traducir,
    subir, bajar, recargarDatos,
    alCambiar: (fn) => { oyentes.push(fn); fn(estadoActual()); }
  };
})();
