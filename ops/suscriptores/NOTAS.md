# Lectores inscritos: notas de operador (2026-10-18)

Inscripción **gratuita** en https://yamacoa.com/suscribete (correo + contraseña escrita dos veces y
confirmada por correo, o Google). Con cuenta se descargan los podcasts (el botón está en cada
episodio; escuchar sigue siendo libre). Lectores en `public.suscriptores`, **separados** de los
internos (`public.perfiles`). Está preparado un campo `plan` para una suscripción de pago futura.

## Puesta en marcha (una vez, en este orden)
1. SQL Editor: `ops/suscriptores/suscriptores_supabase.sql`. Desde ese momento TODA cuenta nueva
   nace lectora; además cierra los permisos que solo exigían «tener cuenta» (PDF del portal,
   originales de opinión, envíos).
2. Authentication → URL Configuration: *Site URL* `https://yamacoa.com`; *Redirect URLs*
   `https://yamacoa.com/**`, `https://portal.yamacoa.com/**`, `http://localhost:3123/**`.
3. Authentication → Providers → Email: *Allow new users to sign up* **ON**, *Confirm email* **ON**.
4. Google (opcional, ~10 min):
   - https://console.cloud.google.com → proyecto nuevo «Yamacoa».
   - *APIs y servicios → Pantalla de consentimiento OAuth*: tipo **Externo**, nombre «Yamacoa»,
     correo de asistencia, dominio autorizado `yamacoa.com`, permisos `email` y `profile`; publicar.
   - *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*:
     orígenes `https://yamacoa.com`; URI de redirección autorizada
     `https://qsajkrppuaikyzmuipru.supabase.co/auth/v1/callback`.
   - Copiar *ID de cliente* y *Secreto* en Supabase → Authentication → Providers → Google (activar).
     El secreto se pega solo en el panel de Supabase: nunca en el repo ni en un chat.

## Operación
- **Crear un usuario interno** (portal): créalo como siempre (CLI del orquestador o panel) y luego
  `select public.hacer_interno('persona@dominio');` — pasa de lector a interno. Después, sus
  permisos (`puede_opinar`, `puede_grabar`, `es_admin`).
- **Baja**: el lector, desde «Mi cuenta» (borra su cuenta entera). Un interno no puede darse de
  baja desde ahí.
- Los correos de los lectores son datos personales: solo los ve la service role. Falta una página
  de política de privacidad enlazada desde el formulario (pendiente de redactar).
