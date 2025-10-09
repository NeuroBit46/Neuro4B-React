// Nivel helpers centralizados

export const NIVEL = {
  MuyBajo: 'MuyBajo',
  Bajo: 'Bajo',
  Medio: 'Medio',
  Alto: 'Alto',
  MuyAlto: 'MuyAlto',
};

export function getNivelKey(tscore) {
  const v = Number(tscore);
  if (!Number.isFinite(v)) return NIVEL.MuyBajo;
  if (v >= 70 && v <= 80) return NIVEL.MuyAlto;
  if (v >= 60 && v <= 69) return NIVEL.Alto;
  if (v >= 41 && v <= 59) return NIVEL.Medio;
  if (v >= 31 && v <= 40) return NIVEL.Bajo;
  return NIVEL.MuyBajo;
}

export function getNivelLabel(key) {
  return {
    [NIVEL.MuyAlto]: 'MUY ALTO',
    [NIVEL.Alto]: 'ALTO',
    [NIVEL.Medio]: 'MEDIO',
    [NIVEL.Bajo]: 'BAJO',
    [NIVEL.MuyBajo]: 'MUY BAJO',
  }[key] || '—';
}

export function getNivelColorVar(key) {
  return {
    [NIVEL.MuyAlto]: 'var(--color-very-high)',
    [NIVEL.Alto]: 'var(--color-high)',
    [NIVEL.Medio]: 'var(--color-medium)',
    [NIVEL.Bajo]: 'var(--color-low)',
    [NIVEL.MuyBajo]: 'var(--color-very-low)'
  }[key] || 'var(--color-primary)';
}

// Genera rgb(from var(--color-*) r g b / alpha)
export function alphaVar(colorVar, a) {
  if (typeof colorVar === 'string' && colorVar.startsWith('var(')) {
    return `rgb(from ${colorVar} r g b / ${a})`;
  }
  // fallback: si llega rgba/hex, devolver tal cual o intentar parseo básico
  return colorVar;
}

// Shortcut: devuelve estructuras usadas por componentes existentes
export function getColorSetFromValue(value) {
  const key = getNivelKey(value);
  const color = getNivelColorVar(key);
  return { color, background: color, key, label: getNivelLabel(key) };
}

// Devuelve el set de color para una clave de nivel (compat con código existente)
export function getColorSet(key) {
  const color = getNivelColorVar(key);
  return { color, background: color };
}

// Estilos tipicos (badge) a partir de la variable de color
export function levelStyles(colorVar, kind = 'badge') {
  const bg = alphaVar(colorVar, kind === 'badge' ? 0.18 : 0.12);
  const text = alphaVar(colorVar, 0.92);
  const border = alphaVar(colorVar, 0.40);
  return { background: bg, color: text, borderColor: border };
}
