"""Resumen hablado de noticias con Kokoro en el PC (2026-10-18), el mismo modelo y voz que
tts.yamacoa.com (Kokoro v1.0, ef_dora) pero en segundos en lugar de minutos.

Uso: kokoro_local.py <salida.wav>   (texto por la entrada estándar)
Entorno: ~/bohio/yamacoa-tts/kokoro-venv (kokoro-onnx); modelos en ~/bohio/yamacoa-tts/modelos/kokoro/.
"""
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

MODELOS = os.path.expanduser("~/bohio/yamacoa-tts/modelos/kokoro")
VOZ = os.environ.get("YAMACOA_KOKORO_VOZ", "ef_dora")


def main():
    texto = sys.stdin.read().strip()
    if not texto:
        sys.exit("sin texto")
    k = Kokoro(os.path.join(MODELOS, "kokoro-v1.0.onnx"), os.path.join(MODELOS, "voices-v1.0.bin"))
    audio, sr = k.create(texto, voice=VOZ, speed=1.0, lang="es")
    sf.write(sys.argv[1], audio, sr)


if __name__ == "__main__":
    main()
