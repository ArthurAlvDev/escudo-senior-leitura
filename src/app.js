/* Escudo Sênior — interface (100% local). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { result: null, source: '' };

  const SAMPLES = {
    banco:
      'URGENTE! Identificamos uma compra suspeita no seu cartão. Sua conta será BLOQUEADA em 24 horas. Confirme seus dados e informe o código de verificação que chegou por SMS agora mesmo: http://bit.ly/seguranca-conta',
    parente:
      'Oi mãe, troquei de celular. Este é meu novo número, salve aí. Preciso que você faça um Pix de R$ 1.850 hoje para pagar uma conta urgente. Depois te explico. Não conte para o meu irmão, ele fica nervoso.',
    normal:
      'Olá, dona Maria. Sua consulta foi confirmada para quinta-feira às 14h na clínica do bairro. Se precisar remarcar, ligue para o número que está no nosso cartão de agendamento.',
  };

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function setStatus(message, kind) {
    const el = $('status');
    el.textContent = message;
    el.dataset.kind = kind || 'info';
  }

  function analyze() {
    const source = $('source').value;
    if (!source.trim()) {
      setStatus('Cole uma mensagem para analisar.', 'error');
      $('source').focus();
      return;
    }

    const result = ScamAnalyzer.analyze(source);
    state.result = result;
    state.source = source;

    renderRisk(result);
    renderSummary(result);
    renderSemaforo(source);
    renderFindings(result);
    renderChecklist(result);
    $('reply').textContent = PlainExplain.safeReply(result);

    $('results').hidden = false;

    if (result.level === 'alto') {
      setStatus('Risco alto: pare e confirme por um canal oficial antes de fazer qualquer coisa.', 'error');
    } else if (result.level === 'médio') {
      setStatus('Risco médio: existem sinais de alerta. Confirme antes de agir.', 'info');
    } else {
      setStatus('Nenhum sinal forte encontrado. Ainda assim, confirme antes de pagar ou clicar.', 'ok');
    }

    $('risk-title').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function renderRisk(result) {
    const banner = $('risk-banner');
    banner.dataset.level = result.level;
    $('risk-headline').textContent = PlainExplain.headline(result);
    $('risk-score').textContent = String(result.score);
    $('risk-level').textContent = result.level;

    const meter = $('meter');
    meter.setAttribute('aria-valuenow', String(result.score));
    meter.setAttribute('aria-valuetext', `risco ${result.level}, ${result.score} de 100`);
    $('meter-fill').style.width = `${result.score}%`;
  }

  function renderSummary(result) {
    $('summary').textContent = PlainExplain.summary(result);
  }

  function renderSemaforo(source) {
    if (typeof SemaforoAntiGolpe === 'undefined') return;
    const sem = SemaforoAntiGolpe.analyzeMessage(source);
    const lightEl = $('semaforo-light');
    const reasonsEl = $('semaforo-reasons');
    if (lightEl) lightEl.textContent = sem.light;
    if (reasonsEl) {
      reasonsEl.textContent = '';
      sem.reasons.forEach((reason) => {
        const li = document.createElement('li');
        li.textContent = reason;
        reasonsEl.appendChild(li);
      });
    }
  }

  function renderFindings(result) {
    const list = $('findings');
    list.innerHTML = '';

    if (!result.findings.length) {
      list.innerHTML = '<li class="finding"><p><strong>Nenhum sinal do catálogo foi encontrado.</strong> Isso não significa que a mensagem é segura: golpes novos podem usar palavras diferentes.</p></li>';
      return;
    }

    result.findings.forEach((finding) => {
      const li = document.createElement('li');
      li.className = 'finding';
      li.dataset.weight = finding.weight >= 18 ? 'alto' : 'normal';
      li.innerHTML =
        `<div class="head"><span class="title">${escapeHTML(finding.title)}</span>` +
        `<span class="tag">${escapeHTML(finding.category)} · peso ${finding.weight}</span></div>` +
        `<p>${escapeHTML(finding.explain)}</p>` +
        `<p class="advice">O que fazer: ${escapeHTML(finding.advice)}</p>` +
        (finding.evidence && finding.evidence.length
          ? `<span class="evidence">trecho: ${escapeHTML(finding.evidence[0])}</span>`
          : '');
      list.appendChild(li);
    });
  }

  function renderChecklist(result) {
    const list = $('checklist');
    list.innerHTML = '';
    for (const item of PlainExplain.checklist(result)) {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    }
  }

  function downloadReport() {
    if (!state.result) return;
    const md = PlainExplain.report(state.result, state.source);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-escudo-senior.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus('Relatório baixado.', 'ok');
  }

  function bind() {
    $('btn-analyze').addEventListener('click', analyze);

    $('btn-clear').addEventListener('click', () => {
      $('source').value = '';
      $('results').hidden = true;
      state.result = null;
      state.source = '';
      setStatus('Pronto. Cole a mensagem e clique em Analisar.', 'info');
      $('source').focus();
    });

    document.querySelectorAll('[data-sample]').forEach((button) => {
      button.addEventListener('click', () => {
        $('source').value = SAMPLES[button.dataset.sample] || '';
        analyze();
      });
    });

    $('btn-copy-reply').addEventListener('click', async () => {
      if (!state.result) return;
      const text = PlainExplain.safeReply(state.result);
      try {
        await navigator.clipboard.writeText(text);
        setStatus('Resposta copiada. Cole no lugar de responder à mensagem.', 'ok');
      } catch (_err) {
        setStatus('O navegador bloqueou a cópia. Selecione o texto da resposta manualmente.', 'error');
      }
    });

    $('btn-report').addEventListener('click', downloadReport);

    $('btn-print').addEventListener('click', () => window.print());
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    setStatus('Pronto. Cole a mensagem e clique em Analisar. Nada é enviado para a internet.', 'info');
  });
})();
