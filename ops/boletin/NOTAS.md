# Boletín de los domingos — notas de operador

Correo semanal **opcional** para lectores inscritos (`suscriptores.boletin = true`). Consentimiento
aparte del de la cuenta: casilla al inscribirse o interruptor en «Mi cuenta» (`/suscribete`).

- **Contenido:** lo ya publicado en los feeds públicos de yamacoa.com en los últimos 7 días
  (conversación semanal arriba, podcasts grabados, la última edición «al día», opinión, estudios)
  y las 6 noticias vigentes más relevantes. No escribe nada nuevo y respeta las retiradas.
- **Envío:** Resend (`boletin@yamacoa.com`, respuestas a la redacción), en lotes de 100. Cada
  correo lleva su enlace de baja con un clic y `List-Unsubscribe` (RFC 8058) →
  `functions/api/boletin/baja.js` → RPC `boletin_baja(token)`. Sin píxeles ni seguimiento de
  clics: en Resend, *Domains → yamacoa.com*, «Open tracking» y «Click tracking» desactivados
  (la política de privacidad lo promete).
- **Cuándo:** domingo, tras la conversación, si `~/.config/yamacoa/boletin.env` trae
  `YAMACOA_BOLETIN_AUTO=1` (ver `ops/noticias/ciclo.sh`). Una semana ISO se envía una sola vez
  (`boletin_envios`).
- **Secretos:** `~/.config/yamacoa/boletin.env` con `RESEND_API_KEY=` (clave «Sending access»
  limitada a yamacoa.com), chmod 600, fuera del repo.

```
node ops/boletin/boletin.mjs --vista             # ops/boletin/vista.html, sin enviar
node ops/boletin/boletin.mjs --prueba <correo>   # solo a esa dirección
node ops/boletin/boletin.mjs --enviar            # a todos (una vez por semana)
```

SQL: `ops/suscriptores/boletin_supabase.sql` (columnas, `mi_boletin`, `boletin_baja`, `boletin_envios`).
