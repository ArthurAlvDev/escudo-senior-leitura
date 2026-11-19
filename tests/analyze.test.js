'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const analyze = require('../src/analyze.js');
const Patterns = require('../src/patterns.js');

const PHISHING = 'URGENTE!!! Sua conta sera BLOQUEADA hoje. Confirme seus dados e informe o codigo de verificacao no link http://bit.ly/atualiza-conta agora mesmo.';
const PARENTE = 'Oi mae, mudei de numero. Preciso que voce faca um pix de 1.200 para mim agora, nao conte para ninguem.';
const LEGITIMO = 'Ola, a reuniao da igreja sera no sabado as 15h. Traga o bolo que combinamos.';

test('mensagem vazia devolve resultado vazio', () => {
  const result = analyze.analyze('   ');
  assert.equal(result.empty, true);
  assert.equal(result.score, 0);
  assert.equal(result.level, 'baixo');
  assert.deepEqual(result.findings, []);
});

test('phishing bancário atinge risco alto', () => {
  const result = analyze.analyze(PHISHING);
  assert.equal(result.level, 'alto');
  assert.ok(result.score >= 60, `pontuação: ${result.score}`);
});

test('phishing bancário encontra credencial, urgência, ameaça e link', () => {
  const result = analyze.analyze(PHISHING);
  assert.equal(result.signals.credential, true);
  assert.equal(result.signals.urgency, true);
  assert.equal(result.signals.threat, true);
  assert.equal(result.signals.link, true);
});

test('golpe do falso parente é classificado como alto', () => {
  const result = analyze.analyze(PARENTE);
  assert.equal(result.level, 'alto');
  assert.equal(result.signals.money, true);
  assert.equal(result.signals.manipulation, true);
});

test('mensagem cotidiana fica em risco baixo', () => {
  const result = analyze.analyze(LEGITIMO);
  assert.equal(result.level, 'baixo');
  assert.ok(result.score < 30);
  assert.ok(!result.findings.some((f) => f.category === 'credencial'));
});

test('achados vêm ordenados por peso', () => {
  const result = analyze.analyze(PHISHING);
  for (let i = 1; i < result.findings.length; i += 1) {
    assert.ok(result.findings[i - 1].weight >= result.findings[i].weight);
  }
});

test('achados incluem explicação e conselho', () => {
  const result = analyze.analyze(PHISHING);
  for (const finding of result.findings) {
    assert.ok(finding.title.length > 0);
    assert.ok(finding.explain.length > 20);
    assert.ok(finding.advice.length > 10);
    assert.ok(finding.simple.length > 10);
  }
});

test('conta ocorrências da mesma regra', () => {
  const result = analyze.analyze('URGENTE, responda agora mesmo. URGENTE!');
  const rule = result.findings.find((f) => f.id === 'urgencia-tempo');
  assert.ok(rule.count >= 2);
});

test('extrai links http e https sem repetir', () => {
  const links = analyze.extractLinks('veja https://a.com/x e http://b.com e https://a.com/x');
  assert.deepEqual(links, ['https://a.com/x', 'http://b.com']);
});

test('limita a quantidade de links extraídos', () => {
  const text = Array.from({ length: 20 }, (_, i) => `https://site${i}.com`).join(' ');
  assert.equal(analyze.extractLinks(text).length, 10);
});

test('excesso de exclamações gera achado estrutural', () => {
  const result = analyze.analyze('Ola!!! Tudo bem!!! Vamos!!!');
  assert.ok(result.findings.some((f) => f.id === 'exclamacoes'));
});

test('texto em caixa alta gera achado estrutural', () => {
  const result = analyze.analyze('ATENCAO TODOS OS DOCUMENTOS PRECISAM SER ENTREGUES NA RECEPCAO HOJE');
  assert.ok(result.findings.some((f) => f.id === 'caixa-alta'));
});

test('muitos emojis geram achado estrutural', () => {
  const result = analyze.analyze('Parabens 🎉🎉🎉🎉🎉 voce ganhou');
  assert.ok(result.findings.some((f) => f.id === 'emojis'));
});

test('combinação de credencial e dinheiro força risco alto', () => {
  const result = analyze.analyze('Pague o pix e envie o codigo de verificacao');
  assert.equal(result.level, 'alto');
});

test('pedido de sigilo tem peso alto', () => {
  const result = analyze.analyze('Faca o que estou pedindo e nao conte para ninguem');
  const rule = result.findings.find((f) => f.id === 'sigilo');
  assert.equal(rule.weight, 24);
  assert.equal(result.level, 'médio');
  assert.ok(result.score >= 45);
  assert.equal(result.signals.manipulation, true);
});

test('pontuação nunca passa de 100', () => {
  const result = analyze.analyze(PHISHING + ' ' + PARENTE + ' senha cvv anydesk mandado de prisao');
  assert.ok(result.score <= 100);
  assert.equal(result.score, 100);
});

test('níveis respeitam os limites', () => {
  assert.equal(analyze.levelFor(0), 'baixo');
  assert.equal(analyze.levelFor(29), 'baixo');
  assert.equal(analyze.levelFor(30), 'médio');
  assert.equal(analyze.levelFor(59), 'médio');
  assert.equal(analyze.levelFor(60), 'alto');
  assert.equal(analyze.levelFor(100), 'alto');
});

test('normaliza acentos para encontrar as regras', () => {
  assert.ok(Patterns.normalize('CÓDIGO DE VERIFICAÇÃO') === 'codigo de verificacao');
  const result = analyze.analyze('informe o código de verificação');
  assert.ok(result.findings.some((f) => f.id === 'codigo-verificacao'));
});

test('o catálogo não tem identificadores repetidos', () => {
  const ids = Patterns.RULES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('toda regra tem peso razoável e conselho', () => {
  for (const rule of Patterns.RULES) {
    assert.ok(rule.weight > 0 && rule.weight <= 24, rule.id);
    assert.ok(rule.advice.length > 10, rule.id);
    assert.ok(rule.explain.length > 20, rule.id);
  }
});

test('mensagem longa é resumida em achados, não em todo o texto', () => {
  const result = analyze.analyze(`${LEGITIMO} ${LEGITIMO} ${LEGITIMO}`);
  assert.equal(result.level, 'baixo');
  assert.ok(result.words > 20);
});
