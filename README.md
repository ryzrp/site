# Site oficial da RYZ RP

Site estático, sem framework. RYZ se diz "Rai-Zi" e vem de Rise.

## Rodar local
```bash
npm install                 # só para as ferramentas (prints, Lighthouse)
node tools/build.mjs        # monta src/ -> dist/
node tools/serve.mjs        # abre em http://localhost:4173/
```
Estrutura: `src/pages/*.html` (esqueletos com `<!--#include ...-->`), `src/partials/`, `src/css/NN-*.css` e `src/js/NN-*.js`, `src/static/` (robots, sitemap, manifest), `assets/img` e `assets/fonts`.

O build gera um CSS e um JS por página em `dist/css/` e `dist/js/`, com hash no nome (cache de 1 ano na Vercel). Cada página recebe os arquivos compartilhados mais os dela; a divisão por prefixo `NN` fica em `BUNDLES`, no topo de `tools/build.mjs`. Arquivo novo com prefixo que não está lá entra em todas as páginas.

## Prints e Lighthouse
```bash
node tools/shoot.mjs --out progress/shots/home.png --full
node tools/shoot.mjs --mobile --full --out progress/shots/home-mobile.png
node tools/shoot.mjs --page regras.html --target "#roleplay" --out progress/shots/regras.png
node tools/lh.mjs --json progress/data/lighthouse.json            # --details mostra os elementos de cada problema
```
O Lighthouse local comprime os arquivos e simula a API de jogadores, como a Vercel, para a nota ficar próxima da de produção.

## Publicar (GitHub Pages)
Repositório: `github.com/ryzrp/site`. Todo push na `main` publica sozinho: o workflow `.github/workflows/pages.yml` roda `node tools/build.mjs` e publica a pasta `dist/` (não precisa subir `dist/`, ela fica fora do git).

1. **Ligar o Pages** (uma vez): Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.
2. **Domínio**: o arquivo `src/static/CNAME` já leva `ryzrp.com.br`. Em Settings → Pages → *Custom domain*, confirme `ryzrp.com.br` e marque **Enforce HTTPS** quando liberar.
3. **DNS do ryzrp.com.br** (no registro.br ou onde estiver o domínio):
   - `@` com 4 registros **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` em **CNAME** para `ryzrp.github.io` (o GitHub redireciona `www` para o domínio principal).
4. **ryzrp.com** (se quiser que leve ao .com.br): o GitHub Pages só atende um domínio por site, então configure um redirecionamento no próprio registrador do `.com` para `https://ryzrp.com.br`.

Limites do GitHub Pages: não roda a função `api/players.js` (o contador de jogadores busca direto na API pública do FiveM pelo navegador, com `server` preenchido em `src/js/00-config.js`) e não usa o `vercel.json` (cabeçalhos e redirecionamentos de lá não valem aqui). Ao trocar uma imagem em `assets/`, troque também o nome do arquivo para não pegar cache antigo.

## Trocar placeholders
Lista completa em [`PLACEHOLDERS.md`](PLACEHOLDERS.md). Config geral (Discord, servidor, redes) em `src/js/00-config.js`.
