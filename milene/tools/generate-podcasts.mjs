#!/usr/bin/env node
/* Gera os episódios do Contract Gossip com vozes do Gemini (TTS) e grava:
     milene/audio/<episódio>.mp3   — um arquivo por episódio
     milene/audio/manifest.js      — início de cada fala (para destacar a linha e permitir pular)

   Uso:
     GEMINI_API_KEY=... node generate-podcasts.mjs            # todos os episódios
     GEMINI_API_KEY=... node generate-podcasts.mjs ep1 ep3    # só alguns
     node generate-podcasts.mjs --mock                        # sem API: áudio de teste, para validar o app

   Variáveis opcionais: GEMINI_TTS_MODEL (padrão abaixo).
   Cada fala é gerada separadamente e guardada em .cache/, então rodar de novo só refaz o que mudou. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Mp3Encoder } from "@breezystack/lamejs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "audio");
const CACHE = path.join(HERE, ".cache");
const RATE = 24000;            // Gemini TTS devolve PCM 16-bit mono a 24 kHz
const PAUSE_S = 0.35;          // respiro entre falas
const MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const KEY = process.env.GEMINI_API_KEY;

/* Voz e direção de cada personagem. Troque as vozes à vontade (lista no AI Studio). */
const VOICES = {
  re:   { voice: "Aoede",  style: "Fale em português do Brasil, como uma colega do Financeiro contando uma fofoca de escritório: animada, rápida, bem-humorada." },
  jura: { voice: "Charon", style: "Fale em português do Brasil, como um advogado do Jurídico: teatral e um pouco dramático, mas claro e preciso." },
  tati: { voice: "Zephyr", style: "Fale em português do Brasil, como uma arquiteta de TI jovem, empolgada e direta." }
};

const args = process.argv.slice(2);
const MOCK = args.includes("--mock");
const only = args.filter((a) => !a.startsWith("--"));
if (!MOCK && !KEY) { console.error("Defina GEMINI_API_KEY (ou use --mock)."); process.exit(1); }

/* Carrega os episódios direto do conteúdo do app. */
const loadBrowserScript = (file) => { const g = {}; g.window = g; vm.runInNewContext(fs.readFileSync(file, "utf8"), g); return g.MM || {}; };
const EPISODES = loadBrowserScript(path.join(ROOT, "content-gossip.js")).EPISODES.filter((e) => !only.length || only.includes(e.id));

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tts(who, text) {
  const v = VOICES[who];
  const hash = crypto.createHash("sha1").update([MOCK, MODEL, v.voice, v.style, text].join("|")).digest("hex").slice(0, 16);
  const file = path.join(CACHE, `${who}-${hash}.pcm`);
  if (fs.existsSync(file)) return new Int16Array(new Uint8Array(fs.readFileSync(file)).buffer);

  let pcm;
  if (MOCK) {
    const secs = Math.max(1, text.split(/\s+/).length / 2.6);   // ~155 palavras/min
    pcm = new Int16Array(Math.round(secs * RATE));
    const f = { re: 330, jura: 196, tati: 440 }[who];
    for (let i = 0; i < pcm.length; i++) pcm[i] = (i % RATE < RATE * 0.15 ? 2500 : 0) * Math.sin((2 * Math.PI * f * i) / RATE);
  } else {
    const body = {
      contents: [{ parts: [{ text: `${v.style}\n\n${text}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v.voice } } } }
    };
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body)
      });
      if (res.ok) {
        const json = await res.json();
        const data = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
        if (!data) throw new Error("Resposta sem áudio: " + JSON.stringify(json).slice(0, 300));
        const buf = Buffer.from(data, "base64");
        pcm = new Int16Array(buf.buffer, buf.byteOffset, buf.length >> 1).slice();
        break;
      }
      const msg = await res.text();
      if ((res.status === 429 || res.status >= 500) && attempt < 6) {
        const wait = 2000 * 2 ** attempt;
        console.warn(`  ${res.status} — tentando de novo em ${wait / 1000}s`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Gemini ${res.status}: ${msg.slice(0, 400)}`);
    }
  }
  fs.writeFileSync(file, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength));
  return pcm;
}

function toMp3(chunks) {
  const enc = new Mp3Encoder(1, RATE, 64);
  const parts = [];
  for (const c of chunks) for (let i = 0; i < c.length; i += 1152 * 20) { const b = enc.encodeBuffer(c.subarray(i, i + 1152 * 20)); if (b.length) parts.push(Buffer.from(b)); }
  parts.push(Buffer.from(enc.flush()));
  return Buffer.concat(parts);
}

const manifestPath = path.join(OUT, "manifest.js");
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = loadBrowserScript(manifestPath).AUDIO || {};
}

const silence = new Int16Array(Math.round(PAUSE_S * RATE));
for (const ep of EPISODES) {
  console.log(`▶ ${ep.id} — ${ep.title} (${ep.lines.length} falas)`);
  const chunks = [], starts = [];
  let t = 0;
  for (const [i, [who, text]] of ep.lines.entries()) {
    const pcm = await tts(who, text);
    starts.push(+t.toFixed(2));
    chunks.push(pcm, silence);
    t += (pcm.length + silence.length) / RATE;
    process.stdout.write(`  ${i + 1}/${ep.lines.length}\r`);
  }
  fs.writeFileSync(path.join(OUT, `${ep.id}.mp3`), toMp3(chunks));
  manifest[ep.id] = { src: `audio/${ep.id}.mp3`, duration: +t.toFixed(2), starts, voice: MOCK ? "mock" : "gemini" };
  console.log(`  ✓ ${ep.id}.mp3 · ${Math.floor(t / 60)}min${String(Math.round(t % 60)).padStart(2, "0")}s`);
}

fs.writeFileSync(manifestPath,
  "/* Gerado por tools/generate-podcasts.mjs — não edite à mão. */\nwindow.MM = window.MM || {};\nMM.AUDIO = " + JSON.stringify(manifest, null, 2) + ";\n");
console.log("Manifest atualizado:", path.relative(process.cwd(), manifestPath));
