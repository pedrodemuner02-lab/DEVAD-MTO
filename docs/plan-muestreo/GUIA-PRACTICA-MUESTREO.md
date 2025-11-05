# 📘 Guía Práctica de Uso - Plan de Muestreo DEVAD-MTO

## 🎯 Objetivo

Esta guía proporciona instrucciones paso a paso para implementar el plan de muestreo estadístico en el sistema DEVAD-MTO y justificar las mejoras mediante evidencia cuantitativa.

## 📋 Contenido

1. [Preparación](#1-preparación)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Fase de Línea Base](#3-fase-de-línea-base)
4. [Fase de Intervención](#4-fase-de-intervención)
5. [Fase de Medición Post-Intervención](#5-fase-de-medición-post-intervención)
6. [Análisis de Resultados](#6-análisis-de-resultados)
7. [Generación de Reportes](#7-generación-de-reportes)

---

## 1. Preparación

### 1.1 Crear la Tabla de Muestreo en Supabase

Ejecuta el siguiente script SQL en el editor de Supabase:

```sql
-- Tabla para registro de muestreo estadístico
CREATE TABLE IF NOT EXISTS muestreo_estadistico (
  id SERIAL PRIMARY KEY,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  semana_estudio INTEGER NOT NULL,
  fase VARCHAR(20) NOT NULL CHECK (fase IN ('baseline', 'intervencion', 'post')),
  equipo_id INTEGER REFERENCES equipment(id),
  turno VARCHAR(20),
  complejidad VARCHAR(10),
  
  -- KPIs medidos
  mtbf_horas DECIMAL(10,2),
  mttr_horas DECIMAL(10,2),
  oee_porcentaje DECIMAL(5,2),
  disponibilidad_porcentaje DECIMAL(5,2),
  cumplimiento_pm_porcentaje DECIMAL(5,2),
  utilizacion_operador_porcentaje DECIMAL(5,2),
  
  -- Metadatos
  observaciones TEXT,
  registrado_por VARCHAR(100),
  
  -- Índices para consultas rápidas
  CONSTRAINT semana_positiva CHECK (semana_estudio > 0)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_muestreo_fase ON muestreo_estadistico(fase);
CREATE INDEX idx_muestreo_semana ON muestreo_estadistico(semana_estudio);
CREATE INDEX idx_muestreo_equipo ON muestreo_estadistico(equipo_id);
CREATE INDEX idx_muestreo_fecha ON muestreo_estadistico(fecha_registro);

-- Configuración de muestra
CREATE TABLE IF NOT EXISTS configuracion_muestreo (
  id SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  duracion_semanas INTEGER DEFAULT 12,
  tamaño_poblacion INTEGER,
  tamaño_muestra INTEGER,
  nivel_confianza DECIMAL(3,2) DEFAULT 0.95,
  error_maximo DECIMAL(4,3) DEFAULT 0.05,
  semilla_aleatoria BIGINT,
  equipos_muestra INTEGER[] -- IDs de equipos en la muestra
);

COMMENT ON TABLE muestreo_estadistico IS 'Registros de muestreo para análisis estadístico de mejoras';
COMMENT ON TABLE configuracion_muestreo IS 'Configuración del plan de muestreo activo';
```

### 1.2 Verificar Datos Disponibles

```javascript
// En la consola del navegador o archivo test
import { supabase } from './src/lib/supabase';

// Contar equipos disponibles
const { data: equipos, error } = await supabase
  .from('equipment')
  .select('id, nombre, codigo', { count: 'exact' });

console.log(`Total de equipos: ${equipos?.length}`);
```

---

## 2. Configuración Inicial

### 2.1 Importar el Servicio de Muestreo

```javascript
import samplingService from './src/services/samplingService';
```

### 2.2 Calcular Tamaño de Muestra Requerido

```javascript
// Ejemplo: 100 equipos en total
const poblacionTotal = 100;

// Calcular tamaño de muestra (95% confianza, 5% error)
const tamañoMuestra = samplingService.calcularTamañoMuestra(
  poblacionTotal,
  0.95,  // 95% confianza
  0.05,  // 5% error
  0.5    // máxima varianza
);

console.log(`Se requieren ${tamañoMuestra} equipos en la muestra`);
// Resultado esperado: ~80 equipos
```

### 2.3 Definir Estratos

```javascript
// Definir estratos por turno
const estratosTurno = [
  { nombre: 'Mañana', tamaño: 40 },
  { nombre: 'Intermedio', tamaño: 20 },
  { nombre: 'Tarde', tamaño: 30 },
  { nombre: 'Noche', tamaño: 10 }
];

// Calcular muestra por estrato
const distribucion = samplingService.calcularMuestraEstratificada(
  tamañoMuestra,
  estratosTurno
);

console.log('Distribución por turno:', distribucion);
/*
Salida:
[
  { nombre: 'Mañana', poblacion: 40, proporcion: 0.4, muestra: 32 },
  { nombre: 'Intermedio', poblacion: 20, proporcion: 0.2, muestra: 16 },
  { nombre: 'Tarde', poblacion: 30, proporcion: 0.3, muestra: 24 },
  { nombre: 'Noche', poblacion: 10, proporcion: 0.1, muestra: 8 }
]
*/
```

### 2.4 Seleccionar Muestra Aleatoria

```javascript
// Obtener todos los equipos desde Supabase
const { data: todosEquipos } = await supabase
  .from('equipment')
  .select('*')
  .order('id');

// Seleccionar muestra pseudoaleatoria
const semilla = 12345; // Usar timestamp o valor fijo para reproducibilidad
const resultado = samplingService.seleccionarMuestraAleatoria(
  todosEquipos,
  tamañoMuestra,
  semilla
);

console.log('Muestra seleccionada:', resultado.muestra.length, 'equipos');
console.log('Índices:', resultado.indices);
console.log('Semilla usada:', resultado.semilla);

// Guardar configuración en la base de datos
const { data: config } = await supabase
  .from('configuracion_muestreo')
  .insert({
    fecha_inicio: new Date().toISOString().split('T')[0],
    duracion_semanas: 12,
    tamaño_poblacion: poblacionTotal,
    tamaño_muestra: tamañoMuestra,
    semilla_aleatoria: semilla,
    equipos_muestra: resultado.muestra.map(e => e.id)
  })
  .select()
  .single();

console.log('Configuración guardada:', config);
```

---

## 3. Fase de Línea Base

**Duración:** Semanas 1-4  
**Objetivo:** Establecer valores actuales (baseline)

### 3.1 Recolección de Datos Semanal

```javascript
async function registrarMedicionSemanal(equipoId, semana, fase = 'baseline') {
  // Simular o calcular KPIs del equipo
  const kpis = await calcularKPIsEquipo(equipoId);
  
  const { data, error } = await supabase
    .from('muestreo_estadistico')
    .insert({
      semana_estudio: semana,
      fase: fase,
      equipo_id: equipoId,
      turno: kpis.turno,
      complejidad: kpis.complejidad,
      mtbf_horas: kpis.mtbf,
      mttr_horas: kpis.mttr,
      oee_porcentaje: kpis.oee,
      disponibilidad_porcentaje: kpis.disponibilidad,
      cumplimiento_pm_porcentaje: kpis.cumplimientoPM,
      utilizacion_operador_porcentaje: kpis.utilizacionOp,
      registrado_por: 'Jefe de Mantenimiento'
    });
  
  if (error) {
    console.error('Error al registrar:', error);
    return null;
  }
  
  return data;
}

// Ejemplo: Calcular KPIs de un equipo
async function calcularKPIsEquipo(equipoId) {
  // Obtener mantenimientos del equipo en las últimas 4 semanas
  const { data: mantenimientos } = await supabase
    .from('maintenance')
    .select('*')
    .eq('equipo_id', equipoId)
    .gte('fecha_programada', new Date(Date.now() - 28*24*60*60*1000).toISOString());
  
  // Calcular MTBF, MTTR, etc.
  // (Implementación específica según lógica de negocio)
  
  return {
    turno: 'Mañana',
    complejidad: 'Media',
    mtbf: 480,
    mttr: 6,
    oee: 72,
    disponibilidad: 88,
    cumplimientoPM: 75,
    utilizacionOp: 80
  };
}
```

### 3.2 Registrar Todas las Muestras (Semanas 1-4)

```javascript
async function registrarLineaBase() {
  // Obtener configuración y muestra
  const { data: config } = await supabase
    .from('configuracion_muestreo')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  const equiposMuestra = config.equipos_muestra;
  
  // Registrar 4 semanas de baseline
  for (let semana = 1; semana <= 4; semana++) {
    console.log(`Registrando semana ${semana}...`);
    
    for (const equipoId of equiposMuestra) {
      await registrarMedicionSemanal(equipoId, semana, 'baseline');
      
      // Pequeña pausa para no saturar la BD
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✓ Semana ${semana} completada`);
  }
  
  console.log('✓ Línea base completa (4 semanas)');
}

// Ejecutar
await registrarLineaBase();
```

### 3.3 Verificar Datos de Línea Base

```javascript
async function verificarLineaBase() {
  const { data, count } = await supabase
    .from('muestreo_estadistico')
    .select('*', { count: 'exact' })
    .eq('fase', 'baseline');
  
  console.log(`Total de registros baseline: ${count}`);
  console.log(`Esperado: ${80 * 4} = 320 registros`);
  
  // Estadísticas básicas
  const mtbfValues = data.map(r => r.mtbf_horas).filter(v => v != null);
  const stats = samplingService.calcularEstadisticas(mtbfValues);
  
  console.log('Estadísticas MTBF baseline:', stats);
}

await verificarLineaBase();
```

---

## 4. Fase de Intervención

**Duración:** Semanas 5-8  
**Objetivo:** Implementar mejoras del sistema

### 4.1 Mejoras a Implementar

Durante estas 4 semanas, el equipo de desarrollo implementa:

1. ✅ **Asignación Automática Inteligente**
   - Distribución equitativa de carga
   - Consideración de complejidad

2. ✅ **Plantillas Recurrentes**
   - Generación automática de mantenimientos
   - Reducción de trabajo manual

3. ✅ **Balanceo de Carga por Turno**
   - Optimización de recursos
   - Mejor utilización de operadores

4. ✅ **Sistema de Requisiciones Optimizado**
   - Menor tiempo de espera
   - Mejor control de inventario

### 4.2 Monitoreo (Opcional)

```javascript
// Durante la intervención, puedes seguir registrando datos
// pero estos NO se usarán en el análisis final
async function registrarIntervencion() {
  const { data: config } = await supabase
    .from('configuracion_muestreo')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  const equiposMuestra = config.equipos_muestra;
  
  for (let semana = 5; semana <= 8; semana++) {
    console.log(`Semana ${semana} - Fase de intervención`);
    // Opcional: registrar datos intermedios
  }
}
```

---

## 5. Fase de Medición Post-Intervención

**Duración:** Semanas 9-12  
**Objetivo:** Medir resultados después de implementar mejoras

### 5.1 Recolección de Datos Post-Intervención

```javascript
async function registrarPostIntervencion() {
  const { data: config } = await supabase
    .from('configuracion_muestreo')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  const equiposMuestra = config.equipos_muestra;
  
  // Registrar 4 semanas post-intervención
  for (let semana = 9; semana <= 12; semana++) {
    console.log(`Registrando semana ${semana} (post)...`);
    
    for (const equipoId of equiposMuestra) {
      await registrarMedicionSemanal(equipoId, semana, 'post');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✓ Semana ${semana} completada`);
  }
  
  console.log('✓ Medición post-intervención completa');
}

await registrarPostIntervencion();
```

---

## 6. Análisis de Resultados

### 6.1 Extraer Datos para Análisis

```javascript
async function extraerDatosAnalisis(kpi = 'mtbf_horas') {
  // Datos baseline
  const { data: baseline } = await supabase
    .from('muestreo_estadistico')
    .select(kpi)
    .eq('fase', 'baseline')
    .not(kpi, 'is', null);
  
  // Datos post-intervención
  const { data: post } = await supabase
    .from('muestreo_estadistico')
    .select(kpi)
    .eq('fase', 'post')
    .not(kpi, 'is', null);
  
  return {
    baseline: baseline.map(r => r[kpi]),
    post: post.map(r => r[kpi])
  };
}
```

### 6.2 Calcular Estadísticas Comparativas

```javascript
async function analizarMejora(kpiNombre, kpiCampo, menorEsMejor = false) {
  // Extraer datos
  const datos = await extraerDatosAnalisis(kpiCampo);
  
  // Configurar KPI
  const kpiInfo = {
    nombre: kpiNombre,
    unidad: kpiCampo.includes('porcentaje') ? '%' : 'horas',
    menorEsMejor: menorEsMejor,
    meta: kpiNombre === 'MTBF' ? 720 : 
          kpiNombre === 'MTTR' ? 4 :
          kpiNombre === 'OEE' ? 85 : null
  };
  
  // Generar reporte completo
  const reporte = samplingService.generarReporteMejora(
    datos.baseline,
    datos.post,
    kpiInfo
  );
  
  console.log('='.repeat(60));
  console.log(`REPORTE DE MEJORA: ${kpiNombre}`);
  console.log('='.repeat(60));
  console.log('\n📊 LÍNEA BASE:');
  console.log(`  Media: ${reporte.lineaBase.media.toFixed(2)} ${kpiInfo.unidad}`);
  console.log(`  Desv. Est.: ${reporte.lineaBase.desviacionEstandar.toFixed(2)}`);
  console.log(`  IC 95%: [${reporte.lineaBase.intervaloConfianza.limiteInferior.toFixed(2)}, ${reporte.lineaBase.intervaloConfianza.limiteSuperior.toFixed(2)}]`);
  
  console.log('\n📈 POST-INTERVENCIÓN:');
  console.log(`  Media: ${reporte.postIntervencion.media.toFixed(2)} ${kpiInfo.unidad}`);
  console.log(`  Desv. Est.: ${reporte.postIntervencion.desviacionEstandar.toFixed(2)}`);
  console.log(`  IC 95%: [${reporte.postIntervencion.intervaloConfianza.limiteInferior.toFixed(2)}, ${reporte.postIntervencion.intervaloConfianza.limiteSuperior.toFixed(2)}]`);
  
  console.log('\n✨ MEJORA:');
  console.log(`  Porcentaje: ${reporte.mejora.porcentaje.toFixed(2)}%`);
  console.log(`  Absoluta: ${reporte.mejora.absoluta.toFixed(2)} ${kpiInfo.unidad}`);
  console.log(`  Significativa: ${reporte.mejora.pruebaEstadistica.esSignificativo ? '✓ SÍ' : '✗ NO'}`);
  console.log(`  Valor p: ${reporte.mejora.pruebaEstadistica.valorP}`);
  
  if (kpiInfo.meta) {
    console.log(`  Cumple meta (${kpiInfo.meta}): ${reporte.mejora.cumpleObjetivo ? '✓ SÍ' : '✗ NO'}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  return reporte;
}
```

### 6.3 Analizar Todos los KPIs

```javascript
async function analizarTodosKPIs() {
  const reportes = {};
  
  // MTBF (mayor es mejor)
  reportes.mtbf = await analizarMejora('MTBF', 'mtbf_horas', false);
  
  // MTTR (menor es mejor)
  reportes.mttr = await analizarMejora('MTTR', 'mttr_horas', true);
  
  // OEE (mayor es mejor)
  reportes.oee = await analizarMejora('OEE', 'oee_porcentaje', false);
  
  // Disponibilidad (mayor es mejor)
  reportes.disponibilidad = await analizarMejora('Disponibilidad', 'disponibilidad_porcentaje', false);
  
  // Cumplimiento PM (mayor es mejor)
  reportes.cumplimiento = await analizarMejora('Cumplimiento PM', 'cumplimiento_pm_porcentaje', false);
  
  // Utilización (mayor es mejor, pero no más de 90%)
  reportes.utilizacion = await analizarMejora('Utilización Operadores', 'utilizacion_operador_porcentaje', false);
  
  return reportes;
}

// Ejecutar análisis completo
const resultados = await analizarTodosKPIs();
```

---

## 7. Generación de Reportes

### 7.1 Resumen Ejecutivo

```javascript
function generarResumenEjecutivo(reportes) {
  console.log('\n' + '═'.repeat(70));
  console.log('              RESUMEN EJECUTIVO - MEJORAS IMPLEMENTADAS');
  console.log('═'.repeat(70) + '\n');
  
  const tabla = [];
  
  for (const [key, reporte] of Object.entries(reportes)) {
    tabla.push({
      KPI: reporte.kpi,
      'Antes': reporte.lineaBase.media.toFixed(2) + ' ' + reporte.unidad,
      'Después': reporte.postIntervencion.media.toFixed(2) + ' ' + reporte.unidad,
      'Mejora': reporte.mejora.porcentaje.toFixed(2) + '%',
      'Significativo': reporte.mejora.pruebaEstadistica.esSignificativo ? '✓' : '✗',
      'Cumple Meta': reporte.mejora.cumpleObjetivo !== null ? (reporte.mejora.cumpleObjetivo ? '✓' : '✗') : 'N/A'
    });
  }
  
  console.table(tabla);
  
  // Contar mejoras significativas
  const significativas = Object.values(reportes)
    .filter(r => r.mejora.pruebaEstadistica.esSignificativo).length;
  
  console.log(`\n✨ Total de mejoras estadísticamente significativas: ${significativas}/${Object.keys(reportes).length}`);
  console.log('═'.repeat(70) + '\n');
}

generarResumenEjecutivo(resultados);
```

### 7.2 Guardar Resultados en Archivo

```javascript
function exportarResultados(reportes) {
  const resultado = {
    fecha_analisis: new Date().toISOString(),
    metodologia: {
      tipo_muestreo: 'Aleatorio estratificado',
      tamaño_muestra: 80,
      nivel_confianza: 0.95,
      error_maximo: 0.05,
      periodo_baseline: 'Semanas 1-4',
      periodo_intervencion: 'Semanas 5-8',
      periodo_post: 'Semanas 9-12'
    },
    resultados: reportes
  };
  
  // En Node.js:
  // const fs = require('fs');
  // fs.writeFileSync('resultados-mejora.json', JSON.stringify(resultado, null, 2));
  
  // En navegador:
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resultados-mejora-devad-mto.json';
  a.click();
  
  console.log('✓ Resultados exportados exitosamente');
}

exportarResultados(resultados);
```

---

## 📚 Conclusión

Este plan de muestreo proporciona:

✅ **Rigor Científico**: Metodología estadística probada  
✅ **Reproducibilidad**: Secuencias pseudoaleatorias documentadas  
✅ **Validez**: Intervalos de confianza del 95%  
✅ **Justificación Cuantitativa**: Evidencia numérica de mejoras  
✅ **Trazabilidad**: Registro completo de datos y decisiones

## 🔗 Referencias Adicionales

- [PLAN-MUESTREO-ESTADISTICO.md](./PLAN-MUESTREO-ESTADISTICO.md) - Plan completo
- [samplingService.js](../../src/services/samplingService.js) - Implementación código
- [README.md](../../README.md) - Documentación general del sistema

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Pedro Demuner - DEVAD-MTO
