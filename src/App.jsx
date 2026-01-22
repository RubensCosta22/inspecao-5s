'use client';

import React, { useState, useRef } from 'react';
// A LINHA ABAIXO É A QUE ESTÁ FALTANDO:
import { Camera, Save, ClipboardList, History, ArrowLeft, CheckCircle, AlertTriangle, XCircle, MinusCircle, Search, Trash2, Plus, FileText, ChevronDown, ChevronUp, BarChart3, LayoutDashboard, PieChart, Printer, Filter, Calendar, User, MapPin, Lightbulb } from 'lucide-react';

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


// --- DATA & CONFIGURATION ---

const AREAS = {
  "Administrativo": [
    "Almoxarifado Central", "Almoxarifado I", "Almoxarifado II", "Almoxarifado III",
    "Balança Rodoviária", "Sala de Reuniões", "Prédio Administrativo"
  ],
  "Gente & Gestão": [
    "Refeitório", "Arquivo G&G"
  ],
  "Logística": [
    "Arquivo Logística"
  ],
  "Manutenção": [
    "Canteiro das Contratadas", "Ferramentaria", "Oficina Civil", "Oficina de Caldeiraria",
    "Oficina de Máquinas", "Oficina de Pintura", "Oficina Elétrica", "Oficina Mecânica",
    "Oficina de Refrigeração", "Sala de Lubrificantes"
  ],
  "Operação": [
    "CCO", "Copa Limpeza", "Copa Moega", "Linhas de Recebimento", "Linhas de Expedição",
    "Moegas", "Sala Conservação", "Sala do Encarregado", "Tanque de Óleo Diesel",
    "Tanque de Óleo Vegetal", "Tanque SNAP", "Tombadores", "Vestiário OGMO", "Vestiário Píer"
  ],
  "Patrimonial": [
    "Estacionamento", "Portaria Mar", "Portaria Terra", "Sala de Caminhoneiros",
    "Sala Consuldata", "Sala de Apoio OGMO"
  ],
  "Qualidade": [
    "Classificação Embarque", "Classificação Ferroviária", "Classificação Rodoviária",
    "Container de Amostras", "Sala E.O Soluções"
  ],
  "SSMA": [
    "Arquivo SSMA", "Central de Resíduos", "Sala de Emergência", "Sala de Placas",
    "Saúde Ocupacional"
  ]
};

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

const QUESTIONARIO = [
  {
    senso: "Utilização",
    fullSenso: "Senso de Utilização (Seiri)",
    key: "seiri",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    headerColor: "bg-blue-600",
    perguntas: [
      { id: "seiri_1", texto: "A área está livre de itens desnecessários ocupando espaço?" },
      { id: "seiri_2", texto: "A área está livre de itens que ofereçam risco ou demonstrem desorganização?" },
      { id: "seiri_3", texto: "Os procedimentos e instruções de trabalho estão disponíveis e atualizados?" }
    ]
  },
  {
    senso: "Organização",
    fullSenso: "Senso de Organização (Seiton)",
    key: "seiton",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    headerColor: "bg-orange-500",
    perguntas: [
      { id: "seiton_1", texto: "Equipamentos de emergência estão disponíveis, demarcados e desobstruídos?" },
      { id: "seiton_2", texto: "Materiais e equipamentos estão etiquetados corretamente?" },
      { id: "seiton_3", texto: "Existem locais específicos para armazenar materiais não utilizados?" }
    ]
  },
  {
    senso: "Limpeza",
    fullSenso: "Senso de Limpeza (Seiso)",
    key: "seiso",
    color: "bg-green-100 text-green-800 border-green-200",
    headerColor: "bg-green-600",
    perguntas: [
      { id: "seiso_1", texto: "O local está em boas condições de limpeza?" },
      { id: "seiso_2", texto: "Ferramentas, equipamentos e máquinas estão limpos?" },
      { id: "seiso_3", texto: "Existem recipientes de descarte suficientes e em boas condições?" },
      { id: "seiso_4", texto: "Os resíduos estão descartados corretamente conforme coleta seletiva?" },
      { id: "seiso_5", texto: "Banheiros e vestiários estão limpos e com materiais de higiene?" }
    ]
  },
  {
    senso: "Padronização",
    fullSenso: "Senso de Padronização (Seiketsu)",
    key: "seiketsu",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    headerColor: "bg-purple-600",
    perguntas: [
      { id: "seiketsu_1", texto: "A área está livre de máquinas ou equipamentos que necessitem manutenção?" },
      { id: "seiketsu_2", texto: "As condições de trabalho atendem aos padrões adequados?" },
      { id: "seiketsu_3", texto: "Produtos químicos estão dentro da validade e conforme rótulo?" }
    ]
  },
  {
    senso: "Disciplina",
    fullSenso: "Senso de Disciplina (Shitsuke)",
    key: "shitsuke",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    headerColor: "bg-slate-600",
    perguntas: [
      { id: "shitsuke_1", texto: "EPIs estão disponíveis e em boas condições conforme o setor?" },
      { id: "shitsuke_2", texto: "Colaboradores demonstram conhecimento e comprometimento com o 5S?" }
    ]
  }
];

const OPCOES_RESPOSTA = [
  { value: "atende", label: "Atende", color: "text-green-700", bg: "bg-green-100" },
  { value: "parcial", label: "Parcial", color: "text-yellow-700", bg: "bg-yellow-100" },
  { value: "nao_atende", label: "Não Atende", color: "text-red-700", bg: "bg-red-100" },
  { value: "na", label: "N/A", color: "text-gray-500", bg: "bg-gray-100" },
];

// --- HELPERS ---

const calculateScore = (respostas) => {
  let totalAplicavel = 0;
  let somaPontos = 0;

  QUESTIONARIO.forEach(bloco => {
    bloco.perguntas.forEach(p => {
      const resp = respostas[p.id];
      if (resp && resp.valor !== 'na') {
        totalAplicavel++;
        if (resp.valor === 'atende') somaPontos += 1;
        if (resp.valor === 'parcial') somaPontos += 0.5;
      }
    });
  });

  return totalAplicavel > 0 ? Math.round((somaPontos / totalAplicavel) * 100) : 0;
};

const calculateSenseScores = (respostas) => {
  const scores = {};
  
  QUESTIONARIO.forEach(bloco => {
    let totalAplicavel = 0;
    let somaPontos = 0;
    
    bloco.perguntas.forEach(p => {
      const resp = respostas[p.id];
      if (resp && resp.valor !== 'na') {
        totalAplicavel++;
        if (resp.valor === 'atende') somaPontos += 1;
        if (resp.valor === 'parcial') somaPontos += 0.5;
      }
    });

    scores[bloco.key] = totalAplicavel > 0 ? Math.round((somaPontos / totalAplicavel) * 100) : 0;
  });

  return scores;
};

const getAreaFromLocal = (localName) => {
  for (const [area, locais] of Object.entries(AREAS)) {
    if (locais.includes(localName)) return area;
  }
  return "Outros";
};

// --- COMPONENTS ---

// Botão Genérico
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 active:scale-95 print:hidden";
  const variants = {
    primary: "bg-blue-700 text-white hover:bg-blue-800 shadow-md",
    secondary: "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
};

// Input Card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [screen, setScreen] = useState('home'); // home, new, audit, summary, history, dashboard
  const [inspections, setInspections] = useState([]);

const renderScreen = () => {
    switch (screen) {
      case 'home':
        return renderHome();
      case 'new':
        return renderNewInspection();
      case 'audit':
        return renderAuditForm();
      case 'summary':
        return renderSummary();
      case 'dashboard':
        return renderDashboard();
      default:
        return renderHome();
    }
  };
  
  // Current Inspection State
  const [currentData, setCurrentData] = useState({
    auditor: '',
    local: '',
    data: new Date().toISOString().split('T')[0],
    respostas: {}, // { id_pergunta: { valor, obs, fotos: [] } }
    acoesSugeridas: '',
    fotosGerais: []
  });

  // Filters
  const [historyFilter, setHistoryFilter] = useState('');
  
  // Dashboard Filters
  const [dashboardFilter, setDashboardFilter] = useState('Todas'); // Area
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear().toString());
  const [dashboardMonth, setDashboardMonth] = useState((new Date().getMonth() + 1).toString()); // '1'...'12' or 'all'

  // --- PHOTO UPLOAD LOGIC ---
  const fileInputRef = useRef(null);
  const activeUploadRef = useRef({ type: null, id: null }); // { type: 'question' | 'general', id: string }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const { type, id } = activeUploadRef.current;

      if (type === 'question' && id) {
        // Add to specific question
        const currentPhotos = currentData.respostas[id]?.fotos || [];
        handleAnswerChange(id, 'fotos', [...currentPhotos, base64String]);
      } else if (type === 'general') {
        // Add to general photos
        setCurrentData(prev => ({
          ...prev,
          fotosGerais: [...prev.fotosGerais, base64String]
        }));
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const triggerUpload = (type, id = null) => {
    activeUploadRef.current = { type, id };
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- ACTIONS ---

  const startNewInspection = () => {
    setCurrentData({
      auditor: '',
      local: '',
      data: new Date().toISOString().split('T')[0],
      respostas: {},
      acoesSugeridas: '',
      fotosGerais: []
    });
    setScreen('new');
  };

  const handleStartAudit = () => {
    if (!currentData.auditor || !currentData.local) {
      alert("Por favor, preencha o auditor e o local.");
      return;
    }
    setScreen('audit');
  };

  const handleAnswerChange = (questionId, field, value) => {
    setCurrentData(prev => ({
      ...prev,
      respostas: {
        ...prev.respostas,
        [questionId]: {
          ...prev.respostas[questionId],
          [field]: value
        }
      }
    }));
  };

  const validateAndSummary = () => {
    const errors = [];
    let hasNonCompliant = false;

    // RULE 1: Mandatory comments and photos for "Não Atende" and "Parcial"
    QUESTIONARIO.forEach(bloco => {
      bloco.perguntas.forEach(p => {
        const resp = currentData.respostas[p.id];
        const isNegative = resp?.valor === 'nao_atende' || resp?.valor === 'parcial';
        
        if (isNegative) {
          hasNonCompliant = true;
          if (!resp?.obs || resp.obs.trim() === '') {
            errors.push(`Item "${p.texto.substring(0, 30)}...": Observação obrigatória.`);
          }
          if (!resp?.fotos || resp.fotos.length === 0) {
            errors.push(`Item "${p.texto.substring(0, 30)}...": Foto obrigatória.`);
          }
        }
      });
    });

    // RULE 2: If everything is compliant (no "Não Atende" or "Parcial"), require at least one general photo
    if (!hasNonCompliant && currentData.fotosGerais.length === 0) {
      errors.push("Como todos os itens atendem, é obrigatório anexar pelo menos uma Foto Geral do Local ao final.");
    }

    if (errors.length > 0) {
      alert("Pendências encontradas:\n\n" + errors.join("\n"));
      return;
    }
    setScreen('summary');
  };

  const saveInspection = () => {
    const score = calculateScore(currentData.respostas);
    const senseScores = calculateSenseScores(currentData.respostas);
    const area = getAreaFromLocal(currentData.local);

    const newInspection = {
      id: Date.now(),
      ...currentData,
      score,
      senseScores,
      area,
      timestamp: new Date().toLocaleString()
    };
    setInspections([newInspection, ...inspections]);
    setScreen('home');
  };

  const handlePrint = () => {
    window.print();
  };

  // --- RENDERERS ---

  const renderHome = () => (
    <div className="flex flex-col h-full items-center justify-center p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="text-center space-y-2">
        <div className="bg-blue-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <ClipboardList className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Inspeção 5S</h1>
        <p className="text-slate-500">Terminal de Granéis</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button onClick={startNewInspection} className="w-full text-lg py-4">
          <Plus size={20} /> Nova Inspeção
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setScreen('dashboard')} variant="secondary" className="w-full">
            <LayoutDashboard size={18} /> Painel
          </Button>
          <Button onClick={() => setScreen('history')} variant="secondary" className="w-full">
            <History size={18} /> Histórico
          </Button>
        </div>
      </div>
      
      <p className="fixed bottom-6 text-xs text-slate-400">Versão 1.9.0 - Preview Web</p>
    </div>
  );

  const renderNewInspection = () => (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setScreen('home')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="text-slate-600" />
        </button>
        <h2 className="font-semibold text-slate-800 text-lg">Dados Gerais</h2>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto mt-4">
        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
            <input 
              type="date" 
              disabled 
              value={currentData.data}
              className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Responsável</label>
            <input 
              type="text" 
              placeholder="Digite seu nome"
              value={currentData.auditor}
              onChange={(e) => setCurrentData({...currentData, auditor: e.target.value})}
              className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Local Inspecionado</label>
            <div className="relative">
              <select 
                value={currentData.local}
                onChange={(e) => setCurrentData({...currentData, local: e.target.value})}
                className="w-full p-3 bg-white rounded-lg border border-slate-300 appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecione um local...</option>
                {/* Render grouped options if supported, or flat list */}
                {Object.entries(AREAS).map(([areaName, locais]) => (
                  <optgroup key={areaName} label={areaName}>
                    {locais.map(l => <option key={l} value={l}>{l}</option>)}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg md:relative md:bg-transparent md:border-none md:shadow-none md:max-w-2xl md:mx-auto">
        <Button onClick={handleStartAudit} className="w-full text-lg">
          Iniciar Inspeção
        </Button>
      </div>
    </div>
  );

  const renderAuditForm = () => {
    const totalQuestions = QUESTIONARIO.reduce((acc, curr) => acc + curr.perguntas.length, 0);
    const filledQuestions = Object.keys(currentData.respostas).length;
    const progress = Math.round((filledQuestions / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-slate-100 pb-24">
         {/* HIDDEN INPUT FOR FILE UPLOAD */}
         <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
         />

         <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setScreen('new')} className="p-1 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-600" size={20} />
            </button>
            <div className="flex-1">
               <h2 className="font-semibold text-slate-800 text-sm leading-tight">{currentData.local}</h2>
            </div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
              {progress}%
            </div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </header>

        <div className="p-4 space-y-8 max-w-3xl mx-auto">
          {QUESTIONARIO.map((bloco, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-600 pl-3 py-1 bg-blue-50/50 rounded-r-lg">
                {bloco.fullSenso}
              </h3>
              
              {bloco.perguntas.map((pergunta) => {
                const respostaAtual = currentData.respostas[pergunta.id] || {};
                const isNegative = respostaAtual.valor === 'nao_atende' || respostaAtual.valor === 'parcial';
                const showComment = isNegative || respostaAtual.obs;

                return (
                  <Card key={pergunta.id} className="p-4 md:p-6 transition-shadow hover:shadow-md">
                    <p className="font-medium text-slate-800 mb-4 text-lg">{pergunta.texto}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {OPCOES_RESPOSTA.map(op => (
                        <label 
                          key={op.value} 
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${respostaAtual.valor === op.value 
                              ? `${op.bg} border-current ring-1 ring-current` 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${respostaAtual.valor === op.value ? 'border-current' : 'border-slate-300'}`}>
                            {respostaAtual.valor === op.value && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                          </div>
                          <input 
                            type="radio" 
                            name={`q_${pergunta.id}`} 
                            value={op.value}
                            checked={respostaAtual.valor === op.value}
                            onChange={() => handleAnswerChange(pergunta.id, 'valor', op.value)}
                            className={`hidden ${op.color}`}
                          />
                          <span className={`font-medium ${respostaAtual.valor === op.value ? op.color : 'text-slate-600'}`}>
                            {op.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                      <div>
                         <button 
                            onClick={() => triggerUpload('question', pergunta.id)}
                            className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-fit
                                ${isNegative && (!respostaAtual.fotos || respostaAtual.fotos.length === 0) 
                                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                                    : 'text-blue-600 hover:bg-blue-50'}`}
                          >
                            <Camera size={18} />
                            {respostaAtual.fotos?.length > 0 ? `Fotos Anexadas (${respostaAtual.fotos.length})` : 'Anexar Foto'}
                            {isNegative && <span className="text-[10px] font-bold uppercase ml-1">(Obrigatório)</span>}
                          </button>

                          {respostaAtual.fotos?.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                              {respostaAtual.fotos.map((f, i) => (
                                <div key={i} className="relative group flex-shrink-0">
                                  <img src={f} alt="Evidência" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      {showComment && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Observação {isNegative && <span className="text-red-500">* (Obrigatório)</span>}
                          </label>
                          <textarea 
                            value={respostaAtual.obs || ''}
                            onChange={(e) => handleAnswerChange(pergunta.id, 'obs', e.target.value)}
                            placeholder={isNegative ? "Descreva o problema obrigatóriamente..." : "Observações adicionais (opcional)"}
                            className={`w-full p-3 text-sm rounded-lg border outline-none focus:ring-2 
                              ${isNegative && (!respostaAtual.obs || respostaAtual.obs.trim() === '')
                                ? 'border-red-300 bg-red-50 focus:ring-red-200 placeholder-red-400' 
                                : 'border-slate-300 bg-slate-50 focus:ring-blue-200'}`}
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}

          {/* New Rule 2 & 3: Final Card */}
          <Card className="p-6 border-l-4 border-l-blue-600">
             <h3 className="font-bold text-slate-800 text-lg mb-4">Finalização e Sugestões</h3>
             
             {/* General Photos */}
             <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                   Fotos Gerais do Local
                   <span className="block text-xs font-normal text-slate-500 mt-1">
                      Caso todos os itens estejam "Atende" ou "N/A", é <strong>obrigatório</strong> anexar ao menos uma foto geral da área.
                   </span>
                </label>
                <button 
                  onClick={() => triggerUpload('general')}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                   <Camera size={24} className="mb-2" />
                   <span className="text-sm">Clique para adicionar foto geral</span>
                </button>
                {currentData.fotosGerais.length > 0 && (
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {currentData.fotosGerais.map((f, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                          <img src={f} alt="Geral" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">✓</div>
                        </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Suggested Actions (Rule 3) */}
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                   <Lightbulb size={16} className="text-yellow-500" />
                   Ações Sugeridas / Melhorias (Opcional)
                </label>
                <textarea 
                   value={currentData.acoesSugeridas}
                   onChange={(e) => setCurrentData({...currentData, acoesSugeridas: e.target.value})}
                   placeholder="Descreva sugestões de melhoria para a área..."
                   className="w-full p-3 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                   rows={3}
                />
             </div>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="max-w-3xl mx-auto flex gap-3">
             <Button onClick={validateAndSummary} className="flex-1 text-lg shadow-blue-200">
               <CheckCircle size={20} /> Finalizar Inspeção
             </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const score = calculateScore(currentData.respostas);
    
    // Determine color based on score
    let scoreColor = 'text-red-600';
    if (score >= 80) scoreColor = 'text-green-600';
    else if (score >= 60) scoreColor = 'text-yellow-600';

    const naoConformidades = [];
    QUESTIONARIO.forEach(bloco => {
      bloco.perguntas.forEach(p => {
        const resp = currentData.respostas[p.id];
        if (resp?.valor === 'nao_atende' || resp?.valor === 'parcial') {
          naoConformidades.push({ pergunta: p.texto, obs: resp.obs, senso: bloco.fullSenso, valor: resp.valor });
        }
      });
    });

    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setScreen('audit')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="text-slate-600" />
          </button>
          <h2 className="font-semibold text-slate-800 text-lg">Resumo da Inspeção</h2>
        </header>

        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          
          <Card className="p-6 text-center">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">Índice de Aderência 5S</p>
            <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>{score}%</div>
            <div className="flex justify-center gap-4 text-sm text-slate-600 mt-4 border-t pt-4">
               <div>
                  <span className="block font-bold text-slate-800">{currentData.local}</span>
                  <span className="text-xs">Local</span>
               </div>
               <div className="border-l pl-4">
                  <span className="block font-bold text-slate-800">{new Date(currentData.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs">Data</span>
               </div>
            </div>
          </Card>

          {naoConformidades.length > 0 ? (
            <div>
              <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Itens Não Atendidos / Parciais ({naoConformidades.length})
              </h3>
              <div className="space-y-3">
                {naoConformidades.map((nc, idx) => (
                  <Card key={idx} className="p-4 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-1">
                       <p className="text-xs text-slate-400">{nc.senso}</p>
                       <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${nc.valor === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {nc.valor === 'parcial' ? 'Parcial' : 'Não Atende'}
                       </span>
                    </div>
                    <p className="font-medium text-slate-800 mb-2">{nc.pergunta}</p>
                    <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800">
                      <span className="font-bold">Obs:</span> {nc.obs}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-6 bg-green-50 border-green-200 flex flex-col items-center text-center">
              <CheckCircle className="text-green-600 w-12 h-12 mb-2" />
              <h3 className="text-green-800 font-bold text-lg">Excelente!</h3>
              <p className="text-green-700">Nenhuma não conformidade encontrada.</p>
            </Card>
          )}

          {/* Suggestions Summary */}
          {currentData.acoesSugeridas && (
             <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">
                   <Lightbulb size={14} /> Ações Sugeridas
                </h4>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{currentData.acoesSugeridas}</p>
             </Card>
          )}

          <div className="h-10"></div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg md:relative md:bg-transparent md:border-none md:shadow-none md:max-w-2xl md:mx-auto">
          <Button onClick={saveInspection} className="w-full text-lg">
            <Save size={20} /> Salvar Inspeção
          </Button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    // Determine if Accumulated or Specific Month
    const isAccumulated = dashboardMonth === 'all';
    
    // Filtering Logic
    const filteredInspections = inspections.filter(i => {
       const iDate = new Date(i.data);
       const iYear = iDate.getFullYear().toString();
       const iMonth = (iDate.getMonth() + 1).toString();

       // 1. Year Filter
       if (iYear !== dashboardYear) return false;

       // 2. Month Filter (if not accumulated)
       if (!isAccumulated && iMonth !== dashboardMonth) return false;

       // 3. Area Filter
       if (dashboardFilter !== 'Todas' && i.area !== dashboardFilter) return false;

       return true;
    });

    const isAreaFiltered = dashboardFilter !== 'Todas';

    const totalScore = filteredInspections.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = filteredInspections.length > 0 ? Math.round(totalScore / filteredInspections.length) : 0;
    
    // Calculate average scores per Sense for the filtered view
    const senseAverages = { seiri: 0, seiton: 0, seiso: 0, seiketsu: 0, shitsuke: 0 };
    if (filteredInspections.length > 0) {
      filteredInspections.forEach(insp => {
        Object.keys(senseAverages).forEach(key => {
          senseAverages[key] += (insp.senseScores?.[key] || 0);
        });
      });
      Object.keys(senseAverages).forEach(key => {
        senseAverages[key] = Math.round(senseAverages[key] / filteredInspections.length);
      });
    }

    let scoreColor = 'text-slate-400';
    if (filteredInspections.length > 0) {
      if (avgScore >= 80) scoreColor = 'text-green-600';
      else if (avgScore >= 60) scoreColor = 'text-yellow-600';
      else scoreColor = 'text-red-600';
    }

    // --- VIEW 1: GENERAL DASHBOARD (Not Filtered by Area) ---
    if (!isAreaFiltered) {
      const areaStats = Object.keys(AREAS).map(area => {
        const areaInspections = filteredInspections.filter(i => i.area === area);
        const areaTotal = areaInspections.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const areaAvg = areaInspections.length > 0 ? Math.round(areaTotal / areaInspections.length) : 0;
        return { label: area, score: areaAvg, count: areaInspections.length };
      });

      return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
          <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 print:hidden">
            <button onClick={() => setScreen('home')} className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-600" />
            </button>
            <div className="flex-1">
               <h2 className="font-semibold text-slate-800 text-lg">Painel de Resultados</h2>
            </div>
            <button onClick={handlePrint} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Imprimir">
              <Printer size={20} />
            </button>
          </header>

          <div className="p-4 max-w-5xl mx-auto space-y-6 print:p-0">
            
            {/* FILTERS TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-3 items-center print:hidden bg-white p-3 rounded-xl shadow-sm border border-slate-100">
               {/* Area Filter */}
               <div className="relative w-full md:w-1/3">
                  <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select 
                    value={dashboardFilter}
                    onChange={(e) => setDashboardFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm font-medium text-slate-700"
                  >
                    <option value="Todas">Todas as Áreas</option>
                    {Object.keys(AREAS).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
               </div>

               {/* Month Filter */}
               <div className="relative w-full md:w-1/3">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select 
                    value={dashboardMonth}
                    onChange={(e) => setDashboardMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm font-medium text-slate-700"
                  >
                    <option value="all">Acumulado do Ano</option>
                    <optgroup label="Meses">
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
               </div>

               {/* Year Filter */}
               <div className="relative w-full md:w-1/3">
                  <div className="absolute left-3 top-3 text-slate-400 font-bold text-xs">ANO</div>
                  <select 
                    value={dashboardYear}
                    onChange={(e) => setDashboardYear(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm font-medium text-slate-700"
                  >
                    {[0, 1, 2].map(offset => {
                       const y = (new Date().getFullYear() - offset).toString();
                       return <option key={y} value={y}>{y}</option>
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
               </div>
            </div>

            <Card className="p-8 flex flex-col items-center justify-center bg-white border-blue-100 shadow-md print:shadow-none print:border">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">
                 Nota Geral - {isAccumulated ? `Acumulado ${dashboardYear}` : `${MONTHS.find(m => m.value === dashboardMonth)?.label} ${dashboardYear}`}
              </h3>
              <div className={`text-7xl font-black ${scoreColor}`}>
                {filteredInspections.length > 0 ? `${avgScore}%` : '-'}
              </div>
              <p className="text-slate-400 text-sm mt-2">{filteredInspections.length} inspeções realizadas</p>
            </Card>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 print:text-black">
                <PieChart size={20} className="text-blue-600 print:text-black" /> Desempenho por Área
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-4">
                {areaStats.map((stat) => (
                  <Card key={stat.label} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow print:shadow-none print:border-slate-400 print:break-inside-avoid">
                    <div>
                      <p className="font-semibold text-slate-700 mb-1 truncate print:text-black" title={stat.label}>{stat.label}</p>
                      <p className="text-xs text-slate-400 mb-3 print:text-gray-600">{stat.count} inspeções</p>
                    </div>
                    <div>
                      <span className={`text-2xl font-bold ${stat.count > 0 ? (stat.score >= 80 ? 'text-green-600' : stat.score >= 60 ? 'text-yellow-600' : 'text-red-600') : 'text-slate-300'}`}>
                         {stat.count > 0 ? `${stat.score}%` : '-'}
                      </span>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 print:border print:border-gray-300">
                        <div className={`h-full ${stat.score >= 80 ? 'bg-green-500' : stat.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.count > 0 ? stat.score : 0}%` }}></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // --- VIEW 2: DETAILED REPORT (FILTERED BY AREA) ---
    // Instead of a summary table, we render "Report Cards" for each subarea
    const subareas = AREAS[dashboardFilter] || [];
    
    // We only want to show the LATEST inspection for each subarea in this report
    const latestInspections = subareas.map(local => {
      // If we are filtering, we want the best representation. 
      // If Accumulated, we might want the average? 
      // Current Logic: Shows the latest inspection in the selected period (Month/Year)
      // This works best for "Monthly Reports".
      const found = filteredInspections.filter(i => i.local === local).sort((a,b) => b.id - a.id)[0];
      return found ? found : null;
    }).filter(i => i !== null);

    const periodLabel = isAccumulated 
        ? `Acumulado ${dashboardYear}` 
        : `${MONTHS.find(m => m.value === dashboardMonth)?.label} ${dashboardYear}`;

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white">
        {/* Screen Header (Hidden on Print) */}
        <header className="bg-slate-800 px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 print:hidden text-white">
          <button onClick={() => setDashboardFilter('Todas')} className="p-2 hover:bg-slate-700 rounded-full">
            <ArrowLeft className="text-white" />
          </button>
          <div className="flex-1">
             <h2 className="font-semibold text-lg">Relatório Detalhado: {dashboardFilter}</h2>
          </div>
          <button onClick={handlePrint} className="p-2 bg-blue-600 hover:bg-blue-50 rounded-full" title="Imprimir Relatório">
            <Printer size={20} />
          </button>
        </header>

        <div className="p-6 max-w-[297mm] mx-auto space-y-8 print:p-0 print:space-y-0 print:w-full">
           
           {/* Filters in Detail View too */}
           <div className="flex flex-col md:flex-row gap-3 items-center print:hidden bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-4">
               {/* Month Filter */}
               <div className="relative w-full md:w-1/2">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select 
                    value={dashboardMonth}
                    onChange={(e) => setDashboardMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm font-medium text-slate-700"
                  >
                    <option value="all">Acumulado do Ano</option>
                    <optgroup label="Meses">
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </optgroup>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
               </div>

               {/* Year Filter */}
               <div className="relative w-full md:w-1/2">
                  <div className="absolute left-3 top-3 text-slate-400 font-bold text-xs">ANO</div>
                  <select 
                    value={dashboardYear}
                    onChange={(e) => setDashboardYear(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm font-medium text-slate-700"
                  >
                    {[0, 1, 2].map(offset => {
                       const y = (new Date().getFullYear() - offset).toString();
                       return <option key={y} value={y}>{y}</option>
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
               </div>
            </div>

          {latestInspections.length === 0 ? (
             <div className="text-center py-20 text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Nenhuma inspeção realizada para {dashboardFilter} em {periodLabel}.</p>
             </div>
          ) : (
            latestInspections.map((insp, index) => {
              // Prepare question data with answers
              const renderQuestionBlock = (sensoKey) => {
                const sensoData = QUESTIONARIO.find(q => q.key === sensoKey);
                return (
                   <div key={sensoKey} className="mb-4 break-inside-avoid">
                      <div className={`${sensoData.headerColor} text-white px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2`}>
                        {sensoData.senso}
                      </div>
                      <div className="space-y-3">
                         {sensoData.perguntas.map(perg => {
                            const resp = insp.respostas[perg.id];
                            const valor = resp?.valor || 'na';
                            const option = OPCOES_RESPOSTA.find(o => o.value === valor);
                            
                            return (
                               <div key={perg.id} className="text-[10px] leading-tight border-b border-gray-100 pb-2 last:border-0">
                                  <div className="text-gray-700 mb-1">{perg.texto}</div>
                                  <div className="flex justify-between items-start">
                                     <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${option.bg} ${option.color} border border-transparent`}>
                                        {option.label}
                                     </span>
                                     {(valor === 'nao_atende' || valor === 'parcial') && resp.obs && (
                                        <span className="text-red-600 text-[9px] italic ml-2 text-right max-w-[60%]">
                                           Obs: {resp.obs}
                                        </span>
                                     )}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                );
              };

              return (
                <div key={insp.id} className="bg-white p-8 shadow-sm print:shadow-none print:break-after-page print:h-screen print:w-full print:p-8 mb-8 relative">
                   
                   {/* Header Row */}
                   <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                      <div className="w-1/3">
                         <div className="text-4xl font-light text-slate-800 tracking-tight">{periodLabel}</div>
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Relatório de Inspeção</div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-xs border-l border-slate-200 pl-8">
                         <div>
                            <span className="block text-slate-400 font-bold uppercase text-[10px]">Data da Inspeção</span>
                            <span className="font-medium text-slate-700">{new Date(insp.data).toLocaleDateString('pt-BR')}</span>
                         </div>
                         <div>
                            <span className="block text-slate-400 font-bold uppercase text-[10px]">Local</span>
                            <span className="font-medium text-slate-700">{insp.local}</span>
                         </div>
                         <div>
                            <span className="block text-slate-400 font-bold uppercase text-[10px]">Coordenação Responsável</span>
                            <span className="font-medium text-slate-700">{insp.area}</span>
                         </div>
                         <div>
                            <span className="block text-slate-400 font-bold uppercase text-[10px]">Auditores</span>
                            <span className="font-medium text-slate-700">{insp.auditor}</span>
                         </div>
                      </div>

                      <div className="w-32 text-right">
                         <div className="text-sm font-bold text-slate-400 uppercase text-[10px] mb-1">Nota da Inspeção</div>
                         <div className={`text-5xl font-black ${insp.score >= 80 ? 'text-blue-600' : insp.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {insp.score}%
                         </div>
                      </div>
                   </div>

                   {/* Content Grid - 5S Layout */}
                   <div className="grid grid-cols-5 gap-4">
                      <div className="flex flex-col">{renderQuestionBlock('seiri')}</div>
                      <div className="flex flex-col pt-8">{renderQuestionBlock('seiton')}</div>
                      
                      {/* Column 3: Center Graphic + Limpeza */}
                      <div className="flex flex-col items-center">
                         {/* REPLACED 5S TEXT WITH IMAGE PLACEHOLDER */}
                         <div className="w-32 h-32 mb-6 flex items-center justify-center">
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" 
                                alt="Logo 5S Central" 
                                className="w-full h-full object-contain"
                            />
                         </div>
                         <div className="w-full text-left">{renderQuestionBlock('seiso')}</div>
                      </div>

                      <div className="flex flex-col pt-8">{renderQuestionBlock('seiketsu')}</div>
                      <div className="flex flex-col">{renderQuestionBlock('shitsuke')}</div>
                   </div>

                   {/* Rule 3: Display Suggested Actions in Print if exists */}
                   {insp.acoesSugeridas && (
                      <div className="mt-4 border-t border-slate-200 pt-4 px-4 break-inside-avoid">
                         <div className="text-xs font-bold uppercase text-slate-500 mb-1">Ações Sugeridas / Melhorias</div>
                         <div className="text-xs text-slate-700 italic border-l-2 border-blue-200 pl-2">
                            {insp.acoesSugeridas}
                         </div>
                      </div>
                   )}
                   
                   {/* Footer Signature */}
                   <div className="absolute bottom-8 left-8 right-8 border-t border-slate-200 pt-4 flex justify-between text-[10px] text-slate-400">
                      <div>Relatório gerado automaticamente pelo Sistema 5S Web</div>
                      <div>{insp.id}</div>
                   </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const filteredInspections = inspections.filter(i => 
      i.local.toLowerCase().includes(historyFilter.toLowerCase()) || 
      i.auditor.toLowerCase().includes(historyFilter.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setScreen('home')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="text-slate-600" />
          </button>
          <div className="flex-1">
             <h2 className="font-semibold text-slate-800 text-lg">Histórico</h2>
          </div>
        </header>

        <div className="p-4 max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Filtrar por local ou auditor..." 
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredInspections.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma inspeção encontrada.</p>
              </div>
            ) : (
              filteredInspections.map((insp) => {
                let badgeColor = "bg-slate-100 text-slate-600";
                if (insp.score >= 80) badgeColor = "bg-green-100 text-green-700";
                else if (insp.score >= 60) badgeColor = "bg-yellow-100 text-yellow-700";
                else badgeColor = "bg-red-100 text-red-700";

                return (
                  <Card key={insp.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{insp.local}</h3>
                        <p className="text-xs text-slate-500">{insp.area}</p>
                      </div>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${badgeColor}`}>{insp.score}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span>{new Date(insp.data).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>Auditor: {insp.auditor}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- ROUTER ---
  switch (screen) {
    case 'home': return renderHome();
    case 'new': return renderNewInspection();
    case 'audit': return renderAuditForm();
    case 'summary': return renderSummary();
    case 'history': return renderHistory();
    case 'dashboard': return renderDashboard();
    default: return renderHome();
  }

}
