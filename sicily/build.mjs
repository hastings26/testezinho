// Encrypts a plaintext HTML file with a password and emits a self-contained
// password-gated index.html. Only ciphertext is written to the output, so the
// sensitive trip details never appear in the published page source.
import { readFile, writeFile } from "node:fs/promises";

const [, , inPath, outPath, password] = process.argv;
if (!inPath || !outPath || !password) {
  console.error("usage: node build.mjs <in.html> <out.html> <password>");
  process.exit(1);
}

const plaintext = await readFile(inPath, "utf8");
const enc = new TextEncoder();

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const ITER = 250000;

const baseKey = await crypto.subtle.importKey(
  "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"]
);
const ctBuf = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, enc.encode(plaintext)
);

const b64 = (u8) => Buffer.from(u8).toString("base64");
const payload = {
  salt: b64(salt),
  iv: b64(iv),
  iter: ITER,
  ct: b64(new Uint8Array(ctBuf)),
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Private · Sicily 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'DM Sans',sans-serif; background:#1A1208; color:#FDFAF4;
    min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .gate {
    width:100%; max-width:360px; text-align:center;
    background:rgba(253,250,244,0.04); border:1px solid rgba(253,250,244,0.08);
    border-radius:24px; padding:40px 28px;
  }
  .gate .tag {
    font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase;
    color:#C4622D; margin-bottom:14px;
  }
  .gate h1 {
    font-family:'Cormorant Garamond',serif; font-weight:300; font-size:46px; line-height:0.95;
    margin-bottom:8px;
  }
  .gate h1 em { font-style:italic; color:#C9962A; }
  .gate .sub {
    font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
    color:rgba(253,250,244,0.5); margin-bottom:28px;
  }
  .gate input {
    width:100%; padding:13px 16px; border-radius:100px; border:1.5px solid rgba(253,250,244,0.15);
    background:rgba(253,250,244,0.06); color:#FDFAF4; font-family:inherit; font-size:15px;
    text-align:center; outline:none; transition:border-color .2s;
  }
  .gate input:focus { border-color:#C9962A; }
  .gate input::placeholder { color:rgba(253,250,244,0.35); }
  .gate button {
    width:100%; margin-top:12px; padding:13px 16px; border-radius:100px; border:none;
    background:#C4622D; color:#FDFAF4; font-family:inherit; font-size:15px; font-weight:500;
    cursor:pointer; transition:background .2s;
  }
  .gate button:hover { background:#a8501f; }
  .gate button:disabled { opacity:.6; cursor:default; }
  .gate .err {
    color:#E08B6A; font-size:13px; margin-top:14px; min-height:18px; line-height:1.4;
  }
  .gate .hint {
    color:rgba(253,250,244,0.35); font-size:12px; margin-top:20px; line-height:1.5;
  }
</style>
</head>
<body>
  <form class="gate" id="gate" autocomplete="off">
    <div class="tag">Alex &amp; Seb · July 2026</div>
    <h1>Sici<em>lia</em></h1>
    <div class="sub">This trip is private</div>
    <input id="pw" type="password" placeholder="Enter password" autocomplete="current-password" autofocus>
    <button id="go" type="submit">Unlock</button>
    <div class="err" id="err"></div>
    <div class="hint">Ask Alex for the password.</div>
  </form>

  <script>
    const DATA = ${JSON.stringify(payload)};
    const b64ToBytes = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const form = document.getElementById('gate');
    const pw = document.getElementById('pw');
    const go = document.getElementById('go');
    const err = document.getElementById('err');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      go.disabled = true; go.textContent = 'Unlocking…';
      try {
        const enc = new TextEncoder();
        const baseKey = await crypto.subtle.importKey(
          'raw', enc.encode(pw.value), 'PBKDF2', false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
          { name:'PBKDF2', salt:b64ToBytes(DATA.salt), iterations:DATA.iter, hash:'SHA-256' },
          baseKey, { name:'AES-GCM', length:256 }, false, ['decrypt']
        );
        const ptBuf = await crypto.subtle.decrypt(
          { name:'AES-GCM', iv:b64ToBytes(DATA.iv) }, key, b64ToBytes(DATA.ct)
        );
        const htmlText = new TextDecoder().decode(ptBuf);
        document.open(); document.write(htmlText); document.close();
      } catch (_) {
        go.disabled = false; go.textContent = 'Unlock';
        err.textContent = 'Wrong password — try again.';
        pw.value = ''; pw.focus();
      }
    });
  </script>
</body>
</html>
`;

await writeFile(outPath, html, "utf8");
console.log("wrote", outPath, "(" + html.length + " bytes)");
