import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  TextInput, Image, Alert, ActivityIndicator, SafeAreaView,
  StatusBar, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ícones específicos para Native
import {
  Camera, Save, ClipboardList, History, ArrowLeft, CheckCircle,
  AlertTriangle, Search, Trash2, Plus, FileText,
  ChevronDown, LayoutDashboard, PieChart, Printer, Filter,
  Calendar, Lightbulb, WifiOff, RefreshCw, X
} from 'lucide-react-native';

// Seus arquivos de configuração (mantenha como estão)
import { APP_NAME, APP_SUBTITLE, APP_VERSION, AREAS, MONTHS, QUESTIONARIO, OPCOES_RESPOSTA } from './config.js';
import { calculateScore, calculateSenseScores, getAreaFromLocal, scoreColor, scoreBg, scoreBadge, formatDate } from './helpers.js';

// ---------------------------------------------------------------------------
// COMPONENTES DE UI NATIVOS (Substituem os HTML)
// ---------------------------------------------------------------------------

const Button = ({ children, onClick, variant = 'primary', disabled = false, style = {} }) => {
  const bgColor = variant === 'primary' ? '#1d4ed8' : variant === 'danger' ? '#dc2626' : '#fff';
  const textColor = variant === 'secondary' ? '#1d4ed8' : '#fff';
  const borderColor = variant === 'secondary' ? '#bfdbfe' : 'transparent';

  return (
    <TouchableOpacity 
      onPress={onClick} 
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bgColor, borderColor, borderWidth: variant === 'secondary' ? 1 : 0 }, style, disabled && { opacity: 0.5 }]}
    >
      <View style={styles.btnContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const Card = ({ children, style = {} }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// ---------------------------------------------------------------------------
// APP PRINCIPAL
// ---------------------------------------------------------------------------

export default function App() {
  const [screen, setScreen] = useState('home');
  const [inspections, setInspections] = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [currentData, setCurrentData] = useState(blankInspection());
  const [aiPhotos, setAiPhotos] = useState({ geral: null, seiri: null, seiton: null, seiso: null, seiketsu: null, shitsuke: null });
  const [aiLoading, setAiLoading] = useState(false);

  function blankInspection() {
    return {
      auditor: '',
      local: '',
      data: new Date().toISOString().split('T')[0],
      respostas: {},
      acoesSugeridas: '',
      fotosGerais: [],
    };
  }

  // Carregar dados usando AsyncStorage (substitui IndexedDB no Mobile)
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('@inspections');
        if (saved) setInspections(JSON.parse(saved));
      } catch (e) { console.error(e); }
      finally { setLoadingDB(false); }
    };
    loadData();
  }, []);

  // Salvar no AsyncStorage
  const saveToStorage = async (newList) => {
    try {
      await AsyncStorage.setItem('@inspections', JSON.stringify(newList));
    } catch (e) { console.error(e); }
  };

  // -------------------------------------------------------------------------
  // CAPTURA E COMPRESSÃO DE FOTOS NATIVA
  // -------------------------------------------------------------------------
  const takePhoto = async (type, id = null) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      // Comprimir imagem
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const base64Img = `data:image/jpeg;base64,${manipResult.base64}`;

      if (type === 'ai') {
        setAiPhotos(prev => ({ ...prev, [id]: base64Img }));
      } else if (type === 'question') {
        const prev = currentData.respostas[id]?.fotos || [];
        handleAnswerChange(id, 'fotos', [...prev, base64Img]);
      } else if (type === 'general') {
        setCurrentData(p => ({ ...p, fotosGerais: [...p.fotosGerais, base64Img] }));
      }
    }
  };

  const handleAnswerChange = (questionId, field, value) => {
    setCurrentData(p => ({
      ...p,
      respostas: { ...p.respostas, [questionId]: { ...p.respostas[questionId], [field]: value } },
    }));
  };

  const handleSaveInspection = async () => {
    const score = calculateScore(currentData.respostas);
    const senseScores = calculateSenseScores(currentData.respostas);
    const area = getAreaFromLocal(currentData.local);
    const newInsp = { id: Date.now(), ...currentData, score, senseScores, area, timestamp: new Date().toLocaleString('pt-BR') };
    
    const newList = [newInsp, ...inspections];
    setInspections(newList);
    await saveToStorage(newList);
    setScreen('home');
  };

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO DE TELAS (EXEMPLO HOME)
  // -------------------------------------------------------------------------

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.homeContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <ClipboardList color="white" size={40} />
            </View>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>{APP_SUBTITLE}</Text>
          </View>

          <Button onClick={() => setScreen('new')} style={{ marginBottom: 12 }}>
            <Plus color="white" size={20} />
            <Text style={styles.btnText}>Nova Inspeção</Text>
          </Button>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button variant="secondary" onClick={() => setScreen('dashboard')} style={{ flex: 1 }}>
              <LayoutDashboard color="#1d4ed8" size={18} />
              <Text style={styles.btnTextSec}>Painel</Text>
            </Button>
            <Button variant="secondary" onClick={() => setScreen('history')} style={{ flex: 1 }}>
              <History color="#1d4ed8" size={18} />
              <Text style={styles.btnTextSec}>Histórico</Text>
            </Button>
          </View>

          <Text style={styles.version}>v{APP_VERSION}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render para a tela de Auditoria (Formulário)
  if (screen === 'audit') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('new')}>
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auditoria 5S</Text>
        </View>
        <ScrollView style={{ padding: 15 }}>
          {QUESTIONARIO.map((bloco, bIdx) => (
            <View key={bIdx} style={{ marginBottom: 25 }}>
              <Text style={styles.sectionTitle}>{bloco.fullSenso}</Text>
              {bloco.perguntas.map((p) => {
                const resp = currentData.respostas[p.id] || {};
                return (
                  <Card key={p.id} style={{ padding: 15, marginBottom: 10 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 10 }}>{p.texto}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                      {OPCOES_RESPOSTA.map(op => (
                        <TouchableOpacity 
                          key={op.value}
                          onPress={() => handleAnswerChange(p.id, 'valor', op.value)}
                          style={[styles.optionBtn, resp.valor === op.value && { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}
                        >
                          <Text style={{ fontSize: 12 }}>{op.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity 
                      onPress={() => takePhoto('question', p.id)}
                      style={styles.photoTrigger}
                    >
                      <Camera color="#3b82f6" size={20} />
                      <Text style={{ color: '#3b82f6', marginLeft: 8 }}>
                        {resp.fotos?.length > 0 ? `Fotos (${resp.fotos.length})` : 'Tirar Foto'}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ))}
          <Button onClick={() => setScreen('summary')} style={{ marginVertical: 30 }}>
            <CheckCircle color="white" size={20} />
            <Text style={styles.btnText}>Finalizar</Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Se estiver em outra tela, exibe botão de volta simples para debug
  return (
    <SafeAreaView style={styles.container}>
       <Text style={{ textAlign: 'center', marginTop: 50 }}>Tela {screen} em construção Nativa...</Text>
       <Button onClick={() => setScreen('home')}><Text>Voltar Home</Text></Button>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// ESTILOS (Substituem as classes Tailwind)
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContent: { padding: 30, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: { backgroundColor: '#1d4ed8', width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 15 },
  subtitle: { color: '#64748b' },
  btn: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20, elevation: 2 },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  btnTextSec: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  header: { padding: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 10, backgroundColor: '#eff6ff', padding: 8, borderRadius: 5 },
  optionBtn: { padding: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, minWidth: '48%' },
  photoTrigger: { flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: '#f0f9ff', padding: 10, borderRadius: 8 },
  version: { position: 'absolute', bottom: 20, color: '#94a3b8', fontSize: 12 }
});
