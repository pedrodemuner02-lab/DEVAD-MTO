/**
 * Servicio de Muestreo Estadístico
 * 
 * Implementa herramientas de ingeniería industrial para
 * muestreo pseudoaleatorio y análisis estadístico
 */

// ============================================================================
// 1. GENERADOR DE NÚMEROS PSEUDOALEATORIOS (LCG)
// ============================================================================

/**
 * Generador Congruencial Lineal (Linear Congruential Generator)
 * Implementa la fórmula: Xn+1 = (a × Xn + c) mod m
 * 
 * Parámetros recomendados por Park & Miller (1988):
 * - m = 2^31 - 1 (número primo de Mersenne)
 * - a = 48271 (multiplicador)
 * - c = 0 (incremento - genera secuencia multiplicativa)
 */
class PseudoRandomGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.current = seed;
    this.a = 48271;
    this.c = 0;
    this.m = 2147483647; // 2^31 - 1
  }

  /**
   * Genera el siguiente número aleatorio en [0, 1)
   */
  next() {
    this.current = (this.a * this.current + this.c) % this.m;
    return this.current / this.m;
  }

  /**
   * Genera un entero aleatorio en el rango [min, max]
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Reinicia el generador con una nueva semilla
   */
  reset(seed) {
    this.seed = seed;
    this.current = seed;
  }

  /**
   * Obtiene la semilla actual
   */
  getSeed() {
    return this.seed;
  }
}

// ============================================================================
// 2. CÁLCULO DE TAMAÑO DE MUESTRA
// ============================================================================

/**
 * Calcula el tamaño de muestra necesario para una población finita
 * 
 * @param {number} N - Tamaño de la población
 * @param {number} confianza - Nivel de confianza (0.90, 0.95, 0.99)
 * @param {number} error - Error máximo permitido (e.g., 0.05 para 5%)
 * @param {number} p - Proporción esperada (0.5 para máxima varianza)
 * @returns {number} - Tamaño de muestra requerido
 */
function calcularTamañoMuestra(N, confianza = 0.95, error = 0.05, p = 0.5) {
  // Valores Z según nivel de confianza
  const valoresZ = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };

  const Z = valoresZ[confianza] || 1.96;
  const q = 1 - p;
  const e = error;

  // Fórmula para población finita
  const numerador = Z * Z * p * q * N;
  const denominador = e * e * (N - 1) + Z * Z * p * q;

  return Math.ceil(numerador / denominador);
}

/**
 * Calcula el tamaño de muestra por estrato (muestreo estratificado)
 * 
 * @param {number} tamañoTotal - Tamaño total de muestra
 * @param {Array} estratos - Array de objetos {nombre, tamaño}
 * @returns {Array} - Array con tamaños por estrato
 */
function calcularMuestraEstratificada(tamañoTotal, estratos) {
  const N = estratos.reduce((sum, e) => sum + e.tamaño, 0);
  
  return estratos.map(estrato => ({
    nombre: estrato.nombre,
    poblacion: estrato.tamaño,
    proporcion: estrato.tamaño / N,
    muestra: Math.ceil((estrato.tamaño / N) * tamañoTotal)
  }));
}

// ============================================================================
// 3. SELECCIÓN DE MUESTRA ALEATORIA
// ============================================================================

/**
 * Selecciona una muestra aleatoria sin reemplazo
 * 
 * @param {Array} poblacion - Array de elementos de la población
 * @param {number} tamañoMuestra - Cantidad de elementos a seleccionar
 * @param {number} semilla - Semilla para el generador pseudoaleatorio
 * @returns {Object} - {muestra, indices, semilla}
 */
function seleccionarMuestraAleatoria(poblacion, tamañoMuestra, semilla = Date.now()) {
  if (tamañoMuestra > poblacion.length) {
    throw new Error('El tamaño de muestra no puede ser mayor que la población');
  }

  const rng = new PseudoRandomGenerator(semilla);
  const muestra = [];
  const indices = new Set();

  while (muestra.length < tamañoMuestra) {
    const indice = rng.nextInt(0, poblacion.length - 1);
    
    if (!indices.has(indice)) {
      indices.add(indice);
      muestra.push(poblacion[indice]);
    }
  }

  return {
    muestra,
    indices: Array.from(indices).sort((a, b) => a - b),
    semilla,
    fecha: new Date().toISOString()
  };
}

/**
 * Selecciona muestra estratificada
 * 
 * @param {Object} poblacionPorEstrato - {estrato1: [items], estrato2: [items], ...}
 * @param {Object} tamañosPorEstrato - {estrato1: n1, estrato2: n2, ...}
 * @param {number} semilla - Semilla para el generador
 * @returns {Object} - Resultados por estrato
 */
function seleccionarMuestraEstratificada(poblacionPorEstrato, tamañosPorEstrato, semilla = Date.now()) {
  const resultados = {};
  let semillaActual = semilla;

  for (const [estrato, poblacion] of Object.entries(poblacionPorEstrato)) {
    const tamañoMuestra = tamañosPorEstrato[estrato];
    
    if (tamañoMuestra) {
      resultados[estrato] = seleccionarMuestraAleatoria(
        poblacion,
        tamañoMuestra,
        semillaActual
      );
      
      // Cambiar semilla para cada estrato
      semillaActual = resultados[estrato].semilla + 1;
    }
  }

  return resultados;
}

// ============================================================================
// 4. ANÁLISIS ESTADÍSTICO
// ============================================================================

/**
 * Calcula estadísticas descriptivas básicas
 */
function calcularEstadisticas(datos) {
  if (!datos || datos.length === 0) {
    return null;
  }

  const n = datos.length;
  const suma = datos.reduce((acc, val) => acc + val, 0);
  const media = suma / n;

  // Varianza y desviación estándar
  const varianza = datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / (n - 1);
  const desviacionEstandar = Math.sqrt(varianza);

  // Ordenar para mediana y cuartiles
  const datosOrdenados = [...datos].sort((a, b) => a - b);
  const mediana = n % 2 === 0
    ? (datosOrdenados[n / 2 - 1] + datosOrdenados[n / 2]) / 2
    : datosOrdenados[Math.floor(n / 2)];

  return {
    n,
    media,
    mediana,
    desviacionEstandar,
    varianza,
    minimo: datosOrdenados[0],
    maximo: datosOrdenados[n - 1],
    q1: datosOrdenados[Math.floor(n * 0.25)],
    q3: datosOrdenados[Math.floor(n * 0.75)]
  };
}

/**
 * Calcula intervalo de confianza para la media
 * 
 * @param {Array} datos - Muestra de datos
 * @param {number} confianza - Nivel de confianza (0.90, 0.95, 0.99)
 * @returns {Object} - {media, errorEstandar, limiteInferior, limiteSuperior}
 */
function calcularIntervaloConfianza(datos, confianza = 0.95) {
  const stats = calcularEstadisticas(datos);
  if (!stats) return null;

  const n = stats.n;
  const errorEstandar = stats.desviacionEstandar / Math.sqrt(n);

  // Valores t críticos para diferentes niveles de confianza
  // (aproximados para n grande, usar tabla t-Student para n pequeño)
  const valoresT = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };

  // Para n < 30, usar valores más conservadores
  let tCritico = valoresT[confianza] || 1.96;
  if (n < 30) {
    // Factor de ajuste conservador para muestras pequeñas
    const SMALL_SAMPLE_ADJUSTMENT = 1.1;
    tCritico *= SMALL_SAMPLE_ADJUSTMENT;
  }

  const margenError = tCritico * errorEstandar;

  return {
    n,
    media: stats.media,
    errorEstandar,
    margenError,
    limiteInferior: stats.media - margenError,
    limiteSuperior: stats.media + margenError,
    confianza,
    interpretacion: `Con ${confianza * 100}% de confianza, la media poblacional está entre ${(stats.media - margenError).toFixed(2)} y ${(stats.media + margenError).toFixed(2)}`
  };
}

/**
 * Calcula porcentaje de mejora entre dos muestras
 */
function calcularPorcentajeMejora(valorAntes, valorDespues, menorEsMejor = false) {
  const diferencia = valorDespues - valorAntes;
  const porcentaje = (diferencia / Math.abs(valorAntes)) * 100;

  // Para KPIs donde menor es mejor (ej: MTTR)
  if (menorEsMejor) {
    return -porcentaje;
  }

  return porcentaje;
}

/**
 * Realiza prueba t para dos muestras independientes
 * Determina si hay diferencia significativa entre antes y después
 */
function pruebaT(muestraAntes, muestraDespues, alfa = 0.05) {
  const stats1 = calcularEstadisticas(muestraAntes);
  const stats2 = calcularEstadisticas(muestraDespues);

  if (!stats1 || !stats2) return null;

  // Calcular estadístico t
  const numerador = stats2.media - stats1.media;
  const denominador = Math.sqrt(
    (stats1.varianza / stats1.n) + (stats2.varianza / stats2.n)
  );
  const t = numerador / denominador;

  // Grados de libertad (aproximación de Welch)
  const gl = stats1.n + stats2.n - 2;

  // Valor crítico basado en alfa (bilateral)
  const valoresTCritico = {
    0.01: 2.576,
    0.05: 1.96,
    0.10: 1.645
  };
  const tCritico = valoresTCritico[alfa] || 1.96;

  const esSignificativo = Math.abs(t) > tCritico;

  return {
    estadisticoT: t,
    gradosLibertad: gl,
    valorP: esSignificativo ? '<0.05' : '>0.05',
    esSignificativo,
    diferenciaMedias: numerador,
    interpretacion: esSignificativo
      ? 'La diferencia es estadísticamente significativa'
      : 'No hay evidencia suficiente de diferencia significativa'
  };
}

// ============================================================================
// 5. GENERACIÓN DE REPORTE
// ============================================================================

/**
 * Genera reporte completo de análisis de mejora
 */
function generarReporteMejora(datosAntes, datosDespues, kpiInfo) {
  const statsAntes = calcularEstadisticas(datosAntes);
  const statsDespues = calcularEstadisticas(datosDespues);
  const icAntes = calcularIntervaloConfianza(datosAntes);
  const icDespues = calcularIntervaloConfianza(datosDespues);
  const prueba = pruebaT(datosAntes, datosDespues);
  const porcentajeMejora = calcularPorcentajeMejora(
    statsAntes.media,
    statsDespues.media,
    kpiInfo.menorEsMejor
  );

  return {
    kpi: kpiInfo.nombre,
    unidad: kpiInfo.unidad,
    lineaBase: {
      ...statsAntes,
      intervaloConfianza: icAntes
    },
    postIntervencion: {
      ...statsDespues,
      intervaloConfianza: icDespues
    },
    mejora: {
      porcentaje: porcentajeMejora,
      absoluta: statsDespues.media - statsAntes.media,
      pruebaEstadistica: prueba,
      cumpleObjetivo: kpiInfo.meta ? 
        (kpiInfo.menorEsMejor ? statsDespues.media <= kpiInfo.meta : statsDespues.media >= kpiInfo.meta) : 
        null
    },
    fechaReporte: new Date().toISOString()
  };
}

// ============================================================================
// 6. VALIDACIÓN DE ALEATORIEDAD
// ============================================================================

/**
 * Test de rachas para verificar aleatoriedad de la secuencia
 */
function testDeRachas(secuencia) {
  let rachas = 1;
  for (let i = 1; i < secuencia.length; i++) {
    if (secuencia[i] !== secuencia[i - 1]) {
      rachas++;
    }
  }

  const n = secuencia.length;
  const mediaEsperada = (2 * n - 1) / 3;
  const varianzaEsperada = (16 * n - 29) / 90;
  const desviacionEsperada = Math.sqrt(varianzaEsperada);

  const z = (rachas - mediaEsperada) / desviacionEsperada;
  const esAleatorio = Math.abs(z) < 1.96; // 95% confianza

  return {
    rachasObservadas: rachas,
    rachasEsperadas: mediaEsperada,
    estadisticoZ: z,
    esAleatorio,
    interpretacion: esAleatorio 
      ? 'La secuencia pasa el test de aleatoriedad'
      : 'La secuencia muestra patrones no aleatorios'
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

const samplingService = {
  // Generador
  PseudoRandomGenerator,
  
  // Cálculo de muestra
  calcularTamañoMuestra,
  calcularMuestraEstratificada,
  
  // Selección
  seleccionarMuestraAleatoria,
  seleccionarMuestraEstratificada,
  
  // Análisis
  calcularEstadisticas,
  calcularIntervaloConfianza,
  calcularPorcentajeMejora,
  pruebaT,
  
  // Reportes
  generarReporteMejora,
  
  // Validación
  testDeRachas
};

export default samplingService;
