import { readFile, writeFile } from "node:fs/promises";
const [, , inPath, outPath, password] = process.argv;
const plaintext = await readFile(inPath, "utf8");
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const ITER = 250000;
const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name:"PBKDF2", salt, iterations:ITER, hash:"SHA-256" }, baseKey, { name:"AES-GCM", length:256 }, false, ["encrypt"]);
const ctBuf = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, enc.encode(plaintext));
const b64 = (u8) => Buffer.from(u8).toString("base64");
const payload = { salt:b64(salt), iv:b64(iv), iter:ITER, ct:b64(new Uint8Array(ctBuf)) };

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Private · Learning Programme Quest</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'VT323',monospace; background:#070b24; color:#e8ecff;
    min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
    background-image:radial-gradient(circle at 20% 30%, rgba(120,140,255,.10), transparent 40%),
                     radial-gradient(circle at 80% 70%, rgba(242,193,78,.08), transparent 40%);
  }
  .gate {
    width:100%; max-width:420px; text-align:center;
    background:rgba(13,18,52,.85); border:3px solid #2a3270;
    box-shadow:0 0 0 3px #070b24, 0 0 40px rgba(80,100,220,.25);
    border-radius:6px; padding:44px 30px;
    image-rendering:pixelated;
  }
  .gate .tag {
    font-family:'Press Start 2P',monospace; font-size:8px; letter-spacing:.15em;
    text-transform:uppercase; color:#8a93d6; margin-bottom:22px; line-height:1.6;
  }
  .gate h1 {
    font-family:'Press Start 2P',monospace; font-size:30px; line-height:1; color:#f2c14e;
    text-shadow:3px 3px 0 #b07c12; margin-bottom:18px; letter-spacing:.04em;
  }
  .gate .sub { font-size:21px; color:rgba(232,236,255,.7); margin-bottom:26px; }
  .gate input {
    width:100%; padding:12px 14px; border:2px solid #3a4490; border-radius:4px;
    background:#0a1030; color:#e8ecff; font-family:'VT323',monospace; font-size:22px;
    text-align:center; outline:none;
  }
  .gate input:focus { border-color:#f2c14e; }
  .gate input::placeholder { color:rgba(232,236,255,.3); }
  .gate button {
    width:100%; margin-top:14px; padding:13px 16px; border:none; border-radius:4px;
    background:#f2c14e; color:#2a1d04; font-family:'Press Start 2P',monospace; font-size:11px;
    cursor:pointer; box-shadow:0 4px 0 #b07c12; transition:transform .05s;
  }
  .gate button:hover { background:#ffd166; }
  .gate button:active { transform:translateY(3px); box-shadow:0 1px 0 #b07c12; }
  .gate button:disabled { opacity:.6; cursor:default; }
  .gate .err { color:#ff7b7b; font-size:18px; margin-top:16px; min-height:20px; }
  .gate .hint { color:rgba(232,236,255,.35); font-size:17px; margin-top:22px; }
</style>
</head>
<body>
  <form class="gate" id="gate" autocomplete="off">
    <div class="tag">Hastings Hub · Learning Programme</div>
    <h1>QUEST</h1>
    <div class="sub">▶ Enter access code to begin</div>
    <input id="pw" type="password" placeholder="ACCESS CODE" autocomplete="current-password" autofocus>
    <button id="go" type="submit">PRESS START</button>
    <div class="err" id="err"></div>
    <div class="hint">Ask Alex for the code.</div>
  </form>
  <script>
    const DATA = ${JSON.stringify(payload)};
    const b64ToBytes = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const form = document.getElementById('gate'), pw = document.getElementById('pw');
    const go = document.getElementById('go'), err = document.getElementById('err');
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); err.textContent = '';
      go.disabled = true; go.textContent = 'LOADING…';
      try {
        const enc = new TextEncoder();
        const baseKey = await crypto.subtle.importKey('raw', enc.encode(pw.value), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({ name:'PBKDF2', salt:b64ToBytes(DATA.salt), iterations:DATA.iter, hash:'SHA-256' }, baseKey, { name:'AES-GCM', length:256 }, false, ['decrypt']);
        const ptBuf = await crypto.subtle.decrypt({ name:'AES-GCM', iv:b64ToBytes(DATA.iv) }, key, b64ToBytes(DATA.ct));
        const htmlText = new TextDecoder().decode(ptBuf);
        document.open(); document.write(htmlText); document.close();
      } catch (_) {
        go.disabled = false; go.textContent = 'PRESS START';
        err.textContent = '✗ Wrong code — try again.'; pw.value = ''; pw.focus();
      }
    });
  </script>
</body>
</html>`;
await writeFile(outPath, html, "utf8");
console.log("wrote", outPath, "(" + html.length + " bytes)");
