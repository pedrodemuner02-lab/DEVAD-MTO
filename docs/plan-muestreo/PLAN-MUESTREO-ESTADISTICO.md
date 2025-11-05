# 📊 Plan de Muestreo Estadístico - Sistema DEVAD-MTO

## 1. Introducción

Este documento establece el **plan de muestreo estadístico** para el Sistema de Mantenimiento Industrial DEVAD-MTO, utilizando herramientas de ingeniería industrial para justificar las mejoras propuestas en el sistema.

### 1.1 Objetivo General

Establecer una metodología de muestreo pseudoaleatorio que permita acercarnos al valor real esperado de los indicadores de mantenimiento, proporcionando evidencia cuantitativa para justificar el porcentaje de mejora alcanzado.

### 1.2 Objetivos Específicos

1. Determinar el tamaño de muestra óptimo para cada indicador clave
2. Implementar secuencias de muestreo pseudoaleatorio
3. Establecer líneas base (baseline) para medición de mejoras
4. Calcular intervalos de confianza para estimaciones
5. Documentar mejoras con evidencia estadística

## 2. Marco Teórico

### 2.1 Muestreo Aleatorio Simple (MAS)

El muestreo aleatorio simple es la técnica fundamental donde cada elemento de la población tiene la misma probabilidad de ser seleccionado.

**Fórmula del tamaño de muestra:**

```
n = (Z² × p × q × N) / (e² × (N-1) + Z² × p × q)

Donde:
- n = Tamaño de la muestra
- Z = Nivel de confianza (1.96 para 95%)
- p = Probabilidad de éxito (0.5 para máxima varianza)
- q = 1 - p
- N = Tamaño de la población
- e = Error máximo permitido (0.05 para 5%)
```

### 2.2 Muestreo Estratificado

Cuando la población se divide en estratos homogéneos (turnos, tipos de equipos, complejidad):

```
ni = n × (Ni / N)

Donde:
- ni = Muestra del estrato i
- n = Tamaño total de muestra
- Ni = Tamaño del estrato i
- N = Tamaño total de población
```

### 2.3 Generador de Números Pseudoaleatorios

Utilizaremos el **Generador Congruencial Lineal (LCG)**:

```
Xn+1 = (a × Xn + c) mod m

Parámetros recomendados:
- m = 2^31 - 1 (módulo primo)
- a = 48271 (multiplicador)
- c = 0 (incremento)
- X0 = semilla (timestamp o valor inicial)
```

## 3. Indicadores Clave de Rendimiento (KPI)

### 3.1 Indicadores a Medir

| Indicador | Descripción | Unidad | Meta |
|-----------|-------------|--------|------|
| **MTBF** | Mean Time Between Failures | Horas | ≥ 720h |
| **MTTR** | Mean Time To Repair | Horas | ≤ 4h |
| **OEE** | Overall Equipment Effectiveness | % | ≥ 85% |
| **Disponibilidad** | Uptime del equipo | % | ≥ 95% |
| **Cumplimiento PM** | Mantenimientos preventivos a tiempo | % | ≥ 90% |
| **Utilización Operadores** | Carga de trabajo balanceada | % | 70-90% |

### 3.2 Estratificación

**Estratos identificados:**

1. **Por Turno:**
   - Mañana (6:00-14:00)
   - Intermedio (14:00-18:00)
   - Tarde (18:00-22:00)
   - Noche (22:00-6:00)

2. **Por Complejidad:**
   - Baja (1 punto)
   - Media (2 puntos)
   - Alta (3 puntos)

3. **Por Tipo de Mantenimiento:**
   - Preventivo
   - Correctivo
   - Predictivo

## 4. Diseño del Plan de Muestreo

### 4.1 Población Objetivo

- **N equipos** registrados en el sistema
- **Período de estudio:** 12 semanas (3 meses)
- **Frecuencia de muestreo:** Semanal

### 4.2 Tamaño de Muestra

Para una población de 100 equipos:

```
Parámetros:
- N = 100 equipos
- Z = 1.96 (95% confianza)
- p = 0.5 (máxima varianza)
- e = 0.05 (5% error)

Cálculo:
n = (1.96² × 0.5 × 0.5 × 100) / (0.05² × 99 + 1.96² × 0.5 × 0.5)
n = (3.8416 × 0.25 × 100) / (0.0025 × 99 + 0.9604)
n = 96.04 / (0.2475 + 0.9604)
n = 96.04 / 1.2079
n ≈ 80 equipos
```

**Resultado:** Se requiere una muestra de **80 equipos** para 95% de confianza y 5% de error.

### 4.3 Asignación por Estrato (Ejemplo)

Si tenemos 4 turnos con distinta cantidad de operadores:

| Turno | Población (Ni) | Proporción | Muestra (ni) |
|-------|---------------|------------|--------------|
| Mañana | 40 | 40% | 32 |
| Intermedio | 20 | 20% | 16 |
| Tarde | 30 | 30% | 24 |
| Noche | 10 | 10% | 8 |
| **Total** | **100** | **100%** | **80** |

### 4.4 Secuencia de Muestreo Pseudoaleatorio

**Algoritmo:**

1. Listar todos los equipos con ID único
2. Generar números pseudoaleatorios usando LCG
3. Normalizar a rango [0, N-1]
4. Seleccionar equipos sin reemplazo
5. Distribuir por estrato según proporción

**Ejemplo de secuencia (semilla = 12345):**

```
Semilla: 12345
Iteración 1: X1 = (48271 × 12345 + 0) mod 2147483647 = 596004315
  → Normalizado: 596004315 / 2147483647 = 0.2775
  → Equipo: floor(0.2775 × 100) = 27

Iteración 2: X2 = (48271 × 596004315 + 0) mod 2147483647 = 1208109060
  → Normalizado: 0.5626
  → Equipo: 56

... continuar hasta obtener 80 equipos únicos
```

## 5. Metodología de Medición

### 5.1 Línea Base (Baseline)

**Período:** Primeras 4 semanas (mes 1)

Registrar valores actuales de cada KPI:

| KPI | Valor Actual | Objetivo | Mejora Esperada |
|-----|--------------|----------|-----------------|
| MTBF | 480h | 720h | +50% |
| MTTR | 6h | 4h | -33% |
| OEE | 72% | 85% | +18% |
| Disponibilidad | 88% | 95% | +8% |
| Cumplimiento PM | 75% | 90% | +20% |

### 5.2 Fase de Intervención

**Período:** Semanas 5-8 (mes 2)

Implementar mejoras del sistema:
- Asignación automática inteligente
- Plantillas recurrentes
- Balanceo de carga
- Requisiciones optimizadas

### 5.3 Fase de Medición Post-Intervención

**Período:** Semanas 9-12 (mes 3)

Medir nuevamente los KPI en la muestra seleccionada.

## 6. Análisis Estadístico

### 6.1 Estimación del Parámetro Poblacional

**Media muestral:**
```
x̄ = (Σ xi) / n
```

**Error estándar:**
```
SE = s / √n

Donde s es la desviación estándar muestral
```

**Intervalo de confianza (95%):**
```
IC = x̄ ± (t × SE)

Donde t es el valor crítico de la distribución t-Student
Para n=80, gl=79: t ≈ 1.99
```

### 6.2 Prueba de Hipótesis (Mejora Significativa)

**H0:** μdespués ≤ μantes (No hay mejora)  
**H1:** μdespués > μantes (Hay mejora significativa)

**Estadístico de prueba:**
```
t = (x̄después - x̄antes) / √(s₁²/n₁ + s₂²/n₂)
```

**Criterio:** Si t > tcrítico, rechazar H0 (mejora significativa al 95%)

### 6.3 Cálculo del Porcentaje de Mejora

```
% Mejora = ((Valor_Nuevo - Valor_Anterior) / Valor_Anterior) × 100
```

**Ejemplo para MTBF:**
```
Antes: 480h
Después: 650h
% Mejora = ((650 - 480) / 480) × 100 = 35.42%
```

## 7. Cronograma de Muestreo

| Semana | Actividad | Muestra | Responsable |
|--------|-----------|---------|-------------|
| 1-4 | Línea Base | 80 equipos × 4 semanas | Jefe Mantenimiento |
| 5-8 | Implementación | - | Equipo Desarrollo |
| 9-12 | Post-Medición | 80 equipos × 4 semanas | Jefe Mantenimiento |
| 13 | Análisis Estadístico | - | Analista Industrial |
| 14 | Reporte Final | - | Gerencia |

## 8. Formato de Registro de Datos

### 8.1 Hoja de Registro Semanal

```
REGISTRO DE MUESTREO - Semana: ___  Fecha: ________

Equipo ID: _____  Turno: _______  Complejidad: ______

KPI                    | Valor | Observaciones
-----------------------|-------|---------------
MTBF (horas)          |       |
MTTR (horas)          |       |
OEE (%)               |       |
Disponibilidad (%)    |       |
Cumplimiento PM (%)   |       |
Utilización Op (%)    |       |

Registrado por: ________________  Firma: __________
```

### 8.2 Base de Datos

Crear tabla en Supabase:

```sql
CREATE TABLE muestreo_estadistico (
  id SERIAL PRIMARY KEY,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  semana_estudio INTEGER,
  fase VARCHAR(20), -- 'baseline', 'intervencion', 'post'
  equipo_id INTEGER REFERENCES equipment(id),
  turno VARCHAR(20),
  complejidad VARCHAR(10),
  mtbf_horas DECIMAL(10,2),
  mttr_horas DECIMAL(10,2),
  oee_porcentaje DECIMAL(5,2),
  disponibilidad_porcentaje DECIMAL(5,2),
  cumplimiento_pm_porcentaje DECIMAL(5,2),
  utilizacion_operador_porcentaje DECIMAL(5,2),
  observaciones TEXT
);
```

## 9. Generador de Secuencias Pseudoaleatorias

### 9.1 Implementación en JavaScript

Ver archivo: `src/services/samplingService.js`

```javascript
// Generador Congruencial Lineal (LCG)
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
    return this.current / this.m; // Normaliza a [0,1)
  }
  
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
```

### 9.2 Selección de Muestra

```javascript
function seleccionarMuestraAleatoria(poblacion, tamañoMuestra, semilla) {
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
  
  return muestra;
}
```

## 10. Ejemplo Práctico

### 10.1 Caso de Estudio: MTBF

**Situación inicial:**
- Población: 100 equipos
- MTBF promedio: 480 horas
- Desviación estándar: 120 horas

**Muestra seleccionada:** 80 equipos (pseudoaleatorio)

**Línea base (Semanas 1-4):**
- MTBF promedio muestral: 485 horas
- Error estándar: 120/√80 = 13.4 horas
- IC 95%: 485 ± (1.99 × 13.4) = [458.3, 511.7] horas

**Post-intervención (Semanas 9-12):**
- MTBF promedio muestral: 658 horas
- Error estándar: 110/√80 = 12.3 horas
- IC 95%: 658 ± (1.99 × 12.3) = [633.5, 682.5] horas

**Mejora calculada:**
```
% Mejora = ((658 - 485) / 485) × 100 = 35.67%
```

**Prueba de hipótesis:**
```
t = (658 - 485) / √(120²/80 + 110²/80) = 173 / 16.87 = 10.26
tcrítico (0.05, 158 gl) ≈ 1.65

Como 10.26 > 1.65: Rechazamos H0
Conclusión: La mejora es estadísticamente significativa (p < 0.001)
```

## 11. Validación y Control de Calidad

### 11.1 Verificación de Aleatoriedad

**Test de rachas (runs test):**
- Verificar que la secuencia no tenga patrones
- Contar rachas de números ascendentes/descendentes
- Comparar con distribución esperada

**Test Chi-cuadrado:**
- Dividir rango [0,1] en k intervalos
- Verificar distribución uniforme
- χ² = Σ[(Oi - Ei)²/Ei]

### 11.2 Auditoría de Datos

- Verificar que todos los registros estén completos
- Identificar y manejar valores atípicos (outliers)
- Documentar cualquier dato faltante
- Validar consistencia temporal

## 12. Reporte de Resultados

### 12.1 Estructura del Reporte Final

1. **Resumen Ejecutivo**
   - Objetivos del estudio
   - Metodología aplicada
   - Principales hallazgos
   - Conclusiones

2. **Resultados por KPI**
   - Tabla comparativa (antes vs después)
   - Gráficas de tendencia
   - Intervalos de confianza
   - Porcentaje de mejora

3. **Análisis Estadístico**
   - Pruebas de hipótesis
   - Significancia estadística
   - Interpretación de resultados

4. **Recomendaciones**
   - Áreas de mejora continua
   - Acciones correctivas
   - Próximos pasos

### 12.2 Visualizaciones Recomendadas

- Gráficas de barras (antes vs después)
- Diagramas de caja (box plots)
- Gráficas de control
- Histogramas de distribución
- Gráficas de tendencia temporal

## 13. Conclusiones

Este plan de muestreo estadístico proporciona:

✅ **Rigor científico:** Metodología basada en teoría estadística probada  
✅ **Reproducibilidad:** Secuencias pseudoaleatorias documentadas  
✅ **Validez:** Intervalos de confianza del 95%  
✅ **Justificación cuantitativa:** Evidencia numérica de mejoras  
✅ **Trazabilidad:** Registro completo de datos y decisiones  

## 14. Referencias

- Montgomery, D. C. (2012). *Statistical Quality Control*. 7th Edition. Wiley.
- Cochran, W. G. (1977). *Sampling Techniques*. 3rd Edition. John Wiley & Sons.
- Knuth, D. E. (1997). *The Art of Computer Programming, Vol. 2: Seminumerical Algorithms*. 3rd Edition.
- ISO 9001:2015 - Quality Management Systems
- Niebel, B. W. & Freivalds, A. (2013). *Ingeniería Industrial: Métodos, Estándares y Diseño del Trabajo*. 13ª Edición.

## 15. Anexos

### Anexo A: Tabla de Distribución t-Student
### Anexo B: Calculadora de Tamaño de Muestra (Excel)
### Anexo C: Scripts de Muestreo (JavaScript)
### Anexo D: Formatos de Registro
### Anexo E: Checklist de Auditoría

---

**Documento:** PLAN-MUESTREO-ESTADISTICO.md  
**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Pedro Demuner - DEVAD-MTO  
**Revisión:** Instituto Tecnológico Superior de Huatusco
