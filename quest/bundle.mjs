import fs from 'fs';
const dir = '/home/user/testezinho';
let html = fs.readFileSync(`${dir}/index.html`,'utf8');
const css = fs.readFileSync(`${dir}/styles.css`,'utf8');
let js  = fs.readFileSync(`${dir}/script.js`,'utf8');
const tpl = fs.readFileSync(`${dir}/template.json`,'utf8');

// safety: prevent premature </script> termination when inlining
const safe = s => s.replace(/<\/script>/gi, '<\\/script>');
const tplSafe = JSON.stringify(JSON.parse(tpl)).replace(/<\//g, '<\\/');

// 1) inline CSS
if (!html.includes('href="styles.css"')) throw new Error('css link not found');
html = html.replace(/<link rel="stylesheet" href="styles\.css" \/>/, `<style>\n${css}\n</style>`);

// 2) inject a fetch shim that serves the embedded template.json, then inline script.js
const shim = `<script>
(function(){
  const __TPL__ = ${tplSafe};
  const __orig = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function(u){
    try { if (typeof u === 'string' && u.indexOf('template.json') !== -1) {
      return Promise.resolve(new Response(JSON.stringify(__TPL__), {status:200, headers:{'content-type':'application/json'}}));
    } } catch(e){}
    return __orig ? __orig.apply(window, arguments) : Promise.reject('no fetch');
  };
})();
</script>`;

if (!html.includes('<script src="script.js"></script>')) throw new Error('script tag not found');
html = html.replace('<script src="script.js"></script>', `${shim}\n<script>\n${safe(js)}\n</script>`);

fs.writeFileSync('/tmp/quest_bundled.html', html);
console.log('bundled bytes:', html.length);
console.log('still references external file?:',
  /href="styles\.css"|src="script\.js"/.test(html) ? 'YES (bad)' : 'no (good)');
