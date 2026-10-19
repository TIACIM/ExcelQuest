export type Lesson = {
  id: number;
  module: number;
  level: 'Básico' | 'Intermediário' | 'Avançado';
  title: string;
  shortTitle: string;
  goal: string;
  theory: string;
  formula: string;
  example: string;
  result: string;
  steps: string[];
  question: string;
  options: string[];
  answer: number;
  feedback: string;
  kind: 'formula' | 'tool' | 'project';
};

const lesson = (
  id: number,
  module: number,
  level: Lesson['level'],
  title: string,
  goal: string,
  theory: string,
  formula: string,
  example: string,
  result: string,
  question: string,
  options: string[],
  answer: number,
  feedback: string,
  kind: Lesson['kind'] = 'formula',
): Lesson => ({
  id,
  module,
  level,
  title,
  shortTitle: title.replace(/^Função /, '').replace(/^Como /, ''),
  goal,
  theory,
  formula,
  example,
  result,
  steps: [
    'Observe os dados da tabela e selecione a célula do resultado.',
    formula ? `Digite ${formula} na barra de fórmulas.` : 'Abra a ferramenta indicada e escolha a opção correta.',
    `Confira o resultado esperado: ${result}.`,
  ],
  question,
  options,
  answer,
  feedback,
  kind,
});

export const modules = [
  { id: 1, title: 'Fundamentos', subtitle: 'Comece com confiança', color: '#19b77f', icon: '⌘' },
  { id: 2, title: 'Primeiras fórmulas', subtitle: 'Faça o Excel calcular', color: '#3e83f8', icon: 'ƒx' },
  { id: 3, title: 'Funções essenciais', subtitle: 'Tome decisões com dados', color: '#7358e7', icon: '∑' },
  { id: 4, title: 'Textos e datas', subtitle: 'Limpe e organize informações', color: '#e4743d', icon: 'Aa' },
  { id: 5, title: 'Análise de dados', subtitle: 'Encontre o que importa', color: '#d59b18', icon: '◫' },
  { id: 6, title: 'Pesquisa avançada', subtitle: 'Conecte suas tabelas', color: '#ce4f74', icon: '↔' },
  { id: 7, title: 'Relatórios e produtividade', subtitle: 'Transforme dados em decisões', color: '#1686a2', icon: '▦' },
] as const;

export const lessons: Lesson[] = [
  lesson(1, 1, 'Básico', 'Conhecendo a interface do Excel', 'Reconhecer os principais elementos da janela do Excel.', 'A faixa de opções reúne comandos; a barra de fórmulas mostra o conteúdo da célula ativa. A planilha é a área de trabalho.', '', 'Clique na caixa de nome para ver a referência A1.', 'A1', 'Onde você vê ou edita o conteúdo da célula selecionada?', ['Barra de status', 'Barra de fórmulas', 'Faixa de opções'], 1, 'A barra de fórmulas mostra e permite editar o valor ou a fórmula da célula.', 'tool'),
  lesson(2, 1, 'Básico', 'Células, linhas, colunas e planilhas', 'Localizar referências e navegar por uma planilha.', 'Uma célula é o encontro entre coluna e linha. A referência B7 aponta para a coluna B, linha 7.', '', 'A coluna C e a linha 4 se cruzam em C4.', 'C4', 'Qual referência indica coluna D e linha 12?', ['12D', 'D12', 'D:12'], 1, 'As referências sempre usam a letra da coluna antes do número da linha.', 'tool'),
  lesson(3, 1, 'Básico', 'Inserção e edição de dados', 'Inserir textos, números e datas sem misturar os tipos.', 'Digite na célula e pressione Enter para confirmar. Números devem ser armazenados como números para poderem ser calculados.', '', 'Digite 1250 em B2 e pressione Enter.', '1250', 'Qual ação confirma a edição de uma célula?', ['Enter', 'Esc', 'Tab apenas'], 0, 'Enter confirma a edição e move a seleção para a célula abaixo.', 'tool'),
  lesson(4, 1, 'Básico', 'Formatação de células e números', 'Aplicar formatos que tornam os dados legíveis.', 'Formatação muda a aparência, não o valor armazenado. Moeda, porcentagem e data devem ser escolhidos de acordo com o significado do dado.', '', 'Formate 0,25 como Porcentagem: 25%.', '25%', 'O formato Moeda altera 150 para qual valor armazenado?', ['150', 'R$ 150,00', '1,5'], 0, 'O valor continua 150; apenas a apresentação muda.', 'tool'),
  lesson(5, 1, 'Básico', 'Salvamento, organização e atalhos essenciais', 'Salvar arquivos e usar atalhos que aceleram tarefas.', 'Use Ctrl+S para salvar. Dê nomes claros às planilhas e mantenha títulos na primeira linha da tabela.', '', 'Use Ctrl+S após renomear a aba para Vendas.', 'Arquivo salvo', 'Qual atalho salva a pasta de trabalho?', ['Ctrl+S', 'Ctrl+F', 'Ctrl+P'], 0, 'Ctrl+S salva as alterações na pasta de trabalho.', 'tool'),

  lesson(6, 2, 'Básico', 'Como criar uma fórmula', 'Criar uma fórmula e entender o sinal de igual.', 'Toda fórmula começa com =. O Excel calcula a expressão e mostra o resultado na célula.', '=B2+C2', 'B2 contém 8 e C2 contém 2.', '10', 'Qual é o primeiro caractere de uma fórmula?', ['#', '=', '+'], 1, 'O sinal = informa ao Excel que o conteúdo deve ser calculado.'),
  lesson(7, 2, 'Básico', 'Operações matemáticas básicas', 'Usar adição, subtração, multiplicação e divisão.', 'Os operadores são +, -, * e /. Use parênteses para definir a ordem de cálculo quando necessário.', '=B2*C2', 'Preço 12 em B2 e quantidade 4 em C2.', '48', 'Qual operador multiplica dois valores?', ['x', '*', '/'], 1, 'No Excel, o asterisco (*) representa multiplicação.'),
  lesson(8, 2, 'Básico', 'Referências relativas e absolutas', 'Fixar uma célula ao copiar fórmulas.', 'B2 muda ao copiar a fórmula. $B$2 permanece fixa. Referências mistas fixam apenas coluna ou linha.', '=C2*$F$1', 'C2 é 100 e F1 contém a alíquota fixa 0,1.', '10', 'Qual referência fica totalmente fixa ao copiar?', ['$B$2', 'B2', 'B$'], 0, 'Os dois cifrões fixam coluna e linha.'),
  lesson(9, 2, 'Básico', 'Funções SOMA e MÉDIA', 'Somar e calcular a média de um intervalo.', 'SOMA reúne valores; MÉDIA divide a soma pela quantidade de números. Use intervalos com dois-pontos.', '=SOMA(B2:B5)', 'B2:B5 contém 10, 12, 8 e 20.', '50', 'Qual fórmula calcula a média de B2 até B5?', ['=MÉDIA(B2:B5)', '=SOMA(B2:B5)', '=MÉDIA(B2;B5)'], 0, 'MÉDIA aplicada ao intervalo considera todos os valores entre as células.'),
  lesson(10, 2, 'Básico', 'Funções MÁXIMO, MÍNIMO e CONT.NÚM', 'Encontrar extremos e contar números.', 'MÁXIMO encontra o maior valor, MÍNIMO o menor, e CONT.NÚM ignora textos e células vazias.', '=MÁXIMO(B2:B5)', 'B2:B5 contém 10, 12, 8 e 20.', '20', 'Qual função conta somente células numéricas?', ['CONT.NÚM', 'CONT.SE', 'SOMA'], 0, 'CONT.NÚM conta valores numéricos e ignora textos.'),

  lesson(11, 3, 'Intermediário', 'Função SE', 'Tomar uma decisão a partir de uma condição.', 'SE testa algo e retorna um resultado para verdadeiro e outro para falso.', '=SE(B2>=7;"Aprovado";"Revisar")', 'B2 contém a nota 8.', 'Aprovado', 'Em SE, o primeiro argumento é:', ['O teste lógico', 'A mensagem final', 'O intervalo'], 0, 'O primeiro argumento define a condição que será avaliada.'),
  lesson(12, 3, 'Intermediário', 'Funções E e OU', 'Combinar mais de uma condição.', 'E só retorna VERDADEIRO quando todas as condições são verdadeiras. OU retorna VERDADEIRO quando pelo menos uma é verdadeira.', '=E(B2>=7;C2>=75%)', 'Nota 8 em B2 e frequência 80% em C2.', 'VERDADEIRO', 'Quando OU retorna VERDADEIRO?', ['Quando ao menos uma condição é verdadeira', 'Somente quando todas são verdadeiras', 'Quando todas são falsas'], 0, 'OU aceita qualquer condição verdadeira.'),
  lesson(13, 3, 'Intermediário', 'Funções CONT.SE e CONT.SES', 'Contar registros que obedecem a critérios.', 'CONT.SE usa um critério; CONT.SES usa vários pares intervalo/critério.', '=CONT.SE(C2:C8;"Pago")', 'C2:C8 possui três registros com o texto Pago.', '3', 'Qual função conta usando mais de um critério?', ['CONT.SES', 'CONT.NÚM', 'MÉDIASE'], 0, 'CONT.SES foi feita para combinar vários critérios.'),
  lesson(14, 3, 'Intermediário', 'Funções SOMASE e SOMASES', 'Somar apenas valores que atendam a regras.', 'SOMASE soma com um critério. SOMASES permite vários critérios, com o intervalo de soma primeiro.', '=SOMASE(B2:B6;"Sul";C2:C6)', 'Some as vendas de C2:C6 quando a região em B2:B6 for Sul.', 'R$ 3.200', 'Na SOMASES, qual intervalo vem primeiro?', ['Intervalo de soma', 'Critério', 'Intervalo de critério'], 0, 'A sintaxe começa pelo intervalo que será somado.'),
  lesson(15, 3, 'Intermediário', 'Funções MÉDIASE e MÉDIASES', 'Calcular médias filtradas por critérios.', 'MÉDIASE calcula uma média com um critério; MÉDIASES permite critérios adicionais.', '=MÉDIASE(B2:B6;"Equipe A";C2:C6)', 'A média das notas da Equipe A é calculada a partir de C2:C6.', '8,5', 'Qual função retorna uma média respeitando critérios?', ['MÉDIASE', 'SOMASE', 'CONT.SE'], 0, 'MÉDIASE combina uma condição e uma média.'),

  lesson(16, 4, 'Intermediário', 'Funções ESQUERDA, DIREITA e EXT.TEXTO', 'Extrair partes de um texto.', 'ESQUERDA e DIREITA retiram caracteres das pontas. EXT.TEXTO começa em uma posição e retorna uma quantidade definida.', '=ESQUERDA(B2;3)', 'B2 contém o código PED-1048.', 'PED', 'Qual função extrai caracteres a partir do meio de um texto?', ['EXT.TEXTO', 'DIREITA', 'ARRUMAR'], 0, 'EXT.TEXTO recebe o texto, a posição inicial e o número de caracteres.'),
  lesson(17, 4, 'Intermediário', 'Funções CONCAT e TEXTO.JUNTAR', 'Unir textos preservando a leitura.', 'CONCAT junta trechos. TEXTO.JUNTAR adiciona um delimitador, como espaço ou vírgula, entre os itens.', '=CONCAT(B2;" - ";C2)', 'B2 é Ana e C2 é Vendas.', 'Ana - Vendas', 'Qual função permite escolher um delimitador entre textos?', ['TEXTO.JUNTAR', 'ESQUERDA', 'SUBSTITUIR'], 0, 'TEXTO.JUNTAR aceita o delimitador como primeiro argumento.'),
  lesson(18, 4, 'Intermediário', 'Funções ARRUMAR e SUBSTITUIR', 'Corrigir espaços e trocar partes de textos.', 'ARRUMAR remove espaços extras. SUBSTITUIR troca uma parte conhecida por outra.', '=ARRUMAR(B2)', 'B2 contém "  Maria   Silva ".', 'Maria Silva', 'Qual função remove espaços duplicados?', ['ARRUMAR', 'CONCAT', 'DIREITA'], 0, 'ARRUMAR mantém apenas um espaço entre palavras e remove os excessos.'),
  lesson(19, 4, 'Intermediário', 'Datas, dias e intervalos entre datas', 'Calcular períodos usando datas reais.', 'Datas são números formatados. Subtrair uma data da outra retorna dias; DIAS também calcula essa diferença.', '=C2-B2', 'Início em B2: 01/03/2026; fim em C2: 11/03/2026.', '10', 'Qual resultado você obtém ao subtrair duas datas?', ['Quantidade de dias', 'Texto da data', 'Hora atual'], 0, 'O Excel armazena datas de modo que a subtração calcule dias.'),
  lesson(20, 4, 'Intermediário', 'Funções HOJE e AGORA', 'Inserir data e hora atuais de forma dinâmica.', 'HOJE retorna a data atual; AGORA retorna data e hora atuais. Ambas se atualizam no recálculo.', '=HOJE()', 'Use em B2 para acompanhar a data do relatório.', 'Data de hoje', 'Qual função retorna também a hora?', ['AGORA()', 'HOJE()', 'DATA()'], 0, 'AGORA inclui a data e o horário do momento.'),

  lesson(21, 5, 'Intermediário', 'Classificação e filtros', 'Ordenar e exibir apenas registros relevantes.', 'Classificar altera a ordem. Filtros escondem temporariamente linhas que não atendem ao critério.', '', 'Filtre a coluna Status para mostrar somente Pendente.', 'Registros pendentes', 'O filtro exclui dados da planilha?', ['Não, apenas oculta temporariamente', 'Sim, apaga as linhas', 'Somente em tabelas'], 0, 'Filtros preservam os dados; você pode limpar o filtro a qualquer momento.', 'tool'),
  lesson(22, 5, 'Intermediário', 'Formatação condicional', 'Destacar padrões sem editar valores.', 'A formatação condicional aplica estilo conforme uma regra: maiores valores, textos específicos, escalas de cor ou fórmulas.', '', 'Destaque em vermelho valores menores que 7.', 'Notas em risco destacadas', 'A formatação condicional altera o valor da célula?', ['Não', 'Sim, sempre', 'Apenas números'], 0, 'Ela muda apenas o visual quando a condição é atendida.', 'tool'),
  lesson(23, 5, 'Intermediário', 'Tabelas estruturadas', 'Transformar um intervalo em uma tabela confiável.', 'Tabelas criam filtros, estilos e referências estruturadas que crescem junto com os dados.', '', 'Selecione A1:D10 e use Ctrl+T para criar uma tabela.', 'Tabela criada', 'Qual atalho cria uma tabela no Excel?', ['Ctrl+T', 'Ctrl+L', 'Ctrl+Shift+T'], 0, 'Ctrl+T abre a criação de tabela para o intervalo selecionado.', 'tool'),
  lesson(24, 5, 'Intermediário', 'Validação de dados e listas suspensas', 'Padronizar o que pode ser digitado em uma célula.', 'A validação restringe entradas e pode oferecer uma lista suspensa. É ideal para status, equipes e categorias.', '', 'Crie uma lista com Aberto, Em andamento e Concluído.', 'Lista disponível', 'Qual recurso evita que alguém digite um status inválido?', ['Validação de dados', 'Formatação condicional', 'Classificar'], 0, 'A validação controla as entradas aceitas pela célula.', 'tool'),
  lesson(25, 5, 'Intermediário', 'Remoção de duplicatas e tratamento de dados', 'Encontrar e remover registros repetidos com segurança.', 'Antes de remover duplicatas, copie ou salve uma versão. A ferramenta compara as colunas escolhidas para identificar repetições.', '', 'Escolha a coluna E-mail ao remover contatos repetidos.', 'Contatos únicos', 'Antes de remover duplicatas, o mais seguro é:', ['Guardar uma cópia', 'Apagar a tabela', 'Converter tudo em texto'], 0, 'Uma cópia permite conferir e recuperar registros se necessário.', 'tool'),

  lesson(26, 6, 'Avançado', 'PROCV e suas limitações', 'Buscar um valor em uma tabela vertical.', 'PROCV procura na primeira coluna da matriz e retorna outra coluna à direita. Para correspondência exata, use FALSO.', '=PROCV(E2;A2:C10;3;FALSO)', 'E2 contém P-102 e a tabela tem preço na terceira coluna.', 'Preço correspondente', 'Qual limitação importante do PROCV?', ['Só busca da esquerda para a direita', 'Não aceita texto', 'Não funciona em tabelas'], 0, 'Como a chave precisa estar na primeira coluna, ele não retorna dados à esquerda.'),
  lesson(27, 6, 'Avançado', 'PROCX e alternativas para versões antigas', 'Fazer buscas mais flexíveis.', 'PROCX separa matriz de procura e matriz de retorno, busca em ambas as direções e permite mensagem para não encontrado.', '=PROCX(E2;A2:A10;C2:C10;"Não encontrado")', 'Procure P-102 em A2:A10 e retorne o preço de C2:C10.', 'Preço correspondente', 'Qual função é alternativa clássica para buscas flexíveis em versões antigas?', ['ÍNDICE + CORRESP', 'ARRUMAR + SOMA', 'CONT.SE + MÉDIA'], 0, 'ÍNDICE e CORRESP funcionam em muitas versões antigas do Excel.'),
  lesson(28, 6, 'Avançado', 'ÍNDICE e CORRESP', 'Combinar posição e retorno sem as restrições do PROCV.', 'CORRESP descobre a posição; ÍNDICE retorna o item daquela posição em outro intervalo.', '=ÍNDICE(C2:C10;CORRESP(E2;A2:A10;0))', 'E2 contém P-102; o código está em A e o preço em C.', 'Preço correspondente', 'O que CORRESP devolve?', ['A posição encontrada', 'O valor final', 'Uma cor'], 0, 'CORRESP retorna a posição relativa do item dentro do intervalo.'),
  lesson(29, 6, 'Avançado', 'Funções SEERRO e tratamento de erros', 'Substituir erros técnicos por mensagens úteis.', 'SEERRO retorna o segundo argumento quando o primeiro gera erro. Use-o sem esconder problemas de dados importantes.', '=SEERRO(A2/B2;"Sem divisor")', 'A2 é 10 e B2 é 0.', 'Sem divisor', 'O que SEERRO faz quando a expressão está correta?', ['Retorna o resultado normal', 'Sempre mostra a mensagem', 'Apaga a fórmula'], 0, 'A mensagem alternativa só aparece quando há um erro.'),
  lesson(30, 6, 'Avançado', 'Funções dinâmicas: FILTRO e ÚNICO', 'Criar resultados que se expandem automaticamente.', 'FILTRO devolve linhas que obedecem a um critério. ÚNICO remove repetições. São recursos do Microsoft 365 e versões recentes.', '=ÚNICO(B2:B10)', 'B2:B10 tem categorias repetidas.', 'Lista sem repetição', 'Em qual versão essas funções podem não estar disponíveis?', ['Excel antigo sem matrizes dinâmicas', 'Excel para Web atual', 'Microsoft 365'], 0, 'FILTRO e ÚNICO dependem do suporte a matrizes dinâmicas.'),

  lesson(31, 7, 'Avançado', 'Criação de gráficos', 'Escolher um gráfico coerente com a pergunta.', 'Colunas comparam categorias, linhas mostram evolução no tempo e pizza funciona apenas para poucas partes de um todo.', '', 'Use colunas para comparar vendas por região.', 'Comparação visual', 'Qual gráfico costuma mostrar uma tendência ao longo do tempo?', ['Linha', 'Pizza', 'Rosca'], 0, 'Gráficos de linha evidenciam a evolução entre períodos.', 'tool'),
  lesson(32, 7, 'Avançado', 'Tabelas dinâmicas', 'Resumir milhares de linhas sem fórmulas repetidas.', 'Uma tabela dinâmica arrasta campos para Linhas, Colunas, Valores e Filtros. Atualize-a quando a base mudar.', '', 'Arraste Região para Linhas e Receita para Valores.', 'Receita por região', 'Onde um campo numérico é normalmente resumido?', ['Valores', 'Linhas', 'Filtros'], 0, 'A área Valores soma, conta ou calcula média dos campos numéricos.', 'tool'),
  lesson(33, 7, 'Avançado', 'Segmentação de dados', 'Filtrar relatórios com controles visuais.', 'Segmentações são botões de filtro para tabelas e tabelas dinâmicas. Elas facilitam explorar períodos, regiões e categorias.', '', 'Adicione uma segmentação para Região.', 'Filtro visual por região', 'A segmentação serve principalmente para:', ['Filtrar visualmente', 'Criar fórmulas', 'Corrigir erros'], 0, 'Ela conecta filtros a uma experiência mais direta de clique.', 'tool'),
  lesson(34, 7, 'Avançado', 'Introdução ao Power Query', 'Importar e transformar dados de modo reproduzível.', 'Power Query registra etapas de limpeza: trocar tipos, remover colunas, dividir textos e combinar fontes. Depois, basta atualizar.', '', 'Importe um CSV e altere a coluna Data para o tipo Data.', 'Consulta pronta para atualizar', 'Qual vantagem central do Power Query?', ['Repetir transformações com atualização', 'Substituir todos os gráficos', 'Editar apenas uma célula'], 0, 'As etapas ficam registradas e podem ser aplicadas novamente aos novos dados.', 'tool'),
  lesson(35, 7, 'Avançado', 'Projeto prático: relatório gerencial', 'Construir um relatório que responde perguntas de negócio.', 'Organize uma base limpa, crie indicadores, uma tabela dinâmica e gráficos. Use filtros para tornar o relatório explorável.', '=SOMA(Receita)-SOMA(Custos)', 'Com receita de R$ 12.000 e custos de R$ 7.500.', 'R$ 4.500 de resultado', 'Qual deve ser o primeiro passo antes de montar o painel?', ['Validar e organizar a base', 'Escolher as cores', 'Inserir animações'], 0, 'Relatórios confiáveis dependem de uma base organizada e consistente.', 'project'),
];

export const simulatorHelp = [
  'Operadores: +, -, * e /; parênteses.',
  'Funções disponíveis: SOMA, MÉDIA, MÁXIMO, MÍNIMO, CONT.NÚM, SE, E, OU, CONT.SE, SOMASE, ESQUERDA, DIREITA, CONCAT, ARRUMAR, SUBSTITUIR, HOJE e AGORA.',
  'Use ; como separador de argumentos. Funções não suportadas aparecem como atividade de montagem de fórmula nas aulas.',
];

export type ModuleAssessment = {
  module: number;
  title: string;
  questions: { question: string; options: string[]; answer: number; explanation: string }[];
};

export const moduleAssessments: ModuleAssessment[] = [
  {
    module: 1, title: 'Fundamentos da planilha',
    questions: [
      { question: 'Onde uma coluna e uma linha se encontram?', options: ['Em uma célula', 'Em uma faixa de opções', 'Em uma pasta'], answer: 0, explanation: 'A célula é a unidade básica de uma planilha, identificada por coluna e linha.' },
      { question: 'O que o formato Moeda altera?', options: ['A aparência do valor', 'O valor calculado', 'O nome da planilha'], answer: 0, explanation: 'A formatação altera a apresentação, sem mudar o número armazenado.' },
      { question: 'Qual atalho salva a pasta de trabalho?', options: ['Ctrl+S', 'Ctrl+P', 'Ctrl+F'], answer: 0, explanation: 'Ctrl+S salva as alterações.' },
    ],
  },
  {
    module: 2, title: 'Primeiras fórmulas',
    questions: [
      { question: 'Como toda fórmula do Excel começa?', options: ['Com =', 'Com #', 'Com +'], answer: 0, explanation: 'O sinal de igual informa que o conteúdo deve ser calculado.' },
      { question: 'Qual referência não muda ao copiar uma fórmula?', options: ['$B$2', 'B2', 'B$2'], answer: 0, explanation: 'Os dois cifrões fixam a coluna e a linha.' },
      { question: 'Qual função retorna o maior número de um intervalo?', options: ['MÁXIMO', 'MÉDIA', 'CONT.NÚM'], answer: 0, explanation: 'MÁXIMO encontra o maior valor numérico.' },
    ],
  },
  {
    module: 3, title: 'Decisões e critérios',
    questions: [
      { question: 'Qual função retorna um resultado diferente para verdadeiro e falso?', options: ['SE', 'SOMA', 'DIREITA'], answer: 0, explanation: 'SE avalia uma condição e escolhe entre dois resultados.' },
      { question: 'Quando E retorna VERDADEIRO?', options: ['Quando todas as condições são verdadeiras', 'Quando uma condição é verdadeira', 'Quando as condições são textos'], answer: 0, explanation: 'E exige que todos os testes sejam verdadeiros.' },
      { question: 'Qual função soma valores obedecendo a vários critérios?', options: ['SOMASES', 'CONT.SES', 'MÉDIASES'], answer: 0, explanation: 'SOMASES soma um intervalo com vários pares de critérios.' },
    ],
  },
  {
    module: 4, title: 'Textos e datas',
    questions: [
      { question: 'Qual função retira espaços extras em um texto?', options: ['ARRUMAR', 'CONCAT', 'ESQUERDA'], answer: 0, explanation: 'ARRUMAR normaliza espaços no início, no fim e entre palavras.' },
      { question: 'O que acontece ao subtrair uma data de outra?', options: ['Obtém dias entre elas', 'Obtém uma nova hora', 'Apaga as datas'], answer: 0, explanation: 'Datas são números no Excel; a diferença entre elas é um período em dias.' },
      { question: 'Qual função devolve data e hora atuais?', options: ['AGORA()', 'HOJE()', 'DATA()'], answer: 0, explanation: 'AGORA inclui a hora; HOJE retorna somente a data.' },
    ],
  },
  {
    module: 5, title: 'Organização e análise',
    questions: [
      { question: 'O que o filtro faz com as linhas que não atendem ao critério?', options: ['Oculta temporariamente', 'Apaga definitivamente', 'Converte em texto'], answer: 0, explanation: 'Filtrar não exclui os dados; a visualização pode ser restaurada.' },
      { question: 'Qual recurso restringe entradas inválidas numa célula?', options: ['Validação de dados', 'Tabela dinâmica', 'Formatação condicional'], answer: 0, explanation: 'A validação pode limitar valores e criar listas suspensas.' },
      { question: 'Antes de remover duplicatas, qual é uma boa prática?', options: ['Guardar uma cópia da base', 'Apagar todas as colunas', 'Classificar por cor'], answer: 0, explanation: 'Uma cópia torna a operação reversível se precisar conferir registros.' },
    ],
  },
  {
    module: 6, title: 'Pesquisas avançadas',
    questions: [
      { question: 'Qual limitação do PROCV é mais conhecida?', options: ['Busca só para a direita', 'Não encontra números', 'Não usa tabelas'], answer: 0, explanation: 'A coluna de procura precisa estar à esquerda da coluna de retorno.' },
      { question: 'O que CORRESP retorna?', options: ['A posição do item', 'O valor final formatado', 'A cor da célula'], answer: 0, explanation: 'CORRESP encontra uma posição que pode ser usada por ÍNDICE.' },
      { question: 'Para que serve SEERRO?', options: ['Exibir alternativa quando há erro', 'Criar um gráfico', 'Converter texto em data'], answer: 0, explanation: 'SEERRO substitui um erro por um valor ou mensagem escolhida.' },
    ],
  },
  {
    module: 7, title: 'Relatórios e produtividade',
    questions: [
      { question: 'Qual gráfico é adequado para mostrar evolução ao longo do tempo?', options: ['Linha', 'Pizza', 'Rosca'], answer: 0, explanation: 'Linhas tornam tendências temporais fáceis de perceber.' },
      { question: 'Em uma tabela dinâmica, onde um campo numérico é resumido?', options: ['Valores', 'Linhas', 'Filtros'], answer: 0, explanation: 'A área Valores soma, conta ou calcula médias.' },
      { question: 'Qual é o primeiro passo para criar um relatório confiável?', options: ['Organizar e validar a base', 'Escolher animações', 'Definir o papel de parede'], answer: 0, explanation: 'Indicadores confiáveis dependem de dados consistentes.' },
    ],
  },
];
