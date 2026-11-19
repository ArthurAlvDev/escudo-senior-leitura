'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const analyze = require('../src/analyze.js');
const explain = require('../src/explain.js');

const PHISHING = 'URGENTE! Sua conta sera bloqueada. Confirme seus dados e informe o codigo de verificacao em http://bit.ly/x agora mesmo.';
const PARENTE = 'Oi mae, mudei de numero. Faca um pix para mim agora e nao conte para ninguem.';
const LEGITIMO = 'A reuniao sera no sabado as 15h. Traga o bolo.';

const result = (text) => analyze.analyze(text);

test('título de risco alto manda parar', () => {
  assert.match(explain.headline(result(PHISHING)), /Pare/);
});

test('título de risco médio pede atenção', () => {
  assert.match(explain.headline({ empty: false, level: 'médio' }), /Atenção/);
});

test('título de risco baixo tranquiliza sem prometer segurança', () => {
  const text = explain.headline({ empty: false, level: 'baixo' });
  assert.match(text, /cuidado nunca é demais/);
});

test('título de resultado vazio pede entrada', () => {
  assert.match(explain.headline({ empty: true }), /Cole uma mensagem/);
});

test('resumo usa frases curtas e explica os sinais', () => {
  const text = explain.summary(result(PHISHING));
  assert.match(text, /sinais de golpe/);
  assert.ok(text.split(/[.!?]/).filter(Boolean).length >= 3);
});

test('resumo cita a quantidade de links', () => {
  assert.match(explain.summary(result(PHISHING)), /link/);
});

test('resumo de mensagem limpa não afirma que é segura', () => {
  const text = explain.summary(result(LEGITIMO));
  assert.match(text, /trate como golpe até provar o contrário/);
});

test('checklist inclui credencial quando aplicável', () => {
  const items = explain.checklist(result(PHISHING));
  assert.ok(items.some((i) => /código de verificação/.test(i)));
});

test('checklist inclui dinheiro quando aplicável', () => {
  const items = explain.checklist(result(PARENTE));
  assert.ok(items.some((i) => /Pix/.test(i)));
});

test('checklist inclui sigilo quando aplicável', () => {
  const items = explain.checklist(result(PARENTE));
  assert.ok(items.some((i) => /segredo/.test(i)));
});

test('checklist mínimo sempre presente', () => {
  const items = explain.checklist(result(LEGITIMO));
  assert.ok(items.length >= explain.BASE_CHECKLIST.length);
  for (const base of explain.BASE_CHECKLIST) assert.ok(items.includes(base));
});

test('checklist vazio para entrada vazia', () => {
  assert.deepEqual(explain.checklist({ empty: true }), []);
});

test('resposta sugerida de risco alto é recusa educada', () => {
  const text = explain.safeReply(result(PHISHING));
  assert.match(text, /Não vou responder/);
  assert.match(text, /canal oficial/);
});

test('resposta sugerida de risco baixo é neutra', () => {
  assert.match(explain.safeReply(result(LEGITIMO)), /verificar com calma/);
});

test('resposta sugerida é vazia sem mensagem', () => {
  assert.equal(explain.safeReply({ empty: true }), '');
});

test('relatório tem nível, sinais e checklist', () => {
  const md = explain.report(result(PHISHING), PHISHING);
  assert.match(md, /# Relatório do Escudo Sênior/);
  assert.match(md, /\*\*Nível de risco:\*\* ALTO/);
  assert.match(md, /## Sinais encontrados/);
  assert.match(md, /## O que fazer/);
  assert.match(md, /- \[ \]/);
  assert.match(md, /Made by OlacDev/);
});

test('relatório lista links encontrados', () => {
  const md = explain.report(result(PHISHING), PHISHING);
  assert.match(md, /## Links na mensagem/);
  assert.match(md, /bit\.ly/);
});

test('relatório sem achados informa isso', () => {
  const md = explain.report(result(LEGITIMO), LEGITIMO);
  assert.match(md, /Nenhum sinal do catálogo/);
});

test('estatísticas de frase contam palavras e frases longas', () => {
  const stats = explain.sentenceStats('Frase curta. Outra frase curta.');
  assert.equal(stats.words, 5);
  assert.equal(stats.sentences, 2);
  assert.equal(stats.longSentences, 0);
});

test('estatísticas de texto vazio são zero', () => {
  assert.deepEqual(explain.sentenceStats('   '), { words: 0, sentences: 0, average: 0, longSentences: 0 });
});
