/* MILENE | CONTRACT MISSION — conteúdo base: habilidades, conceitos, estações da jornada, "Vire o contrato".
   Referências legais: Lei 13.303/2016 (Lei das Estatais) é a base dos Correios; Lei 14.133/2021 e
   IN SGD/ME 94/2022 aparecem como vocabulário e boas práticas de contratação de TIC.
   Sempre confira o regulamento interno de licitações e contratos dos Correios e o edital do PSI. */
window.MM = window.MM || {};

MM.SKILLS = {
  compliance:   { name: "Compliance",   icon: "⚖️", color: "#6C5CE7" },
  risco:        { name: "Risco",        icon: "🛡️", color: "#E17055" },
  dinheiro:     { name: "Dinheiro",     icon: "💰", color: "#00A884" },
  documentacao: { name: "Documentação", icon: "📁", color: "#0984E3" },
  stakeholders: { name: "Stakeholders", icon: "🤝", color: "#D63384" },
  tecnologia:   { name: "Tecnologia",   icon: "🧩", color: "#F2A900" }
};

MM.LEVELS = [
  { xp: 0,    title: "Leitora de Cláusula" },
  { xp: 250,  title: "Caçadora de Prazo" },
  { xp: 600,  title: "Tradutora de TI" },
  { xp: 1100, title: "Guardiã do Aditivo" },
  { xp: 1800, title: "Dona do Fluxo" },
  { xp: 2700, title: "Analista X" }
];

/* Cada conceito aparece em vários formatos (mapa, podcast, caso, flashcard, entrevista).
   Os flashcards variam o jeito de perguntar a mesma ideia. */
MM.CONCEPTS = {
  dfd: {
    name: "Formalização da demanda", skill: "stakeholders",
    short: "O pedido oficial da área que precisa de algo: qual problema, por que agora, quem responde.",
    points: [
      "Nasce na área requisitante (quem sente a dor), não no fornecedor.",
      "Descreve a necessidade de negócio, não a marca do produto.",
      "Aponta alinhamento com o planejamento (PCA/PDTIC) e um responsável.",
      "É a primeira peça do processo — sem ela, ninguém sabe por que se está comprando."
    ],
    bridge: "Quando um órgão público te procura para contratar os Correios, ele já passou por essa etapa do lado dele. Agora quem escreve o pedido é uma área dos Correios.",
    cards: [
      ["Qual é a primeira peça de uma contratação: a necessidade ou a solução?", "A necessidade. A demanda formalizada descreve o problema de negócio; a solução só aparece depois, no ETP."],
      ["A área escreveu “queremos o sistema X da empresa Y”. O que está errado?", "Demanda deve descrever necessidade e resultado esperado, não marca. Indicar marca direciona a contratação sem estudo."],
      ["Quem “assina embaixo” da necessidade?", "A área requisitante — quem sente o problema e vai usar a solução."]
    ]
  },
  pca: {
    name: "Planejamento anual (PCA/PDTIC)", skill: "compliance",
    short: "A lista do que a empresa pretende contratar no ano, alinhada à estratégia de TI.",
    points: [
      "PCA = Plano de Contratações Anual; PDTIC = Plano Diretor de TIC.",
      "Contratação fora do plano não é proibida por si só, mas exige justificativa.",
      "Ajuda a prever orçamento e a evitar compras emergenciais “de última hora”.",
      "Emergência criada por falta de planejamento é um alerta clássico dos órgãos de controle."
    ],
    bridge: "Você já viu órgãos correndo no fim do ano para contratar antes de perder orçamento. O PCA existe para que os Correios não façam o mesmo.",
    cards: [
      ["Para que serve o PCA?", "Planejar o que será contratado no ano, prever orçamento e evitar contratações improvisadas."],
      ["Uma área pede contratação que não está no plano anual. É proibido?", "Não necessariamente — mas precisa de justificativa e ajuste do planejamento."],
      ["O que é “emergência fabricada”?", "Quando a urgência nasce da falta de planejamento. Órgãos de controle questionam, e pode gerar responsabilização."]
    ]
  },
  etp: {
    name: "ETP — Estudo Técnico Preliminar", skill: "documentacao",
    short: "O estudo que prova que vale a pena contratar e escolhe o melhor caminho — antes de escrever o TR.",
    points: [
      "Responde: qual a necessidade, quais soluções existem no mercado, qual é a melhor e por quê.",
      "Compara alternativas (comprar, alugar, nuvem, desenvolver internamente, reaproveitar contrato existente).",
      "Traz estimativa de quantidades e de custo, e demonstra viabilidade técnica e econômica.",
      "Conclui se a contratação é viável. Se não for, o processo para aqui — e isso é um resultado válido.",
      "É a base do Termo de Referência: o TR detalha a solução que o ETP escolheu."
    ],
    bridge: "Quando você monta uma proposta para um órgão, você já pensou em “qual serviço dos Correios resolve o problema dele”. O ETP é esse raciocínio — só que dos Correios olhando para o mercado.",
    cards: [
      ["ETP em uma frase:", "O estudo que demonstra a necessidade, compara soluções e conclui se a contratação é viável — base do TR."],
      ["O ETP vem antes ou depois do TR?", "Antes. O ETP escolhe a solução; o TR detalha como ela será contratada e gerida."],
      ["Um ETP pode concluir que NÃO se deve contratar?", "Sim. Concluir pela inviabilidade é resultado legítimo e evita desperdício."],
      ["Cite 3 perguntas que o ETP responde.", "Qual a necessidade? Que alternativas existem? Qual a melhor e por quê (incluindo custo estimado)?"]
    ]
  },
  tr: {
    name: "Termo de Referência (TR)", skill: "documentacao",
    short: "O “manual” da contratação: o que será entregue, como, quanto, como medir e como pagar.",
    points: [
      "Define objeto, requisitos, modelo de execução e modelo de gestão do contrato.",
      "Traz critérios de medição e de pagamento, níveis mínimos de serviço e sanções.",
      "Diz como o fornecedor será selecionado e quais qualificações deve ter.",
      "Vira anexo do edital e, depois, do contrato: o que não está no TR dificilmente será exigido.",
      "Em obras e engenharia, o equivalente é o projeto básico."
    ],
    bridge: "Você já leu contratos e perguntou “onde está escrito isso?”. O TR é o lugar onde isso deveria estar escrito. Agora você ajuda a escrever.",
    cards: [
      ["O que um TR de TIC precisa dizer sobre dinheiro?", "Como medir o serviço e como pagar: critérios de medição, níveis de serviço, glosas e forma de pagamento."],
      ["Por que um TR fraco vira dor de cabeça na gestão?", "Porque o que não está no TR (e no contrato) dificilmente pode ser cobrado do fornecedor depois."],
      ["TR x ETP: qual detalha a execução?", "O TR. O ETP decide a solução; o TR detalha execução, gestão, medição e pagamento."]
    ]
  },
  estimativa: {
    name: "Estimativa de custo", skill: "dinheiro",
    short: "Quanto deve custar, com base em pesquisa de preços defensável.",
    points: [
      "Usa fontes variadas: contratações similares de outros órgãos, painéis de preços, cotações de fornecedores.",
      "Desconsidera preços muito fora da curva (inexequíveis ou excessivos), com critério.",
      "Na Lei 13.303 (estatais), o valor estimado pode ser sigiloso, com regras para divulgação.",
      "Em TIC por consumo (nuvem), estima-se volume de uso — e isso precisa de memória de cálculo."
    ],
    bridge: "Você negocia valores com órgãos o tempo todo e sabe o que é preço fora da realidade. Aqui você é quem precisa provar que o preço de referência é justo.",
    cards: [
      ["Por que usar várias fontes na pesquisa de preços?", "Para que a estimativa seja defensável e reflita o mercado, e não só a cotação de um fornecedor interessado."],
      ["Nas estatais, o orçamento estimado é sempre público?", "Não. A Lei 13.303 permite que seja sigiloso, com regras para sua divulgação."],
      ["Em contrato de nuvem, o que se estima além do preço unitário?", "O volume de consumo previsto, com memória de cálculo e margem."]
    ]
  },
  riscos: {
    name: "Análise de riscos", skill: "risco",
    short: "Listar o que pode dar errado, a chance, o impacto e o que fazer antes e depois.",
    points: [
      "Cobre riscos da contratação (licitação deserta, atraso) e da execução (falha do fornecedor, lock-in).",
      "Cada risco tem: probabilidade, impacto, ação preventiva, ação de contingência e responsável.",
      "A Lei 13.303 prevê matriz de riscos para repartir responsabilidades entre as partes.",
      "Não é documento de gaveta: deve ser revisto ao longo do contrato."
    ],
    bridge: "Você já resolveu problema de contrato “apagando incêndio”. A análise de riscos é pensar no incêndio antes e deixar o extintor no lugar certo.",
    cards: [
      ["Quais 4 elementos um risco bem mapeado tem?", "Probabilidade, impacto, ação preventiva e ação de contingência (mais um responsável)."],
      ["Cite um risco típico de contrato de TIC.", "Dependência do fornecedor (lock-in), indisponibilidade do serviço, vazamento de dados, atraso na implantação."],
      ["Matriz de riscos serve para quê?", "Definir, antes, quem arca com cada risco (contratante ou contratado)."]
    ]
  },
  nms: {
    name: "Níveis mínimos de serviço (SLA)", skill: "risco",
    short: "A régua de qualidade: disponibilidade, prazo de atendimento, tempo de solução.",
    points: [
      "Expressos em indicadores mensuráveis: ex. disponibilidade de 99,5% ao mês, chamado crítico resolvido em 4h.",
      "Precisam de fórmula, fonte do dado e período de apuração definidos.",
      "Ligados ao pagamento: se não atingir, há redução (glosa) prevista no contrato.",
      "SLA sem forma de medir é só promessa."
    ],
    bridge: "Você já acompanha SLA e indicadores dos Correios para órgãos. Agora o SLA é do fornecedor — e quem cobra é você.",
    cards: [
      ["O que um SLA precisa ter para ser cobrável?", "Indicador, meta, fórmula, fonte do dado, período de apuração e consequência se não cumprir."],
      ["99,9% de disponibilidade mensal significa quanto tempo fora do ar?", "Cerca de 43 minutos por mês (30 dias)."],
      ["SLA e pagamento têm relação?", "Sim. O não atingimento gera ajuste no pagamento (glosa) conforme o instrumento de medição."]
    ]
  },
  imr: {
    name: "Medição por resultado (IMR)", skill: "dinheiro",
    short: "A tabela que transforma indicador de qualidade em valor a pagar.",
    points: [
      "IMR = Instrumento de Medição de Resultado: indicadores, metas, faixas e percentuais de ajuste.",
      "Paga-se pelo resultado entregue, não pelo esforço (Súmula 269 do TCU restringe pagamento por hora em TIC).",
      "Deve estar no TR/contrato desde o início — não se inventa régua durante a execução.",
      "Métricas comuns em TIC: pontos de função, UST com catálogo, disponibilidade, chamados."
    ],
    bridge: "É como a tabela de desconto por atraso que um órgão aplicaria aos Correios — só que agora os Correios aplicam ao fornecedor.",
    cards: [
      ["O que é IMR?", "Instrumento de Medição de Resultado: converte indicadores de qualidade em ajuste no valor a pagar."],
      ["O que diz a Súmula 269 do TCU?", "Em TIC, a remuneração deve estar vinculada a resultados/níveis de serviço; pagamento por hora só como exceção justificada."],
      ["Pode criar critério de medição novo no meio do contrato?", "Não por conta própria. A régua precisa estar prevista; mudar exige alteração contratual por acordo."]
    ]
  },
  modalidade: {
    name: "Forma de contratação", skill: "compliance",
    short: "Licitação (em regra, pregão para bens e serviços comuns), dispensa ou inexigibilidade.",
    points: [
      "Os Correios, como empresa pública, seguem a Lei 13.303/2016 e seu regulamento interno.",
      "Bens e serviços comuns: preferência pelo pregão.",
      "Dispensa (art. 29): hipóteses previstas em lei, como valores baixos ou emergência.",
      "Inexigibilidade (art. 30): quando a competição é inviável (ex.: fornecedor exclusivo).",
      "Contratação direta não é “sem processo”: exige justificativa, preço e documentação."
    ],
    bridge: "Muitos órgãos contratam os Correios por contratação direta — você conhece a papelada que vem junto. Agora a justificativa sai dos Correios.",
    cards: [
      ["Qual lei é a base das contratações dos Correios?", "A Lei 13.303/2016 (Lei das Estatais), mais o regulamento interno de licitações e contratos."],
      ["Dispensa x inexigibilidade:", "Dispensa: a competição seria possível, mas a lei permite não licitar. Inexigibilidade: a competição é inviável."],
      ["Contratação direta dispensa justificativa?", "Não. Precisa justificar a hipótese legal, o fornecedor escolhido e o preço."]
    ]
  },
  garantia: {
    name: "Garantia contratual", skill: "dinheiro",
    short: "Um “seguro” que o fornecedor dá para cobrir inadimplemento.",
    points: [
      "Modalidades: caução em dinheiro, seguro-garantia ou fiança bancária (escolha do contratado).",
      "Na Lei 13.303, em regra até 5% do valor do contrato (até 10% em casos de grande vulto e alta complexidade).",
      "Precisa estar válida durante a vigência — e ser atualizada em aditivos de valor ou prazo.",
      "Liberada ao final, após cumprimento das obrigações."
    ],
    bridge: "Você acompanha vencimentos; a garantia é mais uma data para vigiar — e costuma ser esquecida em prorrogações.",
    cards: [
      ["Quem escolhe a modalidade de garantia?", "O contratado, entre as previstas: caução, seguro-garantia ou fiança bancária."],
      ["Prorroguei o contrato. O que acontece com a garantia?", "Precisa ser renovada/atualizada para cobrir o novo prazo e valor."],
      ["Limite usual de garantia nas estatais:", "Até 5% do valor do contrato; até 10% em grande vulto e alta complexidade."]
    ]
  },
  fiscais: {
    name: "Gestão e fiscalização", skill: "stakeholders",
    short: "Quem acompanha o contrato: gestor, fiscais (técnico, requisitante, administrativo) e o preposto do fornecedor.",
    points: [
      "Gestor: coordena, consolida, encaminha alterações, prorrogações e sanções.",
      "Fiscal técnico: verifica se a entrega atende tecnicamente (e mede SLA).",
      "Fiscal requisitante: verifica se atende à necessidade do negócio.",
      "Fiscal administrativo: obrigações trabalhistas, fiscais, documentos, garantia.",
      "Preposto: representante do fornecedor, interlocutor oficial.",
      "O Analista de Contratos apoia todos eles — organiza, controla prazos, instrui processos."
    ],
    bridge: "Hoje você é o “preposto” dos Correios diante de órgãos públicos, na prática. Agora você senta do outro lado da mesa e apoia quem fiscaliza.",
    cards: [
      ["Quem verifica se a entrega atende tecnicamente?", "O fiscal técnico."],
      ["Quem é o preposto?", "O representante formal do fornecedor perante os Correios."],
      ["Qual o papel do analista de contratos na fiscalização?", "Apoiar gestor e fiscais: prazos, documentos, instrução de processos, rastreabilidade."]
    ]
  },
  os: {
    name: "Ordem de serviço e kickoff", skill: "documentacao",
    short: "O “pode começar” formal: define o que, quando e como o fornecedor executa.",
    points: [
      "Reunião inicial (kickoff): apresenta fiscais, preposto, canais, rotinas e calendário de medição.",
      "Ordem de Serviço (OS) ou de Fornecimento: demanda formal, com escopo, prazo e métrica.",
      "Trabalho executado sem OS é trabalho sem cobertura — risco de pagamento indevido ou disputa.",
      "Toda comunicação relevante deve ser registrada (ofício, sistema, ata)."
    ],
    bridge: "Você já viu cliente pedir coisa “por WhatsApp” e depois discutir o que foi combinado. A OS é o antídoto.",
    cards: [
      ["O fornecedor começou a trabalhar “por e-mail informal”. Qual o risco?", "Serviço sem cobertura formal: difícil medir, aceitar e pagar; pode gerar disputa."],
      ["O que se define no kickoff?", "Pessoas (fiscais e preposto), canais oficiais, rotinas, calendário de medição e entregas."],
      ["OS em uma frase:", "O documento formal que manda executar um serviço específico, com escopo, prazo e métrica."]
    ]
  },
  recebimento: {
    name: "Recebimento provisório e definitivo", skill: "documentacao",
    short: "Primeiro se registra que chegou; depois se confirma que está conforme.",
    points: [
      "Provisório: registra a entrega para verificação (em regra, pelo fiscal técnico).",
      "Definitivo: confirma qualidade e conformidade com o contrato.",
      "É o recebimento que sustenta a liquidação da despesa.",
      "Recebimento definitivo não elimina a responsabilidade do fornecedor por vícios ocultos."
    ],
    bridge: "É o “aceite” que você já pede aos órgãos. Agora os Correios dão (ou recusam) o aceite.",
    cards: [
      ["Diferença entre recebimento provisório e definitivo:", "Provisório: registra a entrega para análise. Definitivo: atesta que está conforme o contrato."],
      ["Sem recebimento, dá para pagar?", "Não. O recebimento/atesto é a base da liquidação, que vem antes do pagamento."],
      ["Recebi em definitivo e depois achei defeito oculto. Perdi o direito?", "Não. O fornecedor continua responsável por vícios ocultos, na forma da lei e do contrato."]
    ]
  },
  glosa: {
    name: "Glosa x multa", skill: "dinheiro",
    short: "Glosa ajusta o pagamento ao que foi entregue; multa é sanção com processo e defesa.",
    points: [
      "Glosa: desconto por serviço não prestado ou abaixo do nível previsto no IMR.",
      "Multa: penalidade prevista no contrato, aplicada após processo com direito de defesa.",
      "Podem coexistir: a glosa corrige o valor; a multa pune o descumprimento.",
      "Ambas precisam de base contratual e registro das evidências."
    ],
    bridge: "Você já viu órgão descontar fatura dos Correios por falha de entrega. Lá você defendia; aqui você instrui.",
    cards: [
      ["Glosa é penalidade?", "Não. É ajuste do pagamento ao resultado entregue, conforme o IMR. Multa é que é sanção."],
      ["Multa exige o quê antes de ser aplicada?", "Processo com oportunidade de defesa prévia do fornecedor."],
      ["Glosa e multa podem acontecer juntas?", "Sim: uma corrige o valor pago, a outra pune o descumprimento — se o contrato prever ambas."]
    ]
  },
  despesa: {
    name: "Empenho, liquidação e pagamento", skill: "dinheiro",
    short: "Reservar o dinheiro, comprovar a entrega, pagar. Nessa ordem.",
    points: [
      "Empenho: reserva do recurso para aquela despesa (cria a obrigação de pagar, se houver entrega).",
      "Liquidação: verificação do direito do credor com base em documentos (nota fiscal + recebimento/atesto).",
      "Pagamento: só depois da liquidação.",
      "Sem saldo reservado não se executa; sem liquidação não se paga.",
      "O edital cita essas etapas; nos Correios, o fluxo segue normativos e sistemas internos — o princípio é o mesmo."
    ],
    bridge: "Você acompanha faturamento e pagamento dos órgãos para os Correios. Agora é o caminho inverso: os Correios pagando o fornecedor.",
    cards: [
      ["Coloque na ordem: pagamento, empenho, liquidação.", "Empenho → liquidação → pagamento."],
      ["O que é liquidação?", "Verificar o direito do credor com base em documentos: nota fiscal e comprovação da entrega (atesto/recebimento)."],
      ["Contrato vai ser aditivado em valor. O que checar no dinheiro?", "Se há disponibilidade orçamentária e reforço da reserva (empenho) para cobrir o acréscimo."]
    ]
  },
  aditivo: {
    name: "Aditivo x apostila", skill: "documentacao",
    short: "Aditivo muda o contrato (acordo das partes); apostila registra o que o contrato já previa.",
    points: [
      "Termo aditivo: altera cláusulas — prazo, escopo, quantidade, valor fora do previsto.",
      "Apostila: registro simples de algo já previsto, como reajuste pelo índice do contrato.",
      "Na Lei 13.303, alterações contratuais ocorrem por acordo entre as partes.",
      "Prorrogação de prazo se faz por aditivo, assinado antes do fim da vigência."
    ],
    bridge: "Você já faz aditivos com órgãos. A diferença: agora quem justifica a necessidade da alteração são os Correios.",
    cards: [
      ["Reajuste anual pelo índice previsto no contrato: aditivo ou apostila?", "Apostila — só aplica o que o contrato já previa."],
      ["Aumentar a quantidade de licenças: aditivo ou apostila?", "Aditivo — muda o objeto/valor do contrato."],
      ["Nos Correios (Lei 13.303), pode alterar contrato unilateralmente?", "Não. As alterações são por acordo entre as partes."]
    ]
  },
  limites: {
    name: "Limites de alteração (25%)", skill: "compliance",
    short: "Acréscimos e supressões têm teto: em regra, 25% do valor inicial atualizado.",
    points: [
      "Lei 13.303, art. 81: acréscimos ou supressões até 25% do valor inicial atualizado.",
      "Reforma de edifício ou equipamento: acréscimos até 50%.",
      "Supressões acima do limite só por acordo entre as partes.",
      "Precisou de mais do que isso? Em regra, é caso de nova contratação — não de “esticar” o contrato."
    ],
    bridge: "Você já ouviu “dá para colocar mais isso no contrato?”. A resposta agora vem com uma conta: quanto isso representa do valor inicial?",
    cards: [
      ["Limite de acréscimo em serviços e compras (Lei 13.303):", "25% do valor inicial atualizado do contrato."],
      ["A área quer +40% de licenças. E aí?", "Acima do limite de acréscimo: avaliar nova contratação, com planejamento próprio."],
      ["O percentual se calcula sobre o quê?", "Sobre o valor inicial atualizado do contrato."]
    ]
  },
  reajuste: {
    name: "Reajuste, repactuação e reequilíbrio", skill: "dinheiro",
    short: "Três jeitos de mexer no preço, com causas diferentes.",
    points: [
      "Reajuste: correção por índice previsto no contrato, com periodicidade mínima de 12 meses.",
      "Repactuação: para serviços contínuos com mão de obra dedicada — revisão de custos (ex.: convenção coletiva).",
      "Reequilíbrio (revisão): evento imprevisível, ou previsível de consequências incalculáveis, que desequilibra o contrato — a qualquer tempo, com comprovação.",
      "Reajuste costuma ir por apostila; reequilíbrio exige análise e aditivo."
    ],
    bridge: "Você já negociou reajuste com órgãos. Agora é o fornecedor pedindo — e você checa índice, data-base e prova.",
    cards: [
      ["Fornecedor pede aumento porque o dólar disparou por um evento imprevisível. Qual instituto?", "Reequilíbrio econômico-financeiro — exige comprovação do impacto."],
      ["Reajuste pode ser a cada 6 meses?", "Não. A periodicidade mínima é anual."],
      ["Repactuação se aplica a quê?", "Serviços contínuos com dedicação de mão de obra — revisa custos como salários de convenção coletiva."]
    ]
  },
  prorrogacao: {
    name: "Vigência e prorrogação", skill: "compliance",
    short: "Contratos têm prazo; prorrogar exige vantagem, desempenho e papel assinado a tempo.",
    points: [
      "Lei 13.303, art. 71: duração de até 5 anos, com exceções legais; é vedado prazo indeterminado.",
      "Antes de prorrogar: desempenho do fornecedor, preço ainda vantajoso, interesse das partes, orçamento, habilitação mantida.",
      "O aditivo precisa ser assinado ANTES do fim da vigência — contrato vencido não se prorroga.",
      "Garantia e reserva orçamentária também precisam acompanhar."
    ],
    bridge: "Controle de vencimento é o seu dia a dia. A diferença: agora a pergunta é “ainda vale a pena para os Correios?”.",
    cards: [
      ["Prazo máximo de contratos nas estatais (regra geral):", "Até 5 anos (Lei 13.303, art. 71), salvo exceções legais."],
      ["O contrato venceu ontem. Dá para prorrogar hoje?", "Não. Contrato extinto não se prorroga; seria necessária nova contratação."],
      ["Cite 3 verificações antes de prorrogar.", "Desempenho do fornecedor, vantajosidade do preço, disponibilidade orçamentária (e habilitação, garantia, interesse das partes)."]
    ]
  },
  penalidades: {
    name: "Sanções", skill: "risco",
    short: "Advertência, multa, suspensão — sempre com processo e direito de defesa.",
    points: [
      "Lei 13.303, art. 83: advertência, multa e suspensão de licitar/contratar com a entidade por até 2 anos.",
      "Defesa prévia do fornecedor em 10 dias úteis.",
      "Proporcionalidade: a sanção deve ser compatível com a gravidade.",
      "Tudo documentado: notificação, evidências, defesa, decisão."
    ],
    bridge: "Você já viu órgão notificar os Correios. Sabe como uma notificação mal instruída desmorona na defesa.",
    cards: [
      ["Quais sanções a Lei 13.303 prevê?", "Advertência, multa e suspensão temporária de licitar e contratar com a entidade (até 2 anos)."],
      ["Prazo de defesa prévia na Lei 13.303:", "10 dias úteis."],
      ["O que torna uma sanção frágil?", "Falta de base contratual, de evidências, de notificação correta ou de proporcionalidade."]
    ]
  },
  lgpd: {
    name: "LGPD no contrato", skill: "compliance",
    short: "Se o fornecedor toca em dados pessoais, o contrato precisa dizer como.",
    points: [
      "Correios costumam ser controladores; o fornecedor que trata dados em nome deles é operador.",
      "Cláusulas: finalidade, segurança, sigilo, subcontratação, notificação de incidentes, auditoria.",
      "No fim do contrato: devolução e/ou eliminação dos dados, com comprovação.",
      "Dados de clientes, CPFs e endereços estão por toda parte na operação postal."
    ],
    bridge: "Órgãos já te pediram termo de sigilo e cláusula de dados. Agora os Correios exigem isso do fornecedor.",
    cards: [
      ["Fornecedor processa dados de clientes dos Correios. Qual o papel dele na LGPD?", "Operador — trata dados em nome do controlador (os Correios)."],
      ["O que acontece com os dados ao fim do contrato?", "Devolução e/ou eliminação conforme o contrato, com comprovação."],
      ["Cite 2 cláusulas de LGPD num contrato de TIC.", "Notificação de incidentes e regras de subcontratação (também sigilo, segurança, auditoria)."]
    ]
  },
  transicao: {
    name: "Lock-in, transição e encerramento", skill: "risco",
    short: "Não fique refém do fornecedor: planeje a saída desde o início.",
    points: [
      "Lock-in: dependência que torna caro ou impossível trocar de fornecedor.",
      "Previna no TR: formatos abertos, documentação, propriedade dos dados, transferência de conhecimento.",
      "Plano de transição: período em que o fornecedor que sai apoia o que entra.",
      "Encerramento: termo de encerramento, devolução de dados/acessos, liberação da garantia, lições aprendidas."
    ],
    bridge: "Você já viu órgão com medo de trocar de fornecedor porque “só ele sabe mexer”. O analista de contratos evita que os Correios cheguem a esse ponto.",
    cards: [
      ["O que é lock-in?", "Dependência de um fornecedor que torna a troca cara, arriscada ou inviável."],
      ["Onde se previne o lock-in?", "No planejamento e no TR: dados dos Correios, formatos abertos, documentação e transição obrigatória."],
      ["Checklist de encerramento (3 itens):", "Devolução de dados e acessos, termo de encerramento, liberação da garantia (e lições aprendidas)."]
    ]
  },
  cloud: {
    name: "Nuvem (IaaS, PaaS, SaaS)", skill: "tecnologia",
    short: "Comprar capacidade de computação como serviço — e pagar pelo que consome.",
    points: [
      "IaaS: infraestrutura (servidores, armazenamento). PaaS: plataforma para desenvolver. SaaS: software pronto.",
      "Modelo por consumo: o valor varia com o uso — exige controle mensal e alertas.",
      "FinOps: práticas de gestão financeira da nuvem (etiquetas por projeto, limites, relatórios).",
      "Pontos contratuais: onde ficam os dados, segurança, SLA, portabilidade, suporte, saída."
    ],
    bridge: "É como a conta de energia: não se paga um valor fixo, paga-se o que se consome. E alguém precisa olhar o medidor.",
    cards: [
      ["IaaS, PaaS e SaaS — do mais “cru” ao mais “pronto”:", "IaaS (infraestrutura) → PaaS (plataforma) → SaaS (software pronto)."],
      ["Qual o maior risco financeiro em nuvem por consumo?", "Consumo acima do estimado sem controle — estourar saldo e orçamento."],
      ["O que é FinOps?", "Gestão financeira da nuvem: acompanhar, alocar e otimizar custos de consumo."]
    ]
  },
  api: {
    name: "APIs", skill: "tecnologia",
    short: "A “tomada” que permite um sistema conversar com outro.",
    points: [
      "API = interface de programação: um sistema pede, outro responde (ex.: consultar rastreamento).",
      "No contrato: disponibilidade, tempo de resposta, limite de chamadas, segurança, documentação, versão.",
      "Mudança de versão sem aviso quebra integrações — exija prazos de comunicação.",
      "Se a API cai, o negócio que depende dela para também."
    ],
    bridge: "Clientes dos Correios integram sistemas para gerar etiquetas e rastrear objetos — isso é API. Agora os Correios contratam APIs de terceiros.",
    cards: [
      ["API em linguagem de gente:", "Um jeito padronizado de um sistema pedir e receber informações de outro."],
      ["Cite 3 cláusulas importantes para um contrato com API.", "Disponibilidade, tempo de resposta, limite de chamadas (também segurança, versão e documentação)."],
      ["Por que exigir aviso prévio de mudança de versão?", "Porque mudanças sem aviso quebram as integrações que dependem da API."]
    ]
  },
  wmstms: {
    name: "WMS e TMS", skill: "tecnologia",
    short: "WMS gerencia o armazém; TMS gerencia o transporte. Coração da logística.",
    points: [
      "WMS (Warehouse Management System): recebimento, endereçamento, separação (picking), inventário.",
      "TMS (Transportation Management System): planejamento de rotas, cargas, fretes, acompanhamento da frota.",
      "Contrato típico: licenças/subscrição + implantação + integração + sustentação.",
      "Riscos: customização excessiva, integração com sistemas legados, go-live em época de pico."
    ],
    bridge: "Você conhece a operação dos Correios por dentro. WMS e TMS são os sistemas que dão cérebro aos centros de distribuição e às rotas.",
    cards: [
      ["WMS cuida de quê?", "Do armazém: recebimento, endereçamento, separação e inventário."],
      ["TMS cuida de quê?", "Do transporte: rotas, cargas, fretes e acompanhamento de entregas/frota."],
      ["Por que evitar go-live de sistema logístico em época de pico?", "Qualquer instabilidade afeta o volume máximo de operação — risco operacional alto."]
    ]
  },
  metricas: {
    name: "Métricas de TIC (UST, PF, sustentação)", skill: "tecnologia",
    short: "Como se mede trabalho de TI para pagar por resultado.",
    points: [
      "Pontos de função (PF): medem o tamanho funcional de software.",
      "UST (Unidade de Serviço Técnico): exige catálogo claro — cada serviço com esforço e produto esperado.",
      "Sustentação: manter o sistema funcionando (correções, pequenas melhorias), com SLA.",
      "Desenvolvimento: construir algo novo, medido por entregas/tamanho.",
      "Métrica vaga = pagamento difícil de controlar."
    ],
    bridge: "Assim como os Correios cobram por objeto, peso e serviço, o fornecedor de TI cobra por uma unidade. Seu papel: garantir que a unidade seja clara e verificável.",
    cards: [
      ["Pontos de função medem o quê?", "O tamanho funcional de um software (o que ele faz para o usuário)."],
      ["Qual o cuidado com UST?", "Ter catálogo de serviços claro, com esforço e produto esperado, para evitar pagamento sem controle."],
      ["Sustentação x desenvolvimento:", "Sustentação mantém o sistema funcionando; desenvolvimento constrói algo novo."]
    ]
  }
};

/* Jornada “Minha Missão”: 12 estações do ciclo de vida de uma contratação de TIC. */
MM.STATIONS = [
  { id: "necessidade", name: "Necessidade", icon: "💡", concepts: ["dfd", "pca"],
    what: "Uma área dos Correios identifica um problema: o armazém não dá conta do volume, o sistema de rastreamento cai, a nuvem atual vai vencer.",
    analyst: "Ajuda a transformar a reclamação em demanda formal: problema, impacto, prazo, responsável e alinhamento ao planejamento.",
    doc: "Documento de formalização da demanda",
    youAlready: "Você escuta o órgão público e traduz a dor dele em um serviço dos Correios.",
    risk: "Demanda descrita como marca de produto (“queremos o sistema X”) — direciona a contratação sem estudo.",
    check: { q: "A área de logística escreve: “Precisamos do WMS da empresa Alfa”. Qual a melhor resposta do analista?",
      options: [["Aceitar, porque a área conhece o assunto.", false], ["Pedir que a área descreva o problema e o resultado esperado, sem indicar marca.", true], ["Pedir três orçamentos da empresa Alfa.", false]],
      fb: { faltou: "Faltou separar necessidade de solução.", risco: "Direcionar para uma marca sem estudo compromete a competitividade e é questionado pelo controle.", melhor: "Registrar a necessidade de negócio (volume, prazos, gargalos) e deixar a escolha da solução para o ETP." } } },
  { id: "planejamento", name: "Planejamento", icon: "🗓️", concepts: ["pca", "riscos"],
    what: "A demanda é confrontada com o plano anual de contratações e o planejamento de TI. Forma-se a equipe de planejamento.",
    analyst: "Verifica alinhamento ao PCA, organiza a equipe (requisitante, técnico, administrativo) e o cronograma da contratação.",
    doc: "PCA / PDTIC · cronograma da contratação",
    youAlready: "Você já controla calendários de renovação para não perder prazos com órgãos.",
    risk: "Começar tarde demais e cair numa “emergência fabricada”.",
    check: { q: "O contrato atual de nuvem vence em 4 meses e ninguém começou a nova contratação. Qual o maior risco?",
      options: [["Nenhum, 4 meses é bastante tempo.", false], ["Falta de tempo para ETP, TR e licitação, levando a uma contratação emergencial questionável.", true], ["O fornecedor atual aumentar o preço.", false]],
      fb: { faltou: "Faltou estimar o tempo real de uma contratação de TIC (estudo, TR, jurídico, licitação, recursos).", risco: "Emergência causada por falta de planejamento é alvo de órgãos de controle e pode descontinuar o serviço.", melhor: "Acionar já o planejamento, avaliar prorrogação do contrato atual se ainda cabível, e registrar o cronograma." } } },
  { id: "etp", name: "ETP", icon: "🔍", concepts: ["etp", "estimativa"],
    what: "Estuda-se o mercado: quais soluções existem, quanto custam, qual atende melhor. Conclui-se se é viável contratar.",
    analyst: "Apoia a pesquisa de mercado e de preços, organiza alternativas e consolida a conclusão com as áreas técnicas.",
    doc: "Estudo Técnico Preliminar",
    youAlready: "Você compara serviços dos Correios para oferecer o mais adequado ao órgão.",
    risk: "ETP “copia e cola”, sem comparar alternativas reais — frágil diante do controle.",
    check: { q: "Qual destes itens NÃO é papel do ETP?",
      options: [["Comparar alternativas de solução.", false], ["Estimar quantidades e custos.", false], ["Definir as datas de pagamento das faturas mensais.", true], ["Concluir sobre a viabilidade da contratação.", false]],
      fb: { faltou: "Faltou diferenciar estudo (ETP) de detalhamento de execução (TR/contrato).", risco: "Misturar os documentos gera ETP inchado e TR incompleto.", melhor: "O ETP escolhe e justifica a solução; datas e forma de pagamento ficam no TR e no contrato." } } },
  { id: "tr", name: "Termo de Referência", icon: "📝", concepts: ["tr", "nms", "imr", "riscos"],
    what: "Detalha-se a solução escolhida: requisitos, modelo de execução, modelo de gestão, SLA, medição, pagamento, sanções.",
    analyst: "Ajuda a escrever cláusulas de gestão: prazos, critérios de medição, níveis de serviço, obrigações e documentação.",
    doc: "Termo de Referência (anexo do edital e do contrato)",
    youAlready: "Você lê contratos procurando “onde está escrito”. Agora você garante que esteja escrito.",
    risk: "SLA sem forma de medir e pagamento sem critério — vira briga na execução.",
    check: { q: "O TR diz: “o fornecedor deverá prestar um serviço de alta qualidade”. O que falta?",
      options: [["Nada, a intenção está clara.", false], ["Indicadores mensuráveis, metas, forma de apuração e consequência no pagamento.", true], ["Uma multa maior.", false]],
      fb: { faltou: "Faltou transformar “qualidade” em indicador medível.", risco: "Sem régua objetiva, não há como glosar nem sancionar: o fornecedor recebe integralmente mesmo entregando mal.", melhor: "Definir SLA (ex.: disponibilidade mensal ≥ 99,5%), fonte do dado, período e faixa de glosa no IMR." } } },
  { id: "contratacao", name: "Contratação", icon: "⚖️", concepts: ["modalidade", "estimativa"],
    what: "Escolhe-se o fornecedor por licitação (em regra pregão, para bens e serviços comuns) ou, quando cabível, por contratação direta.",
    analyst: "Apoia a instrução do processo, a resposta a questionamentos técnicos e a articulação com Jurídico e área de licitações.",
    doc: "Edital · processo de contratação direta",
    youAlready: "Você acompanha órgãos contratando os Correios por contratação direta e sabe o que eles pedem.",
    risk: "Contratação direta sem justificativa robusta da hipótese legal e do preço.",
    check: { q: "Só existe uma empresa no Brasil que dá suporte a um software proprietário já usado pelos Correios. Qual hipótese provável?",
      options: [["Dispensa por valor.", false], ["Inexigibilidade, por inviabilidade de competição — com comprovação da exclusividade.", true], ["Pregão obrigatório.", false]],
      fb: { faltou: "Faltou perceber que não há competição possível.", risco: "Alegar exclusividade sem prova é um dos pontos mais auditados.", melhor: "Inexigibilidade (Lei 13.303, art. 30), com prova de exclusividade, justificativa de preço e registro no processo." } } },
  { id: "contrato", name: "Contrato", icon: "✍️", concepts: ["garantia", "lgpd", "fiscais"],
    what: "Assina-se o contrato, apresenta-se a garantia, designam-se gestor e fiscais.",
    analyst: "Confere documentos, prazos de garantia, publicação, designação de fiscais e cadastra o contrato nos controles.",
    doc: "Contrato · garantia · portaria de designação de fiscais",
    youAlready: "Assinaturas, vigências e documentação contratual já são sua rotina.",
    risk: "Contrato começar sem fiscais designados ou sem garantia válida.",
    check: { q: "O contrato foi assinado, mas a garantia ainda não foi apresentada. O que fazer?",
      options: [["Nada, garantia é opcional depois da assinatura.", false], ["Cobrar a apresentação no prazo contratual e registrar; se não vier, instruir as medidas previstas.", true], ["Descontar da primeira fatura sem avisar.", false]],
      fb: { faltou: "Faltou tratar a garantia como obrigação com prazo.", risco: "Sem garantia, os Correios ficam descobertos se o fornecedor falhar.", melhor: "Notificar formalmente, acompanhar o prazo e, se descumprido, encaminhar as consequências contratuais." } } },
  { id: "fornecedor", name: "Fornecedor", icon: "🏢", concepts: ["fiscais", "os"],
    what: "Reunião inicial com o preposto: quem é quem, canais oficiais, rotinas, calendário de entregas e de medição.",
    analyst: "Organiza a reunião inicial, a ata, a lista de contatos e o fluxo de documentos.",
    doc: "Ata de reunião inicial · plano de trabalho",
    youAlready: "Você faz reuniões com órgãos públicos e sabe o valor de uma ata bem feita.",
    risk: "Combinar coisas por fora dos canais oficiais — “mas o gerente falou por telefone…”.",
    check: { q: "O preposto pede para tratar tudo pelo WhatsApp pessoal do fiscal. Melhor resposta?",
      options: [["Tudo bem, é mais rápido.", false], ["Usar os canais oficiais definidos na reunião inicial; o que for decisão precisa ficar registrado.", true], ["Proibir qualquer contato.", false]],
      fb: { faltou: "Faltou pensar em rastreabilidade.", risco: "Decisões fora do registro oficial não se provam e geram disputa.", melhor: "Canais oficiais para comunicação formal; ata para acordos; mensagens rápidas só para operação sem decisão." } } },
  { id: "entrega", name: "Entrega", icon: "📦", concepts: ["os", "wmstms", "api"],
    what: "O fornecedor executa: implanta o WMS, sustenta a API, provisiona a nuvem — sempre a partir de demandas formais.",
    analyst: "Controla ordens de serviço, prazos e pendências; apoia fiscais a registrar ocorrências.",
    doc: "Ordens de serviço · relatórios de execução",
    youAlready: "Você resolve problemas de execução contratual com órgãos — de dentro para fora.",
    risk: "Serviço feito sem OS: não dá para medir nem pagar com segurança.",
    check: { q: "A área técnica pediu por e-mail um ajuste grande no TMS e o fornecedor já fez. O que falta?",
      options: [["Nada, o serviço foi entregue.", false], ["Verificar cobertura contratual, formalizar (OS) e só então medir e pagar — registrando a irregularidade de origem.", true], ["Pagar logo para não gerar atrito.", false]],
      fb: { faltou: "Faltou a formalização antes da execução.", risco: "Pagar serviço sem demanda formal pode ser pagamento indevido; não pagar pode gerar pleito do fornecedor.", melhor: "Checar se o serviço está no escopo, regularizar formalmente com gestor e fiscais, e orientar o fluxo correto daqui para frente." } } },
  { id: "medicao", name: "Medição", icon: "📏", concepts: ["imr", "nms", "glosa", "recebimento"],
    what: "Mede-se o que foi entregue contra o SLA e o IMR. Recebe-se provisória e definitivamente.",
    analyst: "Consolida indicadores, calcula glosas previstas, confere termos de recebimento.",
    doc: "Relatório de medição · termos de recebimento",
    youAlready: "Você acompanha indicadores e SLA dos Correios. Agora o indicador é do fornecedor.",
    risk: "Aceitar o relatório do próprio fornecedor sem conferência.",
    check: { q: "A disponibilidade da API no mês foi 98,7%, e o SLA é 99,5%. O que acontece?",
      options: [["Multa automática, sem processo.", false], ["Aplica-se a glosa prevista no IMR; se houver descumprimento grave, avalia-se sanção com processo e defesa.", true], ["Nada, a diferença é pequena.", false]],
      fb: { faltou: "Faltou separar ajuste de pagamento (glosa) de sanção (multa).", risco: "Multar sem processo anula a sanção; ignorar a falha paga por serviço não entregue.", melhor: "Glosa conforme a faixa do IMR, registro das evidências e, se o contrato prever e a gravidade justificar, processo sancionador." } } },
  { id: "pagamento", name: "Pagamento", icon: "💳", concepts: ["despesa", "recebimento"],
    what: "Com a entrega aceita e a nota fiscal conferida, liquida-se a despesa e paga-se.",
    analyst: "Confere nota, atesto, retenções, saldo reservado e rastreabilidade de documentos.",
    doc: "Nota fiscal · atesto · documentos de liquidação",
    youAlready: "Você acompanha faturamento e cobrança dos órgãos. Agora é o fluxo de pagar.",
    risk: "Pagar sem atesto, ou com valor diferente do medido.",
    check: { q: "Chegou a nota fiscal do mês, mas o fiscal ainda não atestou. Qual etapa está faltando?",
      options: [["Empenho.", false], ["Liquidação — que depende da comprovação da entrega (atesto/recebimento).", true], ["Nenhuma, pode pagar.", false]],
      fb: { faltou: "Faltou lembrar a ordem empenho → liquidação → pagamento.", risco: "Pagar sem liquidar é pagar sem prova de que o serviço foi entregue.", melhor: "Aguardar o atesto, conferir a nota com a medição e só então liquidar e pagar." } } },
  { id: "mudanca", name: "Mudança / Renovação", icon: "🔄", concepts: ["aditivo", "limites", "reajuste", "prorrogacao", "penalidades"],
    what: "Pedidos de mais quantidade, reajuste, prorrogação, reequilíbrio — e, às vezes, sanções.",
    analyst: "Instrui aditivos e apostilas, confere limites legais, vigência, orçamento e garantia.",
    doc: "Termo aditivo · apostila · processo sancionador",
    youAlready: "Aditivos, renovações e valores são o centro do seu trabalho hoje.",
    risk: "Estourar o limite de 25%, ou deixar vencer antes de assinar a prorrogação.",
    check: { q: "Qual situação se resolve por apostila, e não por aditivo?",
      options: [["Aumentar 20% as licenças.", false], ["Aplicar o reajuste anual pelo índice previsto no contrato.", true], ["Prorrogar a vigência por 12 meses.", false]],
      fb: { faltou: "Faltou perguntar: isso muda o contrato ou só aplica o que ele já previa?", risco: "Usar apostila para alteração de verdade deixa o ato sem validade adequada.", melhor: "Apostila para o que já está previsto (reajuste por índice); aditivo para mudar prazo, quantidade ou condições." } } },
  { id: "encerramento", name: "Encerramento", icon: "🏁", concepts: ["transicao", "lgpd", "garantia"],
    what: "O contrato termina: transição para o novo fornecedor, devolução de dados, liberação da garantia, lições aprendidas.",
    analyst: "Conduz o checklist de encerramento e garante que nada fique pendente.",
    doc: "Termo de encerramento · plano de transição",
    youAlready: "Você já encerrou contratos com órgãos e sabe o que fica “pendurado” quando ninguém fecha direito.",
    risk: "Fornecedor sair levando dados, senhas e conhecimento — lock-in na prática.",
    check: { q: "O contrato de sustentação do WMS termina em 60 dias e haverá troca de fornecedor. Prioridade?",
      options: [["Aguardar o último dia e desligar.", false], ["Executar o plano de transição: repasse de conhecimento, documentação, dados e acessos, com prazos.", true], ["Reter a última fatura até o novo fornecedor aprender sozinho.", false]],
      fb: { faltou: "Faltou tratar a saída como uma fase do contrato.", risco: "Sem transição, o novo fornecedor começa às cegas e a operação logística sofre.", melhor: "Ativar as cláusulas de transição previstas, acompanhar entregas de conhecimento e dados, e só então encerrar e liberar a garantia." } } }
];

/* “Vire o contrato”: o que ela já sabe → vira a chave → quando os Correios contratam. */
MM.FLIPS = [
  { id: "f-renovacao", title: "Renovação", concepts: ["prorrogacao"],
    know: "Você lembra o órgão de que o contrato com os Correios vence e prepara a renovação.",
    flip: "Agora os Correios são o órgão. Quem precisa decidir se renova são eles.",
    correios: "Você verifica se ainda vale a pena: desempenho do fornecedor, preço de mercado, orçamento, garantia, limite de 5 anos — e garante o aditivo assinado antes do vencimento.",
    check: { q: "Qual pergunta passa a ser SUA quando os Correios são os contratantes?",
      options: [["“O cliente vai renovar?”", false], ["“Renovar ainda é a melhor opção para os Correios?”", true], ["“Qual desconto posso oferecer?”", false]],
      fb: { faltou: "Faltou mudar o ponto de vista para o de quem paga.", risco: "Renovar por inércia mantém fornecedor ruim ou preço acima do mercado.", melhor: "Decidir com evidências: desempenho, vantajosidade, orçamento e prazo legal." } } },
  { id: "f-sla", title: "SLA", concepts: ["nms", "glosa"],
    know: "Você acompanha os indicadores dos Correios e explica ao órgão por que um prazo não foi cumprido.",
    flip: "Agora quem explica é o fornecedor. Quem cobra é você.",
    correios: "Você confere o indicador com dado independente, aplica a glosa prevista no IMR e, se for o caso, apoia o processo de sanção.",
    check: { q: "O fornecedor manda um relatório dizendo que cumpriu 100% do SLA. O que você faz?",
      options: [["Aceita — o relatório é oficial.", false], ["Confere com fontes independentes (monitoramento, chamados, fiscal técnico) antes de aceitar.", true], ["Recusa por princípio.", false]],
      fb: { faltou: "Faltou validar a fonte do dado.", risco: "Pagar integralmente por um serviço que não entregou o nível contratado.", melhor: "Confrontar o relatório com dados próprios e registrar a conferência na medição." } } },
  { id: "f-aditivo", title: "Aditivo", concepts: ["aditivo", "limites"],
    know: "O órgão pede mais serviço e você providencia o aditivo com os Correios.",
    flip: "Agora é uma área dos Correios pedindo mais serviço ao fornecedor.",
    correios: "Você pergunta: está no escopo? Cabe no limite de 25%? Há orçamento? A garantia acompanha? A justificativa está no processo?",
    check: { q: "A área pede mais 15% de horas de sustentação. Primeira conta a fazer?",
      options: [["Somar com acréscimos anteriores e comparar com o limite de 25% do valor inicial atualizado.", true], ["Calcular só os 15% novos.", false], ["Nenhuma — basta o fornecedor aceitar.", false]],
      fb: { faltou: "Faltou considerar acréscimos anteriores.", risco: "Aditivos sucessivos podem ultrapassar o limite legal sem ninguém notar.", melhor: "Manter histórico acumulado dos acréscimos e supressões em relação ao valor inicial atualizado." } } },
  { id: "f-fatura", title: "Faturamento", concepts: ["despesa", "recebimento"],
    know: "Você cobra o órgão pela fatura dos Correios e acompanha o pagamento.",
    flip: "Agora a fatura chega para os Correios pagarem.",
    correios: "Você garante: reserva orçamentária existe, entrega foi atestada, nota confere com a medição, glosas foram aplicadas — só então liquida e paga.",
    check: { q: "Quando você cobrava órgãos, o que mais atrasava o pagamento?",
      options: [["Falta de atesto ou divergência na nota — exatamente o que você vai conferir agora.", true], ["O humor do cliente.", false], ["O banco.", false]],
      fb: { faltou: "Faltou reconhecer o mesmo fluxo visto do outro lado.", risco: "Pagar com divergência gera pagamento indevido.", melhor: "Usar sua experiência de quem já cobrou: você sabe onde a documentação costuma falhar." } } },
  { id: "f-reclamacao", title: "Reclamação", concepts: ["penalidades", "fiscais"],
    know: "O órgão reclama da entrega dos Correios e você negocia uma solução.",
    flip: "Agora os Correios reclamam do fornecedor.",
    correios: "Você registra a ocorrência, notifica formalmente, dá prazo, acompanha a correção e, se preciso, instrui sanção com direito de defesa.",
    check: { q: "Qual é o primeiro passo formal diante de uma falha relevante do fornecedor?",
      options: [["Aplicar multa imediatamente.", false], ["Registrar a ocorrência e notificar o fornecedor formalmente, com prazo para correção ou manifestação.", true], ["Ligar e resolver de boca.", false]],
      fb: { faltou: "Faltou o rito: registro, notificação, prazo, defesa.", risco: "Sanção sem notificação e defesa é anulável.", melhor: "Registro com evidências → notificação → prazo → análise → decisão proporcional." } } },
  { id: "f-juridico", title: "Jurídico", concepts: ["tr", "modalidade"],
    know: "Você leva ao Jurídico dos Correios dúvidas sobre cláusulas pedidas pelo órgão.",
    flip: "Agora o Jurídico analisa minuta de edital e contrato de uma contratação dos Correios.",
    correios: "Você entrega um processo bem instruído: demanda, ETP, TR, pesquisa de preços, riscos, orçamento — e responde as diligências com rapidez.",
    check: { q: "O que mais acelera a análise jurídica?",
      options: [["Mandar só a minuta do contrato.", false], ["Processo completo e coerente: demanda, ETP, TR, preços e justificativas alinhados.", true], ["Ligar pedindo urgência.", false]],
      fb: { faltou: "Faltou ver o processo como um todo.", risco: "Peças incoerentes geram idas e vindas e atrasam a contratação.", melhor: "Checklist de instrução antes de enviar; documentos conversando entre si." } } },
  { id: "f-financeiro", title: "Financeiro", concepts: ["despesa", "reajuste"],
    know: "Você fala com o Financeiro sobre recebimentos de órgãos e reajustes negociados.",
    flip: "Agora você fala com o Financeiro sobre saldo, reserva e pagamento a fornecedores.",
    correios: "Você acompanha a execução orçamentária do contrato: quanto foi reservado, quanto foi pago, quanto sobra — e antecipa reforços para reajustes e aditivos.",
    check: { q: "O reajuste de 6% foi apostilado. O que o Financeiro precisa saber?",
      options: [["Nada, apostila é só papel.", false], ["O novo valor, a data de início e a necessidade de reforço na reserva orçamentária.", true], ["Só o nome do fornecedor.", false]],
      fb: { faltou: "Faltou ligar o ato formal ao efeito financeiro.", risco: "Faturas com novo valor sem saldo reservado travam pagamentos.", melhor: "Todo ato que muda valor dispara verificação e ajuste de saldo." } } },
  { id: "f-nuvem", title: "Tecnologia", concepts: ["cloud", "api"],
    know: "Você explica a órgãos serviços dos Correios que envolvem sistemas e integrações.",
    flip: "Agora você precisa entender o que o fornecedor de TI está vendendo aos Correios.",
    correios: "Você não precisa programar. Precisa saber perguntar: como se mede? como se paga? o que acontece se cair? como saímos?",
    check: { q: "Qual pergunta é mais útil para a gestão de um contrato de nuvem?",
      options: [["“Qual linguagem de programação vocês usam?”", false], ["“Como acompanhamos o consumo mensal e o que acontece quando ele se aproxima do valor estimado?”", true], ["“Vocês usam servidores bonitos?”", false]],
      fb: { faltou: "Faltou focar no que é gerenciável contratualmente.", risco: "Consumo sem controle estoura o valor do contrato e o orçamento.", melhor: "Perguntar sobre medição, alertas, relatórios, SLA e saída." } } },
  { id: "f-documentos", title: "Documentação", concepts: ["os", "recebimento"],
    know: "Você organiza contratos, aditivos e ofícios dos órgãos clientes.",
    flip: "Agora o dossiê é da contratação dos Correios — e ele conta a história inteira.",
    correios: "Demanda → ETP → TR → edital → contrato → OS → medições → recebimentos → pagamentos → aditivos → encerramento. Qualquer auditor precisa conseguir seguir o fio.",
    check: { q: "Um auditor pergunta: “por que vocês pagaram esta OS?”. O que precisa existir?",
      options: [["A nota fiscal.", false], ["A cadeia: OS emitida, entrega, medição, recebimento/atesto, nota e liquidação.", true], ["Um e-mail do fornecedor.", false]],
      fb: { faltou: "Faltou a rastreabilidade de ponta a ponta.", risco: "Pagamento sem cadeia documental é indefensável.", melhor: "Cada pagamento precisa apontar para a demanda, a entrega e o aceite que o sustentam." } } },
  { id: "f-negociacao", title: "Negociação", concepts: ["reajuste", "estimativa"],
    know: "Você negocia valores com órgãos, defendendo o preço dos Correios.",
    flip: "Agora o fornecedor defende o preço dele — e você defende o dinheiro dos Correios.",
    correios: "Antes de negociar, você tem estimativa de mercado, índice contratual, histórico de consumo e a prova que o fornecedor apresentou.",
    check: { q: "O fornecedor pede 18% de reajuste “porque os custos subiram”. Resposta?",
      options: [["Aceitar para manter a parceria.", false], ["Verificar o que o contrato prevê: índice e data-base para reajuste; para outro aumento, exigir comprovação de desequilíbrio.", true], ["Recusar sem análise.", false]],
      fb: { faltou: "Faltou identificar o instituto certo (reajuste x reequilíbrio).", risco: "Conceder aumento sem base contratual ou prova é pagamento indevido.", melhor: "Reajuste pelo índice previsto; reequilíbrio só com evento extraordinário comprovado." } } }
];
