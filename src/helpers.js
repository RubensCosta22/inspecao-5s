// helpers.js — Funções utilitárias
import { AREAS, QUESTIONARIO } from './config.js';

export const calculateScore = (respostas) => {
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

export const calculateSenseScores = (respostas) => {
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

export const getAreaFromLocal = (localName) => {
  for (const [area, locais] of Object.entries(AREAS)) {
    if (locais.includes(localName)) return area;
  }
  return 'Outros';
};

export const scoreColor = (score, hasData = true) => {
  if (!hasData) return '#cbd5e1'; // slate-300
  if (score >= 80) return '#16a34a'; // green-600
  if (score >= 60) return '#ca8a04'; // yellow-600
  return '#dc2626'; // red-600
};

export const scoreBg = (score) => {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
};

// Se você usar o scoreBadge, ele precisa retornar um objeto de estilo para o Native
export const scoreBadge = (score) => {
  if (score >= 80) return { bg: '#dcfce7', text: '#15803d' };
  if (score >= 60) return { bg: '#fef9c3', text: '#a16207' };
  return { bg: '#fee2e2', text: '#b91c1c' };
};

export const formatDate = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
