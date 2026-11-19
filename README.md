# Escudo Sênior

Ferramenta **100% local** que lê uma mensagem suspeita e explica, **em linguagem simples**, o que ela está tentando fazer: apressar, ameaçar, pedir código, pedir Pix, esconder um link.

- Site: <https://escudo.olacdev.com>
- Licença: MIT
- Feito por **OlacDev** — <https://olacdev.com/>

## O problema

Golpes por mensagem funcionam por acúmulo: uma ameaça de bloqueio, um pedido de código, um link encurtado e um prazo de 24 horas. Quem cresceu sem letramento digital reconhece cada peça isoladamente, mas não o conjunto — e o medo de perder a conta ou o benefício vence a dúvida. Ferramentas de segurança costumam falar em "phishing", "engenharia social" e "domínio suspeito", vocabulário que não ajuda.

## O que a ferramenta faz

1. **Aponta sinais concretos**: pressa artificial, ameaça de bloqueio, pedido de Pix, boleto, prêmio, senha, código de verificação, dados do cartão, acesso remoto, link encurtado, domínio incomum, falso parente, pedido de sigilo, ameaça de prisão.
2. **Dá um nível de risco** (baixo, médio, alto) com pontuação de 0 a 100 e barra visual — nunca só por cor.
3. **Explica em linguagem simples**, uma frase curta por sinal.
4. **Monta um checklist de ação** específico para o que foi encontrado.
5. **Sugere uma resposta neutra** para copiar, sem entrar em discussão com o golpista.
6. **Gera relatório em Markdown** e versão para impressão, útil para mostrar a um familiar ou ao banco.

## Como usar

1. Copie a mensagem recebida.
2. Cole no campo e clique em **Analisar mensagem**.
3. Leia o resultado, o checklist e, se quiser, baixe o relatório.

Há três exemplos prontos (mensagem de banco, falso parente e mensagem comum) para entender o funcionamento.

## Estrutura

```
index.html          interface (entrada, resultado, checklist, ajuda)
src/patterns.js     catálogo de 24 sinais com peso, explicação e conselho
src/analyze.js      pontuação, nível de risco, sinais e extração de links
src/explain.js      linguagem simples, checklist, resposta sugerida, relatório
src/app.js          interface e eventos
tests/              52 testes (node:test), sem dependências
```

## Como o risco é calculado

Cada sinal tem um peso (de 4 a 24). A soma é limitada a 100 e ajustada por regras de combinação:

- Dois sinais de credencial **e** dinheiro → no mínimo 72.
- Pedido de sigilo combinado com dinheiro ou credencial → no mínimo 72.
- Qualquer sinal de peso ≥ 22 → no mínimo 45.
- Seis ou mais sinais → +8.

Faixas: **0–29 baixo**, **30–59 médio**, **60–100 alto**.

## Decisões de projeto

- **Linguagem antes de tecnicismo.** Nada de "phishing" na saída principal; o termo aparece, se aparecer, depois da explicação.
- **Explicação junto do alerta.** Um alerta sem motivo gera descrédito.
- **Nunca afirmar que é seguro.** A saída de risco baixo diz explicitamente que isso não é garantia.
- **Sem upload.** Texto analisado em memória; CSP restritiva; `form-action 'none'`.
- **Corpo de texto maior (18 px)** e alvos grandes, pensando em baixa visão e tremor.
- **Impressão funcional**: o resultado pode ser impresso para levar ao banco ou mostrar a um familiar.

## Limitações

1. **Heurística de palavras e padrões**, não análise semântica. Golpes que evitam o vocabulário do catálogo passam.
2. **Catálogo finito** (24 sinais); novos golpes exigem atualização.
3. **Falsos positivos possíveis**: uma mensagem legítima e urgente do banco pode pontuar alto.
4. **Não verifica o link de verdade** — não há consulta a listas de domínios maliciosos, justamente por ser offline e privado.
5. **Sem teste com usuários idosos** nesta etapa.

## Licença

MIT — veja [LICENSE](LICENSE).

Citação sugerida:

> FERREIRA, A. A. **Escudo Sênior: explicação em linguagem simples de mensagens suspeitas**. 2026. Software. Disponível em: <https://escudo.olacdev.com>.
