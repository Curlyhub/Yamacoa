#!/usr/bin/env python3
"""Subida de los trozos del estudio de grabación (sustituye al Worker workers/media + R2).

Corre en el servidor de tts.yamacoa.com detrás de nginx (location /grabacion/ -> 127.0.0.1:8091).

  PUT /grabacion/<uuid>/<n>   cuerpo = trozo de audio (MediaRecorder, 10 s)
  GET /grabacion/salud

Autorización: el JWT de Supabase del usuario. No se verifica la firma aquí: se pide la fila
de la grabación con ese JWT bajo RLS; si Supabase la devuelve, el token es válido, la
grabación es de quien sube y vemos su estado. Solo se aceptan trozos con estado 'grabando'.
Idempotente: re-subir el mismo <n> sobrescribe. Guarda en DATOS/<uuid>/trozos/NNNNN.<ext>,
carpeta privada que nginx no sirve. Sin dependencias (biblioteca estándar).
Configuración por entorno (unidad systemd): SUPABASE_URL, SUPABASE_ANON, ORIGENES, DATOS.
"""
import json, os, re, tempfile, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_ANON = os.environ["SUPABASE_ANON"]
ORIGENES = [o.strip() for o in os.environ.get("ORIGENES", "").split(",") if o.strip()]
DATOS = os.environ.get("DATOS", "/var/lib/yamacoa-grabaciones")
PUERTO = int(os.environ.get("PUERTO", "8091"))
MAX_TROZO = 40 * 1024 * 1024
EXT = {"audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg"}
RUTA = re.compile(r"^/grabacion/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/(\d{1,5})$")
permitidas = {}  # (token, id) -> caduca


def grabacion_abierta(token, gid):
    clave = (token, gid)
    if permitidas.get(clave, 0) > time.time():
        return True
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/grabaciones?id=eq.{gid}&select=estado",
                                 headers={"apikey": SUPABASE_ANON, "Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            filas = json.load(r)
    except Exception:
        return False
    ok = isinstance(filas, list) and len(filas) == 1 and filas[0].get("estado") == "grabando"
    if ok:
        permitidas[clave] = time.time() + 60
    return ok


class Manejador(BaseHTTPRequestHandler):
    server_version = "yamacoa-subida"

    def cors(self):
        origen = self.headers.get("Origin", "")
        self.send_header("Access-Control-Allow-Origin", origen if origen in ORIGENES else (ORIGENES[0] if ORIGENES else "null"))
        self.send_header("Access-Control-Allow-Methods", "PUT, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.send_header("Vary", "Origin")

    def responder(self, status, cuerpo):
        datos = json.dumps(cuerpo).encode()
        self.send_response(status)
        self.cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        self.responder(200, {"ok": True}) if self.path == "/grabacion/salud" else self.responder(404, {"error": "ruta"})

    def do_PUT(self):
        m = RUTA.match(self.path)
        if not m:
            return self.responder(404, {"error": "ruta"})
        gid, n = m.groups()
        token = re.sub(r"(?i)^Bearer\s+", "", self.headers.get("Authorization", ""))
        if not token:
            return self.responder(401, {"error": "auth"})
        ext = EXT.get(self.headers.get("Content-Type", "").split(";")[0].strip())
        if not ext:
            return self.responder(415, {"error": "tipo"})
        largo = int(self.headers.get("Content-Length") or 0)
        if not 0 < largo <= MAX_TROZO:
            return self.responder(413, {"error": "tamaño"})
        if not grabacion_abierta(token, gid):
            return self.responder(403, {"error": "grabación cerrada o ajena"})
        cuerpo = self.rfile.read(largo)
        if len(cuerpo) != largo:
            return self.responder(400, {"error": "cuerpo incompleto"})
        destino = os.path.join(DATOS, gid, "trozos")
        os.makedirs(destino, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=destino, prefix=".subiendo-")
        with os.fdopen(fd, "wb") as f:
            f.write(cuerpo)
        os.replace(tmp, os.path.join(destino, f"{int(n):05d}.{ext}"))  # atómico: nunca un trozo a medias
        self.responder(201, {"ok": True, "n": int(n), "bytes": len(cuerpo)})

    def log_message(self, fmt, *args):  # sin IPs ni tokens en el registro
        print(f"{self.command} {self.path.split('?')[0]} -> {args[1] if len(args) > 1 else ''}", flush=True)


if __name__ == "__main__":
    os.makedirs(DATOS, exist_ok=True)
    ThreadingHTTPServer(("127.0.0.1", PUERTO), Manejador).serve_forever()
