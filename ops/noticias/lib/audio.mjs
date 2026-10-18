// Resumen hablado con Kokoro v1.0 (voz ef_dora). Desde 2026-10-18 se sintetiza en el PC
// (ops/noticias/kokoro_local.py: ≈6 s por noticia); si falla, en tts.yamacoa.com, que es lento
// (≈7 min por noticia), así que allí se usa curl con margen amplio: el fetch de Node corta las
// cabeceras a los 300 s. WAV de 24 kHz -> MP3 mono 64 kb/s con ffmpeg.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TTS = process.env.YAMACOA_TTS || "https://tts.yamacoa.com/api/tts";
const HOME = process.env.HOME || "/home/<usuario>";
const PY_LOCAL = process.env.YAMACOA_KOKORO_PY || `${HOME}/bohio/yamacoa-tts/kokoro-venv/bin/python`;
const LOCAL = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "kokoro_local.py");

function local(texto, wav) {
  if (process.env.YAMACOA_TTS_SERVIDOR || !fs.existsSync(PY_LOCAL)) return false;
  const r = spawnSync(PY_LOCAL, [LOCAL, wav], { input: texto, encoding: "utf8", timeout: 5 * 60000 });
  return r.status === 0 && fs.existsSync(wav) && fs.statSync(wav).size > 1000;
}
export const VOZ = "Kokoro · ef_dora";

export function sintetizar(texto, destinoMp3) {
  const wav = destinoMp3.replace(/\.mp3$/, ".wav");
  fs.mkdirSync(path.dirname(destinoMp3), { recursive: true });
  for (let intento = local(texto, wav) ? 3 : 1; intento <= 2; intento++) {
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
