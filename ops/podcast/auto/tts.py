#!/usr/bin/env python3
"""Voces de los podcasts automáticos con VoxCPM2 (local, GPU).

Uso: <venv>/bin/python tts.py <manifiesto.json>

manifiesto = {
  "salida": "<dir>",                       # aquí van t-0001.wav … y duraciones.json
  "voces": {"A": {"referencia": "<wav>|null", "texto_referencia": "…|null", "diseno": "(…)"}, …},
  "turnos": [{"id": "t-0001", "voz": "A", "texto": "texto ya pasado a palabras"}, …]
}
Con `referencia` clona esa voz (y con `texto_referencia`, en modo continuación, más fiel).
Sin ella usa la voz diseñada por descripción: solo para ensayos, nunca para publicar.
"""
import json, os, re, sys, time

import numpy as np
import soundfile as sf
import torch
from voxcpm import VoxCPM

MAX = 220          # caracteres por trozo: VoxCPM pierde calidad en frases muy largas
PAUSA_FRASE = 0.16 # segundos entre trozos de un mismo turno


def trozos(texto):
    frases = re.split(r"(?<=[.!?;:])\s+", texto.strip())
    out, cur = [], ""
    for f in frases:
        if len(cur) + len(f) + 1 <= MAX:
            cur = f"{cur} {f}".strip()
        else:
            if cur:
                out.append(cur)
            while len(f) > MAX:  # frase larguísima: se corta por la última coma posible
                corte = f.rfind(",", 0, MAX)
                corte = corte if corte > 40 else MAX
                out.append(f[: corte + 1].strip())
                f = f[corte + 1 :].strip()
            cur = f
    if cur:
        out.append(cur)
    return out


def main():
    man = json.load(open(sys.argv[1], encoding="utf-8"))
    os.makedirs(man["salida"], exist_ok=True)
    t0 = time.time()
    m = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False)
    sr = m.tts_model.sample_rate
    print(f"modelo cargado en {time.time() - t0:.0f} s", flush=True)

    duraciones = {}
    for t in man["turnos"]:
        v = man["voces"][t["voz"]]
        ref = v.get("referencia")
        ref = os.path.expanduser(ref) if ref else None
        partes = []
        for frag in trozos(t["texto"]):
            if ref and os.path.exists(ref):
                kw = {"reference_wav_path": ref}
                if v.get("texto_referencia"):
                    kw.update(prompt_wav_path=ref, prompt_text=v["texto_referencia"])
                wav = m.generate(text=frag, cfg_value=2.0, inference_timesteps=10, **kw)
            else:
                wav = m.generate(text=v["diseno"] + frag, cfg_value=2.0, inference_timesteps=10)
            partes += [np.asarray(wav, dtype=np.float32), np.zeros(int(sr * PAUSA_FRASE), dtype=np.float32)]
        audio = np.concatenate(partes[:-1]) if partes else np.zeros(1, dtype=np.float32)
        sf.write(os.path.join(man["salida"], f"{t['id']}.wav"), audio, sr)
        duraciones[t["id"]] = round(len(audio) / sr, 3)
        print(f"{t['id']} {t['voz']} {duraciones[t['id']]:.1f} s", flush=True)

    json.dump({"sr": sr, "duraciones": duraciones}, open(os.path.join(man["salida"], "duraciones.json"), "w"))
    print(f"listo en {time.time() - t0:.0f} s · vram pico {torch.cuda.max_memory_allocated() / 2**30:.1f} GiB", flush=True)


if __name__ == "__main__":
    main()
