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
