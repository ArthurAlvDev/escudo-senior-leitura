/* Catálogo de sinais de golpe, dark patterns e pressão em mensagens (PT-BR). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ScamPatterns = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RULES = [
    {
      id: 'urgencia-tempo',
      category: 'urgência',
      weight: 14,
      pattern: /\b(urgente|imediatamente|agora mesmo|hoje mesmo|nas pr[oó]ximas \d+ horas|[uú]ltimo aviso|prazo final|corra)\b/,
      title: 'Pressa artificial',
      simple: 'A mensagem tenta apressar você.',
      explain: 'Golpes dependem de decisão rápida. Quem é de confiança não exige resposta em minutos.',
      advice: 'Pare. Nenhuma decisão séria precisa ser tomada em minutos.',
    },
    {
      id: 'bloqueio-conta',
      category: 'ameaça',
      weight: 18,
      pattern: /\b(conta|cart[aã]o|benef[ií]cio|acesso)[^.]{0,40}\b(bloquead|suspens|cancelad|encerrad)/,
      title: 'Ameaça de bloqueio',
      simple: 'A mensagem diz que sua conta será bloqueada.',
      explain: 'Bancos e órgãos públicos não bloqueiam conta por mensagem com link.',
      advice: 'Não clique. Abra o aplicativo oficial do banco por conta própria.',
    },
    {
      id: 'pix-dinheiro',
      category: 'dinheiro',
      weight: 12,
      pattern: /\b(pix|transfer[eê]ncia|dep[oó]sito|ted|pagamento)\b/,
      title: 'Pedido de dinheiro',
      simple: 'A mensagem fala em enviar ou receber dinheiro.',
      explain: 'Pedido de Pix com pressa e link é o formato mais comum de golpe financeiro.',
      advice: 'Confirme por telefone, ligando para o número que você já conhece.',
    },
    {
      id: 'boleto-fatura',
      category: 'dinheiro',
      weight: 9,
      pattern: /\b(boleto|segunda via|fatura|d[eé]bito autom[aá]tico|parcela atrasada)\b/,
      title: 'Boleto ou fatura',
      simple: 'A mensagem envolve boleto ou fatura.',
      explain: 'Boletos falsos são enviados com valores e códigos de barra alterados.',
      advice: 'Só pague boleto emitido dentro do site ou aplicativo oficial.',
    },
    {
      id: 'premio-sorteio',
      category: 'promessa',
      weight: 16,
      pattern: /\b(pr[eê]mio|sorteio|contemplad|ganhou|ganhador|brinde|benef[ií]cio liberado|resgate)\b/,
      title: 'Prêmio ou benefício inesperado',
      simple: 'A mensagem promete um prêmio ou benefício.',
      explain: 'Você não ganha sorteio de que não participou. O "prêmio" costuma exigir taxa ou dados.',
      advice: 'Ignore. Prêmio que pede pagamento antes não existe.',
    },
    {
      id: 'reembolso',
      category: 'dinheiro',
      weight: 11,
      pattern: /\b(reembolso|restitui[cç][aã]o|valor a receber|dinheiro esquecido|corre[cç][aã]o monet[aá]ria)\b/,
      title: 'Dinheiro a receber',
      simple: 'A mensagem diz que há dinheiro esperando por você.',
      explain: 'Valores esquecidos são consultados no site oficial do banco ou do governo, sem link de terceiros.',
      advice: 'Verifique apenas em canais oficiais que você mesmo acessa.',
    },
    {
      id: 'senha',
      category: 'credencial',
      weight: 18,
      pattern: /\b(senha|password|pin)\b/,
      title: 'Pedido de senha',
      simple: 'A mensagem menciona senha.',
      explain: 'Nenhuma empresa séria pede sua senha por mensagem, telefone ou e-mail.',
      advice: 'Nunca informe senha. Nem para quem diz ser do banco.',
    },
    {
      id: 'codigo-verificacao',
      category: 'credencial',
      weight: 20,
      pattern: /\b(c[oó]digo de (verifica[cç][aã]o|seguran[cç]a|acesso)|token|sms com o c[oó]digo)\b/,
      title: 'Pedido de código',
      simple: 'A mensagem pede um código de verificação.',
      explain: 'O código que chega no seu celular é a chave da sua conta. Quem pede o código está tentando entrar nela.',
      advice: 'Nunca repasse código recebido por SMS. Ele é só seu.',
    },
    {
      id: 'confirme-dados',
      category: 'credencial',
      weight: 16,
      pattern: /\b(confirme|atualize|atualizar|valide|verifique)[^.]{0,30}\b(dados|informa[cç][oõ]es|cpf|dados banc[aá]rios|endere[cç]o)\b/,
      title: 'Pedido para confirmar dados',
      simple: 'A mensagem pede que você confirme dados pessoais.',
      explain: 'Atualização de cadastro é feita no aplicativo ou na agência, nunca por link recebido.',
      advice: 'Não preencha. Procure o canal oficial.',
    },
    {
      id: 'acesso-remoto',
      category: 'credencial',
      weight: 22,
      pattern: /\b(anydesk|teamviewer|acesso remoto|compartilhe a tela|instale o aplicativo|baixe o app)\b/,
      title: 'Instalação de aplicativo ou acesso remoto',
      simple: 'A mensagem pede para instalar um aplicativo ou dar acesso ao aparelho.',
      explain: 'Com acesso remoto, o golpista vê sua tela e opera sua conta bancária em tempo real.',
      advice: 'Não instale nada por indicação de mensagem. Desligue.',
    },
    {
      id: 'link-clique',
      category: 'link',
      weight: 8,
      pattern: /\b(clique aqui|clique no link|acesse o link|toque aqui|segue o link)\b/,
      title: 'Convite para clicar',
      simple: 'A mensagem pede para clicar em um link.',
      explain: 'O link pode levar a uma página falsa que imita o site verdadeiro.',
      advice: 'Não clique. Digite o endereço oficial você mesmo.',
    },
    {
      id: 'encurtador',
      category: 'link',
      weight: 12,
      pattern: /\b(bit\.ly|tinyurl|t\.co|is\.gd|cutt\.ly|rebrand\.ly|encurtador|encurta\.net|shorturl)\b/,
      title: 'Link encurtado',
      simple: 'O link está escondido atrás de um encurtador.',
      explain: 'Encurtadores escondem o destino real. Empresas sérias usam o próprio domínio.',
      advice: 'Não abra. Se precisar, procure o serviço no navegador.',
    },
    {
      id: 'dominio-estranho',
      category: 'link',
      weight: 14,
      pattern: /https?:\/\/[^\s/?#]*(\.top|\.xyz|\.click|\.buzz|\.link|\.online|\.site|\.shop)(\/|\b)/,
      title: 'Domínio incomum',
      simple: 'O endereço do site tem uma terminação pouco usada por empresas brasileiras.',
      explain: 'Terminações baratas são trocadas com frequência para escapar de bloqueios.',
      advice: 'Desconfie. Confira o endereço antes de digitar qualquer dado.',
    },
    {
      id: 'dominio-numeros',
      category: 'link',
      weight: 10,
      pattern: /https?:\/\/[^\s/?#]*(\d{4,}|--|\.br\.[a-z]{2,})/,
      title: 'Endereço com padrão suspeito',
      simple: 'O endereço tem números ou repetições típicas de site falso.',
      explain: 'Sites falsos copiam o nome e alteram um detalhe do endereço.',
      advice: 'Compare letra por letra com o endereço oficial.',
    },
    {
      id: 'autoridade-banco',
      category: 'autoridade',
      weight: 7,
      pattern: /\b(banco do brasil|caixa econ[oô]mica|ita[uú]|bradesco|santander|nubank|inter|sicoob|sicredi|banco original|banco pan)\b/,
      title: 'Nome de banco',
      simple: 'A mensagem usa o nome de um banco.',
      explain: 'Usar o nome do banco dá aparência de legitimidade. O nome sozinho não prova nada.',
      advice: 'Confira o remetente e o endereço. Ligue para o número do cartão.',
    },
    {
      id: 'autoridade-governo',
      category: 'autoridade',
      weight: 9,
      pattern: /\b(receita federal|inss|detran|gov\.br|minist[eé]rio|cadastro [uú]nico|caixa tem|aux[ií]lio brasil|bolsa fam[ií]lia)\b/,
      title: 'Nome de órgão público',
      simple: 'A mensagem usa o nome de um órgão do governo.',
      explain: 'Órgãos públicos não pedem senha, código ou pagamento por mensagem.',
      advice: 'Acesse apenas o site gov.br digitado por você.',
    },
    {
      id: 'gerente-suporte',
      category: 'autoridade',
      weight: 8,
      pattern: /\b(seu gerente|central de atendimento|setor de seguran[cç]a|suporte t[eé]cnico|equipe de an[aá]lise)\b/,
      title: 'Falsa central de atendimento',
      simple: 'A mensagem se apresenta como atendimento oficial.',
      explain: 'Golpistas criam centrais falsas para conduzir a vítima passo a passo.',
      advice: 'Desligue e ligue para o número impresso no seu cartão.',
    },
    {
      id: 'processo-multa',
      category: 'ameaça',
      weight: 10,
      pattern: /\b(processo|a[cç][aã]o judicial|multa|d[ií]vida|negativad|serasa|spc|protesto)\b/,
      title: 'Cobrança ou processo',
      simple: 'A mensagem ameaça com processo, multa ou negativação.',
      explain: 'Cobrança legítima chega por canais formais e pode ser conferida nos órgãos oficiais.',
      advice: 'Não pague por link. Consulte os canais oficiais.',
    },
    {
      id: 'prisao',
      category: 'ameaça',
      weight: 22,
      pattern: /\b(preso|pris[aã]o|mandado de pris[aã]o|pris[aã]o em flagrante)\b/,
      title: 'Ameaça de prisão',
      simple: 'A mensagem ameaça prender você.',
      explain: 'Nenhuma autoridade comunica prisão por mensagem pedindo dinheiro ou dados.',
      advice: 'É golpe. Não responda e avise um familiar.',
    },
    {
      id: 'sigilo',
      category: 'manipulação',
      weight: 24,
      pattern: /\b(n[aã]o conte|n[aã]o fale|mantenha (sigilo|segredo)|n[aã]o avise|entre n[oó]s)\b/,
      title: 'Pedido de sigilo',
      simple: 'A mensagem pede que você não conte a ninguém.',
      explain: 'Isolamento é técnica clássica: sem alguém para conferir, o golpe funciona.',
      advice: 'Conte para alguém de confiança antes de fazer qualquer coisa.',
    },
    {
      id: 'falso-parente',
      category: 'manipulação',
      weight: 18,
      pattern: /\b(mudei de n[uú]mero|novo n[uú]mero|troquei de celular|salve este contato|meu whatsapp novo)\b/,
      title: 'Número novo de conhecido',
      simple: 'Alguém diz ter mudado de número.',
      explain: 'O golpe do falso parente pede dinheiro em nome de alguém da família.',
      advice: 'Ligue para o número antigo da pessoa antes de qualquer ajuda.',
    },
    {
      id: 'investimento-garantido',
      category: 'promessa',
      weight: 14,
      pattern: /\b(renda extra|dinheiro f[aá]cil|investimento garantido|lucro garantido|retorno garantido|multiplique seu dinheiro|criptomoeda)\b/,
      title: 'Promessa de dinheiro fácil',
      simple: 'A mensagem promete ganho garantido.',
      explain: 'Não existe investimento sem risco. "Garantido" é a palavra preferida do golpe.',
      advice: 'Não invista por indicação de mensagem.',
    },
    {
      id: 'dados-cartao',
      category: 'credencial',
      weight: 20,
      pattern: /\b(n[uú]mero do cart[aã]o|cvv|data de validade|dados do cart[aã]o|bandeira do cart[aã]o)\b/,
      title: 'Pedido de dados do cartão',
      simple: 'A mensagem pede dados do cartão.',
      explain: 'Com número e CVV, a compra é feita na hora.',
      advice: 'Nunca informe. Nem por telefone.',
    },
    {
      id: 'taxa-adiantamento',
      category: 'dinheiro',
      weight: 12,
      pattern: /\b(taxa de libera[cç][aã]o|adiantamento|pague para receber|pequena taxa|taxa de cadastro)\b/,
      title: 'Pagamento para liberar valor',
      simple: 'A mensagem pede um pagamento para liberar outro valor.',
      explain: 'Essa é a estrutura do golpe do falso prêmio ou falso empréstimo.',
      advice: 'Quem vai receber nunca paga primeiro.',
    },
  ];

  const LEVELS = { high: 'alto', medium: 'médio', low: 'baixo' };

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function countMatches(rule, normalized) {
    const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`;
    const regex = new RegExp(rule.pattern.source, flags);
    const found = [];
    let match;
    let guard = 0;
    while ((match = regex.exec(normalized)) && guard < 20) {
      found.push(match[0]);
      guard += 1;
      if (match[0].length === 0) regex.lastIndex += 1;
    }
    return found;
  }

  return { RULES, LEVELS, normalize, countMatches };
});
