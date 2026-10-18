# Noticias automáticas: notas de operador

## Qué hace cada ciclo (00:00 y 18:00, hora local del PC)
`ops/noticias/ciclo.sh` → `ciclo.mjs`:
1. **Caducar.** Borra de la BD lo que cumplió 3 días (y lo retirado a mano). Si borró algo,
   redespliega en el acto: la página desaparece del sitio a su hora y su URL responde 410.
2. **Capturar.** RSS de `fuentes.json` (últimas 30 h, sin repetir lo ya visto en 10 días): prensa
   cubana independiente y oficial, Miami (NBC 6, Telemundo 51, Local 10, CBS Miami, Martí), España
   (El País, El Mundo, ABC, BBC) y EE UU (NYT, CBS, ABC News, NPR, Fox). Los feeds generales pasan
   por `filtro_cuba`. Los Herald, Univision, AP, Reuters o CNN entran por Google Noticias (solo
   descubrimiento: el motor busca y cita el original).
3. **Tratar.** Claude headless (`claude -p`, modelo `opus`) con `motor.md`: agrupa, descarta,
   corrobora en la web, elige plantilla (`cronica` · `breve` · `datos` · `contraste`), redacta
   con la línea editorial (CLAUDE.md §11.5) y escribe `tratadas.json`. Sin Bash, sin MCP ni
   conectores; solo puede escribir en la carpeta del ciclo.
4. **Verja.** Schema + reglas (citas válidas, «corroborada» con dos orígenes, URL extra que
   existan, guion presente). Nombre y URL de cada fuente los pone el código desde la captura.
5. **Audio.** Kokoro (`tts.yamacoa.com`) → MP3. Lento: 1 a 2 min por noticia. Si falla, la
   pieza queda `retenida` y se reintenta en el ciclo siguiente.
6. **Publicar.** `ops/publicar.sh`: build de la rama `publicacion` en `../yamacoa-publicacion`
   con el feed y el audio exportados desde la BD, y `wrangler pages deploy`.

Registro: `ops/noticias/estado/logs/AAAA-MM-DD.log`. Material de cada ciclo (capturas,
`tratadas.json`, `motor.log.json`, `resumen.json`): `ops/noticias/ciclos/<id>/`. Nada de esto
entra en git.

## Puesta en marcha (una vez)
1. **Base de datos:** ejecutar `noticias_supabase.sql` en el SQL Editor de Supabase.
2. **Secretos** en `~/.config/yamacoa/noticias.env` (fuera del repo):
   ```
   SUPABASE_URL=https://<proyecto>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service role, NO la anon>
   ```
   Sin este fichero el ciclo usa la BD local `ops/noticias/estado/db.json` (para ensayos).
   Cloudflare: `~/.config/yamacoa/cf.env` (ya existe).
   Motor: `~/.config/yamacoa/claude.env` con `CLAUDE_CODE_OAUTH_TOKEN=…` (de `claude setup-token`,
   dura un año). Sin él el motor usa la sesión interactiva, que caduca y deja el ciclo sin noticias
   («OAuth session expired» en `motor.log.json`).
3. **Rama de publicación:** commitear el rediseño y `ops/publicar.sh --mover` (primer deploy).
4. **Cron.** WSL no tiene systemd y el servicio cron está parado. Recomendado: Programador de
   tareas de Windows, que arranca WSL aunque esté cerrado. En PowerShell (como administrador):
   ```
   $a = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d Ubuntu-24.04 -u <usuario> -- /home/<usuario>/bohio/yamacoa/ops/noticias/ciclo.sh"
   $t1 = New-ScheduledTaskTrigger -Daily -At 00:00
   $t2 = New-ScheduledTaskTrigger -Daily -At 18:00
   $s = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)
   Register-ScheduledTask -TaskName "Yamacoa noticias" -Action $a -Trigger $t1,$t2 -Settings $s
   ```
   Alternativa dentro de WSL: `service cron start` (hay que repetirlo en cada arranque) y
   `crontab -e` con `0 0,18 * * * /home/<usuario>/bohio/yamacoa/ops/noticias/ciclo.sh`.
   Si el PC está apagado a esa hora no hay ciclo (`StartWhenAvailable` lo lanza al encender).

## Operación
- **Ensayo sin subir:** `node ops/noticias/ciclo.mjs --sin-desplegar` (exporta a `public/`; se
  ve en `npm start` → `/noticias`).
- **Repetir verja y audio** de un ciclo: `node ops/noticias/ciclo.mjs --reusar <id> --sin-desplegar`.
- **Retirar una noticia:** en Supabase, `update noticias set estado='retirada', actualizado=now() where slug='…';`
  y `ops/publicar.sh` para que salga ya (si no, sale en el siguiente ciclo).
- **Publicar código o expedientes:** commit y `ops/publicar.sh --mover`. Nunca `npm run build` +
  `wrangler` a mano: ese build no lleva las noticias.
- **Tope:** como mucho 10 noticias nuevas por ciclo y 20 por día natural (las actualizaciones de
  una vigente no cuentan). Si el motor propone más, entran las de mayor `importancia`.
- Variables: `YAMACOA_MAX_NOTICIAS` (10, por ciclo), `YAMACOA_MAX_DIA` (20), `YAMACOA_MODELO` (opus), `YAMACOA_MOTOR_MIN` (45),
  `YAMACOA_SITE` (https://yamacoa.com).

## Análisis, series y gráficos (2026-10-18)
- **Series de referencia:** `series.json` (catálogo cerrado). Cada una tiene semilla (los datos ya
  verificados de un expediente, leídos en cada ciclo) y/o puntos que añade la verja desde las
  capturas. La verja solo acepta un punto si el número está en el texto de la captura o de la fuente
  extra citada, si la fecha va en el formato de la serie y si el salto frente al punto anterior no
  es absurdo (×5). Los puntos viven en `noticias_series_puntos` (ejecutar `series_supabase.sql`).
  Sin la tabla, el ciclo sigue con la semilla y avisa en el registro.
- **Añadir una serie:** entrada nueva en `series.json` (id, título, unidad, fuente, frecuencia,
  expediente, `abierta`, `semilla` opcional) y commit. El motor la ve en el ciclo siguiente.
- **Corregir un punto:** `update noticias_series_puntos set valor=… where serie='…' and fecha='…';`
  o borrarlo. Lo publicado no cambia hasta que otra noticia use la serie.
- **Gráficos** (`src/periodico/Graficos.jsx`): `serie`, `barras`, `cifra`, `comparacion`,
  `proporcion`, `mapa`. Uno que no sale de una serie se descarta si alguno de sus números no está
  en las capturas de la pieza (la noticia se publica sin él).
- **Ensayo de maqueta** sin Kokoro ni Supabase: `env -u SUPABASE_URL -u SUPABASE_SERVICE_ROLE_KEY
  node ops/noticias/ciclo.mjs --sin-desplegar --sin-audio` (audio mudo; caché `estado/audio-ensayo/`,
  separada de la de producción). Con `?demo` en `npm start` hay una pieza de cada tipo de gráfico.

## Pendiente
- Imágenes: hoy las noticias salen sin imagen (las fotos de los medios tienen derechos). Opciones:
  gráfico de datos propio o ilustración IA rotulada (Workers AI / FLUX), §11.4.
- Fuentes que exigen JavaScript o redes sociales verificadas: navegador headless (Obscura).
- Cuentas de agencias (EFE, AP) por RSS directo en vez de vía Google Noticias.
