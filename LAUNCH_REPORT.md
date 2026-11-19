# Launch Report — Escudo Sênior (ACC-005)

**Data:** 19/11/2026
**Projeto:** `escudo-senior-leitura`
**Licença:** MIT
**Responsável:** Ferreira, A. A. (OlacDev)

## Estado

| Etapa | Estado | Evidência |
| --- | --- | --- |
| Build local | Concluído | 11 arquivos, sem dependências de execução |
| Testes | 52/52 | `node --test tests/*.test.js` |
| GitHub | Publicado | `ArthurAlvDev/escudo-senior-leitura` (branch `main`) |
| Vercel | Publicado | `https://escudo-senior-leitura.vercel.app` (HTTP 200) |
| Domínio próprio | Pendente de DNS | `escudo.olacdev.com` adicionado; CNAME no Cloudflare |
| Artigo | Pronto (não publicado) | `ARTIGO_CIENTIFICO.md` |

## Escopo entregue

- Catálogo de 24 sinais em 8 categorias, com peso, explicação e conselho.
- Pontuação 0–100 com pisos por combinação (credencial + dinheiro, sigilo + dinheiro/credencial).
- Explicação em linguagem simples e checklist condicional.
- Resposta neutra copiável, relatório Markdown e versão para impressão.
- Três exemplos embutidos (banco, falso parente, mensagem comum), com níveis verificados por teste.
- Tipografia de 18 px, `role="meter"` e resultado nunca dependente de cor.
- Marca: "Made by OlacDev" no rodapé.

## Verificações executadas

- `node --test`: 52 testes, 52 aprovados.
- Exemplos da interface conferidos por teste automatizado: banco e falso parente em risco alto, mensagem comum em risco baixo.
- Página verificada por teste para não prometer segurança garantida.

## Pendências e riscos

1. **DNS do domínio próprio** — CNAME `escudo` no Cloudflare apontando para o alvo do projeto.
2. **Falsos positivos** — mensagem legítima e urgente do banco pode pontuar alto.
3. **Catálogo finito** — exige atualização periódica.
4. **Sem teste com usuários idosos** — eficácia comunicativa não medida.

## Próximo passo sugerido

OCR local para prints de conversa e estudo de usabilidade com adultos acima de 60 anos.
