# Escudo Sênior: explicação em linguagem simples de mensagens suspeitas para adultos mais velhos

**Arthur Alves Ferreira (Ferreira, A. A.)**
OlacDev · <https://olacdev.com/>

**Versão:** 1.0 · **Data:** 19/11/2026
**Licença do texto:** CC BY 4.0 · **Licença do software:** MIT
**Tipo de recurso (Zenodo):** Preprint · **Idioma:** Português (Brasil)

*Pré-print interno. Ainda não depositado em repositório de dados; ao publicar, substituir esta nota pelo DOI. A versão citável do software é o repositório público indicado nas referências.*

---

## Resumo

Golpes por mensagem exploram acúmulo de sinais — pressa, ameaça de bloqueio, pedido de código, pedido de Pix, link encurtado — e um vocabulário de segurança que grande parte do público idoso não domina. Ferramentas de proteção existentes classificam URLs e bloqueiam domínios, mas raramente explicam *o que a mensagem está tentando fazer*. Este trabalho apresenta o **Escudo Sênior**, aplicação web estática e local que analisa o texto de uma mensagem por meio de um catálogo de 24 sinais ponderados, calcula um nível de risco (baixo, médio, alto) e devolve uma explicação em linguagem simples, um checklist de ação e uma resposta neutra para copiar. O sistema extrai links e os apresenta separadamente, detecta pedidos de sigilo e credenciais, e eleva o risco quando credencial e dinheiro aparecem juntos. A interface adota corpo de texto de 18 px, alvos grandes, contraste AA e resultado nunca dependente de cor. A suíte de 52 testes cobre o catálogo, a pontuação, os limites de classificação, a extração de links, o checklist condicional e a integridade da página.

**Palavras-chave:** acessibilidade digital; idosos; letramento digital; golpes financeiros; linguagem simples; segurança da informação.

## 1. Introdução

O golpe mais comum não é técnico: é uma mensagem que diz que a conta será bloqueada e oferece um link para "regularizar". A vítima não é ingênua — está sob pressão de tempo, diante de um vocabulário institucional que reconhece parcialmente e sem um segundo par de olhos para conferir.

Campanhas de conscientização ensinam regras ("não clique em links"), mas regras genéricas competem com uma mensagem específica, personalizada e urgente. O que falta é uma ferramenta que leia a mensagem concreta e devolva, em palavras comuns, o que ela está fazendo.

**Objetivo.** Descrever e validar um analisador local de mensagens suspeitas que produza explicação em linguagem simples, nível de risco transparente e ação recomendada, sem enviar o texto a servidor algum.

## 2. Fundamentação

### 2.1 Engenharia social e pressão temporal

A literatura de segurança descreve a engenharia social como manipulação de confiança e de emoção. Os gatilhos recorrentes são autoridade (nome do banco, do órgão), urgência (prazo curto), medo (bloqueio, processo, prisão), ganância (prêmio, renda extra) e sigilo (não conte a ninguém). Um analisador útil precisa nomear esses gatilhos, não apenas somá-los.

### 2.2 Letramento digital e carga cognitiva

Público idoso frequentemente apresenta menor familiaridade com jargão técnico e maior custo para alternar entre aplicativos. Instruções longas competem com a memória de trabalho. Daí três decisões de projeto: frases curtas, uma ação por linha e explicação imediatamente ao lado do alerta.

### 2.3 Por que local

Mensagens recebidas podem conter dados pessoais, números e nomes. Enviar esse conteúdo a um serviço externo para "verificar" cria um novo risco. A análise local resolve o problema sem transferir o problema.

## 3. Método

### 3.1 Catálogo de sinais (`patterns.js`)

24 regras organizadas em oito categorias: urgência, ameaça, dinheiro, credencial, link, promessa, autoridade e manipulação. Cada regra tem identificador, peso (4–24), expressão regular sobre texto normalizado (sem acentos, minúsculo), título, explicação, conselho e uma frase em linguagem simples. A normalização permite que "CÓDIGO DE VERIFICAÇÃO" e "codigo de verificacao" casem com a mesma regra.

### 3.2 Pontuação (`analyze.js`)

A pontuação soma o peso de cada regra acionada, com bônus decrescente por repetição (até +6 por regra). Sinais estruturais acrescentam pontos: três ou mais exclamações (+5), proporção de maiúsculas acima de 40% (+6) e cinco ou mais emojis (+4). Regras de combinação elevam o piso: credencial com dinheiro, ou sigilo com dinheiro/credencial, resulta em pelo menos 72; qualquer sinal de peso ≥ 22 garante 45; seis ou mais sinais acrescentam 8. O total é limitado a 100. Faixas: 0–29 baixo, 30–59 médio, 60–100 alto.

A escolha de pisos, em vez de soma pura, evita que um golpe curto e direto ("me passa o código e não conta pra ninguém") pareça inofensivo por ter poucas palavras.

### 3.3 Explicação (`explain.js`)

`headline` e `summary` produzem o texto principal: uma conclusão, até cinco frases curtas descrevendo os sinais mais graves e uma orientação final. `checklist` parte de quatro itens permanentes (não clicar, não informar dados, contar a alguém, procurar canal oficial) e acrescenta itens condicionais conforme os sinais detectados. `safeReply` oferece uma resposta neutra, sem confronto. `report` gera Markdown com nível, sinais, checklist, links e a mensagem original, servindo de registro para levar ao banco ou a um familiar.

### 3.4 Interface

Resultado em três camadas: banner de risco com barra (`role="meter"`, `aria-valuenow` e `aria-valuetext`), explicação em linguagem simples e lista de achados ordenada por peso. Nenhuma informação é transmitida só por cor: o nível aparece escrito. A página permite imprimir o resultado, o que resolve o caso de quem precisa levar o papel ao atendimento.

## 4. Validação

| Arquivo | Foco | Testes |
| --- | --- | --- |
| `analyze.test.js` | regras, pontuação, pisos, links, estrutura, níveis | 21 |
| `explain.test.js` | título, resumo, checklist condicional, resposta, relatório | 20 |
| `page.test.js` | integridade, rótulos, CSP, `role="meter"`, amostras, tipografia | 11 |

Resultado: **52 testes, 52 aprovados, 0 falhas**.

Casos notáveis: o exemplo de phishing bancário ("URGENTE… conta BLOQUEADA… código de verificação… bit.ly") atinge risco alto com quatro sinais simultâneos; o exemplo do falso parente atinge risco alto por dinheiro + manipulação; a mensagem de consulta médica permanece em risco baixo; e a página é verificada para não prometer segurança garantida.

## 5. Acessibilidade

Corpo de texto em 18 px, entrelinha 1,65, alvos de toque grandes, foco visível de 4 px, contraste AA nos dois temas, listas em vez de parágrafos densos e resultado impresso legível. A linguagem evita termos técnicos na saída principal. O texto da própria ferramenta foi escrito com frases curtas, coerente com o público.

## 6. Limitações

1. **Heurística lexical.** Golpes que evitam o vocabulário do catálogo passam; ironicamente, mensagens legítimas e urgentes podem pontuar alto.
2. **Catálogo finito.** Novos golpes exigem manutenção das regras.
3. **Sem verificação de URL.** Não consulta listas de domínios maliciosos, por decisão de privacidade.
4. **Sem análise de imagem** (prints de conversa) nesta versão.
5. **Sem estudo com usuários idosos** — a eficácia comunicativa das mensagens ainda não foi medida.

## 7. Trabalhos relacionados

Navegadores e operadoras mantêm listas de bloqueio de domínios, eficazes contra links já conhecidos e silenciosas quanto ao texto. Campanhas de conscientização ensinam regras gerais. Aplicativos de banco exibem avisos padronizados. Nenhum desses caminhos entrega, para a mensagem específica que a pessoa recebeu, uma explicação em linguagem simples com ação recomendada — que é a contribuição deste trabalho.

## 8. Conclusão

O Escudo Sênior parte de uma premissa simples: a pessoa não precisa aprender segurança da informação para reconhecer um golpe, se alguém — ou algo — explicar o que a mensagem está tentando fazer. A ferramenta não substitui educação digital nem bloqueio técnico; ela atua no momento da dúvida, com linguagem comum e sem enviar dados. Como continuação, prevê-se leitura de imagens por OCR local, ampliação do catálogo com revisão de especialistas e um estudo de usabilidade com adultos acima de 60 anos.

## Referências

BRASIL. **Lei nº 13.146, de 6 de julho de 2015**. Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência. Brasília, DF, 2015.

FERREIRA, A. A. **Escudo Sênior**: explicação em linguagem simples de mensagens suspeitas. 2026. Software. Disponível em: <https://github.com/ArthurAlvDev/escudo-senior-leitura>.

ORGANIZAÇÃO MUNDIAL DA SAÚDE. **Global report on ageism**. Genebra: OMS, 2021.

W3C. **Making Content Usable for People with Cognitive and Learning Disabilities**. W3C Note. 2021. (COGA)

W3C. **Web Content Accessibility Guidelines (WCAG) 2.2**. Recommendation. 2023.

---

### Nota sobre publicação

Este texto é um pré-print interno. **Não houve submissão a periódico nem depósito em repositório de dados nesta etapa.** A versão citável do software é o repositório público indicado acima, sob licença MIT.
