// Print de uma página/seção do site (monta numa pasta temporária própria, então pode rodar em paralelo).
// node tools/shoot.mjs --page index.html --target "#cidade" --w 1440 --h 900 --out progress/shots/x.png [--full] [--mobile] [--wait 1200] [--element "#rodape"]
// --target top (padrão) = topo da página. Com seletor, rola até a seção ficar no topo da janela.
import { chromium } from 'playwright'; import { execFileSync } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL, fileURLToPath } from 'node:url';
const a = process.argv.slice(2);
const g = (k, d) => { const i = a.indexOf('--' + k); return i > -1 ? a[i + 1] : d; };
const has = k => a.includes('--' + k);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPng = path.resolve(root, g('out', 'progress/shots/shot.png'));
const mobile = has('mobile');
const w = +g('w', mobile ? 390 : 1440), h = +g('h', mobile ? 844 : 900);
const tmp = path.join(root, '.preview', path.basename(outPng, '.png') + '-' + process.pid);
execFileSync(process.execPath, [path.join(root, 'tools/build.mjs'), '--out', path.relative(root, tmp)], { stdio: 'ignore' });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
// Único erro esperado em file://: a chamada ao contador de jogadores (/api/players e o fallback do FiveM), que não existe sem servidor.
const expected = m => /\/api\/players|servers-frontend\.fivem\.net/.test((m.location() && m.location().url) || '') || /\/api\/players|servers-frontend\.fivem\.net/.test(m.text());
page.on('console', m => m.type() === 'error' && !expected(m) && errs.push(m.text() + (m.location()?.url ? ' @ ' + m.location().url : '')));
await page.goto(pathToFileURL(path.join(tmp, g('page', 'index.html'))).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const target = g('target', 'top');
if (target !== 'top') {
  const ok = await page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return false;
    document.documentElement.style.scrollBehavior = 'auto';
    // Isola a parte: esconde (sem mudar o layout) as outras seções da página, para o rodapé de uma
    // seção vizinha não aparecer no print desta parte.
    const main = el.closest('main');
    if (main) for (const sib of main.children) if (!sib.contains(el)) sib.style.visibility = 'hidden';
    const foot = document.getElementById('rodape');
    if (foot && !foot.contains(el)) foot.style.visibility = 'hidden';
    const nav = document.querySelector('[data-fixed-nav]');
    const off = nav ? nav.getBoundingClientRect().height : 0;
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - off); return true;
  }, target);
  if (!ok) console.error('ALVO NAO ENCONTRADO:', target);
}
// Página inteira: as seções com content-visibility:auto só pintam perto da tela; força todas a pintar para o print.
if (has('full')) await page.addStyleTag({ content: '*{content-visibility:visible!important}' });
await page.waitForTimeout(+g('wait', 1200));
fs.mkdirSync(path.dirname(outPng), { recursive: true });
if (g('element')) {
  const el = page.locator(g('element')).first();
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await el.screenshot({ path: outPng });
} else await page.screenshot({ path: outPng, fullPage: has('full') });
// Compara com a largura configurada (w): com isMobile o innerWidth cresce junto com o conteúdo e esconderia a rolagem.
const overflow = await page.evaluate(w => Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth, innerWidth) - w, w);
await browser.close(); fs.rmSync(tmp, { recursive: true, force: true });
console.log('print ok ->', path.relative(root, outPng), `${w}x${h}`, overflow > 0 ? `ROLAGEM HORIZONTAL: ${overflow}px` : 'sem rolagem horizontal');
if (errs.length) console.log('ERROS NO CONSOLE:\n' + errs.join('\n'));
