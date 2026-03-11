// config.js — Configuração genérica do app
// Edite este arquivo para personalizar áreas, sublocais e perguntas

export const APP_NAME = 'Inspecto';
export const APP_SUBTITLE = 'Inteligência em Auditorias 5S';
export const APP_VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// ÁREAS E SUBLOCAIS
// Estrutura: { "Nome da Área": ["Sublocal 1", "Sublocal 2", ...] }
// ---------------------------------------------------------------------------
export const AREAS = {
  'Área 1': [
    'Sublocal 1.1',
    'Sublocal 1.2',
    'Sublocal 1.3',
    'Sublocal 1.4',
    'Sublocal 1.5',
    'Sublocal 1.6',
    'Sublocal 1.7',
  ],
  'Área 2': [
    'Sublocal 2.1',
    'Sublocal 2.2',
  ],
  'Área 3': [
    'Sublocal 3.1',
  ],
  'Área 4': [
    'Sublocal 4.1',
    'Sublocal 4.2',
    'Sublocal 4.3',
    'Sublocal 4.4',
    'Sublocal 4.5',
    'Sublocal 4.6',
    'Sublocal 4.7',
    'Sublocal 4.8',
    'Sublocal 4.9',
    'Sublocal 4.10',
  ],
  'Área 5': [
    'Sublocal 5.1',
    'Sublocal 5.2',
    'Sublocal 5.3',
    'Sublocal 5.4',
    'Sublocal 5.5',
    'Sublocal 5.6',
    'Sublocal 5.7',
    'Sublocal 5.8',
    'Sublocal 5.9',
    'Sublocal 5.10',
    'Sublocal 5.11',
    'Sublocal 5.12',
    'Sublocal 5.13',
    'Sublocal 5.14',
  ],
  'Área 6': [
    'Sublocal 6.1',
    'Sublocal 6.2',
    'Sublocal 6.3',
    'Sublocal 6.4',
    'Sublocal 6.5',
    'Sublocal 6.6',
  ],
  'Área 7': [
    'Sublocal 7.1',
    'Sublocal 7.2',
    'Sublocal 7.3',
    'Sublocal 7.4',
    'Sublocal 7.5',
  ],
  'Área 8': [
    'Sublocal 8.1',
    'Sublocal 8.2',
    'Sublocal 8.3',
    'Sublocal 8.4',
    'Sublocal 8.5',
  ],
};

// ---------------------------------------------------------------------------
// MESES
// ---------------------------------------------------------------------------
export const MONTHS = [
  { value: '1',  label: 'Janeiro'   },
  { value: '2',  label: 'Fevereiro' },
  { value: '3',  label: 'Março'     },
  { value: '4',  label: 'Abril'     },
  { value: '5',  label: 'Maio'      },
  { value: '6',  label: 'Junho'     },
  { value: '7',  label: 'Julho'     },
  { value: '8',  label: 'Agosto'    },
  { value: '9',  label: 'Setembro'  },
  { value: '10', label: 'Outubro'   },
  { value: '11', label: 'Novembro'  },
  { value: '12', label: 'Dezembro'  },
];

// ---------------------------------------------------------------------------
// QUESTIONÁRIO 5S
// ---------------------------------------------------------------------------
export const QUESTIONARIO = [
  {
    senso: 'Utilização',
    fullSenso: 'Senso de Utilização (Seiri)',
    key: 'seiri',
    // Mudamos as classes para códigos Hexadecimais para o React Native entender
    color: '#dbeafe',       // Azul claro
    headerColor: '#1d4ed8', // Azul escuro
    perguntas: [
      { id: 'seiri_1', texto: 'A área está livre de itens desnecessários ocupando espaço?' },
      { id: 'seiri_2', texto: 'A área está livre de itens que ofereçam risco ou demonstrem desorganização?' },
      { id: 'seiri_3', texto: 'Os procedimentos e instruções de trabalho estão disponíveis e atualizados?' },
    ],
  },
  {
    senso: 'Organização',
    fullSenso: 'Senso de Organização (Seiton)',
    key: 'seiton',
    color: '#ffedd5',       // Laranja claro
    headerColor: '#f97316', // Laranja escuro
    perguntas: [
      { id: 'seiton_1', texto: 'Equipamentos de emergência estão disponíveis, demarcados e desobstruídos?' },
      { id: 'seiton_2', texto: 'Materiais e equipamentos estão etiquetados corretamente?' },
      { id: 'seiton_3', texto: 'Existem locais específicos para armazenar materiais não utilizados?' },
    ],
  },
  {
    senso: 'Limpeza',
    fullSenso: 'Senso de Limpeza (Seiso)',
    key: 'seiso',
    color: '#dcfce7',       // Verde claro
    headerColor: '#16a34a', // Verde escuro
    perguntas: [
      { id: 'seiso_1', texto: 'O local está em boas condições de limpeza?' },
      { id: 'seiso_2', texto: 'Ferramentas, equipamentos e máquinas estão limpos?' },
      { id: 'seiso_3', texto: 'Existem recipientes de descarte suficientes e em boas condições?' },
      { id: 'seiso_4', texto: 'Os resíduos estão descartados corretamente conforme coleta seletiva?' },
      { id: 'seiso_5', texto: 'Banheiros e vestiários estão limpos e com materiais de higiene?' },
    ],
  },
  {
    senso: 'Padronização',
    fullSenso: 'Senso de Padronização (Seiketsu)',
    key: 'seiketsu',
    color: '#f3e8ff',       // Roxo claro
    headerColor: '#9333ea', // Roxo escuro
    perguntas: [
      { id: 'seiketsu_1', texto: 'A área está livre de máquinas ou equipamentos que necessitem manutenção?' },
      { id: 'seiketsu_2', texto: 'As condições de trabalho atendem aos padrões adequados?' },
      { id: 'seiketsu_3', texto: 'Produtos químicos estão dentro da validade e conforme rótulo?' },
    ],
  },
  {
    senso: 'Disciplina',
    fullSenso: 'Senso de Disciplina (Shitsuke)',
    key: 'shitsuke',
    color: '#f1f5f9',       // Cinza claro
    headerColor: '#475569', // Cinza escuro
    perguntas: [
      { id: 'shitsuke_1', texto: 'EPIs estão disponíveis e em boas condições conforme o setor?' },
      { id: 'shitsuke_2', texto: 'Colaboradores demonstram conhecimento e comprometimento com o 5S?' },
    ],
  },
];

export const OPCOES_RESPOSTA = [
  { value: 'atende',     label: 'Atende',     color: '#15803d', bg: '#dcfce7' },
  { value: 'parcial',    label: 'Parcial',    color: '#a16207', bg: '#fef9c3' },
  { value: 'nao_atende', label: 'Não Atende', color: '#b91c1c', bg: '#fee2e2' },
  { value: 'na',         label: 'N/A',        color: '#6b7280', bg: '#f3f4f6' },
];
