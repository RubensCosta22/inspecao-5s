import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, Alert, ActivityIndicator, SafeAreaView,
  StatusBar, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ícones específicos para Native
import {
  Camera, ClipboardList, History, ArrowLeft, CheckCircle,
  AlertTriangle, Search, Trash2, Plus, 
  ChevronDown, LayoutDashboard, Lightbulb, RefreshCw, X
} from 'lucide-react-native';

// Importações do seu projeto (config.js e helpers.js devem estar na mesma pasta src)
import { APP_NAME, APP_SUBTITLE, APP_VERSION, AREAS, QUESTIONARIO, OPCOES_RESPOSTA } from './config.js';
import { calculateScore, calculateSenseScores, getAreaFromLocal, scoreColor, scoreBg } from './helpers.js';

// ---------------------------------------------------------------------------
// UI COMPONENTS
// ---------------------------------------------------------------------------

const Button = ({ children, onClick, variant = 'primary', disabled = false, style = {} }) => {
  const bgColor = variant === 'primary' ? '#1d4ed8' : variant === 'danger' ? '#dc2626' : '#fff';
  const borderColor = variant === 'secondary' ? '#bfdbfe' : 'transparent';
  
  return (
    <TouchableOpacity 
      onPress={onClick} 
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bgColor, borderColor, borderWidth: variant === 'secondary' ? 1 : 0 }, style, disabled && { opacity: 0.5 }]}
    >
      <View style={styles.btnContent}>
        {typeof children === 'string' ? (
          <Text style={variant === 'secondary' ? styles.btnTextSec : styles.btnText}>{children}</Text>
        ) : (
          children
        )}
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
// MAIN APP
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

  const saveToStorage = async (newList) => {
    try {
      await AsyncStorage.setItem('@inspections', JSON.stringify(newList));
    } catch (e) { console.error(e); }
  };

  const takePhoto = async (type, id = null) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erro", "Acesso à câmera negado.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
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
      }
    }
  };

  const handleAnswerChange = (questionId, field, value) => {
    setCurrentData(p => ({
      ...p,
      respostas: { ...p.respostas, [questionId]: { ...p.respostas[questionId], [field]: value } },
    }));
  };

  const handleAiAnalysis = async () => {
    const missing = Object.entries(aiPhotos).filter(([k, v]) => !v);
    if (missing.length > 0) {
      Alert.alert("Fotos Faltando", "Por favor, tire todas as 6 fotos solicitadas.");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: aiPhotos })
      });

      if (!response.ok) throw new Error('Falha na comunicação com o Gemini');
      
      const result = await response.json();
      const novasRespostas = {};

      QUESTIONARIO.forEach(bloco => {
        bloco.perguntas.forEach(p => {
          if (result[p.id]) {
            novasRespostas[p.id] = {
              valor: result[p.id],
              obs: result.justificativas?.[p.id] || '',
              fotos: []
            };
          }
        });
      });

      setCurrentData(prev => ({ ...prev, respostas: novasRespostas }));
      setScreen('audit');
    } catch (err) {
      Alert.alert("Erro na IA", "Não foi possível analisar as fotos agora.");
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // SCREENS
  // -------------------------------------------------------------------------

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.homeContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <ClipboardList color="white" size={40} />
            </View>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>{APP_SUBTITLE}</Text>
          </View>

          <Button onClick={() => setScreen('new')} style={{ width: '100%', marginBottom: 15 }}>
            <Plus color="white" size={20} />
            <Text style={styles.btnText}>Nova Inspeção</Text>
          </Button>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button variant="secondary" onClick={() => setScreen('history')} style={{ flex: 1 }}>
              <History color="#1d4ed8" size={18} />
              <Text style={styles.btnTextSec}>Histórico</Text>
            </Button>
          </View>
          <Text style={styles.version}>v{APP_VERSION}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'audit') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('home')}>
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auditoria em {currentData.local || 'Local'}</Text>
        </View>
        <ScrollView style={{ padding: 15 }}>
          {QUESTIONARIO.map((bloco, bIdx) => (
            <View key={bIdx} style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>{bloco.fullSenso}</Text>
              {bloco.perguntas.map((p) => {
                const resp = currentData.respostas[p.id] || {};
                return (
                  <Card key={p.id} style={{ padding: 15, marginBottom: 12 }}>
                    <Text style={{ fontWeight: '700', color: '#1e293b', marginBottom: 10 }}>{p.texto}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {OPCOES_RESPOSTA.map(op => (
                        <TouchableOpacity 
                          key={op.value}
                          onPress={() => handleAnswerChange(p.id, 'valor', op.value)}
                          style={[styles.optionBtn, resp.valor === op.value && { backgroundColor: '#dbeafe', borderColor: '#2563eb' }]}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '600' }}>{op.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          ))}
          <Button onClick={() => setScreen('home')} style={{ marginBottom: 40 }}>
            <Save color="white" size={20} />
            <Text style={styles.btnText}>Salvar Localmente</Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback para telas em desenvolvimento
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {aiLoading ? <ActivityIndicator size="large" color="#1d4ed8" /> : (
          <>
            <Text style={{ marginBottom: 20 }}>Módulo IA ou Configuração pendente.</Text>
            <Button onClick={() => setScreen('home')}>Voltar ao Início</Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContent: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoBox: { backgroundColor: '#1d4ed8', width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginTop: 15 },
  subtitle: { color: '#64748b', fontSize: 16 },
  btn: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  btnTextSec: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  header: { padding: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 12, textTransform: 'uppercase' },
  optionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  version: { position: 'absolute', bottom: 20, color: '#94a3b8', fontSize: 12 }
});

