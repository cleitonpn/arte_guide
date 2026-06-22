// Dimensões da capa (A4 paisagem a ~96dpi) usadas na renderização da referência.
export const COVER_WIDTH = 1123;
export const COVER_HEIGHT = 794;

// Paleta usada nos desenhos SVG / selos.
export const COLORS = {
  marker: '#ea580c',
  cut: '#ef4444',
  cutText: '#b91c1c',
  bleed: '#9932cc',
  hatch: '#a55eea',
  dim: '#ff0000',
};

// Parâmetros geométricos do gabarito técnico.
export const SVG = {
  // O maior lado da peça é mapeado para este número de unidades de usuário.
  scaleTarget: 1000,
  offset: 60,
  crossSize: 8,
  tickSize: 6,
  strokeThin: 1.5,
  strokeThick: 2.5,
};

// Escala de captura do html2canvas (qualidade x consumo de memória).
export const PDF_SCALE = {
  cover: 3,
  art: 4,
};
