#!/usr/bin/env bash
# Instala en el servidor de tts.yamacoa.com la subida del estudio de grabación (2026-10-18).
# Se ejecuta UNA vez, como ubuntu con sudo, desde la carpeta donde se copiaron estos ficheros:
#   subida_estudio.py · yamacoa-subida.service · yamacoa-grabaciones · grabaciones.pub · admin.pub
# Es idempotente. Al final retira la clave temporal de administración (admin.pub).
set -euo pipefail
cd "$(dirname "$0")"
CONF=$(readlink -f /etc/nginx/sites-enabled/yamacoa-tts)

# 1. Datos privados (nginx no los sirve) y servicio
sudo install -d -o ubuntu -g ubuntu -m 750 /var/lib/yamacoa-grabaciones
sudo install -d -m 755 /usr/local/lib/yamacoa /etc/yamacoa
sudo install -m 644 subida_estudio.py /usr/local/lib/yamacoa/subida_estudio.py
sudo tee /etc/yamacoa/subida.env >/dev/null <<ENV
SUPABASE_URL=https://qsajkrppuaikyzmuipru.supabase.co
SUPABASE_ANON=sb_publishable_iuMth2MYSMZ2Y6-pN5gF8Q_Okq9CwWJ
ORIGENES=https://portal.yamacoa.com,http://localhost:8788
DATOS=/var/lib/yamacoa-grabaciones
PUERTO=8091
ENV
sudo install -m 644 yamacoa-subida.service /etc/systemd/system/yamacoa-subida.service
sudo systemctl daemon-reload
sudo systemctl enable --now yamacoa-subida
sudo systemctl restart yamacoa-subida
sleep 1
curl -fsS http://127.0.0.1:8091/grabacion/salud && echo " <- servicio"

# 2. nginx: /grabacion/ -> servicio (trozos de hasta 40 MB; sin búfer para no duplicar en disco)
if ! grep -q "location /grabacion/" "$CONF"; then
  sudo cp "$CONF" "$CONF.bak-estudio-20261018"
  sudo python3 - "$CONF" <<'PY'
import sys
p = sys.argv[1]; s = open(p).read()
bloque = """    # Estudio de grabación (2026-10-18): trozos de 10 s hacia el servicio local (privado).
    location /grabacion/ {
        client_max_body_size 41m;
        proxy_request_buffering off;
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host $host;
        proxy_read_timeout 120s;
    }

    location / {"""
assert s.count("    location / {") == 1
open(p, "w").write(s.replace("    location / {", bloque, 1))
PY
  if sudo nginx -t; then sudo systemctl reload nginx; else sudo cp "$CONF.bak-estudio-20261018" "$CONF"; echo "nginx RESTAURADO"; exit 1; fi
fi

# 3. Clave restringida del procesado
sudo install -m 755 yamacoa-grabaciones /usr/local/bin/yamacoa-grabaciones
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.bak-estudio-20261018
CLAVE=$(cut -d' ' -f1,2 grabaciones.pub)
grep -qF "$CLAVE" ~/.ssh/authorized_keys || \
  echo "command=\"/usr/local/bin/yamacoa-grabaciones\",restrict $(cat grabaciones.pub)" >> ~/.ssh/authorized_keys

# 4. Retirar la clave temporal de administración (último paso)
ADMIN=$(cut -d' ' -f2 admin.pub)
grep -vF "$ADMIN" ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.nuevo
mv ~/.ssh/authorized_keys.nuevo ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
echo "instalado; clave temporal retirada"
