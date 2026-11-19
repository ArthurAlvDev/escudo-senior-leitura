/* Explicação em linguagem simples, checklist de ação e relatório. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlainExplain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const BASE_CHECKLIST = [
    'Não clique em links nem responda à mensagem.',
    'Não informe senha, código de SMS ou dados do cartão.',
    'Conte para alguém de confiança antes de decidir qualquer coisa.',
    'Se for sobre banco ou governo, procure o canal oficial que você já conhece.',
  ];

  function headline(result) {
    if (result.empty) return 'Cole uma mensagem para analisar.';
    if (result.level === 'alto') return 'Pare. Esta mensagem tem vários sinais de golpe.';
    if (result.level === 'médio') return 'Atenção: esta mensagem tem sinais de alerta.';
    return 'Nenhum sinal forte encontrado — mas cuidado nunca é demais.';
  }

  function summary(result) {
    if (result.empty) return 'Nada para analisar ainda.';
    const parts = [];
    parts.push(headline(result));
    if (result.findings.length) {
      const sentences = result.findings.slice(0, 5).map((f) => f.simple);
      parts.push(sentences.join(' '));
    } else {
      parts.push('Não encontramos palavras típicas de golpe nesta mensagem.');
    }
    if (result.links.length) {
      parts.push(`A mensagem tem ${result.links.length} link(s). Confira o endereço antes de abrir.`);
    }
    parts.push(
      result.level === 'alto'
        ? 'Não faça pagamento, não instale aplicativo e não passe códigos. Fale com um familiar agora.'
        : 'Se a mensagem pedir dinheiro, dados ou pressa, trate como golpe até provar o contrário.'
    );
    return parts.join(' ');
  }

  function checklist(result) {
    const items = [];
    if (result.empty) return items;

    if (result.signals.credential) items.push('Nunca repasse código de verificação, senha ou dados do cartão.');
    if (result.signals.money) items.push('Não faça Pix, transferência nem pague boleto enviado por mensagem.');
    if (result.signals.link) items.push('Não abra o link: digite o endereço oficial no navegador.');
    if (result.signals.manipulation) items.push('Não mantenha segredo; avise um familiar ou amigo agora.');
    if (result.signals.threat) items.push('Não acredite em ameaça por mensagem; procure a autoridade ou o órgão oficial.');
    if (result.signals.authority) items.push('Ligue para o número que está no seu cartão ou no site oficial.');

    for (const base of BASE_CHECKLIST) {
      if (!items.includes(base)) items.push(base);
    }
    return items;
  }

  function safeReply(result) {
    if (result.empty) return '';
    if (result.level === 'alto') {
      return 'Não vou responder a esta mensagem. Vou falar com uma pessoa de confiança e procurar o canal oficial.';
    }
    if (result.level === 'médio') {
      return 'Antes de responder, vou confirmar esta informação no canal oficial.';
    }
    return 'Recebi sua mensagem. Vou verificar com calma.';
  }

  function report(result, source) {
    const text = String(source || '').trim();
    const lines = ['# Relatório do Escudo Sênior', ''];
    lines.push(`**Nível de risco:** ${result.level.toUpperCase()} (${result.score}/100)`, '');
    lines.push('## Em linguagem simples', '', summary(result), '');

    lines.push('## Sinais encontrados', '');
    if (!result.findings.length) {
      lines.push('Nenhum sinal do catálogo foi encontrado.', '');
    } else {
      for (const finding of result.findings) {
        lines.push(`- **${finding.title}** (${finding.category}, peso ${finding.weight})`);
        lines.push(`  - ${finding.explain}`);
        if (finding.evidence && finding.evidence.length) {
          lines.push(`  - Trecho: \`${finding.evidence[0]}\``);
        }
      }
      lines.push('');
    }

    lines.push('## O que fazer', '');
    for (const item of checklist(result)) lines.push(`- [ ] ${item}`);
    lines.push('');

    if (result.links.length) {
      lines.push('## Links na mensagem', '');
      for (const link of result.links) lines.push(`- ${link}`);
      lines.push('');
    }

    lines.push('## Mensagem analisada', '', '```text', text, '```', '');
    lines.push('---', '', 'Gerado pelo Escudo Sênior · Made by OlacDev · https://olacdev.com/');
    return lines.join('\n') + '\n';
  }

  function sentenceStats(text) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return { words: 0, sentences: 0, average: 0, longSentences: 0 };
    const words = clean.split(' ').filter(Boolean).length;
    const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const count = sentences.length || 1;
    const average = Math.round((words / count) * 10) / 10;
    const longSentences = sentences.filter((s) => s.split(/\s+/).length > 25).length;
    return { words, sentences: count, average, longSentences };
  }

  return { headline, summary, checklist, safeReply, report, sentenceStats, BASE_CHECKLIST };
});
