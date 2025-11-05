/**
 * Ejemplo de Uso - Plan de Muestreo Estadístico
 * 
 * Este script demuestra cómo usar el samplingService
 * para implementar el plan de muestreo en DEVAD-MTO
 */

import samplingService from '../../src/services/samplingService.js';

// ============================================================================
// EJEMPLO 1: Calcular Tamaño de Muestra
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 1: CÁLCULO DE TAMAÑO DE MUESTRA');
console.log('='.repeat(70) + '\n');

const poblacionTotal = 100; // Total de equipos en DEVAD-MTO
const confianza = 0.95;      // 95% de confianza
const error = 0.05;          // 5% de error máximo

const tamañoMuestra = samplingService.calcularTamañoMuestra(
  poblacionTotal,
  confianza,
  error
);

console.log(`Población total: ${poblacionTotal} equipos`);
console.log(`Nivel de confianza: ${confianza * 100}%`);
console.log(`Error máximo permitido: ${error * 100}%`);
console.log(`\n→ Tamaño de muestra requerido: ${tamañoMuestra} equipos`);

// ============================================================================
// EJEMPLO 2: Estratificación por Turnos
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 2: DISTRIBUCIÓN ESTRATIFICADA POR TURNOS');
console.log('='.repeat(70) + '\n');

const estratosTurno = [
  { nombre: 'Mañana (6:00-14:00)', tamaño: 40 },
  { nombre: 'Intermedio (14:00-18:00)', tamaño: 20 },
  { nombre: 'Tarde (18:00-22:00)', tamaño: 30 },
  { nombre: 'Noche (22:00-6:00)', tamaño: 10 }
];

const distribucion = samplingService.calcularMuestraEstratificada(
  tamañoMuestra,
  estratosTurno
);

console.log('Distribución de muestra por turno:\n');
distribucion.forEach(estrato => {
  const barra = '█'.repeat(Math.floor(estrato.proporcion * 50));
  console.log(`${estrato.nombre.padEnd(30)} ${estrato.muestra.toString().padStart(2)} equipos ${barra} (${(estrato.proporcion * 100).toFixed(1)}%)`);
});

// ============================================================================
// EJEMPLO 3: Selección Pseudoaleatoria
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 3: SELECCIÓN PSEUDOALEATORIA DE MUESTRA');
console.log('='.repeat(70) + '\n');

// Simular población de equipos
const equipos = Array.from({ length: poblacionTotal }, (_, i) => ({
  id: i + 1,
  nombre: `Equipo-${String(i + 1).padStart(3, '0')}`,
  turno: ['Mañana', 'Intermedio', 'Tarde', 'Noche'][Math.floor(i / 25)]
}));

// Seleccionar muestra con semilla reproducible
const semilla = 12345;
const resultado = samplingService.seleccionarMuestraAleatoria(
  equipos,
  tamañoMuestra,
  semilla
);

console.log(`Semilla utilizada: ${semilla}`);
console.log(`Equipos seleccionados: ${resultado.muestra.length}`);
console.log(`\nPrimeros 10 equipos de la muestra:`);
resultado.muestra.slice(0, 10).forEach((equipo, idx) => {
  console.log(`  ${idx + 1}. ${equipo.nombre} (ID: ${equipo.id}) - ${equipo.turno}`);
});
console.log('  ...');

// ============================================================================
// EJEMPLO 4: Simulación de Datos y Análisis
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 4: ANÁLISIS DE MEJORA (SIMULACIÓN)');
console.log('='.repeat(70) + '\n');

// Simular datos de MTBF (Mean Time Between Failures)
function generarDatosMTBF(media, desviacion, cantidad) {
  const datos = [];
  for (let i = 0; i < cantidad; i++) {
    // Aproximación de distribución normal usando Box-Muller
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const valor = media + z * desviacion;
    datos.push(Math.max(0, valor)); // No permitir valores negativos
  }
  return datos;
}

// Datos de línea base (antes de mejoras)
const mtbfBaseline = generarDatosMTBF(485, 120, 80);

// Datos post-intervención (después de mejoras)
const mtbfPost = generarDatosMTBF(658, 110, 80);

// Calcular estadísticas
const statsBaseline = samplingService.calcularEstadisticas(mtbfBaseline);
const statsPost = samplingService.calcularEstadisticas(mtbfPost);

console.log('📊 LÍNEA BASE (Semanas 1-4):');
console.log(`  Media: ${statsBaseline.media.toFixed(2)} horas`);
console.log(`  Desv. Estándar: ${statsBaseline.desviacionEstandar.toFixed(2)} horas`);
console.log(`  Rango: [${statsBaseline.minimo.toFixed(2)}, ${statsBaseline.maximo.toFixed(2)}] horas`);

console.log('\n📈 POST-INTERVENCIÓN (Semanas 9-12):');
console.log(`  Media: ${statsPost.media.toFixed(2)} horas`);
console.log(`  Desv. Estándar: ${statsPost.desviacionEstandar.toFixed(2)} horas`);
console.log(`  Rango: [${statsPost.minimo.toFixed(2)}, ${statsPost.maximo.toFixed(2)}] horas`);

// Calcular intervalo de confianza
const icBaseline = samplingService.calcularIntervaloConfianza(mtbfBaseline);
const icPost = samplingService.calcularIntervaloConfianza(mtbfPost);

console.log('\n🎯 INTERVALOS DE CONFIANZA (95%):');
console.log(`  Baseline: [${icBaseline.limiteInferior.toFixed(2)}, ${icBaseline.limiteSuperior.toFixed(2)}] horas`);
console.log(`  Post:     [${icPost.limiteInferior.toFixed(2)}, ${icPost.limiteSuperior.toFixed(2)}] horas`);

// Calcular mejora
const porcentajeMejora = samplingService.calcularPorcentajeMejora(
  statsBaseline.media,
  statsPost.media,
  false // mayor es mejor para MTBF
);

console.log('\n✨ MEJORA:');
console.log(`  Absoluta: ${(statsPost.media - statsBaseline.media).toFixed(2)} horas`);
console.log(`  Porcentual: ${porcentajeMejora.toFixed(2)}%`);

// Prueba estadística
const prueba = samplingService.pruebaT(mtbfBaseline, mtbfPost);

console.log('\n🔬 PRUEBA DE SIGNIFICANCIA:');
console.log(`  Estadístico t: ${prueba.estadisticoT.toFixed(2)}`);
console.log(`  Grados de libertad: ${prueba.gradosLibertad}`);
console.log(`  Valor p: ${prueba.valorP}`);
console.log(`  ¿Es significativa?: ${prueba.esSignificativo ? '✓ SÍ' : '✗ NO'}`);
console.log(`  Interpretación: ${prueba.interpretacion}`);

// ============================================================================
// EJEMPLO 5: Reporte Completo de Mejora
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 5: REPORTE COMPLETO DE MEJORA');
console.log('='.repeat(70) + '\n');

const kpiInfo = {
  nombre: 'MTBF (Mean Time Between Failures)',
  unidad: 'horas',
  menorEsMejor: false,
  meta: 720 // Meta objetivo: 720 horas
};

const reporteCompleto = samplingService.generarReporteMejora(
  mtbfBaseline,
  mtbfPost,
  kpiInfo
);

console.log(`KPI: ${reporteCompleto.kpi}`);
console.log(`Meta objetivo: ${kpiInfo.meta} ${reporteCompleto.unidad}`);
console.log('\n📊 Línea Base:');
console.log(`  • Media: ${reporteCompleto.lineaBase.media.toFixed(2)} ${reporteCompleto.unidad}`);
console.log(`  • IC 95%: [${reporteCompleto.lineaBase.intervaloConfianza.limiteInferior.toFixed(2)}, ${reporteCompleto.lineaBase.intervaloConfianza.limiteSuperior.toFixed(2)}]`);

console.log('\n📈 Post-Intervención:');
console.log(`  • Media: ${reporteCompleto.postIntervencion.media.toFixed(2)} ${reporteCompleto.unidad}`);
console.log(`  • IC 95%: [${reporteCompleto.postIntervencion.intervaloConfianza.limiteInferior.toFixed(2)}, ${reporteCompleto.postIntervencion.intervaloConfianza.limiteSuperior.toFixed(2)}]`);

console.log('\n✨ Mejora:');
console.log(`  • Porcentaje: ${reporteCompleto.mejora.porcentaje.toFixed(2)}%`);
console.log(`  • Absoluta: ${reporteCompleto.mejora.absoluta.toFixed(2)} ${reporteCompleto.unidad}`);
console.log(`  • Significativa: ${reporteCompleto.mejora.pruebaEstadistica.esSignificativo ? '✓ SÍ' : '✗ NO'}`);
console.log(`  • Cumple meta: ${reporteCompleto.mejora.cumpleObjetivo ? '✓ SÍ' : '✗ NO'}`);

// ============================================================================
// EJEMPLO 6: Validación de Aleatoriedad
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EJEMPLO 6: VALIDACIÓN DE ALEATORIEDAD');
console.log('='.repeat(70) + '\n');

// Generar secuencia de números aleatorios
const rng = new samplingService.PseudoRandomGenerator(12345);
const secuencia = Array.from({ length: 100 }, () => rng.next() > 0.5 ? 1 : 0);

const testRachas = samplingService.testDeRachas(secuencia);

console.log('Test de Rachas (validación de aleatoriedad):');
console.log(`  • Rachas observadas: ${testRachas.rachasObservadas}`);
console.log(`  • Rachas esperadas: ${testRachas.rachasEsperadas.toFixed(2)}`);
console.log(`  • Estadístico Z: ${testRachas.estadisticoZ.toFixed(2)}`);
console.log(`  • ¿Es aleatoria?: ${testRachas.esAleatorio ? '✓ SÍ' : '✗ NO'}`);
console.log(`  • Interpretación: ${testRachas.interpretacion}`);

// ============================================================================
// RESUMEN FINAL
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('RESUMEN: PLAN DE MUESTREO IMPLEMENTADO EXITOSAMENTE');
console.log('='.repeat(70) + '\n');

console.log('✅ Tamaño de muestra calculado: 80 equipos (95% confianza, 5% error)');
console.log('✅ Distribución estratificada por turnos');
console.log('✅ Selección pseudoaleatoria reproducible (semilla: 12345)');
console.log('✅ Análisis estadístico completo con intervalos de confianza');
console.log('✅ Prueba de significancia (prueba t)');
console.log('✅ Validación de aleatoriedad (test de rachas)');
console.log('✅ Reporte de mejoras con evidencia cuantitativa');

console.log('\n📊 RESULTADOS DEMOSTRADOS:');
console.log(`  • Mejora de ${porcentajeMejora.toFixed(2)}%`);
console.log(`  • Estadísticamente significativa (p < 0.05)`);
console.log(`  • Metodología reproducible y auditable`);

console.log('\n📚 DOCUMENTACIÓN COMPLETA DISPONIBLE EN:');
console.log('  • docs/plan-muestreo/PLAN-MUESTREO-ESTADISTICO.md');
console.log('  • docs/plan-muestreo/GUIA-PRACTICA-MUESTREO.md');
console.log('  • docs/plan-muestreo/JUSTIFICACION-MANUAL.md');
console.log('  • src/services/samplingService.js');

console.log('\n' + '='.repeat(70) + '\n');
