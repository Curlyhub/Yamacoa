#!/usr/bin/env python3
"""Transcripción en español con faster-whisper (GPU si la hay) para ops/podcast/procesar.sh.

Uso: <venv>/bin/python transcribir.py <audio> <salida.json>
Escribe el mismo formato que la rama de whisper.cpp:
  {idioma, modelo, segmentos: [{inicio, fin, texto, hablante: null}]}
"""
import json, os, subprocess, sys

import numpy as np
from faster_whisper import WhisperModel

audio, salida = sys.argv[1], sys.argv[2]
modelo = os.environ.get("YAMACOA_WHISPER", "medium")
try:
    m = WhisperModel(modelo, device="cuda", compute_type="float16")
except Exception:
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
# Se decodifica con ffmpeg a 16 kHz mono (el decodificador de av falla con algunos ficheros).
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, language="es",
                       beam_size=5, vad_filter=True)
json.dump({"idioma": "es", "modelo": f"faster-whisper {modelo}",
           "segmentos": [{"inicio": round(s.start, 2), "fin": round(s.end, 2), "texto": s.text.strip(), "hablante": None}
                         for s in segs]},
          open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
