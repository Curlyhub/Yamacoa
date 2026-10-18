#!/usr/bin/env python3
"""Ilustraciones de las noticias con FLUX.1-schnell (Apache-2.0), local en la GPU.

Uso: <venv>/bin/python imagen.py <manifiesto.json>
manifiesto = {"salida": "<dir>", "items": [{"id": "n-…", "prompt": "…", "seed": 123}, …]}
Escribe <salida>/<id>.webp (1200 × 675) y <salida>/imagenes.json con lo generado.

La RTX 3070 (8 GB) no aloja a la vez el codificador T5 (≈9,5 GB) y el transformador, así que:
  1. todos los prompts se codifican en la CPU (CLIP + T5) y se libera la memoria;
  2. el transformador cuantizado (GGUF Q4_K_S) se queda fijo en la GPU y genera los latentes;
  3. el VAE decodifica en la CPU (segundos): así la VRAM no se desborda a la memoria compartida
     de Windows, que multiplica por diez el tiempo.
El estilo y las prohibiciones los fija ops/noticias/ciclo.mjs; aquí solo se pinta.
"""
import gc, json, os, sys, time

import torch
from diffusers import FluxPipeline, FluxTransformer2DModel, GGUFQuantizationConfig
from huggingface_hub import hf_hub_download

REPO = "black-forest-labs/FLUX.1-schnell"
GGUF = ("city96/FLUX.1-schnell-gguf", os.environ.get("YAMACOA_FLUX_GGUF", "flux1-schnell-Q3_K_S.gguf"))
ANCHO, ALTO = 1024, 576          # 16:9; se guarda a 1200 × 675
PASOS = 4                        # schnell está destilado para 1-4 pasos


def main():
    man = json.load(open(sys.argv[1], encoding="utf-8"))
    os.makedirs(man["salida"], exist_ok=True)
    items = man["items"]
    if not items:
        return
    t0 = time.time()

    # 1. Texto -> embeddings, en CPU.
    enc = FluxPipeline.from_pretrained(REPO, transformer=None, vae=None, torch_dtype=torch.bfloat16)
    embeds = []
    with torch.no_grad():
        for it in items:
            pe, ppe, _ = enc.encode_prompt(prompt=it["prompt"], prompt_2=it["prompt"], device="cpu", max_sequence_length=256)
            embeds.append((pe, ppe))
    del enc
    gc.collect()
    print(f"textos codificados en {time.time() - t0:.0f} s", flush=True)

    # 2. Imágenes en GPU.
    tr = FluxTransformer2DModel.from_single_file(
        hf_hub_download(*GGUF), quantization_config=GGUFQuantizationConfig(compute_dtype=torch.bfloat16),
        torch_dtype=torch.bfloat16, config=REPO, subfolder="transformer")
    pipe = FluxPipeline.from_pretrained(REPO, transformer=tr, text_encoder=None, text_encoder_2=None,
                                        tokenizer=None, tokenizer_2=None, torch_dtype=torch.bfloat16)
    pipe.transformer.to("cuda")
    vae = pipe.vae.to("cpu", torch.float32)
    hechas = {}
    for it, (pe, ppe) in zip(items, embeds):
        t = time.time()
        try:
            lat = pipe(prompt_embeds=pe.to("cuda"), pooled_prompt_embeds=ppe.to("cuda"), num_inference_steps=PASOS, guidance_scale=0.0,
                       width=ANCHO, height=ALTO, output_type="latent",
                       generator=torch.Generator("cpu").manual_seed(int(it.get("seed", 0)))).images
            with torch.no_grad():
                lat = pipe._unpack_latents(lat.to("cpu", torch.float32), ALTO, ANCHO, pipe.vae_scale_factor)
                lat = lat / vae.config.scaling_factor + vae.config.shift_factor
                img = pipe.image_processor.postprocess(vae.decode(lat).sample, output_type="pil")[0]
            f = os.path.join(man["salida"], f"{it['id']}.webp")
            img.resize((1200, 675)).save(f, "WEBP", quality=80, method=6)
            hechas[it["id"]] = os.path.basename(f)
            print(f"{it['id']} {time.time() - t:.0f} s · {os.path.getsize(f) // 1024} KB", flush=True)
        except Exception as e:  # una imagen fallida no tumba las demás
            print(f"{it['id']} ERROR {e}", flush=True)
    json.dump(hechas, open(os.path.join(man["salida"], "imagenes.json"), "w"))
    print(f"listo en {time.time() - t0:.0f} s · vram pico {torch.cuda.max_memory_allocated() / 2**30:.1f} GiB", flush=True)


if __name__ == "__main__":
    main()
