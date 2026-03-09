'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Save, ClipboardList, History, ArrowLeft, CheckCircle,
  AlertTriangle, Search, Trash2, Plus, FileText,
  ChevronDown, LayoutDashboard, PieChart, Printer, Filter,
  Calendar, Lightbulb, WifiOff, RefreshCw, X
} from 'lucide-react';

import { APP_NAME, APP_SUBTITLE, APP_VERSION, AREAS, MONTHS, QUESTIONARIO, OPCOES_RESPOSTA } from './config.js';
import { calculateScore, calculateSenseScores, getAreaFromLocal, scoreColor, scoreBg, scoreBadge, formatDate } from './helpers.js';
import { saveInspection, getAllInspections, deleteInspection } from './db.js';

// ---------------------------------------------------------------------------
// UI COMPONENTS
// ---------------------------------------------------------------------------

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const base = 'px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 active:scale-95 print:hidden select-none';
  const variants = {
    primary:   'bg-blue-700 text-white hover:bg-blue-800 shadow-md',
    secondary: 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 shadow-sm',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const OfflineBanner = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-2 print:hidden">
      <WifiOff size={12} /> Modo Offline — dados salvos localmente
    </div>
  );
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const blankInspection = () => ({
  auditor: '',
  local: '',
  data: new Date().toISOString().split('T')[0],
  respostas: {},
  acoesSugeridas: '',
  fotosGerais: [],
});

// ---------------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------------
export default function App() {
  const [screen, setScreen]               = useState('home');
  const [inspections, setInspections]     = useState([]);
  const [loadingDB, setLoadingDB]         = useState(true);
  const [isOffline, setIsOffline]         = useState(!navigator.onLine);
  const [currentData, setCurrentData]     = useState(blankInspection());
  const [historyFilter, setHistoryFilter] = useState('');

  // Dashboard filters
  const [dashboardFilter, setDashboardFilter] = useState('Todas');
  const [dashboardYear,   setDashboardYear]   = useState(new Date().getFullYear().toString());
  const [dashboardMonth,  setDashboardMonth]  = useState((new Date().getMonth() + 1).toString());
  const [aiPhotos, setAiPhotos]   = useState({ geral: null, seiri: null, seiton: null, seiso: null, seiketsu: null, shitsuke: null });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone]       = useState(false);

  // Photo upload refs
  const fileInputRef    = useRef(null);
  const activeUploadRef = useRef({ type: null, id: null });

  // -------------------------------------------------------------------------
  // LOAD INDEXEDDB
  // -------------------------------------------------------------------------
  useEffect(() => {
    getAllInspections()
      .then(data => setInspections(data))
      .catch(err => console.error('Erro ao carregar inspeções:', err))
      .finally(() => setLoadingDB(false));
  }, []);

  // -------------------------------------------------------------------------
  // OFFLINE DETECTION
  // -------------------------------------------------------------------------
  useEffect(() => {
    const goOnline  = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // -------------------------------------------------------------------------
  // PHOTO UPLOAD — compress to max 800px, JPEG 75%
  // -------------------------------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img    = new Image();
    const reader = new FileReader();
    reader.onloadend = () => {
      img.onload = () => {
        const MAX = 800;
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        const { type, id } = activeUploadRef.current;
        if (type === 'question' && id) {
          const prev = currentData.respostas[id]?.fotos || [];
          handleAnswerChange(id, 'fotos', [...prev, compressed]);
        } else if (type === 'general') {
          setCurrentData(p => ({ ...p, fotosGerais: [...p.fotosGerais, compressed] }));
        } else if (type === 'ai' && id) {
          setAiPhotos(p => ({ ...p, [id]: compressed }));
            }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = (type, id = null) => {
    activeUploadRef.current = { type, id };
    fileInputRef.current?.click();
  };

  const removePhoto = (questionId, idx) => {
    const photos = [...(currentData.respostas[questionId]?.fotos || [])];
    photos.splice(idx, 1);
    handleAnswerChange(questionId, 'fotos', photos);
  };

  const removeGeneralPhoto = (idx) => {
    setCurrentData(p => {
      const photos = [...p.fotosGerais];
      photos.splice(idx, 1);
      return { ...p, fotosGerais: photos };
    });
  };

  // -------------------------------------------------------------------------
  // INSPECTION ACTIONS
  // -------------------------------------------------------------------------
  const startNewInspection = () => {
    setCurrentData(blankInspection());
    setScreen('new');
  };

  const handleStartAudit = () => {
    if (!currentData.auditor.trim() || !currentData.local) {
      alert('Por favor, preencha o auditor e o local.');
      return;
    }
    setScreen('audit');
  };

  const handleAnswerChange = (questionId, field, value) => {
    setCurrentData(p => ({
      ...p,
      respostas: { ...p.respostas, [questionId]: { ...p.respostas[questionId], [field]: value } },
    }));
  };
  const handleAiAnalysis = async () => {
  const missing = Object.entries(aiPhotos).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    alert(`Fotos faltando: ${missing.join(', ')}`);
    return;
  }
  setAiLoading(true);
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_VITE_API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: aiPhotos })
    });
    if (!response.ok) throw new Error('Erro na análise');
    const result = await response.json();

    const novasRespostas = {};
    QUESTIONARIO.forEach(bloco => {
      bloco.perguntas.forEach(p => {
        const valor = result[p.id];
        if (valor) {
          novasRespostas[p.id] = {
            valor,
            obs: result.justificativas?.[p.id] || '',
            fotos: []
          };
        }
      });
    });

    setCurrentData(prev => ({ ...prev, respostas: novasRespostas }));
    setAiDone(true);
    setScreen('audit');
  } catch (err) {
    alert('Erro ao analisar fotos. Verifique a conexão.');
    console.error(err);
  } finally {
    setAiLoading(false);
  }
};

  const validateAndSummary = () => {
    const errors = [];
    let hasNonCompliant = false;
    QUESTIONARIO.forEach(bloco => {
      bloco.perguntas.forEach(p => {
        const resp = currentData.respostas[p.id];
        const isNeg = resp?.valor === 'nao_atende' || resp?.valor === 'parcial';
        if (isNeg) {
          hasNonCompliant = true;
          if (!resp?.obs?.trim())                errors.push(`"${p.texto.substring(0, 40)}...": Observação obrigatória.`);
          if (!resp?.fotos || !resp.fotos.length) errors.push(`"${p.texto.substring(0, 40)}...": Foto obrigatória.`);
        }
      });
    });
    if (!hasNonCompliant && currentData.fotosGerais.length === 0)
      errors.push('Como todos os itens atendem, é obrigatório anexar pelo menos uma Foto Geral.');
    if (errors.length > 0) { alert('Pendências:\n\n' + errors.join('\n')); return; }
    setScreen('summary');
  };

  const handleSaveInspection = async () => {
    const score       = calculateScore(currentData.respostas);
    const senseScores = calculateSenseScores(currentData.respostas);
    const area        = getAreaFromLocal(currentData.local);
    const newInsp     = { id: Date.now(), ...currentData, score, senseScores, area, timestamp: new Date().toLocaleString('pt-BR') };
    try {
      await saveInspection(newInsp);
      setInspections(p => [newInsp, ...p]);
      setScreen('home');
    } catch (err) {
      alert('Erro ao salvar inspeção. Tente novamente.');
      console.error(err);
    }
  };

  const handleDeleteInspection = async (id) => {
    if (!confirm('Excluir esta inspeção permanentemente?')) return;
    try {
      await deleteInspection(id);
      setInspections(p => p.filter(i => i.id !== id));
    } catch { alert('Erro ao excluir.'); }
  };

  // -------------------------------------------------------------------------
  // SCREEN: HOME
  // -------------------------------------------------------------------------
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="text-center space-y-2">
        <div className="bg-blue-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <ClipboardList className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{APP_NAME}</h1>
        <p className="text-slate-500">{APP_SUBTITLE}</p>
      </div>

      {loadingDB ? (
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw size={18} className="animate-spin" /> Carregando dados...
        </div>
      ) : (
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
          {inspections.length > 0 && (
            <p className="text-center text-xs text-slate-400">
              {inspections.length} inspeç{inspections.length > 1 ? 'ões salvas' : 'ão salva'} localmente
            </p>
          )}
        </div>
      )}

      <p className="fixed bottom-6 text-xs text-slate-400">v{APP_VERSION}</p>
    </div>
  );

  // -------------------------------------------------------------------------
  // SCREEN: NEW INSPECTION
  // -------------------------------------------------------------------------
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
            <input type="date" disabled value={currentData.data}
              className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Responsável</label>
            <input type="text" placeholder="Digite seu nome" value={currentData.auditor}
              onChange={e => setCurrentData({ ...currentData, auditor: e.target.value })}
              className="w-full p-3 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Local Inspecionado</label>
            <div className="relative">
              <select value={currentData.local}
                onChange={e => setCurrentData({ ...currentData, local: e.target.value })}
                className="w-full p-3 bg-white rounded-lg border border-slate-300 appearance-none focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecione um local...</option>
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
        <div className="space-y-3">
          <Button onClick={() => {
          if (!currentData.auditor.trim() || !currentData.local) {
          alert('Preencha auditor e local.');
          return;
      }
      setScreen('ai');
    }} className="w-full text-lg">
        <Search size={20} /> Analisar com IA
          </Button>
          <Button onClick={handleStartAudit} variant="secondary" className="w-full">
          Preencher manualmente
          </Button>
      </div>
</div>
    </div>
  );

  // -------------------------------------------------------------------------
  // SCREEN: AUDIT FORM
  // -------------------------------------------------------------------------
  const renderAiCapture = () => {
  const sensos = [
    { key: 'geral',    label: 'Foto Geral da Área',     desc: 'Visão ampla do ambiente' },
    { key: 'seiri',    label: 'Utilização (Seiri)',      desc: 'Itens desnecessários, organização geral' },
    { key: 'seiton',   label: 'Organização (Seiton)',    desc: 'Etiquetas, demarcações, emergência' },
    { key: 'seiso',    label: 'Limpeza (Seiso)',         desc: 'Limpeza, lixeiras, resíduos' },
    { key: 'seiketsu', label: 'Padronização (Seiketsu)', desc: 'Manutenção, produtos químicos' },
    { key: 'shitsuke', label: 'Disciplina (Shitsuke)',   desc: 'EPIs, comportamento da equipe' },
  ];
  const allPhotos = Object.values(aiPhotos).every(v => v !== null);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <input type="file" accept="image/*" capture="environment"
        ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setScreen('new')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-800 text-lg">Análise com IA</h2>
          <p className="text-xs text-slate-400">{currentData.local}</p>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            📸 Tire <strong>6 fotos</strong> da área. O Gemini vai analisar e preencher
            o formulário automaticamente. Você poderá revisar antes de salvar.
          </p>
        </Card>

        {sensos.map(({ key, label, desc }) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              {aiPhotos[key] && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
            </div>
            {aiPhotos[key] ? (
              <div className="relative w-full h-32">
                <img src={aiPhotos[key]} alt={label}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                <button onClick={() => setAiPhotos(p => ({ ...p, [key]: null }))}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => {
                activeUploadRef.current = { type: 'ai', id: key };
                fileInputRef.current?.click();
              }}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50">
                <Camera size={20} />
                <span className="text-sm">Tirar foto</span>
              </button>
            )}
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          <Button onClick={handleAiAnalysis} disabled={!allPhotos || aiLoading} className="w-full text-lg">
            {aiLoading
              ? <><RefreshCw size={20} className="animate-spin" /> Analisando...</>
              : <><Search size={20} /> Analisar com IA</>}
          </Button>
          <button onClick={() => setScreen('audit')}
            className="w-full text-sm text-slate-400 hover:text-slate-600 py-2">
            Pular e preencher manualmente
          </button>
        </div>
      </div>
    </div>
  );
};

  const renderAuditForm = () => {
    const totalQ  = QUESTIONARIO.reduce((acc, b) => acc + b.perguntas.length, 0);
    const filledQ = Object.values(currentData.respostas).filter(r => r?.valor).length;
    const progress = Math.round((filledQ / totalQ) * 100);

    return (
      <div className="min-h-screen bg-slate-100 pb-24">
        <input type="file" accept="image/*" capture="environment"
          ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setScreen('new')} className="p-1 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-600" size={20} />
            </button>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-800 text-sm">{currentData.local}</h2>
              <p className="text-xs text-slate-400">{currentData.auditor}</p>
            </div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{progress}%</div>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <div className="p-4 space-y-8 max-w-3xl mx-auto">
          {QUESTIONARIO.map((bloco, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-600 pl-3 py-1 bg-blue-50/50 rounded-r-lg">
                {bloco.fullSenso}
              </h3>
              {bloco.perguntas.map(pergunta => {
                const resp    = currentData.respostas[pergunta.id] || {};
                const isNeg   = resp.valor === 'nao_atende' || resp.valor === 'parcial';
                const showObs = isNeg || resp.obs;
                return (
                  <Card key={pergunta.id} className="p-4 md:p-6">
                    <p className="font-medium text-slate-800 mb-4">{pergunta.texto}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {OPCOES_RESPOSTA.map(op => (
                        <label key={op.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${resp.valor === op.value ? `${op.bg} border-current ring-1 ring-current` : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                            ${resp.valor === op.value ? 'border-current' : 'border-slate-300'}`}>
                            {resp.valor === op.value && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                          </div>
                          <input type="radio" name={`q_${pergunta.id}`} value={op.value}
                            checked={resp.valor === op.value}
                            onChange={() => handleAnswerChange(pergunta.id, 'valor', op.value)}
                            className="hidden" />
                          <span className={`font-medium text-sm ${resp.valor === op.value ? op.color : 'text-slate-600'}`}>
                            {op.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                      {/* Photo */}
                      <div>
                        <button onClick={() => triggerUpload('question', pergunta.id)}
                          className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-fit
                            ${isNeg && (!resp.fotos || !resp.fotos.length)
                              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                              : 'text-blue-600 hover:bg-blue-50'}`}>
                          <Camera size={18} />
                          {resp.fotos?.length > 0 ? `Fotos (${resp.fotos.length})` : 'Anexar Foto'}
                          {isNeg && <span className="text-[10px] font-bold uppercase">(Obrigatório)</span>}
                        </button>
                        {resp.fotos?.length > 0 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                            {resp.fotos.map((f, i) => (
                              <div key={i} className="relative group flex-shrink-0">
                                <img src={f} alt="Evidência" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                                <button onClick={() => removePhoto(pergunta.id, i)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Observation */}
                      {showObs && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Observação {isNeg && <span className="text-red-500">* (Obrigatório)</span>}
                          </label>
                          <textarea value={resp.obs || ''}
                            onChange={e => handleAnswerChange(pergunta.id, 'obs', e.target.value)}
                            placeholder={isNeg ? 'Descreva o problema...' : 'Observações adicionais (opcional)'}
                            className={`w-full p-3 text-sm rounded-lg border outline-none focus:ring-2
                              ${isNeg && !resp.obs?.trim()
                                ? 'border-red-300 bg-red-50 focus:ring-red-200'
                                : 'border-slate-300 bg-slate-50 focus:ring-blue-200'}`}
                            rows={2} />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}

          {/* Final card */}
          <Card className="p-6 border-l-4 border-l-blue-600">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Finalização e Sugestões</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotos Gerais do Local
                <span className="block text-xs font-normal text-slate-500 mt-1">
                  Se todos os itens atendem, ao menos uma foto geral é <strong>obrigatória</strong>.
                </span>
              </label>
              <button onClick={() => triggerUpload('general')}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center text-slate-500 hover:bg-slate-50 transition-colors">
                <Camera size={24} className="mb-2" />
                <span className="text-sm">Clique para adicionar foto geral</span>
              </button>
              {currentData.fotosGerais.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {currentData.fotosGerais.map((f, i) => (
                    <div key={i} className="relative group flex-shrink-0">
                      <img src={f} alt="Geral" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                      <button onClick={() => removeGeneralPhoto(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" /> Ações Sugeridas (Opcional)
              </label>
              <textarea value={currentData.acoesSugeridas}
                onChange={e => setCurrentData({ ...currentData, acoesSugeridas: e.target.value })}
                placeholder="Descreva sugestões de melhoria..."
                className="w-full p-3 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                rows={3} />
            </div>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="max-w-3xl mx-auto">
            <Button onClick={validateAndSummary} className="w-full text-lg">
              <CheckCircle size={20} /> Finalizar Inspeção
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // SCREEN: SUMMARY
  // -------------------------------------------------------------------------
  const renderSummary = () => {
    const score = calculateScore(currentData.respostas);
    const ncs   = [];
    QUESTIONARIO.forEach(b => b.perguntas.forEach(p => {
      const r = currentData.respostas[p.id];
      if (r?.valor === 'nao_atende' || r?.valor === 'parcial')
        ncs.push({ pergunta: p.texto, obs: r.obs, senso: b.fullSenso, valor: r.valor });
    }));

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
            <div className={`text-6xl font-bold mb-2 ${scoreColor(score)}`}>{score}%</div>
            <div className="flex justify-center gap-4 text-sm text-slate-600 mt-4 border-t pt-4">
              <div>
                <span className="block font-bold text-slate-800">{currentData.local}</span>
                <span className="text-xs">Local</span>
              </div>
              <div className="border-l pl-4">
                <span className="block font-bold text-slate-800">{formatDate(currentData.data)}</span>
                <span className="text-xs">Data</span>
              </div>
            </div>
          </Card>

          {ncs.length > 0 ? (
            <div>
              <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Itens Não Atendidos / Parciais ({ncs.length})
              </h3>
              <div className="space-y-3">
                {ncs.map((nc, idx) => (
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

          {currentData.acoesSugeridas && (
            <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
              <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">
                <Lightbulb size={14} /> Ações Sugeridas
              </h4>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{currentData.acoesSugeridas}</p>
            </Card>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Button onClick={handleSaveInspection} className="w-full text-lg">
              <Save size={20} /> Salvar Inspeção
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // SCREEN: HISTORY
  // -------------------------------------------------------------------------
  const renderHistory = () => {
    const filtered = inspections.filter(i =>
      i.local.toLowerCase().includes(historyFilter.toLowerCase()) ||
      i.auditor.toLowerCase().includes(historyFilter.toLowerCase()) ||
      i.area.toLowerCase().includes(historyFilter.toLowerCase())
    );
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setScreen('home')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="text-slate-600" />
          </button>
          <h2 className="font-semibold text-slate-800 text-lg flex-1">Histórico</h2>
          <span className="text-xs text-slate-400">{inspections.length} inspeções</span>
        </header>

        <div className="p-4 max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input type="text" placeholder="Filtrar por local, área ou auditor..."
              value={historyFilter} onChange={e => setHistoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma inspeção encontrada.</p>
              </div>
            ) : (
              filtered.map(insp => (
                <Card key={insp.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{insp.local}</h3>
                      <p className="text-xs text-slate-500">{insp.area}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-sm font-bold px-2 py-1 rounded ${scoreBadge(insp.score)}`}>
                        {insp.score}%
                      </span>
                      <button onClick={() => handleDeleteInspection(insp.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{formatDate(insp.data)}</span>
                    <span>•</span>
                    <span>{insp.auditor}</span>
                  </div>
                  {insp.senseScores && (
                    <div className="mt-3 flex gap-1">
                      {QUESTIONARIO.map(q => (
                        <div key={q.key} className="flex-1" title={`${q.senso}: ${insp.senseScores[q.key]}%`}>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBg(insp.senseScores[q.key])}`}
                              style={{ width: `${insp.senseScores[q.key]}%` }} />
                          </div>
                          <p className="text-[9px] text-slate-400 text-center mt-0.5">{q.senso.substring(0, 3)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // SCREEN: DASHBOARD
  // -------------------------------------------------------------------------
  const renderDashboard = () => {
    const isAccumulated = dashboardMonth === 'all';

    const filtered = inspections.filter(i => {
      const d = new Date(i.data + 'T12:00:00');
      if (d.getFullYear().toString() !== dashboardYear) return false;
      if (!isAccumulated && (d.getMonth() + 1).toString() !== dashboardMonth) return false;
      if (dashboardFilter !== 'Todas' && i.area !== dashboardFilter) return false;
      return true;
    });

    const avgScore = filtered.length > 0
      ? Math.round(filtered.reduce((a, i) => a + i.score, 0) / filtered.length) : 0;

    const periodLabel = isAccumulated
      ? `Acumulado ${dashboardYear}`
      : `${MONTHS.find(m => m.value === dashboardMonth)?.label} ${dashboardYear}`;

    const FiltersBar = () => (
      <div className="flex flex-col md:flex-row gap-3 items-center print:hidden bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative w-full md:w-1/3">
          <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
          <select value={dashboardFilter} onChange={e => setDashboardFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-sm font-medium text-slate-700 outline-none">
            <option value="Todas">Todas as Áreas</option>
            {Object.keys(AREAS).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
        </div>
        <div className="relative w-full md:w-1/3">
          <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
          <select value={dashboardMonth} onChange={e => setDashboardMonth(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-sm font-medium text-slate-700 outline-none">
            <option value="all">Acumulado do Ano</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
        </div>
        <div className="relative w-full md:w-1/3">
          <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">ANO</span>
          <select value={dashboardYear} onChange={e => setDashboardYear(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-sm font-medium text-slate-700 outline-none">
            {[0, 1, 2].map(offset => {
              const y = (new Date().getFullYear() - offset).toString();
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>
    );

    // General view
    if (dashboardFilter === 'Todas') {
      const areaStats = Object.keys(AREAS).map(area => {
        const ai  = filtered.filter(i => i.area === area);
        const avg = ai.length > 0 ? Math.round(ai.reduce((a, i) => a + i.score, 0) / ai.length) : 0;
        return { label: area, score: avg, count: ai.length };
      });

      return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
          <header className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 print:hidden">
            <button onClick={() => setScreen('home')} className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-600" />
            </button>
            <h2 className="font-semibold text-slate-800 text-lg flex-1">Painel de Resultados</h2>
            <button onClick={() => window.print()} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
              <Printer size={20} />
            </button>
          </header>

          <div className="p-4 max-w-5xl mx-auto">
            <FiltersBar />
            <Card className="p-8 flex flex-col items-center bg-white mb-6">
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">Nota Geral — {periodLabel}</h3>
              <div className={`text-7xl font-black ${scoreColor(avgScore, filtered.length > 0)}`}>
                {filtered.length > 0 ? `${avgScore}%` : '—'}
              </div>
              <p className="text-slate-400 text-sm mt-2">{filtered.length} inspeções realizadas</p>
            </Card>

            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-blue-600" /> Desempenho por Área
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {areaStats.map(stat => (
                <Card key={stat.label} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setDashboardFilter(stat.label)}>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1 text-sm">{stat.label}</p>
                    <p className="text-xs text-slate-400 mb-3">{stat.count} inspeções</p>
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${stat.count > 0 ? scoreColor(stat.score) : 'text-slate-300'}`}>
                      {stat.count > 0 ? `${stat.score}%` : '—'}
                    </span>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                      <div className={`h-full ${scoreBg(stat.score)}`}
                        style={{ width: `${stat.count > 0 ? stat.score : 0}%` }} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Detailed area view
    const subareas = AREAS[dashboardFilter] || [];
    const latestPerSubarea = subareas
      .map(local => filtered.filter(i => i.local === local).sort((a, b) => b.id - a.id)[0])
      .filter(Boolean);

    const renderQuestionBlock = (insp, sensoKey) => {
      const s = QUESTIONARIO.find(q => q.key === sensoKey);
      return (
        <div key={sensoKey} className="mb-4 break-inside-avoid">
          <div className={`${s.headerColor} text-white px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2`}>{s.senso}</div>
          <div className="space-y-3">
            {s.perguntas.map(p => {
              const r  = insp.respostas[p.id];
              const v  = r?.valor || 'na';
              const op = OPCOES_RESPOSTA.find(o => o.value === v);
              return (
                <div key={p.id} className="text-[10px] leading-tight border-b border-gray-100 pb-2 last:border-0">
                  <div className="text-gray-700 mb-1">{p.texto}</div>
                  <div className="flex justify-between items-start">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${op.bg} ${op.color}`}>{op.label}</span>
                    {(v === 'nao_atende' || v === 'parcial') && r?.obs && (
                      <span className="text-red-600 text-[9px] italic ml-2 text-right max-w-[60%]">Obs: {r.obs}</span>
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
      <div className="min-h-screen bg-slate-100 print:bg-white">
        <header className="bg-slate-800 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 print:hidden text-white">
          <button onClick={() => setDashboardFilter('Todas')} className="p-2 hover:bg-slate-700 rounded-full">
            <ArrowLeft className="text-white" />
          </button>
          <h2 className="font-semibold text-lg flex-1">Relatório: {dashboardFilter}</h2>
          <button onClick={() => window.print()} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full">
            <Printer size={20} />
          </button>
        </header>

        <div className="p-4 max-w-5xl mx-auto">
          <FiltersBar />

          {latestPerSubarea.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Nenhuma inspeção em {periodLabel} para {dashboardFilter}.</p>
            </div>
          ) : (
            latestPerSubarea.map(insp => (
              <div key={insp.id} className="bg-white p-8 shadow-sm mb-8 print:break-after-page relative">
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                  <div className="w-1/3">
                    <div className="text-3xl font-light text-slate-800">{periodLabel}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Relatório de Inspeção</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-xs border-l border-slate-200 pl-8">
                    <div><span className="block text-slate-400 font-bold uppercase text-[10px]">Data</span><span className="font-medium text-slate-700">{formatDate(insp.data)}</span></div>
                    <div><span className="block text-slate-400 font-bold uppercase text-[10px]">Local</span><span className="font-medium text-slate-700">{insp.local}</span></div>
                    <div><span className="block text-slate-400 font-bold uppercase text-[10px]">Área</span><span className="font-medium text-slate-700">{insp.area}</span></div>
                    <div><span className="block text-slate-400 font-bold uppercase text-[10px]">Auditor</span><span className="font-medium text-slate-700">{insp.auditor}</span></div>
                  </div>
                  <div className="w-28 text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nota</div>
                    <div className={`text-5xl font-black ${scoreColor(insp.score)}`}>{insp.score}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div>{renderQuestionBlock(insp, 'seiri')}</div>
                  <div className="pt-8">{renderQuestionBlock(insp, 'seiton')}</div>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-4 flex items-center justify-center bg-slate-100 rounded-full">
                      <span className="text-2xl font-black text-slate-400">5S</span>
                    </div>
                    <div className="w-full">{renderQuestionBlock(insp, 'seiso')}</div>
                  </div>
                  <div className="pt-8">{renderQuestionBlock(insp, 'seiketsu')}</div>
                  <div>{renderQuestionBlock(insp, 'shitsuke')}</div>
                </div>

                {insp.acoesSugeridas && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Ações Sugeridas</div>
                    <div className="text-xs text-slate-700 italic border-l-2 border-blue-200 pl-2">{insp.acoesSugeridas}</div>
                  </div>
                )}

                <div className="absolute bottom-6 left-8 right-8 border-t border-slate-200 pt-3 flex justify-between text-[10px] text-slate-400">
                  <span>{APP_NAME} — Relatório gerado automaticamente</span>
                  <span>ID: {insp.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // ROOT RENDER
  // -------------------------------------------------------------------------
  return (
    <>
      <OfflineBanner show={isOffline} />
      <div className={isOffline ? 'pt-6' : ''}>
        {screen === 'home'      && renderHome()}
        {screen === 'new'       && renderNewInspection()}
        {screen === 'audit'     && renderAuditForm()}
        {screen === 'summary'   && renderSummary()}
        {screen === 'history'   && renderHistory()}
        {screen === 'dashboard' && renderDashboard()}
        {screen === 'ai'        && renderAiCapture()}
      </div>
    </>
  );
}
