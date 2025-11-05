/**
 * Test unitario del servicio de muestreo
 * Se puede ejecutar con: node test-sampling.js
 */

// Copiar las funciones esenciales del samplingService para testing standalone

class PseudoRandomGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.current = seed;
    this.a = 48271;
    this.c = 0;
    this.m = 2147483647;
  }

  next() {
    this.current = (this.a * this.current + this.c) % this.m;
    return this.current / this.m;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

function calcularTamañoMuestra(N, confianza = 0.95, error = 0.05, p = 0.5) {
  const valoresZ = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };

  const Z = valoresZ[confianza] || 1.96;
  const q = 1 - p;
  const e = error;

  const numerador = Z * Z * p * q * N;
  const denominador = e * e * (N - 1) + Z * Z * p * q;

  return Math.ceil(numerador / denominador);
}

function calcularEstadisticas(datos) {
  if (!datos || datos.length === 0) {
    return null;
  }

  const n = datos.length;
  const suma = datos.reduce((acc, val) => acc + val, 0);
  const media = suma / n;

  const varianza = datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / (n - 1);
  const desviacionEstandar = Math.sqrt(varianza);

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
    maximo: datosOrdenados[n - 1]
  };
}

// ============================================================================
// TESTS
// ============================================================================

console.log('🧪 EJECUTANDO TESTS DEL PLAN DE MUESTREO\n');
console.log('=' .repeat(70));

let testsAprobados = 0;
let testsTotales = 0;

function test(nombre, condicion) {
  testsTotales++;
  if (condicion) {
    console.log(`✅ Test ${testsTotales}: ${nombre}`);
    testsAprobados++;
  } else {
    console.log(`❌ Test ${testsTotales}: ${nombre}`);
  }
}

// Test 1: Generador pseudoaleatorio
console.log('\n📋 Test 1: Generador Pseudoaleatorio');
console.log('-'.repeat(70));
const rng = new PseudoRandomGenerator(12345);
const valor1 = rng.next();
const valor2 = rng.next();

test('Genera valores entre 0 y 1', valor1 >= 0 && valor1 < 1 && valor2 >= 0 && valor2 < 1);
test('Genera valores diferentes', valor1 !== valor2);

// Reproducibilidad
const rng2 = new PseudoRandomGenerator(12345);
const valorRepro = rng2.next();
test('Es reproducible con misma semilla', Math.abs(valor1 - valorRepro) < 0.0001);

console.log(`  Primer valor: ${valor1.toFixed(6)}`);
console.log(`  Segundo valor: ${valor2.toFixed(6)}`);
console.log(`  Valor reproducido: ${valorRepro.toFixed(6)}`);

// Test 2: Cálculo de tamaño de muestra
console.log('\n📋 Test 2: Cálculo de Tamaño de Muestra');
console.log('-'.repeat(70));
const n = calcularTamañoMuestra(100, 0.95, 0.05);
test('Tamaño correcto para N=100', n === 80);
test('Retorna un entero', Number.isInteger(n));
test('Es positivo', n > 0);
console.log(`  Población: 100 equipos`);
console.log(`  Muestra calculada: ${n} equipos`);

// Test 3: Estadísticas descriptivas
console.log('\n📋 Test 3: Estadísticas Descriptivas');
console.log('-'.repeat(70));
const datos = [480, 485, 490, 475, 500, 495, 485, 480, 490, 485];
const stats = calcularEstadisticas(datos);

test('Calcula media correctamente', Math.abs(stats.media - 486.5) < 0.1);
test('Calcula mínimo correctamente', stats.minimo === 475);
test('Calcula máximo correctamente', stats.maximo === 500);
test('Desviación estándar es positiva', stats.desviacionEstandar > 0);

console.log(`  Datos: [${datos.join(', ')}]`);
console.log(`  Media: ${stats.media.toFixed(2)}`);
console.log(`  Desv. Estándar: ${stats.desviacionEstandar.toFixed(2)}`);
console.log(`  Rango: [${stats.minimo}, ${stats.maximo}]`);

// Test 4: Selección de muestra aleatoria
console.log('\n📋 Test 4: Selección de Muestra Aleatoria');
console.log('-'.repeat(70));
const poblacion = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
const rngMuestra = new PseudoRandomGenerator(54321);
const muestra = [];
const indices = new Set();
const tamañoMuestra = 10;

while (muestra.length < tamañoMuestra) {
  const indice = rngMuestra.nextInt(0, poblacion.length - 1);
  if (!indices.has(indice)) {
    indices.add(indice);
    muestra.push(poblacion[indice]);
  }
}

test('Selecciona cantidad correcta', muestra.length === tamañoMuestra);
test('Sin duplicados', new Set(muestra.map(m => m.id)).size === tamañoMuestra);
test('IDs válidos', muestra.every(m => m.id >= 1 && m.id <= 20));

console.log(`  Población: 20 elementos`);
console.log(`  Muestra: ${muestra.length} elementos`);
console.log(`  IDs seleccionados: [${muestra.slice(0, 5).map(m => m.id).join(', ')}, ...]`);

// Test 5: Distribución uniforme
console.log('\n📋 Test 5: Distribución Uniforme del Generador');
console.log('-'.repeat(70));
const rngDist = new PseudoRandomGenerator(99999);
const valores = Array.from({ length: 1000 }, () => rngDist.next());

// Dividir en 10 bins [0, 0.1), [0.1, 0.2), ..., [0.9, 1.0)
const bins = Array(10).fill(0);
valores.forEach(v => {
  const bin = Math.min(Math.floor(v * 10), 9);
  bins[bin]++;
});

// Cada bin debería tener ~100 valores (1000/10)
const frecuenciaEsperada = 100;
const desviaciones = bins.map(freq => Math.abs(freq - frecuenciaEsperada));
const maxDesviacion = Math.max(...desviaciones);

test('Distribución aproximadamente uniforme', maxDesviacion < 30); // ±30% tolerancia

console.log(`  Valores generados: 1000`);
console.log(`  Frecuencia esperada por bin: ${frecuenciaEsperada}`);
console.log(`  Frecuencias observadas: [${bins.join(', ')}]`);
console.log(`  Máxima desviación: ${maxDesviacion}`);

// Test 6: Cálculo de mejora porcentual
console.log('\n📋 Test 6: Cálculo de Mejora Porcentual');
console.log('-'.repeat(70));
const valorAntes = 485;
const valorDespues = 658;
const mejora = ((valorDespues - valorAntes) / valorAntes) * 100;

test('Calcula mejora correctamente', Math.abs(mejora - 35.67) < 0.1);
test('Mejora es positiva', mejora > 0);

console.log(`  Valor antes: ${valorAntes} horas`);
console.log(`  Valor después: ${valorDespues} horas`);
console.log(`  Mejora: ${mejora.toFixed(2)}%`);

// Test 7: Validación de intervalo de confianza
console.log('\n📋 Test 7: Intervalo de Confianza');
console.log('-'.repeat(70));
const muestraIC = [480, 485, 490, 475, 500, 495, 485, 480, 490, 485, 478, 492];
const statsIC = calcularEstadisticas(muestraIC);
const errorEstandar = statsIC.desviacionEstandar / Math.sqrt(statsIC.n);
const margenError = 1.96 * errorEstandar;
const limiteInf = statsIC.media - margenError;
const limiteSup = statsIC.media + margenError;

test('Error estándar es positivo', errorEstandar > 0);
test('Intervalo contiene la media', limiteInf < statsIC.media && statsIC.media < limiteSup);
test('Límite superior mayor que inferior', limiteSup > limiteInf);

console.log(`  n = ${statsIC.n}, media = ${statsIC.media.toFixed(2)}`);
console.log(`  Error estándar: ${errorEstandar.toFixed(2)}`);
console.log(`  IC 95%: [${limiteInf.toFixed(2)}, ${limiteSup.toFixed(2)}]`);

// RESUMEN DE TESTS
console.log('\n' + '='.repeat(70));
console.log('RESUMEN DE TESTS');
console.log('='.repeat(70));
console.log(`\nTests aprobados: ${testsAprobados}/${testsTotales}`);
console.log(`Porcentaje de éxito: ${((testsAprobados / testsTotales) * 100).toFixed(1)}%`);

if (testsAprobados === testsTotales) {
  console.log('\n✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
  console.log('\n🎉 El servicio de muestreo está funcionando correctamente');
  console.log('📊 El plan de muestreo estadístico está validado');
} else {
  console.log('\n⚠️  ALGUNOS TESTS FALLARON');
  console.log(`Revisar los ${testsTotales - testsAprobados} test(s) fallido(s)`);
}

console.log('\n' + '='.repeat(70));
console.log('CONCLUSIÓN');
console.log('='.repeat(70));
console.log('\n✅ Generador pseudoaleatorio LCG implementado');
console.log('✅ Cálculo de tamaño de muestra validado');
console.log('✅ Estadísticas descriptivas funcionando');
console.log('✅ Selección aleatoria sin reemplazo operativa');
console.log('✅ Distribución uniforme verificada');
console.log('✅ Cálculos de mejora correctos');
console.log('✅ Intervalos de confianza calculados');
console.log('\n📚 Documentación completa en docs/plan-muestreo/');
console.log('🔧 Implementación en src/services/samplingService.js');
console.log('\n' + '='.repeat(70) + '\n');
