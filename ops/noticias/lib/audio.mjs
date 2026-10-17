// Resumen hablado con Kokoro (tts.yamacoa.com). La síntesis es lenta (≈1 min por
// párrafo y más si hay cola), así que se usa curl con margen amplio: el fetch de Node
// corta las cabeceras a los 300 s. WAV de 24 kHz -> MP3 mono 64 kb/s con ffmpeg.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TTS = process.env.YAMACOA_TTS || "https://tts.yamacoa.com/api/tts";
export const VOZ = "Kokoro · ef_dora";

export function sintetizar(texto, destinoMp3) {
  const wav = destinoMp3.replace(/\.mp3$/, ".wav");
  fs.mkdirSync(path.dirname(destinoMp3), { recursive: true });
  for (let intento = 1; intento <= 2; intento++) {
    const r = spawnSync("curl", ["-sS", "-f", "-X", "POST", TTS, "-H", "Content-Type: application/json",
      "--data-binary", "@-", "--max-time", "900", "-o", wav], { input: JSON.stringify({ text: texto }), encoding: "utf8" });
    if (r.status === 0 && fs.existsSync(wav) && fs.statSync(wav).size > 1000) break;
    if (intento === 2) throw new Error(`tts: ${(r.stderr || "").trim() || "sin audio"}`);
    spawnSync("sleep", ["20"]);
  }
  const f = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "64k", destinoMp3], { encoding: "utf8" });
  fs.rmSync(wav, { force: true });
  if (f.status !== 0) throw new Error(`ffmpeg: ${f.stderr}`);
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", destinoMp3], { encoding: "utf8" });
  return Math.max(1, Math.round(parseFloat(p.stdout) || 1));
}
