/* ============================================================
   AirChef · Configuración de Supabase
   ------------------------------------------------------------
   supabase.com → tu proyecto → Settings → API

   · url      → "Project URL" (la base, SIN /rest/v1/)
   · anonKey  → "anon public"

   Esta clave `anon` es pública por diseño: viaja al navegador de
   cualquiera que abra la app, así que no es un secreto. Quien
   protege los datos son las políticas RLS de la base de datos
   (las crea supabase.sql), que impiden que un usuario toque las
   filas de otro.

   NUNCA pongas aquí la clave `service_role` ni una `sb_secret_`:
   esas se saltan la seguridad y darían acceso total a cualquiera
   que abriese el código de la web.
   ============================================================ */

const SUPABASE_CONFIG = {
  url: 'https://qnymscqfpetmahfaoacu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFueW1zY3FmcGV0bWFoZmFvYWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTI5NzIsImV4cCI6MjEwMjc4ODk3Mn0.9cuRdgpNDN3YyXLj4ntHxEvwgP3CawYqMJqXWBBv4WA',

  /* Dirección pública de la aplicación. Es a donde llevan los enlaces de los
     correos de confirmación y de entrada sin contraseña.
     Se fija aquí a propósito, en vez de usar la dirección desde la que se abrió:
     el correo casi siempre se abre en el móvil, y un enlace a `localhost`
     apuntaría al ordenador de quien lo generó y no cargaría nada.
     Tiene que estar dada de alta en Supabase → Authentication → URL
     Configuration (Site URL y Redirect URLs). */
  siteUrl: 'https://luiiisss03.github.io/AirFryer/'
};
