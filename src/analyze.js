/* Análise de risco de uma mensagem: pontuação, achados e sinais. */
(function (root, factory) {
  const deps =
    typeof module === 'object' && module.exports ? { patterns: require('./patterns.js') } : { patterns: root.ScamPatterns };
  const api = factory(deps.patterns);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScamAnalyzer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ScamPatterns) {
  'use strict';

  const THRESHOLDS = { high: 60, medium: 30 };

  const CATEGORY_BY_SIGNAL = {
    urgência: 'urgency',
    ameaça: 'threat',
    dinheiro: 'money',
    credencial: 'credential',
    link: 'link',
    promessa: 'promise',
    autoridade: 'authority',
    manipulação: 'manipulation',
  };

  function levelFor(score) {
    if (score >= THRESHOLDS.high) return ScamPatterns.LEVELS.high;
    if (score >= THRESHOLDS.medium) return ScamPatterns.LEVELS.medium;
    return ScamPatterns.LEVELS.low;
  }

  function extractLinks(text) {
    const regex = /https?:\/\/[^\s<>"')\]]+/gi;
    return [...new Set(String(text || '').match(regex) || [])].slice(0, 10);
  }

  function structuralSignals(original) {
    const extra = [];
    let bonus = 0;

    const exclamations = (original.match(/!/g) || []).length;
    if (exclamations >= 3) {
      bonus += 5;
      extra.push({ id: 'exclamacoes', category: 'estrutura', weight: 5, title: 'Excesso de exclamações', count: exclamations, simple: 'A mensagem usa muitas exclamações.', explain: 'Exclamações em excesso simulam urgência e emoção.', advice: 'Leia com calma; susto não é argumento.' });
    }

    const letters = original.replace(/[^A-Za-zÀ-ÿ]/g, '');
    const upper = original.replace(/[^A-ZÀ-Þ]/g, '');
    if (letters.length > 40 && upper.length / letters.length > 0.4) {
      bonus += 6;
      extra.push({ id: 'caixa-alta', category: 'estrutura', weight: 6, title: 'Texto em caixa alta', count: 1, simple: 'Boa parte do texto está em letras maiúsculas.', explain: 'Caixa alta é usada para gritar e intimidar.', advice: 'Ignore o tom e avalie o conteúdo.' });
    }

    const emojis = (original.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
    if (emojis >= 5) {
      bonus += 4;
      extra.push({ id: 'emojis', category: 'estrutura', weight: 4, title: 'Muitos emojis', count: emojis, simple: 'A mensagem tem muitos emojis.', explain: 'Muitos emojis chamam atenção e disfarçam texto mal escrito.', advice: 'Desconfie de comunicados oficiais com muitos símbolos.' });
    }

    return { bonus, extra };
  }

  function analyze(input) {
    const original = String(input == null ? '' : input);
    const trimmed = original.trim();
    const normalized = ScamPatterns.normalize(original);

    if (!trimmed) {
      return {
        empty: true,
        score: 0,
        level: ScamPatterns.LEVELS.low,
        findings: [],
        signals: {},
        links: [],
        words: 0,
        chars: 0,
      };
    }

    const findings = [];
    let score = 0;

    for (const rule of ScamPatterns.RULES) {
      const matches = ScamPatterns.countMatches(rule, normalized);
      if (!matches.length) continue;
      const occurrences = matches.length;
      const ruleScore = rule.weight + Math.min(6, (occurrences - 1) * 2);
      score += ruleScore;
      findings.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        weight: rule.weight,
        count: occurrences,
        evidence: [...new Set(matches)].slice(0, 3),
        simple: rule.simple,
        explain: rule.explain,
        advice: rule.advice,
      });
    }

    const structural = structuralSignals(trimmed);
    score += structural.bonus;
    findings.push(...structural.extra);

    findings.sort((a, b) => b.weight - a.weight || a.title.localeCompare(b.title, 'pt-BR'));

    const signals = {};
    for (const finding of findings) {
      const key = CATEGORY_BY_SIGNAL[finding.category];
      if (key) signals[key] = true;
    }

    if (findings.some((f) => f.weight >= 22)) score = Math.max(score, 45);
    if ((signals.credential && signals.money) || (signals.manipulation && (signals.money || signals.credential))) {
      score = Math.max(score, 72);
    }
    if (findings.length >= 6) score += 8;

    score = Math.max(0, Math.min(100, Math.round(score)));

    const words = trimmed.split(/\s+/).filter(Boolean).length;

    return {
      empty: false,
      score,
      level: levelFor(score),
      findings,
      signals,
      links: extractLinks(trimmed),
      words,
      chars: trimmed.length,
      counts: {
        urgency: findings.filter((f) => f.category === 'urgência').length,
        threat: findings.filter((f) => f.category === 'ameaça').length,
        credential: findings.filter((f) => f.category === 'credencial').length,
        money: findings.filter((f) => f.category === 'dinheiro').length,
        link: findings.filter((f) => f.category === 'link').length,
      },
    };
  }

  return { analyze, levelFor, extractLinks, structuralSignals, THRESHOLDS };
});
