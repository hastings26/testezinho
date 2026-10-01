/* Personagens (ilustrações da Milene), vídeos de apoio e jogos.
   Para adicionar uma ilustração: coloque o arquivo em img/ e acrescente o nome aqui. */
window.MM = window.MM || {};

MM.AVATARS = {
  estudando:   { src: "img/estudando.webp",   alt: "Milene estudando no notebook" },
  pensando:    { src: "img/pensando.webp",    alt: "Milene pensando, com a mão no queixo" },
  comemorando: { src: "img/comemorando.webp", alt: "Milene comemorando com os braços para cima" },
  pronta:      { src: "img/pronta.webp",      alt: "Milene segurando um tablet, pronta para começar" },
  torcida:     { src: "img/torcida.webp",     alt: "Milene abraçada com quem torce por ela" }
};

/* Em qual tela cada ilustração aparece. Troque o nome para trocar a imagem. */
MM.AVATAR_FOR = {
  home: "estudando", missao: "pronta", flip: "pensando", gossip: "estudando", casos: "pronta",
  tic: "estudando", arena: "pensando", fracos: "pensando", leitura: "estudando", jogos: "comemorando",
  revisao: "pensando", acerto: "comemorando", erro: "pensando", fim: "torcida", vitoria: "comemorando"
};

/* Vídeos: buscas no YouTube em português (sempre atualizadas, sem link quebrado). */
MM.VIDEOS = {
  dfd: ["documento de formalização da demanda contratação pública", "planejamento da contratação fase preparatória"],
  pca: ["plano de contratações anual PCA explicado", "PDTIC plano diretor de tecnologia da informação"],
  etp: ["estudo técnico preliminar ETP como fazer", "ETP contratação de TIC"],
  tr: ["termo de referência como elaborar", "termo de referência contratação de TI"],
  estimativa: ["pesquisa de preços contratação pública", "orçamento sigiloso lei 13.303 estatais"],
  riscos: ["matriz de riscos contratos administrativos", "gestão de riscos na contratação pública"],
  nms: ["SLA acordo de nível de serviço explicado", "níveis mínimos de serviço contrato de TI"],
  imr: ["instrumento de medição de resultado IMR", "pagamento por resultado contratos de TI TCU"],
  modalidade: ["lei 13.303 licitações estatais explicada", "dispensa e inexigibilidade de licitação diferença"],
  garantia: ["garantia contratual seguro garantia contratos públicos", "garantia contratual lei 13.303"],
  fiscais: ["gestor e fiscal de contrato papéis", "fiscalização de contratos administrativos na prática"],
  os: ["ordem de serviço contrato de TI", "reunião inicial gestão de contratos"],
  recebimento: ["recebimento provisório e definitivo contratos", "atesto de nota fiscal fiscal de contrato"],
  glosa: ["glosa em contratos administrativos", "diferença entre glosa e multa contrato"],
  despesa: ["empenho liquidação e pagamento explicado", "estágios da despesa pública"],
  aditivo: ["termo aditivo e apostilamento diferença", "apostilamento contrato administrativo"],
  limites: ["limite de 25% aditivo contrato", "acréscimos e supressões contratos estatais"],
  reajuste: ["reajuste repactuação e reequilíbrio econômico financeiro", "reequilíbrio econômico financeiro contrato"],
  prorrogacao: ["prorrogação de contrato de serviço contínuo", "vigência de contratos lei 13.303"],
  penalidades: ["sanções administrativas contratos lei 13.303", "processo administrativo sancionador contrato defesa prévia"],
  lgpd: ["LGPD em contratos com fornecedores", "controlador e operador LGPD explicado"],
  transicao: ["vendor lock-in explicado", "transição contratual contrato de TI"],
  cloud: ["IaaS PaaS SaaS explicado em português", "computação em nuvem para iniciantes"],
  api: ["o que é API explicação simples", "API para leigos"],
  wmstms: ["o que é WMS sistema de gerenciamento de armazém", "o que é TMS sistema de gestão de transporte"],
  metricas: ["pontos de função explicado", "UST unidade de serviço técnico contratos de TI"]
};
MM.ytUrl = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

/* Data da entrevista (AAAA-MM-DD). Se ficar null, ela mesma define na tela inicial. */
MM.EXAM_DATE = null;

/* Recado do Alex (aparece na tela inicial e no certificado). */
MM.LETTER = {
  from: "Alex",
  title: "Um recado pra você",
  paragraphs: [
    "Milene,",
    "Antes de qualquer prova, eu quero que você saiba de uma coisa: eu tenho muito orgulho de você. Orgulho da profissional que você se tornou, de tudo o que construiu com esforço, cuidado e coragem, e da mulher incrível que você é todos os dias.",
    "Este app é só um caminho. O conhecimento você já tem; o resto é organizar, praticar e confiar em você. Vá no seu ritmo, erre sem medo e volte quantas vezes quiser.",
    "Onde quer que essa seleção te leve, você já chegou muito longe. E eu vou estar aqui, torcendo e comemorando cada passo com você."
  ],
  sign: "Com todo o meu carinho e orgulho,"
};

/* Errata dos áudios do podcast (gerados por IA a partir dos roteiros e revisados).
   Aparece dentro do player de cada episódio. Vale sempre o que está no app. */
MM.ERRATA = {
  ep1: [
    "A “Milene” do áudio é personagem: o áudio inventa que ela trabalhou para fornecedores explorando brechas de contrato. Na vida real, você conhece contratos do lado de quem presta o serviço (Correios para órgãos públicos), e é isso que vira vantagem no cargo.",
    "O exemplo de pagar 40% na entrega e 60% depois é ilustração, não regra. A forma de pagamento é a que o TR e o contrato definem, sempre depois de medição e recebimento.",
    "Glosa não é multa: glosa ajusta o pagamento ao que foi entregue (IMR); multa é sanção, com processo e defesa prévia."
  ],
  ep2: [
    "A “Milene” do áudio é personagem e o passado dela é inventado (inclusive a ideia de “inventar desculpas”). Na vida real, explicar indicadores a clientes é gestão de contrato, e é justamente o que te faz entender o outro lado.",
    "O áudio chama o IMR de “penalidade”. Glosa não é penalidade: é ajuste do pagamento ao serviço entregue. Penalidade é a multa, com processo e defesa prévia de 10 dias úteis (Lei 13.303, art. 83).",
    "Aviso de 72h e manutenção só de madrugada não são “regras da indústria”: valem só se estiverem escritas no contrato.",
    "Detalhe de cálculo: de 99,5% para 98,7% a diferença é de 0,8 ponto percentual."
  ],
  ep3: [
    "ERRO IMPORTANTE: o áudio diz que a empresa pode suprimir até 25% de forma unilateral. Nos Correios (Lei 13.303, art. 72), toda alteração é por acordo entre as partes. Alteração unilateral é regra da Lei 14.133, não das estatais.",
    "O limite de 25% (50% para acréscimos em reforma) é acumulado sobre o valor inicial atualizado (art. 81).",
    "Contrato vencido não gera “licitação de emergência”: a saída seria nova contratação, e dispensa emergencial causada por falha de gestão é questionada pelo controle. Por isso o aditivo de prorrogação é assinado antes do fim da vigência.",
    "Na Lei 13.303 o limite é de até 5 anos, com exceções (art. 71). O contrato não precisa ser de 12 em 12 meses; prorrogar exige aditivo e vantajosidade."
  ],
  ep4: [
    "Liquidar consumo de nuvem não é “impossível”: confere-se o relatório de consumo contra os preços do contrato e o monitoramento próprio, com nota fiscal e atesto.",
    "Se a reserva (empenho) acaba, não é só “o fornecedor tem direito de cobrar”: serviço sem empenho é irregular. É preciso reforço de empenho e, se o valor do contrato estourar, aditivo dentro dos 25%. Por isso: teto e alertas de consumo."
  ],
  ep5: [
    "ERRO IMPORTANTE: a garantia contratual não é “sequestrar 5% do dinheiro do projeto”. Quem presta a garantia é o fornecedor (caução, seguro-garantia ou fiança, à escolha dele), em até 5% do valor, ou até 10% em grande vulto e alta complexidade (Lei 13.303, art. 70).",
    "O dever de fazer a transição vem do contrato, do TR e do plano de transição. Se não estiver escrito, é difícil exigir. A parte de LGPD está certa: Correios controlador, fornecedor operador, devolução e eliminação dos dados com comprovação."
  ],
  ep6: [
    "ERRO IMPORTANTE: o áudio sugere criar a ordem de serviço “retroativamente”. Não se faz isso: OS retroativa é irregular. O caminho é regularizar formalmente, com análise do Jurídico, e apurar responsabilidade.",
    "Serviço feito fora do contrato não se resolve com “enriquecimento ilícito”, que é termo de improbidade. O correto é a vedação ao enriquecimento sem causa: o pagamento passa por processo de indenização (reconhecimento de dívida).",
    "Recebimento provisório não é “contar caixas na recepção”: é feito pela fiscalização e registra a entrega para verificação. O definitivo confirma a conformidade, e vícios ocultos continuam sendo responsabilidade do fornecedor.",
    "Pendência trabalhista não trava todo o pagamento de forma automática. O caminho é notificação, prazo para regularizar e, se for o caso, sanção ou rescisão. Retenção de verbas é típica de contratos com mão de obra dedicada."
  ]
};
