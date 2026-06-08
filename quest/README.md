# Learning Programme Quest — password-gated deploy

The retro game tracker (root `index.html` + `script.js` + `styles.css` + `template.json`)
bundled into a single self-contained page, encrypted (AES-256-GCM), and served on
Cloudflare at **quest.hastingshub.com**.

Only ciphertext is stored in `index.html`; the app is unreadable without the password.

## Rebuild
```
node bundle.mjs        # inlines css/js/json -> /tmp/quest_bundled.html
node build-gate.mjs /tmp/quest_bundled.html index.html <password>
```
Then redeploy the Worker named `quest`. Password is held by Alex (not stored in the repo).
