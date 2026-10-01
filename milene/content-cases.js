/* CONTRACT CASES — simulações de decisão em estilo Teams/WhatsApp.
   Cada opção: s (2 = melhor, 1 = parcial, 0 = arriscada), e o feedback em três partes. */
window.MM = window.MM || {};

MM.PEOPLE = {
  carla:  { name: "Carla · Gerente de Logística", avatar: "🚚", color: "#E17055" },
  nando:  { name: "Nando · Fiscal técnico",       avatar: "🔧", color: "#0984E3" },
  tati:   { name: "Tati · Arquitetura de TI",     avatar: "🧩", color: "#F2A900" },
  re:     { name: "Rê · Financeiro",              avatar: "💰", color: "#00A884" },
  jura:   { name: "Jura · Jurídico",              avatar: "⚖️", color: "#6C5CE7" },
  prep:   { name: "Sr. Paulo · Preposto (fornecedor)", avatar: "🏢", color: "#636E72" },
  gestor: { name: "Marcos · Gestor do contrato",  avatar: "📋", color: "#D63384" }
};

MM.CASES = [
  {
    id: "c1", title: "O WMS vence em 60 dias", channel: "Teams · #contratos-tic", concepts: ["prorrogacao", "garantia", "despesa", "reajuste"],
    summary: "Contrato de sustentação do WMS vence em 60 dias. Todo mundo quer “só renovar”.",
    steps: [
      { msgs: [["gestor", "Milene, o contrato de sustentação do WMS vence daqui a 60 dias. Está no 3º ano. Dá pra renovar, né?"],
               ["carla", "Por favor! O fornecedor já conhece a operação. Trocar agora seria um caos."]],
        prompt: "Qual é o seu primeiro movimento?",
        options: [
          { t: "Pedir ao fornecedor que envie a minuta de aditivo para assinarmos logo.", s: 0,
            faltou: "Faltou verificar se a prorrogação ainda é vantajosa e permitida.", risco: "Prorrogar por inércia: preço acima do mercado, fornecedor com desempenho ruim, sem orçamento.", melhor: "Montar a checagem: limite de vigência, desempenho, vantajosidade, orçamento, habilitação, garantia e interesse das partes." },
          { t: "Montar checklist de prorrogação: limite de vigência, avaliação de desempenho, pesquisa de preços, orçamento, habilitação e garantia.", s: 2,
            melhor: "Isso. Prorrogar é uma decisão, não um reflexo. E 60 dias é pouco — o checklist precisa começar hoje." },
          { t: "Dizer que não dá para renovar, porque renovar é sempre arriscado.", s: 0,
            faltou: "Faltou analisar antes de concluir.", risco: "Descontinuar um serviço crítico sem alternativa pronta.", melhor: "Prorrogação é possível quando prevista, vantajosa e dentro dos limites. Analise com evidências." }
        ] },
      { msgs: [["nando", "Sobre desempenho: no último ano tivemos 4 meses com SLA abaixo da meta. Glosamos em todos."],
               ["re", "E a pesquisa de preços que a equipe fez mostra contratos parecidos até 12% mais baratos."]],
        prompt: "Com essas informações, o que você recomenda?",
        options: [
          { t: "Prorrogar do mesmo jeito; a Carla disse que trocar seria caos.", s: 0,
            faltou: "Faltou pesar desempenho e preço, que são requisitos da decisão.", risco: "Manter preço acima do mercado e serviço abaixo do contratado — difícil de justificar ao controle.", melhor: "Levar os dados ao gestor e avaliar negociação ou nova contratação." },
          { t: "Registrar os dados, levar ao gestor e propor negociação de preço com o fornecedor como condição para prorrogar — em paralelo, avaliar o prazo de uma nova contratação.", s: 2,
            melhor: "Excelente. Você usa a negociação que já domina, só que a favor dos Correios, e protege a continuidade com um plano B." },
          { t: "Aplicar uma multa antes de renovar, para mostrar força.", s: 0,
            faltou: "Faltou o rito: sanção exige base, processo e defesa — e não é moeda de negociação.", risco: "Sanção desproporcional e anulável.", melhor: "Separe: desempenho entra na decisão de prorrogar; sanção, se cabível, tem processo próprio." }
        ] },
      { msgs: [["prep", "Aceitamos reduzir 8% e melhorar o SLA. Mas o reajuste anual previsto no contrato também vence agora, certo?"],
               ["re", "E eu preciso saber quanto reservar para os próximos 12 meses."]],
        prompt: "Como você organiza os atos formais?",
        options: [
          { t: "Aditivo de prorrogação (com novo preço negociado e ajustes), assinado antes do vencimento; tratar o reajuste conforme o contrato e alinhar com o Financeiro a reserva e a renovação da garantia.", s: 2,
            melhor: "Perfeito: prazo por aditivo antes de vencer, dinheiro reservado, garantia acompanhando. E o reajuste avaliado à luz do que foi negociado." },
          { t: "Apostila para tudo, é mais rápido.", s: 0,
            faltou: "Faltou diferenciar o que muda o contrato (prazo, preço negociado) do que ele já previa.", risco: "Prorrogação sem aditivo não tem validade adequada.", melhor: "Prorrogação e mudanças negociadas vão por aditivo; apostila só para o que já estava previsto." },
          { t: "Aditivo de prorrogação só depois do vencimento, quando o Jurídico liberar.", s: 0,
            faltou: "Faltou o prazo: contrato vencido não se prorroga.", risco: "Contrato extinto e serviço crítico descoberto.", melhor: "Começar cedo e assinar antes do fim da vigência." }
        ] }
    ]
  },
  {
    id: "c2", title: "A API de rastreamento caiu (de novo)", channel: "WhatsApp · Fiscalização API", concepts: ["nms", "imr", "glosa", "penalidades", "api"],
    summary: "Disponibilidade medida: 98,7%. Contrato exige 99,5%. O fornecedor diz que cumpriu.",
    steps: [
      { msgs: [["nando", "Milene, fechamos o mês: nosso monitoramento deu 98,7% de disponibilidade da API. O contrato exige 99,5%."],
               ["prep", "Nosso relatório mostra 100%. As quedas foram manutenção programada."]],
        prompt: "O que você precisa verificar primeiro?",
        options: [
          { t: "O que o contrato define como manutenção programada (aviso prévio, janela) e se as quedas se encaixam — com as evidências do fiscal.", s: 2,
            melhor: "Isso. A disputa se resolve pelo texto do contrato e pelas evidências, não por quem fala mais alto." },
          { t: "Aceitar o relatório do fornecedor, que é o documento oficial.", s: 0,
            faltou: "Faltou validar a fonte do dado.", risco: "Pagar integralmente por serviço abaixo do nível.", melhor: "Conferir com o monitoramento dos Correios e com as regras de manutenção do contrato." },
          { t: "Usar o número do fiscal e ignorar a alegação do fornecedor.", s: 1,
            faltou: "Faltou analisar a alegação — ela pode ter fundamento parcial.", risco: "Glosa contestável se alguma manutenção foi legítima.", melhor: "Analisar cada evento contra a regra contratual e registrar a conclusão." }
        ] },
      { msgs: [["nando", "Só uma parada foi avisada, e fora da janela. As outras duas não tiveram aviso."],
               ["gestor", "Então aplicamos multa já?"]],
        prompt: "Qual é a resposta tecnicamente correta?",
        options: [
          { t: "Sim, multa imediata no valor máximo.", s: 0,
            faltou: "Faltou o processo e a proporcionalidade.", risco: "Sanção sem notificação e defesa prévia (10 dias úteis na Lei 13.303) é anulável.", melhor: "Glosa conforme IMR no pagamento; sanção, se cabível, via processo com defesa." },
          { t: "Aplicar a glosa prevista no IMR na medição do mês e, se o contrato prever e a gravidade justificar, abrir processo sancionador com notificação e defesa.", s: 2,
            melhor: "Exato: glosa corrige o pagamento; multa pune com rito próprio. Uma não substitui a outra." },
          { t: "Só conversar com o preposto e pedir que não se repita.", s: 1,
            faltou: "Faltou aplicar o que o contrato já prevê.", risco: "Pagar integralmente por serviço abaixo do SLA cria precedente.", melhor: "Conversar é bom, mas o IMR precisa ser aplicado e tudo registrado." }
        ] },
      { msgs: [["tati", "Isso já é o terceiro mês seguido. Acho que o problema é estrutural."]],
        prompt: "O que você propõe para além deste mês?",
        options: [
          { t: "Notificar formalmente pedindo plano de ação com prazos, acompanhar em reunião com ata e atualizar a análise de riscos do contrato.", s: 2,
            melhor: "Ótimo. Reincidência pede plano de correção formal e revisão de riscos — e alimenta futuras decisões de prorrogação." },
          { t: "Esperar o fim do contrato.", s: 0,
            faltou: "Faltou gestão ativa.", risco: "Meses de indisponibilidade afetando clientes e imagem.", melhor: "Exigir plano de ação, acompanhar e registrar." },
          { t: "Pedir à TI dos Correios que assuma a sustentação da API sem aviso ao fornecedor.", s: 0,
            faltou: "Faltou respeitar o contrato vigente.", risco: "Confusão de responsabilidades e perda de base para cobrar o fornecedor.", melhor: "Cobrar o fornecedor pelos instrumentos contratuais." }
        ] }
    ]
  },
  {
    id: "c3", title: "A TI quer mais 40% de licenças", channel: "Teams · Chat privado", concepts: ["limites", "aditivo", "etp", "despesa"],
    summary: "Novo projeto precisa de muito mais licenças do sistema atual. “É só aditivar”, dizem.",
    steps: [
      { msgs: [["tati", "Milene, o projeto novo vai precisar de 40% a mais de licenças do sistema. É só fazer um aditivo, né?"]],
        prompt: "Qual a sua primeira análise?",
        options: [
          { t: "Verificar o histórico de acréscimos e o limite de 25% do valor inicial atualizado.", s: 2,
            melhor: "Isso. 40% já ultrapassa o limite de acréscimo — e ainda precisa somar o que já foi aditivado." },
          { t: "Fazer o aditivo de 40%, já que o fornecedor aceita.", s: 0,
            faltou: "Faltou o limite legal.", risco: "Alteração acima do limite da Lei 13.303 (art. 81), sujeita a questionamento.", melhor: "Comparar com o limite acumulado de 25%." },
          { t: "Fazer dois aditivos de 20%.", s: 0,
            faltou: "Faltou lembrar que o limite é acumulado.", risco: "Fracionar para burlar limite é irregular.", melhor: "O limite considera o total de acréscimos sobre o valor inicial atualizado." }
        ] },
      { msgs: [["tati", "Hmm. Já tivemos um aditivo de 10% ano passado."]],
        prompt: "O que você recomenda?",
        options: [
          { t: "Aditivar os 15% que ainda cabem, se houver justificativa e orçamento, e iniciar o planejamento de nova contratação (demanda, ETP) para o restante.", s: 2,
            melhor: "Solução equilibrada: atende o imediato dentro da lei e trata o crescimento como nova necessidade planejada." },
          { t: "Dizer que não dá e encerrar a conversa.", s: 1,
            faltou: "Faltou oferecer caminho.", risco: "Projeto travado e área buscando atalhos.", melhor: "Mostrar o que cabe agora e o caminho para o restante." },
          { t: "Sugerir que o próprio fornecedor “empreste” as licenças até o fim do ano.", s: 0,
            faltou: "Faltou formalização.", risco: "Uso sem cobertura contratual e futura cobrança sem base.", melhor: "Nada se usa sem cobertura contratual." }
        ] },
      { msgs: [["re", "Para os 15%, preciso saber o valor e se entra ainda neste exercício."]],
        prompt: "O que você envia ao Financeiro?",
        options: [
          { t: "Valor do acréscimo, data prevista de início, impacto mensal e pedido de reforço da reserva orçamentária antes da assinatura.", s: 2,
            melhor: "Perfeito. Aditivo de valor sem reserva é pagamento travado no futuro." },
          { t: "Só a cópia do aditivo depois de assinado.", s: 0,
            faltou: "Faltou verificar disponibilidade antes de assumir a obrigação.", risco: "Obrigação assumida sem recurso reservado.", melhor: "Checar e reservar antes de assinar." },
          { t: "Nada; o Financeiro descobre na fatura.", s: 0,
            faltou: "Faltou comunicação.", risco: "Fatura sem saldo, atraso de pagamento, multa por atraso.", melhor: "Todo ato que muda valor dispara conversa com o Financeiro." }
        ] }
    ]
  },
  {
    id: "c4", title: "Nota fiscal sem atesto", channel: "WhatsApp · Contratos TIC", concepts: ["despesa", "recebimento", "os", "fiscais"],
    summary: "Fornecedor cobrando. Fiscal de férias. E um item na nota que ninguém pediu formalmente.",
    steps: [
      { msgs: [["prep", "Bom dia! A nota de agosto foi entregue há 20 dias e ainda não recebemos. Podem verificar?"],
               ["re", "Não paguei porque não tem atesto. O Nando está de férias."]],
        prompt: "Qual o encaminhamento?",
        options: [
          { t: "Pedir ao gestor que acione o fiscal substituto designado para conferir e atestar.", s: 2,
            melhor: "Isso. A gestão não pode parar por férias — por isso existe substituto." },
          { t: "Pedir ao Financeiro que pague sem atesto, para evitar atrito.", s: 0,
            faltou: "Faltou a liquidação.", risco: "Pagar sem comprovar a entrega.", melhor: "Garantir o atesto por quem tem competência." },
          { t: "Atestar você mesma, já que conhece o contrato.", s: 0,
            faltou: "Faltou competência formal para atestar.", risco: "Atesto por quem não é fiscal designado é irregular.", melhor: "Acionar o substituto designado; se não houver, pedir designação." }
        ] },
      { msgs: [["nando", "(substituto) Conferi. Tem um item de R$ 18 mil de “ajuste no TMS” que não tem OS. Pediram por e-mail."]],
        prompt: "E agora?",
        options: [
          { t: "Pagar o restante que está conforme e tratar o item sem OS à parte: verificar escopo, instruir com gestor e Jurídico se necessário.", s: 2,
            melhor: "Correto: não trave o que está certo, e não pague o que não tem cobertura antes de analisar." },
          { t: "Recusar a nota inteira.", s: 1,
            faltou: "Faltou separar o conforme do não conforme.", risco: "Atraso no pagamento de serviço correto, com possível atualização financeira.", melhor: "Pedir nota corrigida ou separar o item, conforme o procedimento." },
          { t: "Pagar tudo; o serviço foi feito.", s: 0,
            faltou: "Faltou verificar a cobertura contratual do item.", risco: "Pagamento de serviço sem demanda formal.", melhor: "Analisar escopo e regularizar antes de pagar." }
        ] },
      { msgs: [["gestor", "Como evitamos isso de novo?"]],
        prompt: "Sua proposta:",
        options: [
          { t: "Reforçar com áreas e fornecedor que toda demanda sai por OS, criar controle de OS x medição e revisar a lista de fiscais substitutos.", s: 2,
            melhor: "Isso é gestão: corrigir a causa, não só o sintoma." },
          { t: "Mandar um e-mail bravo para todo mundo.", s: 0,
            faltou: "Faltou solução estruturada.", risco: "O problema volta no mês seguinte.", melhor: "Processo, controle e responsáveis claros." },
          { t: "Proibir o fornecedor de ler e-mails.", s: 0,
            faltou: "Faltou realismo.", risco: "Comunicação travada.", melhor: "E-mail para comunicar, OS para demandar." }
        ] }
    ]
  },
  {
    id: "c5", title: "“Queremos o melhor TMS do mercado”", channel: "Teams · Reunião de planejamento", concepts: ["dfd", "etp", "tr", "estimativa", "riscos", "wmstms"],
    summary: "A logística quer um novo sistema de transporte. O pedido chegou em uma linha.",
    steps: [
      { msgs: [["carla", "Precisamos do melhor TMS do mercado. Aquele que a transportadora X usa. Pode abrir a contratação?"]],
        prompt: "Como você conduz?",
        options: [
          { t: "Pedir a demanda formal: problema atual, volumes, rotas, integrações, resultados esperados, prazo — sem citar marca.", s: 2,
            melhor: "Isso. Uma boa demanda é o alicerce do ETP." },
          { t: "Pedir três cotações do sistema da transportadora X.", s: 0,
            faltou: "Faltou separar necessidade e solução.", risco: "Direcionamento e pesquisa de preços viciada.", melhor: "Primeiro a necessidade; alternativas no ETP." },
          { t: "Abrir pregão imediatamente para “TMS”.", s: 0,
            faltou: "Faltou planejamento (ETP e TR).", risco: "Objeto mal definido, licitação fracassada ou contrato inútil.", melhor: "Demanda → ETP → TR → licitação." }
        ] },
      { msgs: [["tati", "Para o ETP: dá pra contratar SaaS, licença instalada aqui, ou evoluir nosso sistema atual."]],
        prompt: "O que o ETP precisa fazer com essas alternativas?",
        options: [
          { t: "Comparar custos totais (licença, implantação, integração, sustentação, saída), riscos e aderência, e justificar a escolha.", s: 2,
            melhor: "Exato — e custo total, não só o preço da licença." },
          { t: "Escolher o SaaS porque nuvem é moderno.", s: 0,
            faltou: "Faltou comparação objetiva.", risco: "Escolha sem justificativa técnica e econômica.", melhor: "Comparar alternativas com critérios e números." },
          { t: "Deixar para o fornecedor vencedor decidir.", s: 0,
            faltou: "Faltou entender que a solução se define antes da licitação.", risco: "Objeto indefinido e propostas incomparáveis.", melhor: "O ETP define; o TR detalha." }
        ] },
      { msgs: [["carla", "E queremos que entre em produção em novembro."]],
        prompt: "Que risco você registra?",
        options: [
          { t: "Go-live no pico de fim de ano: propor implantação em ondas, fora do pico, com período de estabilização e plano de contingência.", s: 2,
            melhor: "Você trouxe o conhecimento da operação dos Correios para o contrato. Isso é valor de analista." },
          { t: "Nenhum, novembro é ótimo.", s: 0,
            faltou: "Faltou conhecer a sazonalidade da operação.", risco: "Instabilidade no maior volume do ano.", melhor: "Registrar o risco e propor mitigação." },
          { t: "Multa alta se atrasar.", s: 1,
            faltou: "Faltou tratar a causa do risco.", risco: "Multa não resolve operação parada.", melhor: "Planejamento de implantação + sanção como instrumento, não como solução." }
        ] }
    ]
  },
  {
    id: "c6", title: "Nuvem: fatura acima do estimado", channel: "WhatsApp · FinOps", concepts: ["cloud", "despesa", "estimativa", "riscos"],
    summary: "Em junho, o contrato de nuvem já consumiu 80% do valor anual.",
    steps: [
      { msgs: [["re", "Milene, o contrato de nuvem já consumiu 80% do valor anual. Estamos em junho."]],
        prompt: "O que você faz primeiro?",
        options: [
          { t: "Pedir à TI e ao fornecedor o relatório de consumo por projeto/serviço para entender a causa.", s: 2,
            melhor: "Diagnóstico antes da solução. Sem saber o que consome, não dá para decidir." },
          { t: "Pedir aditivo de 25% imediatamente.", s: 1,
            faltou: "Faltou entender a causa.", risco: "Pagar mais por desperdício (recursos esquecidos, superdimensionados).", melhor: "Diagnosticar, otimizar e só então avaliar aditivo." },
          { t: "Mandar desligar tudo.", s: 0,
            faltou: "Faltou avaliar impacto no negócio.", risco: "Sistemas críticos fora do ar.", melhor: "Ações seletivas com base no relatório." }
        ] },
      { msgs: [["tati", "Achamos ambientes de teste ligados 24h e um banco superdimensionado. Dá pra economizar uns 30%."]],
        prompt: "Qual encaminhamento?",
        options: [
          { t: "Implementar as otimizações, recalcular a projeção até dezembro e, se ainda faltar, instruir aditivo dentro do limite, com reserva orçamentária.", s: 2,
            melhor: "Isso: otimizar, projetar, e só então ajustar contrato e orçamento com base em números." },
          { t: "Deixar como está; o fornecedor que resolva.", s: 0,
            faltou: "Faltou gestão ativa.", risco: "Saldo acabar e serviço ser interrompido.", melhor: "Agir com a TI e o Financeiro." },
          { t: "Glosar o fornecedor pelo consumo alto.", s: 0,
            faltou: "Faltou identificar de quem é a responsabilidade pelo consumo.", risco: "Glosa sem base: o consumo foi dos Correios.", melhor: "Glosa é para falha de serviço, não para consumo solicitado." }
        ] },
      { msgs: [["gestor", "Como evitamos a surpresa no ano que vem?"]],
        prompt: "Sua proposta:",
        options: [
          { t: "Alertas de consumo (ex.: 50%, 70%, 90%), etiquetas por projeto, relatório mensal na reunião de gestão e estimativa com memória de cálculo na próxima contratação.", s: 2,
            melhor: "Gestão financeira da nuvem (FinOps) + planejamento melhor = sem sustos." },
          { t: "Estimar o dobro no ano que vem, por segurança.", s: 1,
            faltou: "Faltou memória de cálculo.", risco: "Reserva inflada e estimativa indefensável.", melhor: "Estimativa baseada em histórico e projeção justificada." },
          { t: "Voltar a comprar servidores.", s: 0,
            faltou: "Faltou analisar o problema real (gestão do consumo).", risco: "Decisão estrutural por um problema de controle.", melhor: "Controle antes de trocar de modelo." }
        ] }
    ]
  }
];
