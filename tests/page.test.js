'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('declara idioma, título e descrição', () => {
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<title>[^<]*Escudo Sênior/);
  assert.match(html, /name="description"/);
});

test('tem estrutura semântica com um único h1', () => {
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /<main id="main">/);
  assert.equal((html.match(/<h1/g) || []).length, 1);
});

test('referências locais existem', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !/^https?:|^data:|^\/_vercel\//.test(r));
  assert.ok(refs.length >= 5);
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), `ausente: ${ref}`);
});

test('resultado e status são anunciados', () => {
  assert.match(html, /id="status"[^>]*role="status"/);
  assert.match(html, /aria-live="polite"/);
});

test('a barra de risco usa role="meter"', () => {
  assert.match(html, /role="meter"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
});

test('CSP restritiva e nenhum script externo', () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /default-src 'self'/);
  assert.doesNotMatch(html, /src="https?:\/\//);
});

test('campos têm rótulo associado', () => {
  const ids = [...html.matchAll(/<textarea[^>]*id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 1);
  for (const id of ids) assert.match(html, new RegExp(`for="${id}"`));
});

test('credita OlacDev', () => {
  assert.match(html, /Made by OlacDev/);
  assert.match(html, /https:\/\/olacdev\.com\//);
});

test('a base tipográfica é grande o suficiente para baixa visão', () => {
  const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  assert.match(css, /font-size:\s*max\(1\.125rem,\s*18px\)/);
});

test('as três mensagens de exemplo produzem os níveis esperados', () => {
  const ScamAnalyzer = require('../src/analyze.js');
  const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  const block = app.match(/const SAMPLES = \{([\s\S]*?)\n  \};/);
  assert.ok(block, 'esperava SAMPLES no app.js');

  const entries = [...block[1].matchAll(/(\w+):\s*\n?\s*'((?:[^'\\]|\\.)*)'/g)];
  const samples = {};
  for (const [, key, value] of entries) samples[key] = value.replace(/\\'/g, "'");

  assert.ok(samples.banco && samples.parente && samples.normal, JSON.stringify(Object.keys(samples)));
  assert.equal(ScamAnalyzer.analyze(samples.banco).level, 'alto');
  assert.equal(ScamAnalyzer.analyze(samples.parente).level, 'alto');
  assert.equal(ScamAnalyzer.analyze(samples.normal).level, 'baixo');
});

test('a página não promete segurança garantida', () => {
  assert.match(html, /não garante que uma mensagem seja segura|Não garante que uma mensagem seja segura/i);
});


test('incorpora Semáforo Anti-Golpe, Vercel Insights e sitemap.xml', () => {
  assert.match(html, /Semáforo Anti-Golpe/);
  assert.match(html, /\/_vercel\/insights\/script\.js/);
  assert.match(html, /src\/semaforo\.js/);
  const semaforo = require('../src/semaforo.js');
  assert.equal(semaforo.analyzeMessage('Oi mãe, mudei de número, Pix urgente!').light, 'VERMELHO');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/escudo\.olacdev\.com\//);
});
