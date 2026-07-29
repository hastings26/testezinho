/* =============================================================================
   Build a single self-contained MIP Compass file.

     node mip-compass/build-single.mjs

   Produces ../mip-compass-standalone.html — one file, no folder, no server,
   no internet. Double-click it, email it, or drop it into an LMS.

   The game and the admin live in the same file; the gear icon switches
   between them via the #admin hash.
   ============================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), 'utf8');

const parts = {
  styles: read('styles.css'),
  adminCss: read('admin.css'),
  data: read('data.js'),
  store: read('store.js'),
  map: read('map.js'),
  game: read('game.js'),
  admin: read('admin.js')
};

/* The shared header, both app roots, and a hash router. Kept here rather than
   parsed out of the two page shells so the merged layout stays readable. */
const BODY = `
<a class="skip-link" href="#mipcApp">Skip to the game</a>

<div class="app-shell">

  <header class="app-header">
    <a class="brand-mark" href="#play">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#0C1223" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="10.5" fill="none" stroke="#00D09C" stroke-width="1.6" opacity=".55"/>
        <path d="M16 6.5l3.6 10.1L16 25.5l-3.6-8.9z" fill="#3B7BFF"/>
        <path d="M16 6.5l3.6 10.1H16z" fill="#00D09C"/>
        <circle cx="16" cy="16" r="1.9" fill="#fff"/>
      </svg>
      <span>MIP Compass<small id="mipcMode">Partner readiness</small></span>
    </a>

    <div class="header-actions">
      <button id="mipcMotion" class="icon-btn" type="button" aria-pressed="false" title="Toggle animations">
        <span class="sr-only">Reduce animations</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3l-8 10h6l-2 8 8-10h-6z"/></svg>
      </button>
      <a id="mipcAdminLink" class="icon-btn" href="#admin" title="Content admin">
        <span class="sr-only">Content admin</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M20.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.6 13a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.7-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 3.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.4 11a2 2 0 1 1 0 4z"/></svg>
      </a>
      <button id="mipcRestart" class="icon-btn" type="button" title="Start over">
        <span class="sr-only">Start over</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
    </div>
  </header>

  <p id="mipcStorageWarn" class="storage-warn" hidden>
    This browser is blocking local storage, so your progress will not survive a refresh. The game still works.
  </p>

  <div id="gameRoot">
    <main id="mipcApp"></main>
  </div>

  <div id="adminRoot" hidden>
    <main id="adminApp" class="admin-main"></main>
  </div>

  <div id="mipcLive" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

  <footer class="app-footer">
    <p id="mipcFoot">MIP Compass · a judgement game, not a knowledge test. Single-file build — everything runs offline.</p>
  </footer>

</div>`;

const ROUTER = `
/* --- hash router: #admin shows the editor, anything else shows the game --- */
(function () {
  var game = document.getElementById('gameRoot');
  var admin = document.getElementById('adminRoot');
  var mode = document.getElementById('mipcMode');
  var link = document.getElementById('mipcAdminLink');
  var restart = document.getElementById('mipcRestart');

  function route() {
    var isAdmin = window.location.hash.indexOf('admin') === 1;
    game.hidden = isAdmin;
    admin.hidden = !isAdmin;
    mode.textContent = isAdmin ? 'Content admin' : 'Partner readiness';
    link.setAttribute('href', isAdmin ? '#play' : '#admin');
    link.setAttribute('title', isAdmin ? 'Back to the game' : 'Content admin');
    restart.hidden = isAdmin;
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route);
  else route();
})();`;

const out = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>MIP Compass — find the right route for each partner</title>
<meta name="description" content="A five-minute judgement game for Channel Account Managers: assess a partner's AI maturity, choose the right commercial route, and recommend a credible next step." />
<meta name="color-scheme" content="dark" />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23070B16'/><circle cx='16' cy='16' r='11' fill='none' stroke='%2300D09C' stroke-width='2'/><path d='M16 7l3.4 9.6L16 25l-3.4-8.4z' fill='%233B7BFF'/></svg>" />
<style>
${parts.styles}
${parts.adminCss}
</style>
</head>
<body>
${BODY}
<script>
${parts.data}
</script>
<script>
${parts.store}
</script>
<script>
${parts.map}
</script>
<script>
${parts.game}
</script>
<script>
${parts.admin}
</script>
<script>
${ROUTER}
</script>
</body>
</html>
`;

writeFileSync(join(here, '..', 'mip-compass-standalone.html'), out, 'utf8');
console.log('Wrote mip-compass-standalone.html (' + Math.round(out.length / 1024) + ' KB)');

/* --- Optional second output, for hosting as a claude.ai Artifact -----------
   Artifacts supply their own <!doctype>/<head>/<body>, so that wrapper is
   omitted. No external requests: the font stack is system-native and the CSP
   would block a font CDN anyway.
     node mip-compass/build-single.mjs --artifact <path>                     */
const flag = process.argv.indexOf('--artifact');
if (flag > -1 && process.argv[flag + 1]) {
  const fragment = `<title>MIP Compass — find the right route for each partner</title>
<style>
${parts.styles}
${parts.adminCss}
</style>
${BODY}
<script>
${parts.data}
</script>
<script>
${parts.store}
</script>
<script>
${parts.map}
</script>
<script>
${parts.game}
</script>
<script>
${parts.admin}
</script>
<script>
${ROUTER}
</script>
`;
  writeFileSync(process.argv[flag + 1], fragment, 'utf8');
  console.log('Wrote artifact build to ' + process.argv[flag + 1] + ' (' + Math.round(fragment.length / 1024) + ' KB)');
}
