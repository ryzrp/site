const KEYWORDS_BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
const PUNCT_BEFORE_REGEX = '(,=:[!&|?{};+-*%<>~^';
const MARK = '\u0000';

function regexAllowed(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  if (j < 0) return true;
  const c = src[j];
  if (PUNCT_BEFORE_REGEX.includes(c)) return true;
  if (/[A-Za-z_$]/.test(c)) {
    let k = j;
    while (k >= 0 && /[A-Za-z0-9_$]/.test(src[k])) k--;
    return KEYWORDS_BEFORE_REGEX.has(src.slice(k + 1, j + 1));
  }
  return false;
}

function blank(text) {
  return text.split('\n').map(() => MARK).join('\n');
}

function tidy(text) {
  return text.split('\n').filter(line => !(line.includes(MARK) && line.split(MARK).join('').trim() === ''))
    .map(line => line.includes(MARK) ? line.split(MARK).join('').replace(/[ \t]+$/, '') : line).join('\n');
}

export function stripJs(src) {
  let out = '', i = 0;
  const n = src.length;
  const tmpl = [];
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      out += MARK; i = j; continue;
    }
    if (c === '/' && d === '*') {
      const j = src.indexOf('*/', i + 2);
      const end = j < 0 ? n : j + 2;
      out += blank(src.slice(i, end)); i = end; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      out += src.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '`' || (c === '}' && tmpl.length && tmpl[tmpl.length - 1] === 0)) {
      if (c === '}') tmpl.pop();
      let j = i + 1;
      while (j < n && src[j] !== '`') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '$' && src[j + 1] === '{') { j += 2; tmpl.push(0); break; }
        j++;
      }
      if (src[j - 1] === '{' && src[j - 2] === '$') { out += src.slice(i, j); i = j; continue; }
      out += src.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '{' && tmpl.length) { tmpl[tmpl.length - 1]++; out += c; i++; continue; }
    if (c === '}' && tmpl.length) { tmpl[tmpl.length - 1]--; out += c; i++; continue; }
    if (c === '/' && regexAllowed(src, i)) {
      let j = i + 1, cls = false;
      while (j < n && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') cls = true;
        else if (src[j] === ']') cls = false;
        else if (src[j] === '/' && !cls) break;
        j++;
      }
      j++;
      while (j < n && /[a-z]/i.test(src[j])) j++;
      out += src.slice(i, j); i = j; continue;
    }
    out += c; i++;
  }
  return tidy(out);
}

export function stripCss(src) {
  let out = '', i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') {
      const j = src.indexOf('*/', i + 2);
      const end = j < 0 ? n : j + 2;
      out += blank(src.slice(i, end)); i = end; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      out += src.slice(i, j + 1); i = j + 1; continue;
    }
    out += c; i++;
  }
  return tidy(out);
}

export function stripHtml(src, { keepIncludes = false } = {}) {
  const out = src.replace(/<!--([\s\S]*?)-->/g, (m, body) =>
    keepIncludes && /^#include\s/.test(body) ? m : blank(m));
  return tidy(out.replace(/\sdata-placeholder="[^"]*"/g, ''));
}
